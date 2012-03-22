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
var app = require('../pomelo').getApp();
var logger = require('../util/log/log').getLogger(__filename);


var STATUS_INTERVAL = 60 * 1000; // 60 seconds
var HEARTBEAT_INTERVAL = 30 * 1000; // 20 seconds


var clients = {};
var clientStatus = {};
var STARTED = 0; //started
var CONNECTED = 1; //started

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
    this.io = io.listen(port);
    this.register();
  },

  // Registers new Node with LogServer, announces to WebClients
  announce_node: function(socket, message) {
    var log_server = this;
    debugger;
    var nodeId = message.node.id;
    var nodeType = message.node.type;
    console.log(' nodeId ' + nodeId);
    // If this node already exists, ignore announcemen
    if (!!log_server.nodes[nodeId]) {
      this._log.warn("Warning: Node '" + nodeId + "' already exists, ignoring");
      //socket.emit('node_already_exists');
      //return;
    }

    var node = new _node.Node(nodeType, [nodeId], socket, this);
    log_server.nodes[nodeId] = node;

    // Tell all WebClients about new Node
    __(log_server.web_clients).each(function(web_client) {
      web_client.add_node(node);
    });

    socket.on('disconnect', function() {
      delete log_server.nodes[nodeId];
    });
    socket.on('clientmessage', function(msg) {
      //console.log('master server get clientmessage: ' + JSON.stringify(msg));
      log_server.io.sockets.in('web_clients').emit('webmessage', msg);
	});	//on message end
    log_server.checkReady();
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
    		socket.on('webmessage', function(msg) {
            //console.log('master server get webmessage: ' + JSON.stringify(msg));
    		if(!msg || !msg.method) {return;}
    	  	var serverId = msg.id;
    	  	var sysInfo = '';
    			if (!log_server.nodes[serverId]){
    	  		sysInfo = 'can not connect to client ' + serverId;
    	  		socket.emit('webmessage',{method:msg.method,data:sysInfo});
    	  	}	else {
    	  		var node = log_server.nodes[serverId];
    	  		node.socket.emit('clientmessage',msg);
    	  	}
     			return ;
    		});	//on message end
    		socket.on('quit', function() {
          app.quit();
     			return ;
    		});	//on message end
      });
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
  },
  getNode:function(msg){
  	msg.socket.emit(msg.method,app.servers);
  },
  checkReady : function(){
	   logger.info('master server begin check all server was connected to server...');
		var allStarted = true;
		var log_server = this;
		var servers = app.servers;
		for (serverType in servers){
			if (serverType==='master') continue;
			var typeServers = servers[serverType];
		  for (var i=0; i < typeServers.length; i++){
		    var server = typeServers[i];	
				if(!log_server.nodes[server.id]){
					allStarted = false;
					logger.warn(' server not ready.waiting from ' + server.id + ' connect.......');
					}
		   }
		}
		if (allStarted){
			logger.info('begin notify to connect each other');
			for (var id in log_server.nodes){
				log_server.nodes[id].socket.emit('afterstart');
			}
		}
  }

}

exports.LogServer = LogServer;
