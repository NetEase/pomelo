/* Log Server
 * Listens for socket.io connections from Nodes and WebClients
 * Nodes broadcast log messages & pings to WebClients
 * WebClients request log streams & history from Nodes
 */

var io = require('socket.io');
var __ = require('underscore');
var _node = require('./node.js');
var _wc = require('./web_client.js');
var logging = require('./logging.js');
var STATUS_INTERVAL = 60 * 1000; // 60 seconds
var HEARTBEAT_INTERVAL = 20 * 1000; // 20 seconds

// LogServer runs a regular HTTP server
// Announce messages add each client to the appropriate pools
var LogServer = function() {
  this._log = new logging.Logger();
  this.nodes = {};
  this.web_clients = {};
  this.message_count = 0;
  var log_server = this;

  // Print status every minute
  setInterval(function() {
    log_server._log.info("Nodes: " + __(log_server.nodes).size() + ", " +
      "WebClients: " + __(log_server.web_clients).size() + ", " +
      "Messages Sent: " + log_server.message_count);
  }, STATUS_INTERVAL);
}

LogServer.prototype = {

  // Create HTTP Server, bind socket
  listen: function(port) {
    this.io = io.listen(8888);
    this.register();
  },

  // Registers new Node with LogServer, announces to WebClients
  announce_node: function(socket, message) {
    var log_server = this;
    var label = message.label;

    // If this node already exists, ignore announcemen
    if (log_server.nodes[label]) {
      this._log.warn("Warning: Node '" + label + "' already exists, ignoring");
      socket.emit('node_already_exists');
      return;
    }

    var node = new _node.Node(label, message.logs, socket, this);
    log_server.nodes[label] = node;

    // Tell all WebClients about new Node
    __(log_server.web_clients).each(function(web_client) {
      web_client.add_node(node);
    });

    socket.on('disconnect', function() {
      delete log_server.nodes[label];
    });
  },

  // Registers new WebClient with LogServer
  announce_web_client: function(socket) {
    var log_server = this;
    var web_client = new _wc.WebClient(socket, log_server);
    log_server.web_clients[web_client.id] = web_client;

    // Tell new WebClient about all nodes
    __(log_server.nodes).each(function(node, nlabel) {
      web_client.add_node(node);
    });

    socket.on('disconnect', function() {
      delete log_server.web_clients[web_client.id];
    });

  },

  // Register announcement, disconnect callbacks
  register: function() {
    var log_server = this;
    log_server.io.set('log level', 1); // TODO(msmathers): Make configurable
    log_server.io.sockets.on('connection', function(socket) {
      socket.on('announce_node', function(message) {
        log_server._log.info("Registering new node");
        log_server.announce_node(socket, message);
      });
      socket.on('announce_web_client', function(message) {
        log_server._log.info("Registering new web_client");
        log_server.announce_web_client(socket);
      })
    });

    // Broadcast stats to all clients
    setInterval(function() {
      log_server.io.sockets.in('web_clients').emit('stats', {
        message_count: log_server.message_count
      });
    }, 1000);

    // Broadcast heartbeat to all clients
    setInterval(function() {
      log_server.io.sockets.emit('heartbeat');
    }, HEARTBEAT_INTERVAL); 
  }
}

exports.LogServer = LogServer;
