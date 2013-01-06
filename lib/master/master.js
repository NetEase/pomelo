var starter = require('../master/starter');
var logger = require('pomelo-logger').getLogger(__filename);
var crashLogger = require('pomelo-logger').getLogger('crash-log');
var admin = require('pomelo-admin');
var util = require('util');
var pathUtil = require('../util/pathUtil');
var os = require('os');

/**
 * master server
 */
var server = {};
var handler = {};

var Server = function(app) {
  this.app = app;
  this.masterInfo = app.getMaster();
  this.registered = {};
  this.modules = [];

  this.masterConsole = admin.createMasterConsole({
    port: this.masterInfo.port
  });
};

module.exports = Server;

Server.prototype.start = function(cb) {
  registerDefaultModules(this.app);
  loadModules(this, this.masterConsole);

  var self = this;
  this.masterConsole.start(function(err) {
    if(err) {
      cb(err);
      return;
    }
    startModules(self.modules, function(err) {
      if(err) {
        cb(err);
        return;
      }
      starter.runServers(self.app);
      cb();
    });
  });

  this.masterConsole.on('disconnect', function(id, type, reason) {
    crashLogger.info(util.format('[%s],[%s],[%s],[%s]', type, id, Date.now(), reason || 'disconnect'));
  });
};

Server.prototype.stop = function(cb) {
  this.masterConsole.stop();
  process.nextTick(cb);
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
  app.registerAdmin(require('../modules/watchdog'), {app: app, master: true});
  app.registerAdmin(require('../modules/console'), {app: app, starter: starter});
  if(app.enabled('systemMonitor')) {
    app.registerAdmin(admin.modules.systemInfo);
    app.registerAdmin(admin.modules.nodeInfo);
    app.registerAdmin(admin.modules.monitorLog, {path: pathUtil.getLogPath(app.getBase())});
    app.registerAdmin(admin.modules.scripts, {app: app, path: pathUtil.getScriptPath(app.getBase())});
    if(os.platform() !== 'win32') {
      app.registerAdmin(admin.modules.profiler, {isMaster: true});
    }
  }
};
