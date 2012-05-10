var utils = require('../util/utils');
var logger = require('../util/log/log').getLogger(__filename);
var path = require('path');
var Loader = require('module-loader');

/**
 * components for handler
 */
module.exports = function(app) {
  var serverType = app.get('serverType');
  if(!serverType) {
    throw new Error('empty server type');
  }

  var handlers = genHandler(serverType, utils.getConventionPath(app.get('dirname'), serverType, 'handler'));
  var handlerMap = app.get('handlerMap') || {};
  if(!!handlerMap[serverType]) {
    throw new Error('handler conflict, serverType:' + serverType);
  }
  handlerMap[serverType] = handlers;
  app.set('handlerMap', handlerMap);
};

/**
 * generate handers
 * 
 * @param name {String} server type
 * @param dir {String} absolute path for handler
 */
var genHandler = function(name, dir) {
  logger.info('[app.genHandler] loading handler module, name:' + name + ', dir:' + dir);
  if(!dir || dir[0] == '.') {
    throw new Error('dir should use absolute path, dir: ' + dir );
  }

  var handlers = {};

  var exists = path.existsSync(dir);
  if (!exists){
    logger.debug('[handlerPath not exists] name:' + name + ', dir:' + dir);
    return;
  }

  try {
    Loader.loadPath({path: dir, log:false, recurse: false, rootObj: handlers});
    return handlers;
  } catch(err) {
    logger.error('[genHandlerError] name:' + name +'  dir:'+dir+ ', err message:' + err.message);
    process.exit(1);
  }
};

/**
 * component name 
 */
module.exports.name = 'handler';
