'use strict';

const pomelo = require('../../pomelo');
const Package = require('pomelo-protocol').Package;

const CODE_OK = 200;
const CODE_USE_ERROR = 500;
const CODE_OLD_CLIENT = 501;

/**
 * Process the handshake request.
 *
 * @param {Object} opts option parameters
 *                      opts.handshake(msg, cb(err, resp)) handshake callback.
 *                      msg is the handshake message from client.
 *
 *                      opts.hearbeat heartbeat interval (level?)
 *                      opts.version required client level
 */

module.exports = Command;

function Command(opts) {
  opts = opts || {};
  this.userHandshake = opts.handshake;

  if (opts.heartbeat) {
    this.heartbeatSec = opts.heartbeat;
    this.heartbeat = opts.heartbeat * 1000;
  }

  this.checkClient = opts.checkClient;

  this.useDict = opts.useDict;
  this.useProtobuf = opts.useProtobuf;
  this.useCrypto = opts.useCrypto;
}

Command.prototype.handle = function(socket, msg) {
  if (!msg.sys) {
    _processError(socket, CODE_USE_ERROR);
    return;
  }

  if (typeof this.checkClient === 'function') {
    if (!msg || !msg.sys || !this.checkClient(msg.sys.type, msg.sys.version)) {
      _processError(socket, CODE_OLD_CLIENT);
      return;
    }
  }

  const opts = {
    heartbeat: _setupHeartbeat(this)
  };

  if (this.useDict) {
    const dictVersion = pomelo.app.components.__dictionary__.getVersion();
    if (!msg.sys.dictVersion || msg.sys.dictVersion !== dictVersion) {
      // may be deprecated in future
      opts.dict = pomelo.app.components.__dictionary__.getDict();

      opts.routeToCode = pomelo.app.components.__dictionary__.getDict();
      opts.codeToRoute = pomelo.app.components.__dictionary__.getAbbrs();
      opts.dictVersion = dictVersion;
    }
    opts.useDict = true;
  }

  if (this.useProtobuf) {
    const protoVersion = pomelo.app.components.__protobuf__.getVersion();
    if (!msg.sys.protoVersion || msg.sys.protoVersion !== protoVersion) {
      opts.protos = pomelo.app.components.__protobuf__.getProtos();
    }
    opts.useProto = true;
  }

  if (pomelo.app.components.__decodeIO__protobuf__) {
    if (this.useProtobuf) {
      throw new Error('protobuf can not be both used in the same project.');
    }
    const version = pomelo.app.components.__decodeIO__protobuf__.getVersion();
    if (!msg.sys.protoVersion || msg.sys.protoVersion < version) {
      opts.protos = pomelo.app.components.__decodeIO__protobuf__.getProtos();
    }
    opts.useProto = true;
  }

  if (this.useCrypto) {
    pomelo.app.components.__connector__.setPubKey(socket.id, msg.sys.rsa);
  }

  if (typeof this.userHandshake === 'function') {
    this.userHandshake(msg, function(err, resp) {
      if (err) {
        process.nextTick(function() {
          _processError(socket, CODE_USE_ERROR);
        });
        return;
      }
      process.nextTick(function() {
        _response(socket, opts, resp);
      });
    }, socket);
    return;
  }

  process.nextTick(function() {
    _response(socket, opts);
  });
};

function _setupHeartbeat(s) {
  return s.heartbeatSec;
}

function _response(socket, sys, resp) {
  const res = {
    code: CODE_OK,
    sys: sys
  };

  if (resp) {
    res.user = resp;
  }

  socket.handshakeResponse(Package.encode(Package.TYPE_HANDSHAKE,
                                          new Buffer(JSON.stringify(res))));
}

function _processError(socket, code) {
  const res = {
    code: code
  };

  socket.sendForce(Package.encode(Package.TYPE_HANDSHAKE,
                                  new Buffer(JSON.stringify(res))));

  process.nextTick(function() {
    socket.disconnect();
  });
}
