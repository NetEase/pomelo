var utils = require('../util/utils');
var logger = require('../util/log/log').getLogger(__filename);
var exp = module.exports;

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
  var remoteMap = app.get('remoteMap')||{};
  remoteMap.sys = remoteMap.sys||{};
  sys.channelRemote = require('../common/remote/channel/channelRemote');
  logger.info('channel inited.');

  utils.invokeCallback(cb);
};

exp.name = 'channel';
