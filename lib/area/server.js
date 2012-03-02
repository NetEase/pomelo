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
	console.log(' [area server] start listen on server: '+ JSON.stringify(server));
};

/**
 * 服务器启动后回调(可选)
 */
server.afterStart = function() {
    console.log(' [area server] after start!!! ');
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
