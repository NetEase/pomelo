var protocol = require('pomelo-protocol');

var CODE_OK = 200;
var CODE_OLD_CLIENT = 300;
var CODE_USE_ERROR = 500;

var PKG_HANDSHAKE = 1;    // handshake package

/**
 * Process the handshake request.
 *
 * @param {Object} opts option parameters
 *                      opts.handshake(msg, cb(err, resp)) handshake callback. msg is the handshake message from client.
 *                      opts.hearbeat heartbeat interval (level?)
 *                      opts.version required client level
 */
var Command = function(opts) {
  opts = opts || {};
  this.userHandshake = opts.handshake;
  this.heartbeat = opts.heartbeat;
  this.version = opts.version;
};

module.exports = Command;

Command.prototype.handle = function(socket, msg) {
  if(!checkClientVersion(msg)) {
    processError(socket, CODE_OLD_CLIENT);
    return;
  }

  var heartbeat = setupHeartbeat(this, msg);

  if(typeof this.userHandshake === 'function') {
    this.userHandshake(msg, function(err, resp) {
      if(err) {
        process.nextTick(function() {
          processError(socket, CODE_USE_ERROR);
        });
        return;
      }

      process.nextTick(function() {
        response(socket, heartbeat, resp);
      });
    });
    return;
  }

  process.nextTick(function() {
    response(socket, heartbeat);
  });
};

var checkClientVersion = function(self, msg) {
  return true;
};

var setupHeartbeat = function(self, msg) {
  return self.heartbeat;
};

var response = function(socket, heartbeat, resp) {
  var res = {
    code: 200,
    sys: {
      heartbeat: heartbeat
    }
  };

  if(resp) {
    res.user = resp;
  }

  socket.handshakeResponse(protocol.encode(PKG_HANDSHAKE,
                           new Buffer(JSON.stringify(res))));
};

var processError = function(socket, code) {
  var res = {
    code: code
  };
  socket.sendForce(protocol.encode(PKG_HANDSHAKE,
                   new Buffer(JSON.stringify(res))));
};