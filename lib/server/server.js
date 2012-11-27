/**
 * Implementation of server component.
 * Init and start server instance.
 */
var logger = require('pomelo-logger').getLogger(__filename);
var pathUtil = require('../util/pathUtil');
var Loader = require('pomelo-loader');
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
  this.filterService = null;
  this.handlerService = null;
  this.state = ST_INITED;
};

var pro = Server.prototype;

/**
 * Server lifecycle callback
 */
pro.start = function() {
  if(this.state > ST_INITED) {
    return;
  }

  this.filterService = initFilter(this.app);
  this.handlerService = initHandler(this.app);
  this.state = ST_STARTED;
};

/**
 * Stop server
 */
pro.stop = function() {
  this.state = ST_STOPED;
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
  if(!routeRecord) {
    cb(new Error('meet unknown route message %j', msg.route));
    return;
  }

  if(this.app.get('serverType') !== routeRecord.serverType) {
    doForward(this.app, msg, session, routeRecord, cb);
  } else {
    doHandle(this, msg, session, routeRecord, cb);
  }
};

var initFilter = function(app) {
  var service = new FilterService(app);
  var befores = app.get('__befores__');
  var afters = app.get('__afters__');

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
  var p = pathUtil.getHandlerPath(app.getBase(), app.get('serverType'));
  if(p) {
    return Loader.load(p, app);
  }
};

/**
 * Fire before filter chain if any
 */
var beforeFilter = function(server, msg, session, cb) {
  var fm = server.filterService;
  if(fm) {
    fm.beforeFilter(msg, session, cb);
  } else {
    cb();
  }
};

/**
 * Fire after filter chain if have
 */
var afterFilter = function(server, err, msg, session, resp) {
  var fm = server.filterService;
  if(fm) {
    fm.afterFilter(err, msg, session, resp, function() {
      // do nothing
    });
  }
};

/**
 * pass err to the global error handler if specified
 */
var handleError = function(server, err, msg, session, resp, cb) {
  var handler = server.app.get('errorHandler');
  if(!handler) {
    logger.debug('no default error handler to resolve unknown exception. ' + err.stack);
    cb(err);
  } else {
    handler(err, msg, session, cb);
  }
};

/**
 * Send response to client and fire after filter chain if any.
 */
var response = function(server, err, msg, session, resp, cb) {
  cb(err, resp);
  // after filter should not interfere response
  afterFilter(server, err, msg, session, resp);
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
  msg = msg.body;
  if(typeof msg === 'string') {
    msg = JSON.parse(msg);
  }
  msg.__route__ = originMsg.route;

  var self = server;

  var handle = function(err, resp) {
    if(err) {
      // error from before filter
      handleError(self, err, msg, session, resp, function(err) {
        response(self, err, msg, session, resp, cb);
      });
      return;
    }

    self.handlerService.handle(routeRecord, msg, session, function(err, resp) {
      if(err) {
        //error from handler
        handleError(self, err, msg, session, resp, function(err, resp) {
          response(self, err, msg, session, resp, cb);
        });
        return;
      }

      response(self, err, msg, session, resp, cb);
    });
  };  //end of handle

  beforeFilter(server, msg, session, handle);
};