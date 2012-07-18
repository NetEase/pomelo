/**
 * Remote service for global channel.
 */
var channelManager = require('../../service/channelManager');
var utils = require('../../../util/utils');

/**
 * channel remote service
 */
var exp = module.exports;

/**
 * Add user into the specified channel.
 *
 * @param channelName {String} channel name
 * @param uid {String} user id
 * @param sid {String} server id
 * @param cb {Fuction} callback function
 */
exp.add = function(channelName, uid, sid, cb) {
  var channel = channelManager.getChannel(channelName);
  if(!channel) {
    utils.invokeCallback(cb, new Error('channel not exist, name:' + channelName));
    return;
  }

  channel.add(uid, sid, cb);
};

/**
 * Remove user from the specified channel.
 *
 * @param channelName {String} channel name
 * @param uid {String} user id
 * @param sid {String} server id
 * @param cb {Fuction} callback function
 */
exp.leave = function(channelName, uid, sid, cb) {
  var channel = channelManager.getChannel(channelName);
  if(!channel) {
    utils.invokeCallback(cb, new Error('channel not exist, name:' + channelName));
    return;
  }

  channel.leave(uid, sid, cb);
};

/**
 * Destry channel by name.
 *
 * @param channelName {String} channel name
 * @param force {Boolean} whether destroy channel gracefully
 * @param cb {Fuction} callback function
 */
exp.destroy = function(channelName, force, cb) {
  var channel = channelManager.getChannel(channelName);
  if(!!channel) {
    channel.destroy();
  }
  utils.invokeCallback(cb);
};

/**
 * Get channel by name.
 *
 * @param name {String} channel name
 * @param create {Boolean} whether create a new channel if the channel dose not exists
 * @param cb {Fuction} callback function
 */
exp.getChannel = function(name, create, cb) {
  var channel = channelManager.getChannel(name, create);
  var err = null;
  if(!channel) {
    err = new Error('channel not exist, name:' + name);
  }

  utils.invokeCallback(cb, err);
};

/**
 * Push message by channel
 *
 * @param name {String} channel name
 * @param msg {Object} message that would be push to clients by channel
 * @param cb {Function} callback function
 */
exp.pushMessage = function(name, msg, cb) {
  var channel = channelManager.getChannel(name);
  if(!channel) {
    console.error('channel not exist: %j, %j', name, msg);
    utils.invokeCallback(cb, new Error('channel not exist, name:' + name));
    return;
  }

  channel.pushMessage(msg, cb);
};
