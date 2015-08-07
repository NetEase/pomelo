var zkClient = require('./zkClient');
var utils = require('../util/utils');
var constants = require('../util/constants');
var countDownLatch = require('../util/countDownLatch');
var logger = require('pomelo-logger').getLogger('pomelo', __filename);

var Monitor = function(app, opts) {
	opts = opts || {};
	this.app = app;
	this.serverInfo = app.getCurServer();
};

module.exports = Monitor;

Monitor.prototype.start = function(cb) {
	var self = this;

	var monitor = new zkClient(this.app, function() {
		logger.debug('server %s monitor start', self.app.serverId);
		getAndWatchCluster(self.app, monitor);
		utils.invokeCallback(cb);
	});

	this.monitor = monitor;
};

Monitor.prototype.stop = function(cb) {
	this.monitor.close();
	process.nextTick(function() {
		utils.invokeCallback(cb);
	});
};

var getClusterInfo = function(app, zk, servers) {
	var success = true;
	var results = {};
	if(!servers.length)	{
		logger.error('get servers data is null.');
		return;
	}
	
	var latch = countDownLatch.createCountDownLatch(servers.length, {timeout: constants.TIME.TIME_WAIT_COUNTDOWN}, function() {
		if(!success) {
			logger.error('get all children data failed, with serverId: %s', app.serverId);
			return;
		}
		logger.info('cluster servers information: %j', results);
		app.replaceServers(results);
	});

	for(var i = 0; i < servers.length; i++) {
		(function(index) {
			if(utils.startsWith(servers[index], 'info::')) {
				zk.getData(zk.path + '/' + servers[index], null, function(err, data) {
					if(!!err)	{
						logger.error('%s get data failed for server %s, with err: %j', app.serverId, servers[index], err.stack);
						latch.done();
						success = false;
						return;
					}
					var serverInfo = JSON.parse(data);
					results[serverInfo.id] = serverInfo;
					latch.done();
				});
			} else {
				latch.done();
			}
		})(i);
	}
};

var getAndWatchCluster = function(app, zk) {
	logger.debug('watch server: %s, with path: %s', app.serverId, zk.nodePath);
	zk.getChildren(getAndWatchCluster.bind(null, app, zk), function(err, children) {
		if(!!err)	{
			logger.error('get children failed when watch server, with err: %j', err.stack);
			return;
		}
		logger.debug('cluster children: %j', children);
		getClusterInfo(app, zk, children);
	});
};