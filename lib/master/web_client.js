/* WebClient model used by LogServer
 * WebClient listens for enable/disable & history_request messages,
 * sends node announcements to client
 */

var __ = require('underscore');

// WebClient is an end-user using a browser
var WebClient = function(socket, server) {
  this.log_server = server;
  this.socket = socket;
  this.id = socket.id;
  this.watching_logs = [];
  var wc = this;

  function _log_file_helper(message, func) {
    var log_file = wc.get_log_file(message.node, message.log_file);
    if (log_file == null) { return; }
    return func(log_file);
  }

  // Start watching LogFile
  socket.on('enable_log', function(message) {
    _log_file_helper(message, function(log_file) {
      log_file.add_web_client(wc);
      wc.watching_logs.push(log_file);
    });
  });

  // Stop watching LogFile
  socket.on('disable_log', function(message) {
    _log_file_helper(message, function(log_file) {
      log_file.remove_web_client(wc);
      wc.watching_logs = __(wc.watching_logs).without(log_file);
    });
  });

  // Forward log history request to Node
  socket.on('history_request', function(message) {
    _log_file_helper(message, function(log_file) {
      log_file.request_history(wc, message.history_id);
    });
  });

  // Join web_clients room
  socket.join('web_clients');

  // Remove WebClient from LogFiles
  socket.on('disconnect', function() {
    __(wc.watching_logs).each(function(log_file) {
      log_file.remove_web_client(wc);
    });
    socket.leave('web_clients');
  });
}

WebClient.prototype = {

  // Lookup LogFile by label
  get_log_file: function(nlabel, llabel) {
    if (this.log_server.nodes[nlabel]) {
        return this.log_server.nodes[nlabel].log_files[llabel];
    } else {
        return null;
    }
  },

  // Tell WebClient to add new Node, LogFiles
  add_node: function(node) {
    this.socket.emit('add_node', {
      nodeId: node.nodeId,
      nodeType:node.nodeType,
      logs: __(node.log_files).keys()
    });
  },

  // Tell WebClient to remove Node, LogFiles
  remove_node: function(node) {
    this.socket.emit('remove_node', {
      node: node.label
    });
  }
}

module.exports = {
  WebClient: WebClient
}
