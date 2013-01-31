var logger = require('pomelo-logger').getLogger(__filename);
var forward_logger = require('pomelo-logger').getLogger('forward-log');
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
Service.prototype.handle = function(routeRecord, msg, session, cb){
  // the request should be processed by current server
  var handler = getHandler(this.handlers, routeRecord);
  if(!handler) {
    logger.error('[handleManager]: fail to find handler for %j', msg.__route__);
    cb(new Error('fail to find handler for ' + msg.__route__));
    return;
  }
  var start = Date.now();

  handler[routeRecord.method](msg, session, function(err,resp){
    var log = {
      route : msg.__route__,
      args : msg,
      time : utils.format(new Date(start)),
      timeUsed : new Date() - start
    };
    forward_logger.info(JSON.stringify(log));
    cb(err,resp);
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
    return null;
  }
  if(typeof handler[routeRecord.method] !== 'function') {
    return null;
  }
  return handler;
};
