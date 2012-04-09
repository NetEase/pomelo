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
	//color.log(color.$('fsfsd').red);
//	dserver = dnode(function(client, conn) {
//		this.publicConnected = function(serverType,serverId){
//			log($('serverType ' + serverType + ' ' + serverId + ' connected to master ').red);
// 			if (!!clients[serverId]) console.error('the client from ' + serverId + ' is existed, please check the config');
//			clients[serverId] = client;
//			clientStatus[serverId] = STARTED;
//			self.checkReady();
//		};
//		this.pushStatus = function(serverId,status){
//			//console.log('call from client serverId ' + serverId + ' status ' + status);
//			//clientStatus[serverId] = status;
//		};
// 	});
  //dserver.listen(server.port);
  
  logServer = new LogServer();
  logServer.listen(server.port);
  console.log("sever invoke!server port is"+server.port);
  //var consoleapp = require('./app_express');
  logger.info(' [master server] start listen on server: '+ JSON.stringify(server));
  //this.startWebsocket(8888);
  if(app){
  app.startMonitor();
  }else{
  app=
    require('../pomelo').createApp().startMonitor();
  }
  
};

server.afterStart = function() {

}

server.getNode = function(msg){
	msg.socket.emit(msg.method,app.servers);
};

server.getSystem = function(msg){
	var serverId = msg.id;
	var sysInfo = '';
	if (!clients[serverId]) {
		sysInfo = 'can not connect to client ' + serverId;
		msg.socket.emit(msg.method,sysInfo);
	}
	else {
		clients[serverId].getSysData(function(data){msg.socket.emit(msg.method,data);});
	}
 	
};

server.getApp = function(msg){
	var serverId = msg.id;
	var appInfo = '';
	if (!clients[serverId]) {
		appInfo = 'can not connect to client ' + serverId;
		msg.socket.emit(msg.method,appInfo);
	}
	else {
		clients[serverId].getAppData(function(data){msg.socket.emit(msg.method,data);});
	}
};

server.checkReady = function(){
	   logger.info('test. begin..checkReady.......');
		if (this.status != CONNECTED){
			var allStarted = true;
			var servers = app.servers;
			for (serverType in servers){
				if (serverType==='master') continue;
		    var typeServers = servers[serverType];
		      for (var i=0; i<typeServers.length; i++){
		        var server = typeServers[i];	
		        if (clientStatus[server.id] != STARTED){
		        	allStarted = false;
		        	logger.info(' start not ready.waiting from ' + server.id + ' connect.......');
		        	break;
		        }
  		   }
			}
			if (allStarted){
				logger.info('begin notify to connect each other');
				for (var id in clients){
					clients[id].connect();
				}
			}
		} else {
			//something close recall to reconnect
			for (var id in clients){
				clients[id].reconnect();
			}
		}
};

 

