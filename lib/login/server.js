var Gateway = require('rpc-gateway');
var pomelo = require('../pomelo');
var MailBox = require('mail-box');
var MailRouter = require('mail-router');
var logger = require('../util/log/log').getLogger(__filename);

/**
 * agent server
 */
var server = module.exports;


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

/**
 * 服务器启动后回调(可选)
 */
server.afterStart = function() {
	console.log('[login server]: after start');
	var app = pomelo.getApplication();
  MailRouter.createRouter({servers: app.servers}, function(err, router) {
  	if(!!err) {
  		logger.error('fail to start mail router %s, %s.', app.serverType, err.stack);
  		throw err;
  	}
  	mailRouter = router;
  	app.set('mailRouter', mailRouter);
	});
  
  MailBox.createStation({servers: app.servers}, function(err, station) {
  	if(!!err) {
  		logger.error('fail to start mail box %s, %s.', app.serverType, err.stack);
  		throw err;
  	}
  	mailBox = station;
  	app.set('mailBox', mailBox);
	});
};

var dserver = null;

server.listen = function(server) {
	var app = pomelo.getApplication();
	var remoteMap = app.get('remoteMap');
	if(!!remoteMap) {
		gateway = Gateway.createGateway({services: remoteMap});
		gateway.listen(server.port);
		logger.info('[logic server] start listen on server: '+ JSON.stringify(server));
	} else {
		logger.error('[logic server] fail to get remote map');
	}
};