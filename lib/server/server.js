/**
 * Implementation of server component.
 * Init and start server instance.
 */
var sio = require('socket.io');
var logger = require('../util/log/log').getLogger(__filename);
var pomelo = require('../pomelo');
var Proxy = require('local-proxy');
var Gateway = require('rpc-gateway');
var pomelo = require('../pomelo');
var sessionService = require('../common/service/sessionService');
var MailBox = require('mail-box');
var MailRouter = require('mail-router');
var taskManager = require('../common/service/taskManager');
var connectionService = require('../common/service/connectionService');
var mailBoxFilter = require('../filters/mailBoxFilter');
var handlerManager = require('../handlerManager');
var utils = require('../util/utils');

var gateway, proxy;

module.exports.createServer = function(opts) {
	return new Server(opts);
};

var Server = function (opts) {
	this.server = opts.server;
  this.flushInterval = opts.flushInterval||200;  //client message flush interval. default 200ms
  this.sendDirectly = opts.sendDirectly||false;
  sessionService.sendDirectly = this.sendDirectly;
};

var server = Server.prototype;

/**
 * 服务器启动前回调(可选)
 */
server.beforeStart = function() {
};

/**
 * 启动服务器
 */
server.start = function() {
	var app = pomelo.getApp();
	var remoteMap = app.get('remoteMap');
	if(!!remoteMap) {
		gateway = Gateway.createGateway({services: remoteMap});
		gateway.listen(this.server.port);
		logger.info('[' + this.server.serverType + ' server] start listen on server: '+ JSON.stringify(this.server));
	}

	app.startMonitor();
};

/**
 * 服务器启动后回调(可选)
 */
server.afterStart = function() {
  var app = pomelo.getApp();
  var self = this;

  MailRouter.createRouter({servers: app.servers, calculator: app.calculator}, function(err, router) {
    if (!!err) {
      logger.error('fail to start mail router %s, %s.', self.server.serverType, err.stack);
      throw err;
    }
    var mailRouter = router;
    app.set('mailRouter', mailRouter);
	});

  MailBox.createStation({servers: app.servers}, function(err, station) {
    if(!!err) {
      logger.error('fail to start mail box %s, %s.', self.server.serverType, err.stack);
      throw err;
    }
    var mailBox = station;
    mailBox.addPreFilter(mailBoxFilter.rpcPreFilter);
    mailBox.addAfterFilter(mailBoxFilter.rpcAfterFilter);
    app.set('mailBox', mailBox);

    //启动服务
    app.enable('schedulerService');
    if(!!self.server.wsPort) {
      startWebsocket(self.server.wsPort, self);
    }
	});
};

/**
 * 服务器关闭前回调(可选)
 */
server.beforeClose = function() {
};

/**
 * 关闭服务器
 */
server.close = function() {
};

/**
 * handle request
 */
server.handle = function(msg, session, cb) {
  var app = pomelo.getApp();
  var filterManager = app.get('filterManager');

  function handle(err) {
    if(!!err) {
      //error from before filter
      if(!!session.__sessionSent__) {
        //if has responsed in filter then ignore it
        doAfterFilter(err, msg, session, cb);
      } else {
        //else we have to handle the error
        handleError(err, msg, session, function(err) {
          doAfterFilter(err, msg, session, cb);
        });
      }
      return;
    }

    handlerManager.handle(msg, session, function(err) {
      if(!!err) {
        //error from handler
        if(!!session.__sessionSent__) {
          logger.warn('meet invalid handle error callback for session that has sent.');
          doAfterFilter(err, msg, session, cb);
        } else {
          handleError(err, msg, session, function(err) {
            doAfterFilter(err, msg, session, cb);
          });
        }
        return;
      }

      //everything is ok, do the after filter
      doAfterFilter(err, msg, session, cb);
    });
  }  //end of handle

  if(filterManager) {
    //do the before filter
    filterManager.beforeFilter(msg, session, handle);
  } else {
    handle();
  }
};

/**
 * 开始监听websocket
 *
 * @param port {Number} websocket port
 * @param server {Object} server instance
 */
var startWebsocket = function (port, server) {
	var wsocket = sio.listen(port);
	wsocket.set('log level', 1);
	wsocket.sockets.on('connection', function (socket) {
		connectionService.increaseConnectionCount();

		socket.on('disconnect', function() {
			var uid = session?session.uid:null;
			connectionService.decreaseConnectionCount(uid);
		});

		//create session for connection
    var session = getSession(socket);

		/**
     * new client message
     */
		socket.on('message', function(msg) {
			if(!msg) {
				//ignore empty request
				return;
			}

      var wrapper;
      if(msg.__new_format__) {
        wrapper = msg;
        msg = wrapper.body;
      }

			var type = checkServerType(msg);
			if(!type) {
				logger.error('meet invalid route string. ' + msg.route);
				return;
			}

      var curSession = session.cloneSession();
      if(wrapper) {
        curSession.__new_format__ = true;
        curSession.__msg_id__ = wrapper.id;
      }
      //nothing to callback
      server.handle(msg, curSession);
		});	//on message end
	});	//on connection end

  if(!this.sendDirectly) {
    setInterval(function() {
      sessionService.flush();
    }, this.flushInterval);
  }
};

/**
 * get session for current connection
 */
var getSession = function(socket) {
  var app = pomelo.getApp();
  var session = sessionService.getSession(socket.id);
  if(!!session) {
    return session;
  }

  session = sessionService.createSession({
    key: socket.id,
    socket: socket,
    frontendId: app.get('serverId')
  });

  session.response = function(resp) {
    if(!!this.__sessionSent__) {
      logger.warn('session has sent');
      return;
    }
    this.__sessionSent__ = true;
    resp.time = Date.now();
    if(this.__new_format__) {
      if(!this.__msg_id__) {
        logger.error('try to response to a notify: %j', resp);
        return;
      }
      resp = {
        id: this.__msg_id__, 
        __new_format__: true, 
        body: resp
      };
    }
    sessionService.sendMessage(session.key, resp);
  };

  // bind events for session
  socket.on('disconnect', session.closing.bind(session));
  socket.on('error', session.closing.bind(session));
  session.on('closing', function(session) {
    if(!!session && !session.uid) {
      //close it directly if not logined
      session.closed();
    }
  });
  session.on('closed', function(session) {
    sessionService.removeSession(session.key);
    taskManager.closeQueue(session.key, true);
  });
  session.on('login', function(session) {
    connectionService.addLoginedUser(session.uid, {
      loginTime: Date.now(),
      uid: session.uid,
      address:socket.handshake.address.address + ':' + socket.handshake.address.port,
      username: session.username
    });
  });

  return session;
};

/**
 * pass err to the global error handler if specified
 */
var handleError = function handleError(err, msg, session, cb) {
  var handler = pomelo.getApp().get('errorHandler');
  if(!handler) {
    logger.warn('no default error handler to resolve unknown exception. ' + err.stack);
    utils.invokeCallback(cb);
  } else {
    handler(err, msg, session, cb);
  }
};

/**
 * do the after filter
 */
var doAfterFilter = function(err, msg, session, cb) {
  var filterManager = pomelo.getApp().get('filterManager');
  if(!!filterManager) {
    filterManager.afterFilter(err, msg, session, cb);
  } else {
    utils.invokeCallback(cb);
  }
};

/**
 * Get server type form request message.
 */
var checkServerType = function (msg) {
	var route = msg.route;
	if(!route) {
    return null;
  }
	var idx = route.indexOf('.');
	if(idx < 0) {
    return null;
  }
	return route.substring(0, idx);
};
