'use strict';

const Package = require('pomelo-protocol').Package;
const logger = require('pomelo-logger').getLogger('pomelo', __filename);

/**
 * Process heartbeat request.
 *
 * @param {Object} opts option request
 *                      opts.heartbeat heartbeat interval
 */
module.exports = Command;

function Command(opts) {
  opts = opts || {};
  this.heartbeat = null;
  this.timeout = null;

  if (opts.heartbeat) {
    this.heartbeat = opts.heartbeat * 1000; // heartbeat interval

    // max heartbeat message timeout
    this.timeout = opts.timeout * 1000 || this.heartbeat * 2;
  }

  this.timeouts = {};
  this.clients = {};
  this.disconnectOnTimeout = opts.disconnectOnTimeout;
}

Command.prototype.handle = function(socket) {
  if (!this.heartbeat) {
    // no heartbeat setting
    return;
  }

  if (!this.clients[socket.id]) {
    // clear timers when socket disconnect or error
    this.clients[socket.id] = 1;
    socket.once('disconnect', _clearTimers.bind(null, this, socket.id));
    socket.once('error', _clearTimers.bind(null, this, socket.id));
  }

  // clear timeout timer
  if (this.disconnectOnTimeout) {
    this.clear(socket.id);
  }

  socket.sendRaw(Package.encode(Package.TYPE_HEARTBEAT));

  if (this.disconnectOnTimeout) {
    this.timeouts[socket.id] = setTimeout(() => {
      logger.info('client %j heartbeat timeout.', socket.id);
      socket.disconnect();
    }, this.timeout);
  }
};

Command.prototype.clear = function(id) {
  const tid = this.timeouts[id];
  if (tid) {
    clearTimeout(tid);
    delete this.timeouts[id];
  }
};

function _clearTimers(s, id) {
  delete s.clients[id];
  const tid = s.timeouts[id];
  if (tid) {
    clearTimeout(tid);
    delete s.timeouts[id];
  }
}
