var starter = require('../master/starter');
var logger = require('pomelo-logger').getLogger(__filename);
var crashLogger = require('pomelo-logger').getLogger('crash-log');
var admin = require('pomelo-admin');
var util = require('util');
var pathUtil = require('../util/pathUtil');
var Zookeeper = require('./zookeeper');
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

  //Default is the main master
  this.isSlave = false;

  this.masterConsole = admin.createMasterConsole({
    port: this.masterInfo.port
  });

  if(app.enabled('masterHA')){
    this.zookeeper = Zookeeper.getClient(app);
  }
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
      //If it is the back up, do note start server
      if(!self.app.enabled('masterHA')){
        logger.info('masterHA not enabled, start servers');
        starter.runServers(self.app);
        cb();
      }else{
        self.zookeeper.start(function(err, result){
          if(err){
            logger.error('start zookeeper failed! err : %j', err);
            cb(err);
            return;
          }
          self.zookeeper.getLock(function(err, result){
            if(err || !result){
              self.isSlave = true;
              self.zookeeper.on('onPromote', self.onPromote.bind(self));
              cb();
            }else{
              self.zookeeper.setData(self.masterInfo, function(err){
                if(err){
                  logger.error('set master info faild!');
                  cb(err);
                  return;
                }

                starter.runServers(self.app);
                cb();
              });
            }
          });
        });
      }
    });
  });

  this.masterConsole.on('disconnect', function(id, type, reason) {
    crashLogger.info(util.format('[%s],[%s],[%s],[%s]', type, id, Date.now(), reason || 'disconnect'));
    var server = self.app.getServerById(id);
    if(!!server && !!server.restart) {
      self.app.addServers(server);
      starter.run(self.app, server, function(err) {
        if(err) {
          cb(new Error("could not restart server " + err), null);
          return;
        }
      });
    }
  });

  this.masterConsole.on('register', function(record) {
    starter.bindCpu(record.id, record.pid, record.host);
  });
};

Server.prototype.stop = function(cb) {
  this.masterConsole.stop();
  if(this.zookeeper){
    this.zookeeper.close();
  }
  process.nextTick(cb);
};

Server.prototype.onPromote = function(){
  var zookeeper = this.zookeeper;
  console.warn('on promote!');
  var self = this;
  zookeeper.getLock(function(err, result){
    if(result){
      zookeeper.setData(self.masterInfo, function(err, result){
        if(!err){
          logger.info('server : %j now is promoted to master!', self.app.serverId);
        }
      });
    }
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
