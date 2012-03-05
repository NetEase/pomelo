var dnode = require('dnode');


var context = null;

Monitor = function(){};

var monitor = module.exports  = new Monitor() ;
/**
 *
 * 客户端连接
 *
 */
Monitor.prototype.start = function(app,server){
	context = app;
	dnode.connect(server.port, this.onConnect);
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
	console.log(' monitor client to Master server is connected '  + context.serverType);
	monitor.publicStatus();
};



/**
 * The init function for event module
 */
Monitor.prototype.publicStatus = function(){
	if (!client){
		throw error(' monitor client is closed or not connected ');
	}
	console.log(' test public status ...... ' + JSON.stringify(client));
	client.pushStatus(context.serverType,context.serverId);
};  
 