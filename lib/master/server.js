var util = require('util');
var app = require('../pomelo').getApp();
var color = require('../util/color');
var LogServer = require('./log_server').LogServer;
var logger = require('../util/log/log').getLogger(__filename);
var express = require('express');

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
  
  this.logServer = new LogServer();
  this.logServer.listen(server.port);
  console.log("sever invoke!server port is"+server.port);
  logger.info(' [master server] start listen on server: '+ JSON.stringify(server));
//  if(app){
  app.startMonitor();
  this.startQueryServer(server.queryPort);
//  }else{
//  app=
//    require('../pomelo').createApp().startMonitor();
//  }
  
};

server.afterStart = function() {

};
 
server.startQueryServer = function(port) {
	var app = express.createServer();
	app.use(app.router);
	app.configure('development', function(){
		app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
	});

	app.configure('production', function(){
	  app.use(express.errorHandler()); 
	});

	var self = this;

	// Routes
	app.get('/', function(req, res){
		res.writeHeader(200, {
			'content-type': 'text/javascript'
		});
		res.end('window.__front_address__=\'' + self.logServer.getLowLoadServer() + '\';');
	});

	app.get('/status', function(req, res) {
		res.writeHeader(200, {
			'content-type': 'text/plain'
		});
		res.end(JSON.stringify(self.logServer.getStatus()));
	});

	app.listen(port);
};

