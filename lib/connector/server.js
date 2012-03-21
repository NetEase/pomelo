var sio = require('socket.io');
var logger = require('../util/log/log').getLogger(__filename);
var pomelo = require('../pomelo');
var Proxy = require('local-proxy');
var Gateway = require('rpc-gateway');
var pomelo = require('../pomelo');
var sessionService = require('./service/sessionService');
var MailBox = require('mail-box');
var MailRouter = require('mail-router');
var taskManager = require('../common/service/taskManager');

var gateway, proxy;

/**
 * agent server
 */
var server = module.exports;


/**
 * 服务器启动前回调(可选)
 */
server.beforeStart = function() {
};

/**
 * 启动服务器
 */
server.start = function() {
};

server.listen = function(server) {
	var app = pomelo.getApp();
	var remoteMap = app.get('remoteMap');
	if(!!remoteMap) {
		gateway = Gateway.createGateway({services: remoteMap});
		gateway.listen(server.port);
		logger.info('[connector server] start listen on server: '+ JSON.stringify(server));
	} else {
		logger.error('[connector server] fail to get remote map');
	}
	
//	startWebsocket(server);
	startWebsocket(server.wsPort);
};

/**
 * 服务器启动后回调(可选)
 */
server.afterStart = function() {
  console.log(' [connectorServer] after start!!! ');
  var app = pomelo.getApp();
  MailRouter.createRouter({servers: app.servers}, function(err, router) {
  	if(!!err) {
  		logger.error('fail to start mail router %s, %s.', app.serverType, err.stack);
  		throw err;
  	}
  	mailRouter = router;
  	app.set('mailRouter', mailRouter);
	});
  
  MailBox.createStation({servers: app.servers}, function(err, station) {
  	if(!!err) {
  		logger.error('fail to start mail box %s, %s.', app.serverType, err.stack);
  		throw err;
  	}
  	mailBox = station;
  	app.set('mailBox', mailBox);
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
	console.log('websocket port:'  + port)
	wsocket = sio.listen(port);
	var sockets = [];
	wsocket.set('log level', 1);
	wsocket.sockets.on('connection', function (socket) {
		/**
		 * 客户端新请求到达回调
		 */
		socket.on('message', function(msg) {
            //console.log('[connector server] get msg: ' + JSON.stringify(msg));
			if(!msg) {
				//忽略空请求
				return;
			}
			
			var app = pomelo.getApp();
			
			var session = sessionService.getSession(socket.id);
			if(!session) {
				session = sessionService.createSession({key: socket.id, socket: socket, response: getResponseFunction(socket)});
//				session.uid = "changchang";
				socket.addListener('disconnect', session.closing.bind(session));
				socket.addListener('error', session.closing.bind(session));
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
		console.log('[connector server] response result:' + JSON.stringify(resp));
		resp.time = Date.now();
		socket.emit('message', resp);
	};
};

var responseError = function(socket, err, msg) {
	console.log('response err:' + err.stack);
	//TODO: use the real error code
	socket.emit('message', {route: msg.route, code: 500, time: Date.now()});
};