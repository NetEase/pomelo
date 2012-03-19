var dnode = require('dnode');
var monitor = require('pomelo-monitor');
var monitorService = require('../common/service/monitorService');
var Harvester = require('./log/log_harvester').LogHarvester;

var context = null;

MonitorClient = function(){};

var monitorClient = module.exports  = new MonitorClient() ;

var connected = false;
var timerId = null;
/**
 *
 * 客户端连接
 *
 */
MonitorClient.prototype.start = function(app,server){
	context = app;
	this.server = server;
	var self = this;
	if (connected==false) {
		timerId = setInterval(function(){
			if (!!connected) {clearInterval(timerId);return }
			self.start(app,server);
			console.log('beging auto connection to master ' + JSON.stringify(server))
		},5000);
	}
	dnode({
    hello : function (name) {client.pushStatus(context.serverId,'running');},
    connect : function (name) {console.log(' pls connect each other 请相互连接吧');
      if(!!app.currentServer.afterStart)
      	app.currentServer.afterStart();
    },
    reconnect : function (name) {console.log(' pls reconnect each other ');},
    getSysData : this.getSysData,
    getAppData : this.getAppData
	}).connect(server.port, this.onConnect);
};

/**
 * dnode client for master server
 */
var client;
var conn;



/**
 * 连接服务器
 * @param remote
 * @param conn
 */
MonitorClient.prototype.onConnect = function(remote, conn){
	client = remote;
	conn = conn;
	console.log(' monitor client to Master server is connected ' + conn.id  + context.serverType);
	monitorClient.publicConnected();
	connected = true;
	var config = require('./log/log.conf').config;
	//var harvester = new Harvester(config);
	//harvester.run();
};

/**
 * The init function for event module
 */
MonitorClient.prototype.publicConnected = function(){
	if (!client){
		throw Error(' monitor client is closed or not connected ');
	}
	console.log(' test public status ...... ' + JSON.stringify(client));
	client.publicConnected(context.serverType,context.serverId);
};  
 
MonitorClient.prototype.getSysData = function(cb){
	var data = {'cpu':323,'name':'windows',server:this.server};
	cb.apply(null, [ monitor.getSysInfo()]); //monitor.getSysInfo()
}; 

MonitorClient.prototype.getAppData = function(cb){
  cb.apply(null, [monitorService.getDataMap()]); //monitor.getSysInfo()
}; 
