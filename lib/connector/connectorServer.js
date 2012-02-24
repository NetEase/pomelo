var sio = require('socket.io');
var rpcMessage = require('../meta/rpcMessage');
var filterManager = require('../filterManager');
var serverRouter = require('../serverRouter');
var context = require('../context');
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
    console.log(' connecotrServer mock start! ');
};

/**
 * 服务器启动后回调(可选)
 */
server.afterStart = function() {
    console.log(' [connectorServer] after start!!! ');
	startWebsocket();
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
var startWebsocket = function() {
	console.log(' startwebsocket');
	wsocket = sio.listen(context.getFrontendPort());
	//logger.info('agent server websocket listen ' , {'port':configs.frontendPort});
	
	wsocket.set('log level', 1);
	wsocket.sockets.on('connection', function (socket) {
		/**
		 * 客户端新请求到达回调
		 */
		socket.on('message', function(msg) {
			if(!msg) {
				//忽略空请求
				return;
			}
            var rMsg = rpcMessage.create(msg);
            var context= {socket: socket, msg: rMsg};
			filterManager.doFilter(context, processRequest);
		});	//on message end
	});	//on connection end
};


var processRequest = function(context) {
    var msg = context.msg;
	serverRouter.forwardMessage(msg, function(err, res, attach) {
	    console.log(' handler server process in attach '+ attach);
	});	//forwardMessage end
};


