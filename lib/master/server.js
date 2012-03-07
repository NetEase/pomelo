var dnode = require('dnode');
var util = require('util');
var app = require('../application');
/**
 * master server
 */
var server = module.exports;
var dserver;
var handler = {};


handler.pushStatus = function(serverType,serverId){
	console.log(' report status serverType: ' + serverType + ' serverId: ' + serverId);
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

server.listen = function(server) {
	this.status = STARTED;
	var self = this;
	dserver = dnode(function(client, conn) {
		this.publicConnected = function(serverType,serverId){
 			if (!!clients[serverId]) throw error('the client from ' + serverId + ' is existed, please check the config');
			clients[serverId] = client;
			clientStatus[serverId] = STARTED;
			self.checkReady();
		};
		this.pushStatus = function(serverId,status){
			//console.log('call from client serverId ' + serverId + ' status ' + status);
			//clientStatus[serverId] = status;
		};
 	});
  dserver.listen(server.port);
	console.log(' [master server] start listen on server: '+ JSON.stringify(server));
	
};


server.checkReady = function(){
		console.log('test. begin..checkReady.......');
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
		        	console.log(' start not ready.wait other connect.......');
		        	break;
		        }
  		   }
			}
			if (allStarted){
				console.log('begin notify to connect each other');
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

 

