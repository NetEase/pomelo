var utils = require('../../util/utils');
var pomelo = require('../../pomelo');

/**
 * Local proxy for global channel
 */
var Channel = function(name) {
  this.name = name;
};

var pro = Channel.prototype;

/**
 * Add user into channel.
 * 
 * @param uid {String} user id
 * @param sid {String} server id
 * @param cb {Function} callback function
 */
pro.add = function(uid, sid, cb) {
  invokeRemote('add', [this.name, uid, sid], cb);
};

/**
 * Remote user into channel.
 * 
 * @param uid {String} user id
 * @param sid {String} server id
 * @param cb {Function} callback function
 */
pro.leave = function(uid, sid, cb) {
  invokeRemote('leave', [this.name, uid, sid], cb);
};

/**
 * Destroy channel.
 *
 * @param force {Boolean} whether destroy channel gracefully
 * @param cb {Fuction} callback function
 */
pro.destroy = function(force, cb) {
  invokeRemote('destroy', [this.name, force], cb);
};

/**
 * Push message by channel.
 *
 * @param msg {Object} message that would be push to clients by channel
 * @param cb {Function} callback function
 */
pro.pushMessage = function(msg, cb) {
  invokeRemote('pushMessage', [this.name, msg], cb);
};

/**
 * invoke remote method on global channel server
 *
 * @param method {String} remote method name
 * @param args {String} remote method arguments
 * @param cb {Function} callback function
 */
var invokeRemote = function(method, args, cb) {
  var channelSid = pomelo.getApp().get('channelServerId');
  if(!channelSid) {
    utils.invokeCallback(cb, new Error('channel server not enable'));
    return;
  }

  var msg = {
    service: 'sys.globalChannelRemote', 
    method: method, 
    args: args
  };

  pomelo.getApp().get('mailBox').dispatch(channelSid, msg, null, cb);
};

/**
 * Create a channel proxy
 *
 * @param name {String} channel name
 * @return {Object} channel proxy
 */
module.exports.createProxy = function(name) {
  return new Channel(name);
};
