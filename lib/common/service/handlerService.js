'use strict';

const fs = require('fs');

const utils = require('../../util/utils');
const Loader = require('pomelo-loader');
const pathUtil = require('../../util/pathUtil');
const plog = require('pomelo-logger');
const logger = plog.getLogger('pomelo', __filename);
const fwdLogger = plog.getLogger('forward-log', __filename);
const PmlError = require('../../errors').PomeloError;

/**
 * Handler service.
 * Dispatch request to the relactive handler.
 *
 * @param {Object} app      current application context
 */
module.exports = Service;

function Service(app, opts) {
  this.app = app;
  this.handlerMap = {};

  if (opts.reloadHandlers) {
    _watchHandlers(app, this.handlerMap);
  }
}

Service.prototype.name = 'handler';

/**
 * Handler the request.
 */
Service.prototype.handle = function(routeRecord, msg, session, cb) {
  // the request should be processed by current server
  const handler = this.getHandler(routeRecord);

  if (!handler) {
    logger.error('[handleManager]: fail to find handler for %j',
                 msg.__route__);
    utils.invokeCallback(cb,
                         new PmlError(`handler ${msg.__route__} not found`));
    return;
  }

  const start = Date.now();

  handler[routeRecord.method](msg, session, (err, resp, opts) => {
    const log = {
      route: msg.__route__,
      args: msg,
      time: utils.format(new Date(start)),
      timeUsed: new Date() - start
    };
    fwdLogger.info(JSON.stringify(log));
    utils.invokeCallback(cb, err, resp, opts);
  });
};

/**
 * Get handler instance by routeRecord.
 *
 * @param  {Object} handlers    handler map
 * @param  {Object} routeRecord route record parsed from route string
 * @return {Object}             handler instance if any matchs or null
 *                              for match fail
 */
Service.prototype.getHandler = function(routeRecord) {
  const serverType = routeRecord.serverType;
  if (!this.handlerMap[serverType]) {
    _loadHandlers(this.app, serverType, this.handlerMap);
  }
  const handlers = this.handlerMap[serverType] || {};
  const handler = handlers[routeRecord.handler];

  if (!handler) {
    logger.warn('could not find handler for routeRecord: %j', routeRecord);
    return null;
  }

  if (typeof handler[routeRecord.method] !== 'function') {
    logger.warn('could not find the method %s in handler: %s',
                routeRecord.method, routeRecord.handler);
    return null;
  }
  return handler;
};

/**
 * Load handlers from current application
 */
function _loadHandlers(app, serverType, handlerMap) {
  const p = pathUtil.getHandlerPath(app.getBase(), serverType);
  if (p) {
    handlerMap[serverType] = Loader.load(p, app);
  }
}

function _watchHandlers(app, handlerMap) {
  const p = pathUtil.getHandlerPath(app.getBase(), app.serverType);
  if (p) {
    fs.watch(p, function(event, name) {
      if (event === 'change') {
        handlerMap[app.serverType] = Loader.load(p, app);
      }
    });
  }
}
