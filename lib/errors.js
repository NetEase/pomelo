'use strict';

var util = require('util');

function PomeloError(msg) {
  Error.captureStackTrace(this, this.constructor);
  Object.defineProperty(this, 'name', {
    enumerable: false,
    value: this.constructor.name,
    writable: false
  });

  Object.defineProperty(this, 'message', {
    enumerable: false,
    value: msg,
    writable: false
  });
}
util.inherits(PomeloError, Error);

function RPCClientError(msg, dest, remote, method) {
  PomeloError.call(this, msg);
  this.dest = dest;
  this.remote = remote;
  this.method = method;
}
util.inherits(RPCClientError, PomeloError);

function RPCRemoteError(msg, dest, remote, method) {
  PomeloError.call(this, msg);
  this.dest = dest;
  this.remote = remote;
  this.method = method;
}
util.inherits(RPCRemoteError, PomeloError);

module.exports.PomeloError = PomeloError;
module.exports.RPCClientError = RPCClientError;
module.exports.RPCRemoteError = RPCRemoteError;
