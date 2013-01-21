var protocol = require('pomelo-protocol');

var PKG_HEARTBEAT = 3;     // heartbeat package

/**
 * Process hearbeat request.
 *
 * @param {Object} opts option request
 *                      opts.hearbeat heartbeat interval
 */
var Command = function(opts) {
  opts = opts || {};
  this.heartbeat = opts.heartbeat;

  this.timeouts = {};
};

module.exports = Command;

Command.prototype.handle = function(socket) {
  this.clear(socket.id);

  socket.send(protocol.encode(PKG_HEARTBEAT, ''));

  this.timeouts[socket.id] = setTimeout(function() {
    socket.close();
  }, this.heartbeat);
};

Command.prototype.clear = function(id) {
  var tid = this.timeouts[id];
  if(tid) {
    clearTimeout(tid);
  }
};