var app = require('../pomelo').app;
var ServerAgent = require('./serverAgent').ServerAgent;
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

var serverAgent = null;

server.listen = function(server) {
  this.serverAgent = new ServerAgent();
  this.serverAgent.listen(server.port);
  logger.info(' [master server] start listen on server: '+ JSON.stringify(server));
  app.startMonitor();
  this.startQueryServer(server.queryPort);
  var profilerAgent  = require('./profilerAgent');
  profilerAgent.start(server.wsPort || 2337);
};

server.afterStart = function() {
   process.on('SIGHUP',function(){
     app.quit();
   });
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
		res.end('window.__front_address__=\'' + self.serverAgent.getLowLoadServer() + '\';');
	});

	app.get('/status', function(req, res) {
		res.writeHeader(200, {
			'content-type': 'text/plain'
		});
		res.end(JSON.stringify(self.serverAgent.getStatus()));
	});

	app.listen(port);
};

