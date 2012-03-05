var dnode = require('dnode');
var app = require('../application');
var session = require('../session');
/**
 * master server
 */
var server = module.exports;
var dserver;
var event = {};


event.pushStatus = function(serverType,serverId){
	console.log('[serverType]' + serverType + serverId);
};

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
  dserver = dnode({
	 'pushStatus': event.pushStatus
 	});
  dserver.listen(server.port);
	console.log(' [master server] start listen on server: '+ JSON.stringify(server));
};

 

