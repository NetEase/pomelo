var channelManager = require('./channelManager');
var ChannelProxy = require('../meta/channelProxy');
var utils = require('../../util/utils');
var pomelo = require('../../pomelo');
var exp = module.exports;

/**
 * Get local channel instance
 *
 * @param opts {Object} channel info parameters {name: channelName, create: createIfNotExist}
 * @param cb {Function} callback function
 */
exp.getLocalChannel = function(opts, cb) {
  var channel = channelManager.getChannel(opts.name, opts.create);
  var err = null;
  if(!channel) {
    err = new Error('local channel not exist, name:' + opts.name);
  }

  process.nextTick(function() {
    utils.invokeCallback(cb, err, channel);
  });
};

/**
 * Synchronous getLocalChannel
 */
exp.getLocalChannelSync = function(opts) {
  return channelManager.getChannel(opts.name, opts.create);
};

/**
 * Get global channel instance
 *
 * @param opts {Object} channel info parameters {name: channelName, create: createIfNotExist}
 * @param cb {Function} callback function
 */
exp.getGlobalChannel = function(opts, cb) {
  var channelSid = pomelo.app.get('channelServerId');
  if(!channelSid) {
    utils.invokeCallback(cb, new Error('channel server not enable'));
    return;
  }

  var msg = {
    service: 'sys.globalChannelRemote',
    method: 'getChannel',
    args: [opts.name, opts.create]
  };

  pomelo.app.get('mailBox').dispatch(channelSid, msg, null, function(err) {
    if(!!err) {
      utils.invokeCallback(cb, err);
      return;
    }

    var proxy = ChannelProxy.createProxy(opts.name);
    utils.invokeCallback(cb, null, proxy);
  });
};

/**
 * push message by uids
 * group the uids by group. query status server for sid if sid not specified.
 *
 * @param msg {Object} message that would be sent to client
 * @param uids {Array} [{uid: userId, sid: serverId}] or [uids]
 * @param cb {Function} cb(err)
 */
exp.pushMessageByUids = function(msg, uids, cb) {
  channelManager.pushMessageByUids(msg, uids, cb);
};

