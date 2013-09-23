/**
 * Implementation of server component.
 * Init and start server instance.
 */
var logger = require('pomelo-logger').getLogger('pomelo', __filename);
var pathUtil = require('../util/pathUtil');
var Loader = require('pomelo-loader');
var schedule = require('pomelo-schedule');
var events = require('../util/events');
var FilterService = require('../common/service/filterService');
var HandlerService = require('../common/service/handlerService');

var ST_INITED = 0;    // server inited
var ST_STARTED = 1;   // server started
var ST_STOPED = 2;    // server stoped

/**
 * Server factory function.
 *
 * @param {Object} app  current application context
 * @return {Object} erver instance
 */
module.exports.create = function(app) {
  return new Server(app);
};

var Server = function (app) {
  this.app = app;
  this.globalFilterService = null;
  this.filterService = null;
  this.handlerService = null;
  this.activities = [];
  this.jobs = {};
  this.state = ST_INITED;

  app.event.on(events.ADD_ACTIVITIES, this.addActivities.bind(this));
  app.event.on(events.REMOVE_ACTIVITIES, this.removeActivities.bind(this));
};

var pro = Server.prototype;

/**
 * Server lifecycle callback
 */
pro.start = function() {
  if(this.state > ST_INITED) {
    return;
  }

  this.globalFilterService = initFilter(true, this.app);
  this.filterService = initFilter(false, this.app);
  this.handlerService = initHandler(this.app);
  this.activityHandlers = loadActivityHandlers(this.app);
  loadActivities(this, this.app);
  this.state = ST_STARTED;
};

pro.afterStart = function() {
  scheduleActivities(this, this.activities);
};

/**
 * Stop server
 */
pro.stop = function() {
  this.state = ST_STOPED;
};

/**
 * Global handler.
 *
 * @param  {Object} msg request message
 * @param  {Object} session session object
 * @param  {Callback} callback function 
 */
pro.globalHandle = function(msg, session, cb) {
  if(this.state !== ST_STARTED) {
    cb(new Error('server not started'));
    return;
  }

  var routeRecord = parseRoute(msg.route);
  if(!routeRecord) {
    cb(new Error('meet unknown route message %j', msg.route));
    return;
  }

  var self = this;
  var dispatch = function(err, resp) {
    if(err) {
      handleError(true, self, err, msg, session, resp, function(err, resp) {
        response(true, self, err, msg, session, resp, cb);
      });
      return;
    }

    if(self.app.getServerType() !== routeRecord.serverType) {
      doForward(self.app, msg, session, routeRecord, function(err, resp) {
        response(true, self, err, msg, session, resp, cb);
      });
    } else {
      doHandle(self, msg, session, routeRecord, function(err, resp) {
        response(true, self, err, msg, session, resp, cb);
      });
    }
  };
  beforeFilter(true, self, msg, session, dispatch);
};

/**
 * Handle request
 */
pro.handle = function(msg, session, cb) {
   if(this.state !== ST_STARTED) {
    cb(new Error('server not started'));
    return;
  }

  var routeRecord = parseRoute(msg.route);
  doHandle(this, msg, session, routeRecord, cb);
};

/**
 * Add activities at runtime.
 *
 * @param {Array} activities would be added in application
 */
pro.addActivities = function(activities) {
  this.activityHandlers = loadActivityHandlers(this.app);
  for(var i=0, l=activities.length; i<l; i++) {
    var activity = activities[i];
    checkAndAdd(activity, this.activities, this);
  }
  scheduleActivities(this, activities);
};

/**
 * Remove activities at runtime.
 *
 * @param {Array} activities would be removed in application
 */
pro.removeActivities = function(activities) {
  for(var i=0, l=activities.length; i<l; i++) {
    var activity = activities[i];
    var id = parseInt(activity.id);
    if(!!this.jobs[id]) {
      schedule.cancelJob(this.jobs[id]);
    } else {
      logger.warn('activity is not in application: %j', activity);
    }
  }
};

var initFilter = function(isGlobal, app) {
  var service = new FilterService();
  var befores, afters;

  if(isGlobal) {
    befores = app.get('__globalBefores__');
    afters = app.get('__globalAfters__');
  } else {
    befores = app.get('__befores__');
    afters = app.get('__afters__');
  }

  var i, l;
  if(befores) {
    for(i=0, l=befores.length; i<l; i++) {
      service.before(befores[i]);
    }
  }

  if(afters) {
    for(i=0, l=afters.length; i<l; i++) {
      service.after(afters[i]);
    }
  }

  return service;
};

var initHandler = function(app) {
  return new HandlerService(app, loadHandlers(app));
};

/**
 * Load handlers from current application
 */
var loadHandlers = function(app) {
  var p = pathUtil.getHandlerPath(app.getBase(), app.getServerType());
  if(p) {
    return Loader.load(p, app);
  }
};

/**
 * Load activity handlers from current application
 */
var loadActivityHandlers = function(app) {
  var p = pathUtil.getActivityPath(app.getBase(), app.getServerType());
  if(p) {
    return Loader.load(p, app);
  }
};

/**
 * Load activities from configure file
 */
