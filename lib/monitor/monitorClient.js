var MonitorAgent = require('./monitorAgent').MonitorAgent;
var app = require('../pomelo').app;
var logger = require('../util/log/log').getLogger(__filename);

MonitorClient = function(){};

var monitorClient = module.exports  = new MonitorClient() ;

 /**
 *
 * 客户端连接
 *
 */
MonitorClient.prototype.start = function(app,master){
	this.server = master;
	var agent = null;
	if(app.serverType === 'master') {
			agent = new MonitorAgent(master, {id:app.serverId, type:app.serverType});
	} else {
	  var curServer = app.get('serverInfo');
	  agent = new MonitorAgent(master, {id:app.serverId, type:app.serverType, host: curServer.host, port: curServer.wsPort});
	}
	agent.run();
};


