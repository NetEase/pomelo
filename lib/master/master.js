var starter = require('./starter');
var logger = require('pomelo-logger').getLogger('pomelo', __filename);
var crashLogger = require('pomelo-logger').getLogger('crash-log', __filename);
var adminLogger = require('pomelo-logger').getLogger('admin-log', __filename);
var admin = require('pomelo-admin');
var util = require('util');
var utils = require('../util/utils');
var moduleUtil = require('../util/moduleUtil');

var Server = function(app, opts) {
  opts = opts || {};
  this.app = app;
  this.masterInfo = app.getMaster();
  this.registered = {};
  this.modules = [];
  this.serversStatus = {};
  this.closeWatcher = opts.closeWatcher;
  this.masterConsole = admin.createMasterConsole({
    port: this.masterInfo.port,
    authUser: app.get('adminAuthUser'), // auth client function
    authServer: app.get('adminAuthServerMaster') // auth server function
  });
};

module.exports = Server;

Server.prototype.start = function(cb) {
  moduleUtil.registerDefaultModules(true, this.app, this.closeWatcher);
  moduleUtil.loadModules(this, this.masterConsole);

  var self = this;
  // start master console
  this.masterConsole.start(function(err) {
    if(err) {
      utils.invokeCallback(cb, err);
      return;
    }
    moduleUtil.startModules(self.modules, function(err) {
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

  this.masterConsole.on('error', function(err) {
    if(!!err) {
      logger.error('masterConsole encounters with error: %j', err.stack);
      return;
    }
  });

   // monitor servers disconnect event
  this.masterConsole.on('disconnect', function(id, type, info, reason) {
    crashLogger.info(util.format('[%s],[%s],[%s],[%s]', type, id, Date.now(), reason || 'disconnect'));
    var server = self.app.getServerById(id);
    var time =  0;
    var count = 0;
    var pingTimer = null;
    self.serversStatus[id] = false;
    if(!!server && (server['auto-restart'] === 'true' || server['restart-force'] === 'true')) {
      var handle = function() {
        clearTimeout(pingTimer);
        utils.checkPort(server, function(status) {
          if(status === 'error') {
            utils.invokeCallback(cb, new Error('Check port command executed with error.'));
            return;
          } else if(status === 'busy') {
            if(!!server['restart-force']) {
              starter.kill([info.pid], [server]);
            } else {
              utils.invokeCallback(cb, new Error('Port occupied already, check your server to add.'));
              return;
            }
          }
          setTimeout(function() {
            starter.run(self.app, server, null);
          }, 1000 * 15);
        });
      };
      var setTimer = function(time) {
        pingTimer = setTimeout(function() {
          utils.ping(server.host, function(flag) {
            if(flag)  {
              handle();
            } else {
              count++;
              if(count > 3) {
                time = 5 * 60 * 1000;
              } else {
                time = 30 * 1000 * count;
              }
              setTimer(time);
            }
          });
        }, time);
      };
      setTimeout(function() {
        if(!self.serversStatus[id]) {
          setTimer(time);
        }
      }, 2 * 60 * 1000);
    }
  });

  // monitor servers register event
  this.masterConsole.on('register', function(record) {
    starter.bindCpu(record.id, record.pid, record.host);
  });

  this.masterConsole.on('reconnect', function(record) {
    crashLogger.info('server reconnect successfully, serverId: %s', record.id);
    self.serversStatus[record.id] = true;
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