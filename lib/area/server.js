var app = require('../application');
var serverRouter = require('../serverRouter');
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

server.listen = function(port) {
	startDNode(port);
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
var startDNode = function(port) {
	
};





