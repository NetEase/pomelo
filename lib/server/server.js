'use strict';

/**
 * Implementation of server component.
 * Init and start server instance.
 */
const fs = require('fs');
const path = require('path');

const Loader = require('pomelo-loader');
const schedule = require('pomelo-scheduler');

const logger = require('pomelo-logger').getLogger('pomelo', __filename);
const pathUtil = require('../util/pathUtil');
const utils = require('../util/utils');
const events = require('../util/events');
const Constants = require('../util/constants');
const FilterService = require('../common/service/filterService');
const HandlerService = require('../common/service/handlerService');

const ST_INITED = 0;    // server inited
const ST_STARTED = 1;   // server started
const ST_STOPED = 2;    // server stoped

/**
 * Server factory function.
 *
 * @param {Object} app  current application context
 * @return {Object} erver instance
 */
module.exports.create = function(app, opts) {
  return new Server(app, opts);
};

function Server(app, opts) {
  this.opts = opts || {};
  this.app = app;
  this.globalFilterService = null;
  this.filterService = null;
  this.handlerService = null;
  this.crons = [];
  this.jobs = {};
  this.state = ST_INITED;

  app.event.on(events.ADD_CRONS, this.addCrons.bind(this));
  app.event.on(events.REMOVE_CRONS, this.removeCrons.bind(this));
}

/**
 * Server lifecycle callback
 */
Server.prototype.start = function() {
  if (this.state > ST_INITED) {
    return;
  }

  this.globalFilterService = _initFilter(true, this.app);
  this.filterService = _initFilter(false, this.app);
  this.handlerService = _initHandler(this.app, this.opts);
  this.cronHandlers = _loadCronHandlers(this.app);
  _loadCrons(this, this.app);
  this.state = ST_STARTED;
};

Server.prototype.afterStart = function() {
  _scheduleCrons(this, this.crons);
};

/**
 * Stop server
 */
Server.prototype.stop = function() {
  this.state = ST_STOPED;
};

/**
 * Global handler.
 *
 * @param  {Object} msg request message
 * @param  {Object} session session object
 * @param  {Callback} callback function
 */
Server.prototype.globalHandle = function(msg, session, cb) {
  if (this.state !== ST_STARTED) {
    utils.invokeCallback(cb, new Error('server not started'));
    return;
  }

  const routeRecord = _parseRoute(msg.route);
  if (!routeRecord) {
    utils.invokeCallback(cb, new Error('meet unknown route message %j',
                         msg.route));
    return;
  }

  const self = this;
  const dispatch = (err, resp, opts) => {
    if (err) {
      _handleError(true, self, err, msg, session, resp, opts, (err, resp, opts) => {
        _response(true, self, err, msg, session, resp, opts, cb);
      });
      return;
    }

    if (self.app.getServerType() !== routeRecord.serverType) {
      _doForward(self.app, msg, session, routeRecord, function(err, resp, opts) {
        _response(true, self, err, msg, session, resp, opts, cb);
      });
    } else {
      _doHandle(self, msg, session, routeRecord, (err, resp, opts) => {
        _response(true, self, err, msg, session, resp, opts, cb);
      });
    }
  };
  _beforeFilter(true, self, msg, session, dispatch);
};

/**
 * Handle request
 */
Server.prototype.handle = function(msg, session, cb) {
  if (this.state !== ST_STARTED) {
    cb(new Error('server not started'));
    return;
  }

  const routeRecord = _parseRoute(msg.route);
  _doHandle(this, msg, session, routeRecord, cb);
};

/**
 * Add crons at runtime.
 *
 * @param {Array} crons would be added in application
 */
Server.prototype.addCrons = function(crons) {
  this.cronHandlers = _loadCronHandlers(this.app);

  let i;
  for (i = 0; i < crons.length; i++) {
    const cron = crons[i];
    _checkAndAdd(cron, this.crons, this);
  }
  _scheduleCrons(this, crons);
};

/**
 * Remove crons at runtime.
 *
 * @param {Array} crons would be removed in application
 */
