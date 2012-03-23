/* Node models used by LogServer
 * Nodes listen for log, ping & history_response messages from harvesters
 */

var __ = require('underscore');
var lf = require('./log_file.js');

// Node is a server/machine/instance running a harvester
// It has nothing to do with node.js
var Node = function(nodeType,nodeId, logs, socket, server) {
  this.nodeId = nodeId;
  this.nodeType = nodeType;
  this.socket = socket;
  this.id = socket.id;
  this.log_server = server;
  this.log_files = {};
  var node = this;

  // Create LogFiles
  __(logs).each(function(llabel, num) {
    var log_file = new lf.LogFile(llabel, node);
    node.log_files[llabel]= log_file;
  });

  // Broadcast log messages to WebClients
  socket.on('log', function(message) {
    var lf = node.log_files[message.log_file];
    lf.broadcast_log(message);
  });

  // Ping WebClient
  socket.on('ping', function(message) {
    var lf = node.log_files[message.log_file];
    lf.broadcast_ping(message);
  })

  // Send log history response to WebClient
  socket.on('history_response', function(message) {
    var wc = node.log_server.web_clients[message.client_id];
    wc.socket.emit('history_response', message);
  })
 
  // Join 'nodes' room
  socket.join('nodes');

  socket.on('disconnect', function() {
    // Notify all WebClients upon disconnect
    __(node.log_server.web_clients).each(function(web_client, client_id) {
      web_client.remove_node(node);
    });
    socket.leave('nodes');
  });
}

module.exports = {
  Node: Node
}