var loadActivities = function(server, app) {
  app.loadConfig('activities', app.getBase() + '/config/activities.json');
  var activities = app.get('activities');
  for(var serverType in activities) {
    if(app.serverType === serverType) {
      var list = activities[serverType];
      for(var i = 0; i<list.length; i++) {
        if(!list[i].serverId) {
          checkAndAdd(list[i], server.activities, server);
        } else {
          if(app.serverId === list[i].serverId) {
            checkAndAdd(list[i], server.activities, server);
          }
        }
      }
    }
  }
};

/**
 * Fire before filter chain if any
 */
var beforeFilter = function(isGlobal, server, msg, session, cb) {
  var fm;
  if(isGlobal) {
    fm = server.globalFilterService;
  } else {
    fm = server.filterService;
  }
  if(fm) {
    fm.beforeFilter(
      msg, session, cb);
  } else {
    cb();
  }
};

/**
 * Fire after filter chain if have
 */
var afterFilter = function(isGlobal, server, err, msg, session, resp) {
  var fm;
  if(isGlobal) {
    fm = server.globalFilterService;
  } else {
    fm = server.filterService;
  }
  if(fm) {
    fm.afterFilter(err, msg, session, resp, function() {
      // do nothing
    });
  }
};

/**
 * pass err to the global error handler if specified
 */
var handleError = function(isGlobal, server, err, msg, session, resp, cb) {
  var handler;
  if(isGlobal) {
    handler = server.app.get('errorHandler');
  } else {
    handler = server.app.get('globalErrorHandler');
  }
  if(!handler) {
    logger.debug('no default error handler to resolve unknown exception. ' + err.stack);
    cb(err, resp);
  } else {
    handler(err, msg, resp, session, cb);
  }
};

/**
 * Send response to client and fire after filter chain if any.
 */
var response = function(isGlobal, server, err, msg, session, resp, cb) {
  cb(err, resp);
  // after filter should not interfere response
  afterFilter(isGlobal, server, err, msg, session, resp);
};

/**
 * Parse route string.
 *
 * @param  {String} route route string, such as: serverName.handlerName.methodName
 * @return {Object}       parse result object or null for illeagle route string
 */
var parseRoute = function(route) {
  if(!route) {
    return null;
  }
  var ts = route.split('.');
  if(ts.length !== 3) {
    return null;
  }

  return {
    route: route,
    serverType: ts[0],
    handler: ts[1],
    method: ts[2]
  };
};

var doForward = function(app, msg, session, routeRecord, cb) {
  var finished = false;
  //should route to other servers
  try {
    app.sysrpc[routeRecord.serverType].msgRemote.forwardMessage(
      session,
      msg,
      session.export(),
      function(err, resp) {
        if(err) {
          logger.error('fail to process remote message:' + err.stack);
        }
        finished = true;
        cb(err, resp);
      }
    );
  } catch(err) {
    if(!finished) {
      logger.error('fail to forward message:' + err.stack);
      cb(err);
    }
  }
};

var doHandle = function(server, msg, session, routeRecord, cb) {
  var originMsg = msg;
  msg = msg.body || {};
  msg.__route__ = originMsg.route;

  var self = server;

  var handle = function(err, resp) {
    if(err) {
      // error from before filter
      handleError(false, self, err, msg, session, resp, function(err, resp) {
        response(false, self, err, msg, session, resp, cb);
      });
      return;
    }

    self.handlerService.handle(routeRecord, msg, session, function(err, resp) {
      if(err) {
        //error from handler
        handleError(false, self, err, msg, session, resp, function(err, resp) {
          response(false, self, err, msg, session, resp, cb);
        });
        return;
      }

      response(false, self, err, msg, session, resp, cb);
    });
  };  //end of handle

  beforeFilter(false, server, msg, session, handle);
};

/**
 * Schedule activities
 */
var scheduleActivities = function(server, activities) {
  var handlers = server.activityHandlers;
  for(var i = 0; i<activities.length; i++) {
    var activityInfo = activities[i];
    var time = activityInfo['time'];
    var activity = activityInfo['activity'];
    var job = activityInfo['job'];
    var jobId = activityInfo['id'];
    if(!time || !activity || !job || !jobId) {
      logger.error('activity miss necessary parameters: %j', activityInfo);
      continue;
    }
    var handler = handlers[activity];
    if(!handler) {
      logger.error('could not find activity: %j', activityInfo);
      continue;
    }
    if(typeof handler[job] !== 'function') {
      logger.error('could not find activity job: %j, %s', activityInfo, job);
      continue;
    }
    var id = schedule.scheduleJob(time, handler[job].bind(handler));
    server.jobs[jobId] = id;
  }
};

/**
 * If activity is not in activities then put it in the array.
 */
var checkAndAdd = function(activity, activities, server) {
  if(!containActivity(activity.id, activities)) {
    server.activities.push(activity);
  } else {
    logger.warn('activity is duplicated: %j', activity);
  }
};

/**
 * Check if activity is in activities.
 */
var containActivity = function(id, activities) {
  for(var i=0, l=activities.length; i<l; i++) {
    if(id == activities[i].id)
      return true;
  }
  return false;
};