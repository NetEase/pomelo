var logger = require('pomelo-logger').getLogger('pomelo', __filename);
var utils = require('../util/utils');
var events = require('../util/events');
var Constants = require('../util/constants');
var EventEmitter = require('events').EventEmitter;
var util = require('util');

module.exports = function(opts, consoleService) {
  return new Module(opts, consoleService);
};

module.exports.moduleId = '__serverwatcher__';

var Module = function(opts, consoleService) {
  this.app = opts.app;
  this.service = consoleService;
  this.id = this.app.getServerId();

  this.app.event.on(events.START_SERVER, finishStart.bind(null, this));
};

Module.prototype.start = function(cb) {
  subscribeRequest(this, this.service.agent, this.id, cb);
};

Module.prototype.monitorHandler = function(agent, msg, cb) {
  if(!msg || !msg.action) {
    return;
  }

  var func = monitorMethods[msg.action];
  if(!func) {
    logger.info('monitor watchdog unknown action: %j', msg.action);
    return;
  }

  func(this, agent, msg, cb);
};

var subscribeRequest = function(self, agent, id, cb) {
  var msg = {action: 'subscribe', id: id};
  agent.request('__masterwatcher__', msg, function(err, servers) {
    if(err) {
      utils.invokeCallback(cb, err);
    }

    var res = [];
    for(var id in servers) {
      res.push(servers[id]);
    }
    addServers(self, res);
    utils.invokeCallback(cb);
  });
};

var addServers = function(self, servers) {
  if(!servers || !servers.length) {
    return;
  }

  self.app.addServers(servers);
};

var addServer = function(self, agent, msg) {
  logger.debug('[%s] receive addServer signal: %j', self.app.serverId, msg);
  if(!msg || !msg.server) {
    return;
  }

  addServers(self, [msg.server]);
};

var removeServers = function(self, ids) {
  if(!ids || !ids.length) {
    return;
  }
  self.app.removeServers(ids);
};

var removeServer = function(self, agent, msg) {
  logger.debug('%s receive removeServer signal: %j', self.app.serverId, msg);
  if(!msg || !msg.id) {
    return;
  }
  removeServers(self, [msg.id]);
};

var replaceServers = function(self, servers) {
  self.app.replaceServers(servers);
};

var replaceServer = function(self, agent, msg) {
  logger.debug('%s receive replaceServer signal: %j', self.app.serverId, msg);
  if(!msg || !msg.servers) {
    return;
  }
  replaceServers(self, msg.servers);
};

var startOver = function(self, agent, msg) {
  var fun = self.app.lifecycleCbs[Constants.LIFECYCLE.AFTER_STARTALL];
  if(!!fun) {
    fun.call(null, self.app);
  }
};

var finishStart = function(self, id) {
  var msg = {action: 'record', id: id};
  self.service.agent.notify('__masterwatcher__', msg);
};

var monitorMethods = {
  'addServer': addServer,
  'removeServer': removeServer,
  'replaceServer': replaceServer,
  'startOver': startOver
};