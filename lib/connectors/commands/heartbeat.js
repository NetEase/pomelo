var Package = require('pomelo-protocol').Package;
var logger = require('pomelo-logger').getLogger('pomelo', __filename);

/**
 * Process heartbeat request.
 *
 * @param {Object} opts option request
 *                      opts.heartbeat heartbeat interval
 */
<<<<<<< HEAD
var Command = function (opts) {
    opts = opts || {};
    this.heartbeat = null;
    this.timeout = null;
    this.disconnectOnTimeout = opts.disconnectOnTimeout;

    if (opts.heartbeat) {
        this.heartbeat = opts.heartbeat * 1000; // heartbeat interval
        this.timeout = opts.timeout * 1000 || this.heartbeat * 2;      // max heartbeat message timeout
        this.disconnectOnTimeout = true;
    }

    this.timeouts = {};
    this.clients = {};
=======
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
>>>>>>> NetEase/master
};

var newTid = null,oldTid = null;

Command.prototype.clearTimers = function (id) {
    var self = this;
    delete self.clients[id];
    oldTid = self.timeouts[id];
    if (tid) {
        clearTimeout(oldTid);
        delete self.timeouts[id];
    }
};


Command.prototype.handle = function (socket) {
    var self = this;

    if (!self.heartbeat) {
        // no heartbeat setting
        return;
    }

    if (!self.clients[socket.id]) {
        // clear timers when socket disconnect or error
        self.clients[socket.id] = 1;
        socket.once('disconnect', self.clearTimers.bind(self,socket.id));
        socket.once('error', self.clearTimers.bind(self,socket.id));
    }

    // clear timeout timer
    if (self.disconnectOnTimeout) {
        self.clear(socket.id);
    }

    socket.sendRaw(Package.encode(Package.TYPE_HEARTBEAT));

    if (self.disconnectOnTimeout) {
        newTid = setTimeout(function () {
            logger.info('client %j heartbeat timeout.', socket.id);
            socket.disconnect();
        }, self.timeout);
        self.timeouts[socket.id] = newTid;
    }
};

Command.prototype.clear = function (id) {
    var self = this;
    oldTid = self.timeouts[id];
    if (oldTid) {
        console.log('tid: ',oldTid);
        clearTimeout(oldTid);
        delete self.timeouts[id];
    }
};

module.exports = Command;