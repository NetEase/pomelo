var sio = require('socket.io');
var logger = require('../util/log/log').getLogger(__filename);
var pomelo = require('../pomelo');
var Proxy = require('local-proxy');
var Gateway = require('rpc-gateway');
var pomelo = require('../pomelo');
var sessionService = require('./service/sessionService');

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
	var app = pomelo.getApplication();
	var remoteMap = app.get('remoteMap');
	if(!!remoteMap) {
		gateway = Gateway.createGateway({services: remoteMap});
		gateway.listen(server.port);
		logger.info('[connector server] start listen on server: '+ JSON.stringify(server));
	} else {
		logger.error('[connector server] fail to get remote map');
	}
	
//	startWebsocket(server);
};

/**
 * 服务器启动后回调(可选)
 */
server.afterStart = function() {
  console.log(' [connectorServer] after start!!! ');
	startWebsocket(5050);
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
	
	wsocket.set('log level', 1);
	wsocket.sockets.on('connection', function (socket) {
		/**
		 * 客户端新请求到达回调
		 */
		socket.on('message', function(msg) {
      console.log('[connector server] get msg: ' + JSON.stringify(msg));
			if(!msg) {
				//忽略空请求
				return;
			}
			
			var app = pomelo.getApplication();
			
			var session = sessionService.getSession(socket);
			if(!session) {
				console.log('empty session msg:' + JSON.stringify(session));
				session = sessionService.createSession({key: socket, response: getResponseFunction(socket)});
				session.uid = "changchang";
			}
			
			var app = pomelo.getApplication();
			var type = checkServerType(msg);
			if(!type) {
				logger.error('[connect server] invalid route string. ' + msg.route);
				session.response({route: msg.route, code: 500});
				return;
			}
			
			//if is other server's message
			if(type !== 'connector') {
				if(!session.uid) {
					session.response({route: msg.route, code: 500});
					return;
				}
				
				var proxy = app.get('proxyMap');
				try {
				  console.log(proxy);
					proxy.sys[type].msgService.forwardMessage(session.uid, msg, session.exportSession(), function(err, resp) {
						if(!!err) {
							logger.error('[handlerManager] fail to process remote message:' + JSON.stringify(err));
							session.response({route: msg.route, code: 500});
							return;
						}
						session.response(resp);
					});
				} catch(err) {
					logger.error('[handlerManager] fail to forward message:' + err.stack);
					session.response({route: msg.route, code: 500});
				}
				return;
			}
			
			app.handle(msg, session, function(err) {
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
		socket.emit('message', resp);
	};
};

var responseError = function(socket, err, msg) {
	//TODO: use the real error code
	socket.emit('message', {route: msg.route, code: 500});
};