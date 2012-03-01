var sio = require('socket.io');
var app = require('../application');
var session = require('../session');
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
	wsocket = sio.listen(server.port);
	//logger.info('agent server websocket listen ' , {'port':configs.frontendPort});
	
	wsocket.set('log level', 1);
	wsocket.sockets.on('connection', function (socket) {
		/**
		 * 客户端新请求到达回调
		 */
		socket.on('message', function(msg) {
            console.log('[connector server] get msg: '+msg);
			if(!msg) {
				//忽略空请求
				return;
			}
            var curSession = session.create(msg.route, msg.params);
            app.handle(session, processRequest)
			//filterManager.doFilter(session, processRequest);
		});	//on message end
	});	//on connection end
};


var processRequest = function(session, context) {
    var msg = context.msg;
	serverRouter.forwardMessage(msg, function(err, res, attach) {
	    console.log(' handler server process in attach '+ attach);
	});	//forwardMessage end
};


