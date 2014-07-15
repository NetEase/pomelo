var fs = require('fs');
var utils = require('../../util/utils');
var Loader = require('pomelo-loader');
var pathUtil = require('../../util/pathUtil');
var logger = require('pomelo-logger').getLogger('pomelo', __filename);
var forwardLogger = require('pomelo-logger').getLogger('forward-log', __filename);
/**
 * Handler service.
 * Dispatch request to the relactive handler.
 *
 * @param {Object} app      current application context
 */
var Service = function(app, opts) {
  this.app = app;
  this.handlerMap = {};
  if(!!opts.reloadHandlers) {
    watchHandlers(app, this.handlerMap);
  }
};

module.exports = Service;

Service.prototype.name = 'handler';

/**
 * Handler the request.
 */
Service.prototype.handle = function(routeRecord, msg, session, cb) {
  // the request should be processed by current server
  var handler = this.getHandler(routeRecord);
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
Service.prototype.getHandler = function(routeRecord) {
  var serverType = routeRecord.serverType;
  if(!this.handlerMap[serverType]) {
    loadHandlers(this.app, serverType, this.handlerMap);
  }
  var handlers = this.handlerMap[serverType] || {};
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

/**
 * Load handlers from current application
 */
var loadHandlers = function(app, serverType, handlerMap) {
  var p = pathUtil.getHandlerPath(app.getBase(), serverType);
  if(p) {
    handlerMap[serverType] = Loader.load(p, app);
  }
};

var watchHandlers = function(app, handlerMap) {
  var p = pathUtil.getHandlerPath(app.getBase(), app.serverType);
  if (!!p){
    fs.watch(p, function(event, name) {
      if(event === 'change') {
        handlerMap[app.serverType] = Loader.load(p, app);
      }
    });
  }
};
