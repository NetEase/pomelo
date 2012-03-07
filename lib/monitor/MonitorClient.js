var dnode = require('dnode');
var monitor = require('pomelo-monitor');
var monitorFilter = require('../filters/monitorFilter');

var context = null;

Monitor = function(){};

var monitor = module.exports  = new Monitor() ;
/**
 *
 * 客户端连接
 *
 */
Monitor.prototype.start = function(app,server){
	debugger;
	context = app;
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
 * 连接Agent服务器
 * @param remote
 * @param conn
 */
Monitor.prototype.onConnect = function(remote, conn){
	client = remote;
	conn = conn;
	console.log(' monitor client to Master server is connected ' + conn.id  + context.serverType);
	monitor.publicConnected();
};

/**
 * The init function for event module
 */
Monitor.prototype.publicConnected = function(){
	if (!client){
		throw error(' monitor client is closed or not connected ');
	}
	console.log(' test public status ...... ' + JSON.stringify(client));
	client.publicConnected(context.serverType,context.serverId);
};  
 
Monitor.prototype.getSysData = function(){
  return monitor.getSysInfo();
} 

Monitor.prototype.getAppData = function(){
  return monitorFilter.getDataMap();
}