Server.prototype.removeCrons = function(crons) {
  let i;
  for (i = 0; i < crons.length; i++) {
    const cron = crons[i];
    const id = parseInt(cron.id);
    if (this.jobs[id]) {
      schedule.cancelJob(this.jobs[id]);
    } else {
      logger.warn('cron is not in application: %j', cron);
    }
  }
};

function _initFilter(isGlobal, app) {
  const service = new FilterService();
  let befores;
  let afters;

  if (isGlobal) {
    befores = app.get(Constants.KEYWORDS.GLOBAL_BEFORE_FILTER);
    afters = app.get(Constants.KEYWORDS.GLOBAL_AFTER_FILTER);
  } else {
    befores = app.get(Constants.KEYWORDS.BEFORE_FILTER);
    afters = app.get(Constants.KEYWORDS.AFTER_FILTER);
  }

  let i;
  if (befores) {
    for (i = 0; i < befores.length; i++) {
      service.before(befores[i]);
    }
  }

  if (afters) {
    for (i = 0; i < afters.length; i++) {
      service.after(afters[i]);
    }
  }

  return service;
}

function _initHandler(app, opts) {
  return new HandlerService(app, opts);
}

/**
 * Load cron handlers from current application
 */
function _loadCronHandlers(app) {
  const p = pathUtil.getCronPath(app.getBase(), app.getServerType());
  if (p) {
    return Loader.load(p, app);
  }
}

/**
 * Load crons from configure file
 */
function _loadCrons(server, app) {
  const env = app.get(Constants.RESERVED.ENV);
  let p = path.join(app.getBase(), Constants.FILEPATH.CRON);

  if (!fs.existsSync(p)) {
    p = path.join(app.getBase(), Constants.FILEPATH.CONFIG_DIR,
                  env, path.basename(Constants.FILEPATH.CRON));
    if (!fs.existsSync(p)) {
      return;
    }
  }

  app.loadConfigBaseApp(Constants.RESERVED.CRONS, Constants.FILEPATH.CRON);

  const crons = app.get(Constants.RESERVED.CRONS);
  let serverType;
  for (serverType in crons) {
    if (app.serverType === serverType) {
      const list = crons[serverType];
      let i;
      for (i = 0; i < list.length; i++) {
        if (!list[i].serverId) {
          _checkAndAdd(list[i], server.crons, server);
        } else {
          if (app.serverId === list[i].serverId) {
            _checkAndAdd(list[i], server.crons, server);
          }
        }
      }
    }
  }
}

/**
 * Fire before filter chain if any
 */
function _beforeFilter(isGlobal, server, msg, session, cb) {
  let fm;
  if (isGlobal) {
    fm = server.globalFilterService;
  } else {
    fm = server.filterService;
  }

  if (fm) {
    fm.beforeFilter(msg, session, cb);
  } else {
    utils.invokeCallback(cb);
  }
}

/**
 * Fire after filter chain if have
 */
function _afterFilter(isGlobal, server, err, msg, session, resp, opts, cb) {
  let fm;
  if (isGlobal) {
    fm = server.globalFilterService;
  } else {
    fm = server.filterService;
  }

  if (fm) {
    if (isGlobal) {
      fm.afterFilter(err, msg, session, resp, () => { /* do nothing */ });
    } else {
      fm.afterFilter(err, msg, session, resp, (err) => {
        cb(err, resp, opts);
      });
    }
  }
}

/**
 * pass err to the global error handler if specified
 */
function _handleError(isGlobal, server, err, msg, session, resp, opts, cb) {
  let handler;
  if (isGlobal) {
    handler = server.app.get(Constants.RESERVED.GLOBAL_ERROR_HANDLER);
  } else {
    handler = server.app.get(Constants.RESERVED.ERROR_HANDLER);
  }

  if (!handler) {
    logger.debug('no default error handler to resolve unknown exception. ',
                 err.stack);

    utils.invokeCallback(cb, err, resp, opts);
  } else {
    if (handler.length === 5) {
      handler(err, msg, resp, session, cb);
    } else {
      handler(err, msg, resp, session, opts, cb);
    }
  }
}

