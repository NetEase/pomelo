/**
 * Component for channel.
 * Init and set global channel server in context.
 */
var utils = require('../util/utils');
var logger = require('../util/log/log').getLogger(__filename);
var exp = module.exports;

/**
 * Component life circle callback
 */
exp.init = function(app, opts, cb) {
  logger.info('begin to init channel component.');
  
  var type = opts.serverType||'channel';
  var servers = app.get('servers');
  var list = servers[type];

  if(!list) {
    utils.invokeCallback(cb, new Error('fail to init channel component for channel server not found. server type:' + type));
    return;
  }
  if(list.length !== 1) {
    utils.invokeCallback(cb, new Error('channel server should be only one.'));
    return;
  }

  app.set('channelServerId', list[0].id);
  if(app.get('serverType') === type) {
    // load global channel services if current server is global channel server
    var remoteMap = app.get('remoteMap')||{};
    remoteMap.sys = remoteMap.sys||{};
    remoteMap.sys.globalChannelRemote = require('../common/remote/channel/globalChannelRemote');
  }
  logger.info('channel inited.');

  utils.invokeCallback(cb);
};

exp.name = 'channel';
