/**
 * Component for monitor.
 * Load and start monitor client.
 */
var logger = require('pomelo-logger').getLogger(__filename);
var admin = require('pomelo-admin');
var starter = require('../master/starter');
var pathUtil = require('../util/pathUtil');

var Monitor = function(app) {
	this.app = app;
	this.serverInfo = app.get('curServer');
	this.masterInfo = app.get('master');
	this.monitorConsole = admin.createMonitorConsole({
		id: this.serverInfo.id, 
		type: this.app.get('serverType'), 
		host: this.masterInfo.host, 
		port: this.masterInfo.port
	});
};

module.exports = Monitor;

Monitor.prototype.start = function(cb) {
	registerDefaultModules(this.app);
	loadModules(this.app, this.monitorConsole);
	this.monitorConsole.start(cb);
};

Monitor.prototype.stop = function(cb) {
	this.monitorConsole.stop();
	process.nextTick(function() {
		cb();
	});
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
	app.registerAdmin(require('../modules/afterStart'), app);
	app.registerAdmin(require('../modules/console'), {app: app, starter: starter});
	if(app.enabled('systemMonitor')) {
		app.registerAdmin(admin.modules.systemInfo);
		app.registerAdmin(admin.modules.nodeInfo);
		app.registerAdmin(admin.modules.monitorLog, {path: pathUtil.getLogPath(app.getBase())});
		app.registerAdmin(admin.modules.scripts, {app:app, path: pathUtil.getScriptPath(app.getBase())});
		app.registerAdmin(admin.modules.profiler);
	}
};
