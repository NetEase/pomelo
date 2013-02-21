var protocol = require('pomelo-protocol');

var PKG_HEARTBEAT = 3;     // heartbeat package

var DEFAULT_HEARTBEAT = 3000;
var DEFAULT_TIMEOUT = 5000;

/**
 * Process hearbeat request.
 *
 * @param {Object} opts option request
 *                      opts.hearbeat heartbeat interval
 */
var Command = function(opts) {
  opts = opts || {};
  this.heartbeat = opts.heartbeat || DEFAULT_HEARTBEAT;
  this.timeout = (opts.timeout || DEFAULT_TIMEOUT) + this.heartbeat;

  this.timeouts = {};
};

module.exports = Command;

Command.prototype.handle = function(socket) {
  this.clear(socket.id);

  setTimeout(function() {
    socket.sendRaw(protocol.encode(PKG_HEARTBEAT, ''));
  }, this.heartbeat);

  this.timeouts[socket.id] = setTimeout(function() {
    console.error('heartbeat timeout.');
    socket.disconnect();
  }, this.timeout);
};

Command.prototype.clear = function(id) {
  var tid = this.timeouts[id];
  if(tid) {
    clearTimeout(tid);
  }
};