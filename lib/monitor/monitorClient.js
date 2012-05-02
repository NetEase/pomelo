var Harvester = require('./log_harvester').LogHarvester;
var app = require('../pomelo').getApp();
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
	var harvester = null;
	if(app.serverType === 'master') {
	  harvester = new Harvester(master, {id:app.serverId, type:app.serverType});
	} else {
	  var curServer = app.get('curServer');
	  harvester = new Harvester(master, {id:app.serverId, type:app.serverType, host: curServer.host, port: curServer.wsPort});
	}
	harvester.run();
};

  