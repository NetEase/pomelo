/**
 * Component for monitor.
 * Load and start monitor client.
 */
var logger = require('pomelo-logger').getLogger('pomelo', __filename);
var admin = require('pomelo-admin');
var moduleUtil = require('../util/moduleUtil');
var utils = require('../util/utils');
var Constants = require('../util/constants');

var Monitor = function(app, opts) {
  opts = opts || {};
  this.app = app;
  this.serverInfo = app.getCurServer();
  this.masterInfo = app.getMaster();
  this.modules = [];
  this.closeWatcher = opts.closeWatcher;

  this.monitorConsole = admin.createMonitorConsole({
    id: this.serverInfo.id,
    type: this.app.getServerType(),
    host: this.masterInfo.host,
    port: this.masterInfo.port,
    info: this.serverInfo,
    env: this.app.get(Constants.RESERVED.ENV),
    authServer: app.get('adminAuthServerMonitor') // auth server function
  });
};

module.exports = Monitor;

Monitor.prototype.start = function(cb) {
  moduleUtil.registerDefaultModules(false, this.app, this.closeWatcher);
  this.startConsole(cb);
};

Monitor.prototype.startConsole = function(cb) {
  moduleUtil.loadModules(this, this.monitorConsole);

  var self = this;
  this.monitorConsole.start(function(err) {
    if (err) {
      utils.invokeCallback(cb, err);
      return;
    }
    moduleUtil.startModules(self.modules, function(err) {
      utils.invokeCallback(cb, err);
      return;
    });
  });

  this.monitorConsole.on('error', function(err) {
    if(!!err) {
      logger.error('monitorConsole encounters with error: %j', err.stack);
      return;
    }
  });
};

Monitor.prototype.stop = function(cb) {
  this.monitorConsole.stop();
  this.modules = [];
  process.nextTick(function() {
    utils.invokeCallback(cb);
  });
};

// monitor reconnect to master
Monitor.prototype.reconnect = function(masterInfo) {
  var self = this;
  this.stop(function() {
    self.monitorConsole = admin.createMonitorConsole({
      id: self.serverInfo.id,
      type: self.app.getServerType(),
      host: masterInfo.host,
      port: masterInfo.port,
      info: self.serverInfo,
      env: self.app.get(Constants.RESERVED.ENV)
    });
    self.startConsole(function() {
      logger.info('restart modules for server : %j finish.', self.app.serverId);
    });
  });
};