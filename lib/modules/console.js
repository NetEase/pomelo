/*!
 * Pomelo -- consoleModule serverStop stop/kill
 * Copyright(c) 2012 fantasyni <fantasyni@163.com>
 * MIT Licensed
 */
var logger = require('pomelo-logger').getLogger(__filename);
var monitor = require('pomelo-monitor');
var countDownLatch = require('../util/countDownLatch');
var utils = require('../util/utils');
var TIME_WAIT_KILL = 5000;

module.exports = function(opts) {
	return new Module(opts);
};

module.exports.moduleId = '__console__';

var Module = function(opts) {
		opts = opts || {};
		this.app = opts.app;
		this.starter = opts.starter;
		this.interval = opts.interval || 5;
	};

Module.prototype.monitorHandler = function(agent, msg, cb) {
	if(msg.signal === 'stop') {
		this.app.stop(true);
	} else {
		var serverId = agent.id;
		var pid = process.pid;
		var params = {
			serverId: serverId,
			pid: pid
		};
		monitor.psmonitor.getPsInfo(params, function(err, data) {
			cb({
				serverId: agent.id,
				body: data
			});
		});
	}
};

Module.prototype.clientHandler = function(agent, msg, cb) {
	var self = this, sid, record;
	if(msg.signal === 'kill') {
		var pids = [];
		var serverIds = [];
		for(sid in agent.idMap) {
			record = agent.idMap[sid];
			serverIds.push(record.id);
			pids.push(record.pid);
		}
		if(!pids.length || !serverIds.length) {
			cb(null, {
				status: "error"
			});
			return;
		}
		setTimeout(function() {
			self.starter.kill(self.app, pids, serverIds);
			cb(null, {
				status: "ok"
			});
		}, TIME_WAIT_KILL);
	} else if(msg.signal === 'stop') {
		agent.notifyAll(module.exports.moduleId, {
			signal: msg.signal
		});
		self.app.stop(true);
		cb(null, {
			status: "ok"
		});
	} else {
		var serverInfo = {};
		var count = utils.size(agent.idMap);
		var latch = countDownLatch.createCountDownLatch(count, function() {
			cb(null, {
				msg: serverInfo
			});
		});

		for(sid in agent.idMap) {
			record = agent.idMap[sid];
			agent.request(record.id, module.exports.moduleId, {
				signal: msg.signal
			}, function(msg) {
				serverInfo[msg.serverId] = msg.body;
				latch.done();
			});
		}
	}
};