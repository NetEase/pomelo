var __ = require('underscore');
var io = require('socket.io-client');
var monitor = require('pomelo-monitor');
var app = require('../pomelo').app;
var monitorService = require('../common/service/monitorService');
var logger = require('../util/log/log').getLogger(__filename);
var connectionService = require('../common/service/connectionService');

var areaService = require('../../demos/treasures/app/service/areaService');

var ml = require('./monitorLog');
var vm = require('vm');
var profiler = require('v8-profiler');

var STATUS_INTERVAL = 5 * 1000; // 60 seconds
var RECONNECT_INTERVAL = 15 * 1000; // 5 seconds
var HEARTBEAT_PERIOD = 30 * 1000; // 20 seconds
var HEARTBEAT_FAILS = 3; // Reconnect after 3 missed heartbeats

var MonitorAgent = function(master, node) {
	this._log = logger;
	this._conf = {};
	this._conf.node = node;
	this._conf.master = master;
	this._conf.status_frequency = STATUS_INTERVAL;
	this.last_heartbeat = null;
	this.connected = false;
	this.reconnecting = false;
	var monitorAgent = this;
}

MonitorAgent.prototype = {
	// Create socket, bind callbacks, connect to server
	connect : function() {
		var monitorAgent = this;
		var uri = monitorAgent._conf.master.host + ":"
				+ monitorAgent._conf.master.port;
		// console.error("master url is "+uri);
		monitorAgent.socket = io.connect(uri);

		// TODO(msmathers): Ensure this works once socket.io bug has been fixed...
		// https://github.com/LearnBoost/socket.io/issues/473
		monitorAgent.socket.on('error', function(reason) {
			monitorAgent.reconnect();
		});

		// Register announcement callback
		monitorAgent.socket.on('connect', function() {
			monitorAgent._log.info("Connected to server, sending announcement...");
			monitorAgent.announce();
			monitorAgent.connected = true;
			monitorAgent.reconnecting = false;
			monitorAgent.last_heartbeat = new Date().getTime();
		});

		// Server heartbeat
		monitorAgent.socket.on('heartbeat', function() {
			// monitorAgent._log.info("Received server heartbeat");
			monitorAgent.last_heartbeat = new Date().getTime();
			return;
		});

		// Node with same label already exists on server, kill process
		monitorAgent.socket
				.on(
						'node_already_exists',
						function() {
							monitorAgent._log
									.error("ERROR: A node of the same name is already registered");
							monitorAgent._log
									.error("with the log server. Change this monitorAgent's instance_name.");
							monitorAgent._log.error("Exiting.");
							process.exit(1);
						});

		monitorAgent.socket.on('runJs', function(msg) {
			var initContext = {
				app : app,
				os : require('os'),
				fs : require('fs'),
				process : process,
				monitor : monitor,
				logger : logger,
				areaService : areaService,
				monitorLog : ml,
				connectionService : connectionService
			};
			var context = vm.createContext(initContext);
			var result = vm.runInContext(msg, context);
			monitorAgent.socket.emit('runJs', result);
		});
		monitorAgent.socket.on('profiler', function(msg) {
			var type = msg.type, action = msg.action, uid = msg.uid,result = null;
			if (type === 'CPU') {
				if (action === 'start') {
					profiler.startProfiling();
				} else {
					result = profiler.stopProfiling();
					var res = {};
					res.head = result.getTopDownRoot();
					res.bottomUpHead = result.getBottomUpRoot();
					res.msg = msg;
					monitorAgent.socket.emit('cpuprofiler', res);
				}
			} else {
				var snapshot = profiler.takeSnapshot();
				snapshot.serialize({
					onData : function(chunk, size) {
						chunk = chunk + '';
						monitorAgent.socket.emit('heapprofiler', {
							method : 'Profiler.addHeapSnapshotChunk',
							params : {
								uid : uid,
								chunk : chunk
							}
						});
					},
					onEnd : function() {
						monitorAgent.socket.emit('heapprofiler', {
							method : 'Profiler.finishHeapSnapshot',
							params : {
								uid : uid
							}
						});
					}
				});
			}
		});
		// monitor systemInfo
		monitor.sysmonitor.getSysInfo(function(data) {
			monitorAgent.socket.emit('monitorSys', {
				body : data
			});
		});
		// monitor processInfo
		var serverId = app.serverId;
		var server = app.get('curServer');
		typeof server == 'undefined' ? server = {
			serverId : serverId,
			masterFlag : 'yes'
		} : server = {
			serverId : serverId,
			masterFlag : 'no'
		};
		monitor.psmonitor.getPsInfo(server, function(data) {
			monitorAgent.socket.emit('monitorPro', {
				body : data
			});
		});
		setInterval(function() {
			// monitor systemInfo
			monitor.sysmonitor.getSysInfo(function(data) {
				monitorAgent.socket.emit('monitorSys', {
					body : data
				});
			});

			monitor.psmonitor.getPsInfo(server, function(data) {
				monitorAgent.socket.emit('monitorPro', {
					body : data
				});
			});

			var onlineUser = connectionService.getStatisticsInfo();
			var curServer = app.get('serverInfo');
			if (!!curServer && !!curServer.wsPort) {
				monitorAgent.socket.emit('onlineUserTotalCount', {
					totalConnCount: onlineUser.totalConnCount
				});
			}

		}, STATUS_INTERVAL)
		// send log messages to master server
		monitorAgent.socket.on('monitorLog', function(msg) {
			// if(!!curServer && !!curServer.wsPort) {
			msg.serverId = app.serverId;
			// console.error('log_harverster serverId'+app.serverId);
			ml.getLogs(msg, function(data) {
				monitorAgent.socket.emit('monitorLog', data);
			});
			// }
		});
		// send scene info to master server,which only areaServer run
		monitorAgent.socket.on('monitorScene', function(msg) {
			var ids = msg.senceIds;
			var result = [];
			for ( var i = 0; i < ids.length; i++) {
				var users = areaService.getUsers(ids[i]);
				if (users != {}) {
					for ( var userId in users) {
						result.push(users[userId]);
					}
				}
			}
			monitorAgent.socket.emit('monitorScene', result);
		});
		monitorAgent.socket.on('monitorOnlineUser', function() {
			var curServer = app.get('serverInfo');
			if (!!curServer && !!curServer.wsPort) {
				monitorAgent.socket.emit('monitorOnlineUser', {
					body : connectionService.getStatisticsInfo()
				});
			}
		});

		monitorAgent.socket.on('afterstart', function(message) {
			if (!!app.currentServer.afterStart)
				app.currentServer.afterStart();
		});

		// Respond to history request from WebClient
		monitorAgent.socket.on('history_request', function(message) {
			_log_file_helper(message, function(log_file) {
				log_file.send_history(message.client_id, message.history_id);
			});
		});
	},

	// Run log monitorAgent
	run : function() {
		var monitorAgent = this;
		monitorAgent.connect();

		// Check for heartbeat every HEARTBEAT_PERIOD, reconnect if necessary
		setInterval(function() {
			var delta = ((new Date().getTime()) - monitorAgent.last_heartbeat);
			if (delta > (HEARTBEAT_PERIOD * HEARTBEAT_FAILS)) {
				monitorAgent._log.warn("Failed heartbeat check, reconnecting...");
				monitorAgent.connected = false;
				monitorAgent.reconnect();
			}
		}, HEARTBEAT_PERIOD);

	},

	// Sends announcement to Master
	announce : function() {
		this._send('announce_node', {
			client_type : 'node',
			node : this._conf.node
		});
	},

	// Reconnect helper, retry until connection established
	reconnect : function(force) {
		if (!force && this.reconnecting) {
			return;
		}
		this.reconnecting = true;
		this._log.info("Reconnecting to server...");
		var monitorAgent = this;
		setTimeout(function() {
			if (monitorAgent.connected) {
				return;
			}
			monitorAgent.connect();
			setTimeout(function() {
				if (!monitorAgent.connected) {
					monitorAgent.reconnect(true);
				}
			}, RECONNECT_INTERVAL / 2)
		}, RECONNECT_INTERVAL);
	},

	// Sends message to Master, gracefully handles connection failure
	_send : function(event, message) {
		try {
			this.socket.emit(event, message);
			// If server is down, a non-writeable stream error is thrown.
		} catch (err) {
			this._log.error("ERROR: Unable to send message over socket.");
			this.connected = false;
			this.reconnect();
		}
	}
}

exports.MonitorAgent = MonitorAgent;
