var logger = require('pomelo-logger').getLogger('pomelo', __filename);
var forwardLogger = require('pomelo-logger').getLogger('forward-log', __filename);
var utils = require('../../util/utils');

/**
 * Handler service.
 * Dispatch request to the relactive handler.
 *
 * @param {Object} app      current application context
 * @param {Object} handlers handler map
 */
var Service = function(app, handlers) {
  this.app = app;
  this.handlers = handlers || {};
};

module.exports = Service;

Service.prototype.name = 'handler';

/**
 * Handler the request.
 */
Service.prototype.handle = function(routeRecord, msg, session, cb) {
  // the request should be processed by current server
  var handler = getHandler(this.handlers, routeRecord);
  if(!handler) {
    logger.error('[handleManager]: fail to find handler for %j', msg.__route__);
    utils.invokeCallback(cb, new Error('fail to find handler for ' + msg.__route__));
    return;
  }
  var start = Date.now();

  handler[routeRecord.method](msg, session, function(err, resp, opts) {
    var log = {
      route : msg.__route__,
      args : msg,
      time : utils.format(new Date(start)),
      timeUsed : new Date() - start
    };
    forwardLogger.info(JSON.stringify(log));
    utils.invokeCallback(cb, err, resp, opts);
  });
  return;
};

/**
 * Get handler instance by routeRecord.
 *
 * @param  {Object} handlers    handler map
 * @param  {Object} routeRecord route record parsed from route string
 * @return {Object}             handler instance if any matchs or null for match fail
 */
var getHandler = function(handlers, routeRecord) {
  var handler = handlers[routeRecord.handler];
  if(!handler) {
    logger.warn('could not find handler for routeRecord: %j', routeRecord);
    return null;
  }
  if(typeof handler[routeRecord.method] !== 'function') {
    logger.warn('could not find the method %s in handler: %s', routeRecord.method, routeRecord.handler);
    return null;
  }
  return handler;
};
