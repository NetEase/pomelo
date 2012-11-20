var starter = require('../master/starter');
var logger = require('pomelo-logger').getLogger(__filename);
var crashLogger = require('pomelo-logger').getLogger('crash-log');
var admin = require('pomelo-admin');
var AfterStart = require('../modules/afterStart');
var util = require('util');
var pathUtil = require('../util/pathUtil');

/**
 * master server
 */
var server = {};//module.exports;
var dserver;
var handler = {};

var Server = function(app) {
	this.app = app;
	this.masterInfo = app.get('master');
	this.registered = {};

	this.masterConsole = admin.createMasterConsole({
		port: this.masterInfo.port
	});
};

module.exports = Server;

Server.prototype.start = function(cb) {
	registerDefaultModules(this.app);
	loadModules(this.app, this.masterConsole);

	var self = this;
	this.masterConsole.start(function(err) {
		if(err) {
			cb(err);
			return;
		}
		starter.runServers(self.app);
		cb();
	});
	
	this.masterConsole.on('register', function(record) {
		logger.debug('[master] new register connection: %j, %j', record.id, record.type);
		self.registered[record.id] = record;
		if(checkRegistered(self)) {
			logger.info('[master] all servers have started and notify after start now...');
			self.masterConsole.agent.notifyAll(AfterStart.moduleId);
		}
	});

	this.masterConsole.on('disconnect', function(id, type, reason) {
		crashLogger.info(util.format('[%s],[%s],[%s],[%s]', type, id, Date.now(), reason || 'disconnect'));
	});
};

Server.prototype.stop = function(cb) {
	this.masterConsole.stop(cb);
};

var checkRegistered = function(master) {
	var servers = master.app.getServers();
	for(var sid in servers) {
		if(!master.registered[sid]) {
			return false;
		}
	}
	return true;
};

/**
 * Load admin modules
 */
var loadModules = function(app, consoleService) {
	// load app register modules 
	var modules = app.get('__modules__');

	if(!modules) {
		return;
	}

	var record, moduleId, module;
	for(var i=0, l=modules.length; i<l; i++){
		record = modules[i];
		if(typeof record.module === 'function') {
			module = record.module(record.opts);
		} else {
			module = record.module;
		}

		moduleId = record.moduleId || module.moduleId;

		if(!moduleId) {
			logger.warn('ignore an uname module.');
			continue;
		}

		consoleService.register(moduleId, module);	
	}
};

/**
 * Append the default system admin modules
 */
var registerDefaultModules = function(app) {
	app.registerAdmin(require('../modules/console'), {app: app, starter: starter});
	if(app.enabled('systemMonitor')) {
		app.registerAdmin(admin.modules.systemInfo);
		app.registerAdmin(admin.modules.nodeInfo);
		app.registerAdmin(admin.modules.monitorLog,{path: pathUtil.getLogPath(app.getBase())});
		app.registerAdmin(admin.modules.scripts, {app: app, path: pathUtil.getScriptPath(app.getBase())});
		app.registerAdmin(admin.modules.profiler, {isMaster: true});
	}
};
