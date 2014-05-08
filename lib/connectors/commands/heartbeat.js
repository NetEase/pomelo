var Package = require('pomelo-protocol').Package;
var logger = require('pomelo-logger').getLogger('pomelo', __filename);

/**
 * Process heartbeat request.
 *
 * @param {Object} opts option request
 *                      opts.heartbeat heartbeat interval
 */
var Command = function(opts) {
  opts = opts || {};
  this.heartbeat = null;
  this.timeout = null;

  if(opts.heartbeat) {
    this.heartbeat = opts.heartbeat * 1000; // heartbeat interval
    this.timeout = opts.timeout || this.heartbeat * 2;      // max heartbeat message timeout
  }

  this.heartbeats = {};
  this.timeouts = {};
  this.clients = {};
  this.disconnectOnTimeout = opts.disconnectOnTimeout;
};

module.exports = Command;

Command.prototype.handle = function(socket) {
  if(!this.heartbeat) {
    // no heartbeat setting
    return;
  }

  var self = this;

  if(this.heartbeats[socket.id]) {
    // already in heartbeat interval
    return;
  }

  if(!this.clients[socket.id]) {
    // clear timers when socket disconnect or error
    this.clients[socket.id] = 1;
    socket.once('disconnect', clearTimers.bind(null, this, socket.id));
    socket.once('error', clearTimers.bind(null, this, socket.id));
  }

  // clear timeout timer
  if(self.disconnectOnTimeout) {
    this.clear(socket.id);
  }

  this.heartbeats[socket.id] = setTimeout(function() {
    socket.sendRaw(Package.encode(Package.TYPE_HEARTBEAT));
    delete self.heartbeats[socket.id];

    if(self.disconnectOnTimeout) {
      self.timeouts[socket.id] = setTimeout(function() {
        logger.info('client %j heartbeat timeout.', socket.id);
        socket.disconnect();
      }, self.timeout);
    }
  }, this.heartbeat);
};

Command.prototype.clear = function(id) {
  var tid = this.timeouts[id];
  if(tid) {
    clearTimeout(tid);
    delete this.timeouts[id];
  }
};

var clearTimers = function(self, id) {
  delete self.clients[id];
  var tid = self.timeouts[id];
  if(tid) {
    clearTimeout(tid);
    delete self.timeouts[id];
  }

  tid = self.heartbeats[id];
  if(tid) {
    clearTimeout(tid);
    delete self.heartbeats[id];
  }
};