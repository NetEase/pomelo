var util = require('util');
var app = require('../pomelo').getApp();
var color = require('../util/color');
var LogServer = require('./log_server').LogServer;
var logger = require('../util/log/log').getLogger(__filename);

/**
 * master server
 */
var server = module.exports;
var dserver;
var handler = {};

handler.pushStatus = function(serverType,serverId){
	logger.info(' report status serverType: ' + serverType + ' serverId: ' + serverId);
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

var clients = {};
var clientStatus = {};
var STARTED = 0; //started
var CONNECTED = 1; //started

var logServer = null;

server.listen = function(server) {
	this.status = STARTED;
	var self = this;
  
  logServer = new LogServer();
  logServer.listen(server.port);
  console.log("sever invoke!server port is"+server.port);
  logger.info(' [master server] start listen on server: '+ JSON.stringify(server));
//  if(app){
  app.startMonitor();
//  }else{
//  app=
//    require('../pomelo').createApp().startMonitor();
//  }
  
};

server.afterStart = function() {

};
 

