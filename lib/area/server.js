var pomelo = require('../pomelo');
var logger = require('../util/log/log').getLogger(__filename);
var MailBox = require('mail-box');
var MailRouter = require('mail-router');
var Gateway = require('rpc-gateway');

/**
 * agent server
 */
var server = module.exports;
var mailBox, mailRouter;

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

server.listen = function(server) {
	var app = pomelo.getApp();
	var remoteMap = app.get('remoteMap');
	if(!!remoteMap) {
		gateway = Gateway.createGateway({services: remoteMap});
		gateway.listen(server.port);
		logger.info('[area server] start listen on server: '+ JSON.stringify(server));
	} else {
		logger.error('[area server] fail to get remote map');
	}
};

/**
 * 服务器启动后回调(可选)
 */
server.afterStart = function() {
  console.log(' [area server] after start!!! ');
  var app = pomelo.getApp();
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

/**
 * 服务器关闭前回调(可选)
 */
server.beforeClose = function() {
};

/**
 * 关闭服务器
 */
server.close = function() {
	app.set('mailRouter', null);
	app.set('mailBox', null);
	if(!!mailRouter) {
		mailRouter.close();
		mailRouter = null;
	}
	
	if(!!mailBox) {
		mailBox.close();
		mailBox = null;
	}
};
