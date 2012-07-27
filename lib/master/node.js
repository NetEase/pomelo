/* Node models used by LogServer
 * Nodes listen for log, ping & history_response messages from harvesters
 */

var __ = require('underscore');

// Node is a server/machine/instance running a harvester
// It has nothing to do with node.js
var Node = function(nodeType,nodeId, logs, socket, server) {
  this.nodeId = nodeId;
  this.nodeType = nodeType;
  this.socket = socket;
  this.id = socket.id;
  this.log_server = server;
  this.log_files = {};
  this.info={};//new property
  var node = this;


  // Join 'nodes' room
  socket.join('nodes');
  //join 'areas','connectors' ect room
  socket.on('disconnect', function() {
    // Notify all WebClients upon disconnect
    __(node.log_server.web_clients).each(function(web_client, client_id) {
      web_client.remove_node(node);
    });
    socket.leave('nodes');
  });
};

module.exports = {
  Node: Node
};
