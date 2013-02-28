var logger = require('pomelo-logger').getLogger(__filename);
var pomelo = require('../pomelo');
var EventEmitter = require('events').EventEmitter;
var util = require('util');

module.exports = function(opts, consoleService) {
  return new Module(opts, consoleService);
};

module.exports.moduleId = '__watchdog__';

var Module = function(opts, consoleService) {
  this.app = opts.app;
  this.service = consoleService;
  this.id = this.app.getServerId();
  this.master = !!opts.master;

  if(this.master) {
    this.watchdog = new MasterWatchdog(this.app, this.service);

    this.service.on('register', onServerAdd.bind(null, this));
    this.service.on('disconnect', onServerLeave.bind(null, this));
  }
};

Module.prototype.start = function(cb) {
  if(!this.master) {
    subscribeRequest(this, this.service.agent, this.id, cb);
  } else {
    cb();
  }
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

Module.prototype.masterHandler = function(agent, msg, cb) {
  if(!msg) {
    return;
  }

  var func = masterMethods[msg.action];
  if(!func) {
    logger.info('master watchdog unknow action: %j', msg.action);
    return;
  }

  func(this, agent, msg, cb);
};

// ----------------- master watchdog -------------------------
var onServerAdd = function(module, record) {
  if(!record || record.type === 'client' || !record.serverType) {
    return;
  }

  module.watchdog.addServer(record);
};

var onServerLeave = function(module, id, type) {
  if(!id) {
    return;
  }
  if(type !== 'client') {
    module.watchdog.removeServer(id);
  }
};

var subscribe = function(module, agent, msg, cb) {
  if(!msg) {
    cb(new Error('empty message'));
    return;
  }

  module.watchdog.subscribe(msg.id);
  cb(null, module.watchdog.query());
};

var unsubscribe = function(module, agent, msg, cb) {
  if(!msg) {
    cb(new Error('empty message'));
    return;
  }

  module.watchdog.unsubscribe(msg.id);
  cb();
};

var query = function(module, agent, msg, cb) {
  cb(null, module.watchdog.query());
};

var MasterWatchdog = function(app, service) {
  EventEmitter.call(this);

  this.app = app;
  this.service = service;

  this.servers = {};
  this.listeners = {};
};
util.inherits(MasterWatchdog, EventEmitter);

MasterWatchdog.prototype.addServer = function(server) {
  if(!server) {
    return;
  }

  this.servers[server.id] = server;
  this.notify({action: 'addServer', server: server});
};

MasterWatchdog.prototype.removeServer = function(id) {
  if(!id) {
    return;
  }

  this.unsubscribe(id);
  delete this.servers[id];
  this.notify({action: 'removeServer', id: id});
};

MasterWatchdog.prototype.subscribe = function(id) {
  this.listeners[id] = 1;
};

MasterWatchdog.prototype.unsubscribe = function(id) {
  delete this.listeners[id];
};

MasterWatchdog.prototype.query = function() {
  return this.servers;
};

MasterWatchdog.prototype.notify = function(msg) {
  var listeners = this.listeners;
  for(var id in listeners) {
    this.service.agent.notifyById(id, module.exports.moduleId, msg);
  }
};

// ----------------- monitor watchdog -------------------------
var subscribeRequest = function(self, agent, id, cb) {
  var msg = {action: 'subscribe', id: id};
  agent.request(module.exports.moduleId, msg, function(err, servers) {
    if(err) {
      cb(err);
    }

    var res = [];
    for(var id in servers) {
      res.push(servers[id]);
    }
    addServers(self, res);
    cb();
  });
};

var addServers = function(self, servers) {
  if(!servers || !servers.length) {
    return;
  }

  self.app.addServers(servers);
};

var addServer = function(self, agent, msg) {
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
  if(!msg || !msg.id) {
    return;
  }
  removeServers(self, [msg.id]);
} ;

// ----------------- common -------------------------
var masterMethods = {
  'subscribe': subscribe,
  'unsubscribe': unsubscribe,
  'query': query
};

var monitorMethods = {
  'addServer': addServer,
  'removeServer': removeServer
};
