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
    var self = this;

    if(!self.heartbeat) {
        // no heartbeat setting
        return;
    }

    if(!self.clients[socket.id]) {
        // clear timers when socket disconnect or error
        self.clients[socket.id] = 1;
        socket.once('disconnect', clearTimers.bind(null, self, socket.id));
        socket.once('error', clearTimers.bind(null, self, socket.id));
    }

    // clear timeout timer
    if(self.disconnectOnTimeout) {
        self.clear(socket.id);
    }

    socket.sendRaw(Package.encode(Package.TYPE_HEARTBEAT));

    if(self.disconnectOnTimeout) {
        self.timeouts[socket.id] = setTimeout(function() {
            logger.info('client %j heartbeat timeout.', socket.id);
            socket.disconnect();
        }, self.timeout);
    }
};

Command.prototype.clear = function(id) {
    var self = this;
    var tid = self.timeouts[id];
    if(tid) {
        clearTimeout(tid);
        delete self.timeouts[id];
    }
};

var clearTimers = function(self, id) {
    delete self.clients[id];
    var tid = self.timeouts[id];
    if(tid) {
        clearTimeout(tid);
        delete self.timeouts[id];
    }
};
