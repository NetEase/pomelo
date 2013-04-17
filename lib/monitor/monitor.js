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
  this.serverInfo = app.getCurServer();
  this.masterInfo = app.getMaster();
  this.modules = [];
  this.monitorConsole = admin.createMonitorConsole({
    id: this.serverInfo.id,
    type: this.app.getServerType(),
    host: this.masterInfo.host,
    port: this.masterInfo.port,
    info: this.serverInfo
  });
};

module.exports = Monitor;

Monitor.prototype.start = function(cb) {
  registerDefaultModules(this.app);
  loadModules(this, this.monitorConsole);

  var self = this;
  this.monitorConsole.start(function(err) {
    if(err) {
      cb(err);
      return;
    }
    startModules(self.modules, function(err) {
      cb(err);
    });
  });
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
var loadModules = function(self, consoleService) {
  // load app register modules
  var modules = self.app.get('__modules__');

  if(!modules) {
    return;
  }

  var record, moduleId, module;
  for(var i=0, l=modules.length; i<l; i++){
    record = modules[i];
    if(typeof record.module === 'function') {
      module = record.module(record.opts, consoleService);
    } else {
      module = record.module;
    }

    moduleId = record.moduleId || module.moduleId;

    if(!moduleId) {
      logger.warn('ignore an uname module.');
      continue;
    }

    consoleService.register(moduleId, module);
    self.modules.push(module);
  }
};

var startModules = function(modules, cb) {
  // invoke the start lifecycle method of modules
  if(!modules) {
    return;
  }

  startModule(null, modules, 0, cb);
};

var startModule = function(err, modules, index, cb) {
  if(err || index >= modules.length) {
    cb(err);
    return;
  }

  var module = modules[index];
  if(module && typeof module.start === 'function') {
    module.start(function(err) {
      startModule(err, modules, index + 1, cb);
    });
  } else {
    startModule(err, modules, index + 1, cb);
  }
};

/**
 * Append the default system admin modules
 */
var registerDefaultModules = function(app) {
  app.registerAdmin(require('../modules/watchdog'), {app: app});
  app.registerAdmin(require('../modules/console'), {app: app, starter: starter});
  if(app.enabled('systemMonitor')) {
    app.registerAdmin(admin.modules.systemInfo);
    app.registerAdmin(admin.modules.nodeInfo);
    app.registerAdmin(admin.modules.monitorLog, {path: pathUtil.getLogPath(app.getBase())});
    app.registerAdmin(admin.modules.scripts, {app:app, path: pathUtil.getScriptPath(app.getBase())});
    app.registerAdmin(admin.modules.profiler);
  }
};
