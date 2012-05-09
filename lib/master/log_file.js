/* LogFile models used by LogServer
 * LogFile broadcasts log, ping messages to pertinent WebClients
 */

var __ = require('underscore');

// LogFile is a file that resides on a Node
var LogFile = function(label, node) {
  this.node = node;
//  this.label = label;
  this._enabled = false;
  this.web_clients = [];
  this.room = node.label + ":" + label;
};

LogFile.prototype = {

  // Generic broadcast method all WebClients watching this LogFile
  _broadcast: function(event, message) {
    this.node.log_server.io.sockets.in('web_clients').emit(event, message);
  },

  // Broadcast log message to listening WebClients
  broadcast_log: function(message) {
    this._broadcast('log', message);
  },

  // Broadcast ping to all WebClients
  broadcast_ping: function(message) {
    var log_server = this.node.log_server;
    log_server.message_count++;
    log_server.io.sockets.in('web_clients').emit('ping', message);
  },

  // Add WebClient to pool, optionally enable LogFile
  add_web_client: function(web_client) {
    if (this.web_clients.length == 0) { this.enable(); }
    this.web_clients.push(web_client);
    web_client.socket.join(this.room);
  },

  // Remove WebClient from pool, optionally disable LogFile
  remove_web_client: function(web_client) {
    this.web_clients = __(this.web_clients).without(web_client);
    if (this.web_clients.length == 0) { this.disable(); }
    web_client.socket.leave(this.room);
  },

  // Tell Node to send log tail
  request_history: function(web_client, history_id) {
    this.node.socket.emit('history_request', {
      client_id: web_client.id,
      history_id: history_id,
      log_file: this.label
    });
  },

  // Tell Node to start sending log messages
  enable: function() {
    this._enabled = true;
    this.node.socket.emit('enable_log', {
      log_file: this.label
    });
  },

  // Tell Node to stop sending log messages
  disable: function() {
    this.node.socket.emit('disable_log', {
      log_file: this.label
    });
    this._enabled = false;
  }
}

module.exports = {
  LogFile: LogFile
}
