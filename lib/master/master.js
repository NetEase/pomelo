var starter = require('../master/starter');
var logger = require('pomelo-logger').getLogger('pomelo', __filename);
var crashLogger = require('pomelo-logger').getLogger('crash-log', __filename);
var adminLogger = require('pomelo-logger').getLogger('admin-log', __filename);
var admin = require('pomelo-admin');
var util = require('util');
var pathUtil = require('../util/pathUtil');
var utils = require('../util/utils');
var os = require('os');

var Server = function(app) {
  this.app = app;
  this.masterInfo = app.getMaster();
  this.registered = {};
  this.modules = [];

  this.masterConsole = admin.createMasterConsole({
    port: this.masterInfo.port,
    authUser: app.get('adminAuthUser'), // auth client function
    authServer: app.get('adminAuthServerMaster') // auth server function
  });
};

module.exports = Server;

Server.prototype.start = function(cb) {
  registerDefaultModules(this.app);
  loadModules(this, this.masterConsole);

  var self = this;
  // start master console
  this.masterConsole.start(function(err) {
    if(err) {
      utils.invokeCallback(cb, err);
      return;
    }
    startModules(self.modules, function(err) {
      if(err) {
        utils.invokeCallback(cb, err);
        return;
      }
      if(self.app.get('mode') !== 'stand-alone') {
        starter.runServers(self.app);
      }
      utils.invokeCallback(cb);
    });
  });

  // monitor servers disconnect event
  this.masterConsole.on('disconnect', function(id, type, reason) {
    crashLogger.info(util.format('[%s],[%s],[%s],[%s]', type, id, Date.now(), reason || 'disconnect'));
    var server = self.app.getServerById(id);
    if(!!server && server['auto-restart'] === 'true') {
      self.app.addServers(server);
      starter.run(self.app, server, function(err) {
        if(err) {
          cb(new Error("could not restart " + server.serverId + err), null);
          return;
        }
      });
    }
  });

  // monitor servers register event
  this.masterConsole.on('register', function(record) {
    starter.bindCpu(record.id, record.pid, record.host);
  });

  this.masterConsole.on('admin-log', function(log, error) {
    if(error) {
      adminLogger.error(JSON.stringify(log));
    } else {
      adminLogger.info(JSON.stringify(log));
    }
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
  var _modules = self.app.get('__modules__');

  if(!_modules) {
    return;
  }

  var modules = [];
  for(var moduleId in _modules) {
    modules.push(_modules[moduleId]);
  }

  var record, moduleId, module;
  for(var i=0, l=modules.length; i<l; i++) {
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
  app.registerAdmin(admin.modules.watchServer,{app:app});
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
