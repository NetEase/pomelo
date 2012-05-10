var utils = require('../util/utils');
var logger = require('../util/log/log').getLogger(__filename);
var path = require('path');
var Loader = require('module-loader');

module.exports = function(app) {
  var serverType = app.get('serverType');
  if(!serverType) {
    throw new Error('empty server type');
  }

  var userRemote = genRemote(serverType, utils.getConventionPath(app.get('dirname'), serverType, 'remote'), 'user');
  
  var role = isFrontendServer(app.get('server')) ? 'frontend' : 'backend';
  var sysRemote = genRemote(serverType, __dirname + '/../common/remote/' + role, 'sys');

  var remoteMap = app.get('remoteMap') || {};

  var userRemotes = remoteMap['user'] = remoteMap['user'] || {};
  if(!!userRemotes[serverType]) {
    throw new Error('user remote conflict, serverType:' + serverType);
  }

  var sysRemotes = remoteMap['sys'] = remoteMap['sys'] || {};
  if(!!sysRemotes[serverType]) {
    throw new Error('sys remote conflict, serverType:' + serverType);
  }

  userRemotes[serverType] = userRemote;
  sysRemotes[serverType] = sysRemote;

  app.set('remoteMap', remoteMap);
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
  if(!dir || dir[0] !== '/') {
    throw new Error('dir should use absolute path, dir: ' + dir );
  }

  scope = scope || 'user';
  
  var exists = path.existsSync(dir);
  if (!exists){
    logger.debug('[remote path not exists] name:' + name +'  dir:'+dir);
    return;
  }

  var remotes = {};
  try {
    Loader.loadPath({path: dir, recurse: false, rootObj: remotes});
    return remotes;
  } catch(err) {
    logger.error('[genRemoteError] name:' + name + '  dir:'+ dir+ ', err message:' + err.message);
    process.exit(1);
  }
};

var isFrontendServer = function(server) {
  return !!server && !!server.wsPort;
};

module.exports.name = 'remote';
