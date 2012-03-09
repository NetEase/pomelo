var dnode = require('dnode');
var monitor = require('pomelo-monitor');
var monitorFilter = require('../filters/monitorFilter');

var context = null;

MonitorClient = function(){};

var monitorClient = module.exports  = new MonitorClient() ;
/**
 *
 * 客户端连接
 *
 */
MonitorClient.prototype.start = function(app,server){
	debugger;
	context = app;
	this.server = server;
	dnode({
    hello : function (name) {client.pushStatus(context.serverId,'running');},
    connect : function (name) {console.log(' pls connect each other 请相互连接吧');},
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
};

/**
 * The init function for event module
 */
MonitorClient.prototype.publicConnected = function(){
	if (!client){
		throw error(' monitor client is closed or not connected ');
	}
	console.log(' test public status ...... ' + JSON.stringify(client));
	client.publicConnected(context.serverType,context.serverId);
};  
 
MonitorClient.prototype.getSysData = function(cb){
	var data = {'cpu':323,'name':'windows',server:this.server};
	var t = monitor.getSysInfo();
	console.log(t);
	cb.apply(null, [t]); //monitor.getSysInfo()
}; 

MonitorClient.prototype.getAppData = function(cb){
  console.log(monitorFilter.getDataMap());
  cb.apply(null, [monitorFilter.getDataMap()]); //monitor.getSysInfo()
}; 
