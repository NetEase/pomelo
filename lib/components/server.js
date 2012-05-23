var utils = require('../util/utils');
var logger = require('../util/log/log').getLogger(__filename);
var Server = require('../server/server');
var exp = module.exports;

exp.init = function(app, opts, cb) {
  logger.info('begin to init server component.');
  var server = app.findServer(app.serverType, app.serverId);

  if(!server) {
    logger.error('fail to init server component for empty server info, server type:%s, server id:%s', app.serverType, app.serverId);
    utils.invokeCallback(cb, new Error('can not find server info, serverType:' + app.serverType + ', serverId:' + app.serverId));
    return;
  }

  app.set('serverInfo', server);
  logger.info('server inited.');
  utils.invokeCallback(cb);
};

exp.start = function(app, opts, cb) {
  logger.info('begin to start server component.');
  var server = app.get('serverInfo');
  if(!server) {
    logger.error('fail to start server component for empty current server info, whether server component not inited?');
    utils.invokeCallback(cb, new Error('can not find current server info from application'));
    return;
  }

  var serverInst = Server.createServer(server);
  serverInst.start();
  app.set('currentServer', serverInst);
  
  logger.info('server started.');
  utils.invokeCallback(cb);
};

exp.name = 'server';
