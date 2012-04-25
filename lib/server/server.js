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

var gateway, proxy;

module.exports.createServer = function(server) {
	return new Server(server);
};

var Server = function(server) {
	this.server = server;
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

	if(!!this.server.wsPort) {
		startWebsocket(this.server.wsPort);
	}

	app.startMonitor();
};

/**
 * 服务器启动后回调(可选)
 */
server.afterStart = function() {
  //logger.info('[' + this.server.serverType + ' server] after start.');
  var app = pomelo.getApp();
  MailRouter.createRouter({servers: app.servers, calculator: app.calculator}, function(err, router) {
  	if(!!err) {
  		logger.error('fail to start mail router %s, %s.', this.server.serverType, err.stack);
  		throw err;
  	}
  	mailRouter = router;
  	app.set('mailRouter', mailRouter);
	});

  MailBox.createStation({servers: app.servers}, function(err, station) {
  	if(!!err) {
  		logger.error('fail to start mail box %s, %s.', this.server.serverType, err.stack);
  		throw err;
  	}
  	mailBox = station;
  	app.set('mailBox', mailBox);

  	//启动服务
  	//
  	logger.debug('!!!!!!!!!!!!!!!!!!!!!scheulderService enable!');
  	app.enable('schedulerService');
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
 * 开始监听websocket
 *
 * @returns
 */
var startWebsocket = function(port) {
	wsocket = sio.listen(port);
	var sockets = [];
	wsocket.set('log level', 1);
	wsocket.sockets.on('connection', function (socket) {
		connectionService.increaseConnectionCount();

		socket.on('disconnect', function() {
			connectionService.decreaseConnectionCount();
		});

		var app = pomelo.getApp();

		var session = sessionService.getSession(socket.id);
		if(!session) {
			session = sessionService.createSession({key: socket.id, socket: socket, frontendId: app.get('serverId'), response: getResponseFunction(socket)});
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
				connectionService.addLoginedUser(session.uid, {loginTime: Date.now(), uid: session.uid, address:socket.handshake.address.address + ':' + socket.handshake.address.port, username: session.username});
			});
			session.on('logout', function(session) {
				connectionService.removeLoginedUser(session.uid);
			});
		}

		/**
		 * new client message
		 */
		socket.on('message', function(msg) {
			if(!msg) {
				//ignore empty request
				return;
			}

			var app = pomelo.getApp();
			var type = checkServerType(msg);
			if(!type) {
				logger.error('[connect server] invalid route string. ' + msg.route);
				session.response({route: msg.route, code: 500});
				return;
			}

			app.handle(msg, session.cloneSession(), function(err) {
				if(!!err) {
					responseError(socket, err, msg);
					return;
				}
				logger.warn('found invalid handle flow, uid:' + session.uid + ', msg:' + JSON.stringify(msg));
			});

		});	//on message end
	});	//on connection end
};

var checkServerType = function(msg) {
	var route = msg.route;
	if(!route) return null;
	var idx = route.indexOf('.');
	if(idx < 0) return null;
	return route.substring(0, idx);
};

var getResponseFunction = function(socket) {
	return function(resp) {
		resp.time = Date.now();
		socket.emit('message', resp);
	};
};

var responseError = function(socket, err, msg) {
	//TODO: use the real error code
	socket.emit('message', {route: msg.route, code: 500, time: Date.now()});
};

