var util = require('util');
var app = require('../pomelo').getApp();
var color = require('../util/color');
var LogServer = require('./log_server').LogServer;
var logger = require('../util/log/log').getLogger(__filename);



var Server=function(){
    var handler={};
	var clients = {};
	var clientStatus = {};
	var STARTED = 0; //started
	var CONNECTED = 1; //started
	var logServer = null;
}

this.handler.pushStatus=function(servertype,serverId){
 logger.info(' report status serverType: ' + serverType + ' serverId: ' + serverId);
}
this.listen=function(server){
  this.status=this.STARTED;
  
  logServer=new LogServer();
  logServer.listen(server.port);
  var consoleApp=require('../app');
  logger.info(' [master server] start listen on server: '+ JSON.stringify(server));
  app.startmonitor();
};

