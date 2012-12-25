var logger = require('pomelo-logger').getLogger(__filename);
var pomelo = require('../pomelo');
var EventEmitter = require('events').EventEmitter;
var util = require('util');

module.exports = function(opts) {
  return new Module(opts);
};

module.exports.moduleId = '__watchdog__';

var masterMethods = {
  'subscribe': subscribe,
  'unsubscribe': unsubscribe,
  'query': query
};

var monitorMethods = {
  'addServer': addServer,
  'removeServer': removeServer
};

var Module = function(app, consoleService) {
  this.app = app;
  this.service = consoleService;
  this.id = this.app.get('curServer').id;
  this.master = !!this.service.master;

  if(this.master) {
    this.watchdog = new MasterWatchdog(this.app, this.service);

    this.service.on('register', onServerAdd.bind(null, this));
    this.service.on('disconnect', onServerLeave.bind(null, this));
  }
};

Module.prototype.init = function(agent, cb) {
  if(!this.master) {
    subscribeRequest(this, agent, this.id, cb);
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
    logger.info('unknown action: %j', msg.action);
    return;
  }

  func(this.agent, msg, cb);
};

Module.prototype.masterHandler = function(agent, msg, cb) {
  if(!msg) {
    return;
  }

  var func = masterMethods[msg.action];
  if(!func) {
    logger.info('unknow action: %j', msg.action);
    return;
  }

  func(this, agent, msg, cb);
};

// ----------------- master watchdog -------------------------
var onServerAdd = function(module, record) {
  if(!record || record.type !== 'monitor') {
    return;
  }

  module.watchdog.addServer(record);
};

var onServerLeave = function(module, id) {
  if(!id) {
    return;
  }
  module.watchdog.removeServer(id);
};

var subscribe = function(module, agent, msg, cb) {
  if(!msg) {
    cb(new Error('empty message'));
    return;
  }

  module.watchdog.subscribe(msg.id);
  cb(null, module.servers);
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

var onMasterHeartbeatTimeout = function(module, id) {
  logger.error('server %j heartbeat timeout.', id);
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
    this.service.notifyById(id, module.exports.moduleId, msg);
  }
};

// ----------------- monitor watchdog -------------------------
var subscribeRequest = function(module, agent, id, cb) {
  var msg = {action: 'subscribe', id: id};
  agent.request(module.exports.moduleId, msg, function(err, servers) {
    if(err) {
      cb(err);
    }

    updateServers(module.app, servers);
    cb();
  });
};

var updateServers = function(app, servers) {
  if(!servers) {
    return;
  }

  for(var id in servers) {
    app.addServer(servers[id]);
  }
};

var addServer = function(module, agent, msg) {
  if(!msg || !msg.server) {
    return;
  }

  module.app.addServer(msg.server);
};

var removeServer = function(module, agent, msg) {
  if(!msg || !msg.id) {
    return;
  }
  module.app.removeServer(msg.id);
};
