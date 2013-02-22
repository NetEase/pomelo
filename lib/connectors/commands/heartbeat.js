var Package = require('pomelo-protocol').Package;
var logger = require('pomelo-logger').getLogger(__filename);

/**
 * Process hearbeat request.
 *
 * @param {Object} opts option request
 *                      opts.hearbeat heartbeat interval
 */
var Command = function(opts) {
  opts = opts || {};
  this.hearbeat = null;
  this.timeout = null;

  if(opts.heartbeat) {
    this.heartbeat = opts.heartbeat * 1000; // hearbeat interval
    this.timeout = this.heartbeat * 2;     // max heartbeat message timeout
  }

  this.heartbeats = {};
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

  if(this.heartbeats[socket.id]) {
    // already in heartbeat interval
    return;
  }

  if(!this.clients[socket.id]) {
    this.clients[socket.id] = 1;
    socket.on('disconnect', function() {
      var id = socket.id;
      delete self.clients[id];
      var tid = self.heartbeats[id];
      if(tid) {
        clearTimeout(tid);
        delete self.heartbeats[id];
      }
    });
  }

  //this.clear(socket.id);

  this.heartbeats[socket.id] = setTimeout(function() {
    socket.sendRaw(Package.encode(Package.TYPE_HEARTBEAT));
    delete self.heartbeats[socket.id];
  }, this.heartbeat);

  // whether disconnect the timeout client connection?
/*
  this.timeouts[socket.id] = setTimeout(function() {
    logger.info('client %j heartbeat timeout.', socket.id);
    socket.disconnect();
  }, this.timeout);
*/
};

Command.prototype.clear = function(id) {
  var tid = this.timeouts[id];
  if(tid) {
    clearTimeout(tid);
    delete this.timeouts[id];
  }
};