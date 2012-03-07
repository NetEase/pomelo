var dnode = require('dnode');
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

var dserver = null;

server.listen = function(server) {
	dserver = dnode({
	 	});
	dserver.listen(server.port);
	console.log(' [login server] start listen on server: '+ JSON.stringify(server));
};