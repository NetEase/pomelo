var configFile = './ServerConfig';

var context = require('../lib/context');

var logger = require('../lib/util/log/log').getLogger(__filename);

var configs = require(configFile);

var servers = configs.servers;

/**
 * 检查server配置
 */
if (!servers || servers.length == 0) {
	logger.error('ERROR: no server found.');
	process.exit(1);
}

/**
 * 启动服务器
 * 
 * @returns
 */
var start = function() {
	var server;
	try {
		for ( var i = 0, l = servers.length; i < l; i++) {
			server = servers[i];
			if (typeof server.beforeStart == 'function') {
				server.beforeStart();
			}
		}

		for ( var i = 0, l = servers.length; i < l; i++) {
			servers[i].start();
		}
		
		for ( var i = 0, l = servers.length; i < l; i++) {
			server = servers[i];
			if (typeof server.afterStart == 'function') {
				server.afterStart();
			}
		}

	} catch (err) {
		logger.error('meet error during starting: ' + err.stack);
		return 1;
	}
	
	logger.info('all servers started ');
}

/**
 * 关闭服务器
 * 
 * @returns
 */
var stop = function() {
	logger.info('closing servers ...');
	var server;
	for ( var i = 0, l = servers.length; i < l; i++) {
		server = servers[i];
		if (typeof server.beferStop == 'function') {
			server.beferStop();
		}
	}

	for ( var i = 0, l = servers.length; i < l; i++) {
		servers[i].close();
	}
};

///**
// * 截获ctrl+c事件
// */
//process.on('SIGINT', function() {
//	stop();
//	return;
//});
//
/**
 * 捕获未捕获异常
 */
process.on('uncaughtException', function(err) {
	console.log('Caught exception: ' + err.stack);
});

context.init('.');
start();
