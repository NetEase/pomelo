/**
 * Component for logger.
 * Load logger config and init logger.
 */
var log = require('../util/log/log');
var logger = log.getLogger(__filename);
var utils = require('../util/utils');

var exp = module.exports;

/**
 * Component life circle callback
 */
exp.init = function(app, opts, cb) {
  logger.info('begin to init logger component.');
  var logConfFile = app.get('dirname')+'/config/log4js.json';
  log.configure(logConfFile);

  logger.info('logger inited');

  utils.invokeCallback(cb);
};

/**
 * component name 
 */
exp.name = 'logger';