/**
 * Send response to client and fire after filter chain if any.
 */

function _response(isGlobal, server, err, msg, session, resp, opts, cb) {
  if (isGlobal) {
    cb(err, resp, opts);
    // after filter should not interfere response
    _afterFilter(isGlobal, server, err, msg, session, resp, opts, cb);
  } else {
    _afterFilter(isGlobal, server, err, msg, session, resp, opts, cb);
  }
}

/**
 * Parse route string.
 *
 * @param  {String} route route string, such as:
 *                        serverName.handlerName.methodName
 * @return {Object}       parse result object or null for illeagle route string
 */
function _parseRoute(route) {
  if (!route) {
    return null;
  }
  const ts = route.split('.');
  if (ts.length !== 3) {
    return null;
  }

  return {
    route: route,
    serverType: ts[0],
    handler: ts[1],
    method: ts[2]
  };
}

function _doForward(app, msg, session, routeRecord, cb) {
  let finished = false;
  //should route to other servers
  try {
    const msgRemote = app.sysrpc[routeRecord.serverType].msgRemote;
    msgRemote.forwardMessage(session, msg, session.export(), (err, resp, opts) => {
      if (err) {
        logger.error('fail to process remote message:' + err.stack);
      }
      finished = true;
      utils.invokeCallback(cb, err, resp, opts);
    });
  } catch (err) {
    if (!finished) {
      logger.error('fail to forward message:' + err.stack);
      utils.invokeCallback(cb, err);
    }
  }
}

function _doHandle(server, msg, session, routeRecord, cb) {
  const originMsg = msg;
  msg = msg.body || {};
  msg.__route__ = originMsg.route;


  const handle = (err, resp, opts) => {
    if (err) {
      // error from before filter
      _handleError(false, server, err, msg, session, resp, opts, (err, resp, opts) => {
        _response(false, server, err, msg, session, resp, opts, cb);
      });
      return;
    }

    server.handlerService.handle(routeRecord, msg, session, (err, resp, opts) => {
      if (err) {
        //error from handler
        _handleError(false, server, err, msg, session, resp, opts, (err, resp, opts) => {
          _response(false, server, err, msg, session, resp, opts, cb);
        });

        return;
      }

      _response(false, server, err, msg, session, resp, opts, cb);
    });
  };  //end of handle

  _beforeFilter(false, server, msg, session, handle);
}

/**
 * Schedule crons
 */
function _scheduleCrons(server, crons) {
  const handlers = server.cronHandlers;
  let i;

  for (i = 0; i < crons.length; i++) {
    const cronInfo = crons[i];
    const time = cronInfo.time;
    const action = cronInfo.action;
    const jobId = cronInfo.id;

    if (!time || !action || !jobId) {
      logger.error('cron miss necessary parameters: %j', cronInfo);
      continue;
    }

    if (action.indexOf('.') === -1) {
      logger.error('cron action is error format: %j', cronInfo);
      continue;
    }

    const cron = action.split('.')[0];
    const job = action.split('.')[1];
    const handler = handlers[cron];

    if (!handler) {
      logger.error('could not find cron: %j', cronInfo);
      continue;
    }

    if (typeof handler[job] !== 'function') {
      logger.error('could not find cron job: %j, %s', cronInfo, job);
      continue;
    }

    const id = schedule.scheduleJob(time, handler[job].bind(handler));
    server.jobs[jobId] = id;
  }
}

/**
 * If cron is not in crons then put it in the array.
 */
function _checkAndAdd(cron, crons, server) {
  if (!_containCron(cron.id, crons)) {
    server.crons.push(cron);
  } else {
    logger.warn('cron is duplicated: %j', cron);
  }
}

/**
 * Check if cron is in crons.
 */
function _containCron(id, crons) {
  let i;
  for (i = 0; i < crons.length; i++) {
    if (id === crons[i].id) {
      return true;
    }
  }
  return false;
}
