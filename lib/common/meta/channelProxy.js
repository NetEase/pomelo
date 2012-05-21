var utils = require('../../util/utils');
var pomelo = require('../../pomelo');

/**
 * local proxy for global channel
 */
var Channel = function(name) {
  this.name = name;
};

var pro = Channel.prototype;

pro.add = function(uid, sid, cb) {
  invokeRemote('add', [this.name, uid, sid], cb);
};

pro.leave = function(uid, sid, cb) {
  invokeRemote('leave', [this.name, uid, sid], cb);
};

pro.destroy = function(force, cb) {
  invokeRemote('destroy', [this.name, force], cb);
};

pro.pushMessage = function(msg, cb) {
  invokeRemote('pushMessage', [this.name, msg], cb);
};

/**
 * invoke remote method on global channel server
 */
var invokeRemote = function(method, args, cb) {
  var channelSid = app.get('channelServerId');
  if(!channelSid) {
    utils.invokeCallback(cb, new Error('channel server not enable'));
    return;
  }

  var msg = {
    service: 'sys.channelRemote', 
    method: method, 
    args: args
  };

  pomelo.getApp().get('mailBox').dispatch(channelSid, msg, null, cb);
};

module.exports.createProxy = function(name) {
  return new Channel(name);
};
