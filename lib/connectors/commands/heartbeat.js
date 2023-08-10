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
  this.disconnectOnTimeout = opts.disconnectOnTimeout;

  if(opts.heartbeat) {
    this.heartbeat = opts.heartbeat * 1000; // heartbeat interval
    this.timeout = opts.timeout * 1000 || this.heartbeat * 2;      // max heartbeat message timeout
    this.disconnectOnTimeout = true;
  }

  this.timeouts = {};
  this.clients = {};
};

module.exports = Command;

Command.prototype.handle = function(socket) {
  if(!this.heartbeat) {
    // no heartbeat setting
    return;
  }

  var self = this;

  if(!this.clients[socket.id]) {
    // clear client and timer when socket disconnect or error
    this.clients[socket.id] = 1;
    socket.once('disconnect', this.clear.bind(this, socket.id));
    socket.once('error', this.clear.bind(this, socket.id));
  }

  // clear timeout timer
  if(self.disconnectOnTimeout) {
    this.clearTimers(socket.id);
  }

  socket.sendRaw(Package.encode(Package.TYPE_HEARTBEAT));

  if(self.disconnectOnTimeout) {
    self.timeouts[socket.id] = setTimeout(function() {
      logger.info('client %j heartbeat timeout.', socket.id);
      socket.disconnect();
    }, self.timeout);
  }
};

Command.prototype.clearTimers = function(id) {
  var tid = this.timeouts[id];
  if(tid) {
    clearTimeout(tid);
    delete this.timeouts[id];
  }
};

Command.prototype.clear = function(id) {
  delete this.clients[id];
  var tid = this.timeouts[id];
  if(tid) {
    clearTimeout(tid);
    delete this.timeouts[id];
  }
};
