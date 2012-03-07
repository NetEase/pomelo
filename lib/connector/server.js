var sio = require('socket.io');
var session = require('../session');
var logger = require('../util/log/log').getLogger(__filename);
var pomelo = require('../pomelo');
var Proxy = require('local-proxy');
var Gateway = require('rpc-gateway');
var pomelo = require('../pomelo');

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
			var type = checkServerType(msg);
			if(!type) {
				response(new Error('unnkown msg type:' + msg.route));
				return;
			}
			
			function response(err, resp) {
				if(!!err) {
					logger.error('[connector server] response error:' + err.stack);
					responseError(socket, err, msg);
				} else {
					console.log('[connector server] response result:' + resp);
					responseResult(socket, resp);
				}
			};
			
			//TODO: generate real session
			var curSession = {uid: 'coming soon...', response: response};
			
			if(type == 'connector') {
				app.handle(msg, curSession);
				return;
			}

			var proxy = app.get('proxyMap');
			try {
				proxy.sys[type].msgService.forwardMessage(curSession.uid, msg, curSession, response);
			} catch(err) {
				logger.error('[server] fail to forward message:' + err.stack);
				responseError(socket, err, msg);
			}
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

var responseResult = function(socket, resp) {
	socket.emit('message', resp);
};

var responseError = function(socket, err, msg) {
	//TODO: use the real error code
	socket.emit('message', {route: msg.route, code: 500});
}