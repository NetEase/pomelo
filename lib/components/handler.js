/**
 * Component for handler.
 * Load handlers for current server.
 */
var utils = require('../util/utils');
var logger = require('../util/log/log').getLogger(__filename);
var path = require('path');
var Loader = require('module-loader');

var exp = module.exports;

/**
 * Component life circle callback
 */
exp.init = function(app, opts, cb) {
  logger.info('begin to init handler component.');
  
  var serverType = app.get('serverType');
  if(!serverType) {
    logger.error('fail to init handler component for empty server type.');
    utils.invokeCallback(cb, new Error('fail to init handler for empty server type'));
    return;
  }

  try {
    var handlers = genHandler(serverType, utils.getConventionPath(app.get('dirname'), serverType, 'handler'));
    var handlerMap = app.get('handlerMap') || {};
    if(!!handlerMap[serverType]) {
      logger.error('fail to init handler component for handler conflicts, server type:%s', serverType);
      utils.invokeCallback(cb, new Error('handler conflict, serverType:' + serverType));
      return;
    }

    handlerMap[serverType] = handlers;
    app.set('handlerMap', handlerMap);

    logger.info('handlers inited.');
    utils.invokeCallback(cb);
  } catch(err) {
    logger.error('fail to init handler component for exception, err:' + err.stack);
    utils.invokeCallback(cb, err);
  }
};

/**
 * generate handers
 * 
 * @param name {String} server type
 * @param dir {String} absolute path for handler
 */
var genHandler = function(name, dir) {
  logger.info('[app.genHandler] loading handler module, name:' + name + ', dir:' + dir);
  if(!dir || dir[0] === '.') {
    throw new Error('dir should use absolute path, dir: ' + dir );
  }

  var exists = path.existsSync(dir);
  if (!exists){
    logger.debug('[handlerPath not exists] name:' + name + ', dir:' + dir);
    return;
  }

  var handlers = {};
  Loader.loadPath({path: dir, log:false, recurse: false, rootObj: handlers});
  return handlers;
};

/**
 * component name 
 */
module.exports.name = 'handler';
