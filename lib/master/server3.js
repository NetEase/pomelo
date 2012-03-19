var dnode = require('dnode');
var util = require('util');
var app = require('../application');
var LogServer = require('./log_server').LogServer;
var consoleapp = require('./console/app_express');

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
	server = new LogServer();
	server.listen(server.port);
	console.log(' [master server] start listen on server: '+ JSON.stringify(server));
};
