var channelManager = require('../../service/channelManager');
var utils = require('../../../util/utils');

/**
 * channel remote service
 */
var exp = module.exports;

exp.add = function(channelName, uid, sid, cb) {
  var channel = channelManager.getChannel(channelName);
  if(!channel) {
    utils.invokeCallback(cb, new Error('channel not exist, name:' + channelName));
    return;
  }

  channel.add(uid, sid, cb);
};

exp.leave = function(channelName, uid, sid, cb) {
  var channel = channelManager.getChannel(channelName);
  if(!channel) {
    utils.invokeCallback(cb, new Error('channel not exist, name:' + channelName));
    return;
  }

  channel.leave(uid, sid, cb);
};

exp.destroy = function(channelName, force, cb) {
  var channel = channelManager.getChannel(channelName);
  if(!!channel) {
    channel.destroy();
  }
  utils.invokeCallback(cb);
};

exp.getChannel = function(name, create, cb) {
  var channel = channelManager.getChannel(name, create);
  var err = null;
  if(!channel) {
    err = new Error('channel not exist, name:' + name);
  }

  utils.invokeCallback(cb, err);
};

exp.pushMessage = function(name, msg, cb) {
  var channel = channelManager.getChannel(name);
  if(!channel) {
    console.error('channel not exist: %j, %j', name, msg);
    utils.invokeCallback(cb, new Error('channel not exist, name:' + name));
    return;
  }

  channel.pushMessage(msg, cb);
};
