var starter = require('./starter');
var crashLogger = require('pomelo-logger').getLogger('crash-log', __filename);
var adminLogger = require('pomelo-logger').getLogger('admin-log', __filename);
var admin = require('pomelo-admin');
var util = require('util');
var utils = require('../util/utils');
var moduleUtil = require('../util/moduleUtil');
var Constants = require('../util/constants');

var Server = function(app, opts) {
  this.app = app;
  this.masterInfo = app.getMaster();
  this.registered = {};
  this.modules = [];
  opts = opts || {};
  
  opts.port = this.masterInfo.port;
  this.masterConsole = admin.createMasterConsole(opts);
};

module.exports = Server;

Server.prototype.start = function(cb) {
  moduleUtil.registerDefaultModules(true, this.app);
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

      if(self.app.get(Constants.RESERVED.MODE) !== Constants.RESERVED.STAND_ALONE) {
        starter.runServers(self.app);
      }
      utils.invokeCallback(cb);
    });
  });

  // monitor servers disconnect event
  this.masterConsole.on('disconnect', function(id, type, reason) {
    crashLogger.info(util.format('[%s],[%s],[%s],[%s]', type, id, Date.now(), reason || 'disconnect'));
    var server = self.app.getServerById(id);
    if(!!server && server[Constants.RESERVED.AUTO_RESTART] === 'true' && self.app.get(Constants.RESERVED.STOP_SERVERS).indexOf(id) < 0) {
      utils.checkPort(server, function(status) {
        if(status === 'busy') {
          utils.invokeCallback(cb, new Error('Port occupied already, check your server to add.'));
          return;
        } else {
          self.app.addServers(server);
          starter.run(self.app, server, function(err) {
            if(err) {
              utils.invokeCallback(cb, new Error("could not restart " + server.serverId + err));
              return;
            }
          });
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
