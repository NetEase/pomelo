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
	console.log(' [login server] start listen on server: '+ JSON.stringify(server));
};