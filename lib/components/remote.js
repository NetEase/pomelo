var utils = require('../util/utils');
var logger = require('../util/log/log').getLogger(__filename);
var path = require('path');
var Loader = require('module-loader');
var exp = module.exports;

exp.init = function(app, opts, cb) {
  logger.info('begin to init remote component.');

  var serverType = app.get('serverType');
  if(!serverType) {
    utils.invokeCallback(cb, new Error('fail to init remote component empty servers'));
    return;
  }

  try {
    var userRemote = genRemote(serverType, utils.getConventionPath(app.get('dirname'), serverType, 'remote'), 'user');
    var role = isFrontendServer(app.findServer(app.serverType, app.serverId)) ? 'frontend' : 'backend';
    var sysRemote = genRemote(serverType, __dirname + '/../common/remote/' + role, 'sys');
    var remoteMap = app.get('remoteMap') || {};

    var userRemotes = remoteMap['user'] = remoteMap['user'] || {};
    if(!!userRemotes[serverType]) {
      logger.error('fail to init remote component for user remote conflict, server type: %s', serverType);
      utils.invokeCallback(cb, new Error('user remote conflict, serverType:' + serverType));
    }

    var sysRemotes = remoteMap['sys'] = remoteMap['sys'] || {};
    if(!!sysRemotes[serverType]) {
      logger.error('fail to init remote component for sys remote conflict, server type: %s', serverType);
      utils.invokeCallback(cb, Error('sys remote conflict, serverType:' + serverType));
    }

    userRemotes[serverType] = userRemote;
    sysRemotes[serverType] = sysRemote;
    app.set('remoteMap', remoteMap);

    logger.info('remote inited.');
    utils.invokeCallback(cb);
  } catch(err) {
    logger.error('fail to init remote componenet for exception, err:' + err.stack);
    utils.invokeCallback(cb, err);
  }
};
 
/**
 * generate remote service instance
 *
 * @param name {String} server type
 * @param dir {String} remote codes root dir in abosulte path
 * @param scope {String} 'user' or 'sys'
 */
var genRemote = function(name, dir, scope) {
  logger.info('[app.genRemote] loading handler module, name:' + name + ', dir:' + dir);
  if(!dir || dir[0] == '.') {
    throw new Error('dir should use absolute path, dir: ' + dir );
  }

  scope = scope || 'user';
  
  var exists = path.existsSync(dir);
  if (!exists){
    logger.debug('[remote path not exists] name:' + name +'  dir:'+dir);
    return;
  }

  var remotes = {};
  Loader.loadPath({path: dir, recurse: false, rootObj: remotes});
  return remotes;
};

var isFrontendServer = function(server) {
  return !!server && !!server.wsPort;
};

exp.name = 'remote';
