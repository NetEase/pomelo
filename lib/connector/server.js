var sio = require('socket.io');
var app = require('../application');
var session = require('../session');
var logger = require('../util/log/log').getLogger(__filename);

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
	console.log(' [connector server] start listen on server: '+ JSON.stringify(server));
	startWebsocket(server);
};

/**
 * 服务器启动后回调(可选)
 */
server.afterStart = function() {
    console.log(' [connectorServer] after start!!! ');
	//startWebsocket();
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
var startWebsocket = function(server) {
	console.log('server.port '  + server.port)
	wsocket = sio.listen(server.port);
	//logger.info('agent server websocket listen ' , {'port':configs.frontendPort});
	
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
      
			var curSession = session.create(msg.route, msg.params);
      app.handle(curSession, processRequest)
		});	//on message end
	});	//on connection end
};


var processRequest = function(err, session) {
	logger.info('process request callback');
	if(!!err) {
		logger.error(err);
	}
};


