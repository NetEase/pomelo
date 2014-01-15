var logger = require('pomelo-logger').getLogger('pomelo', __filename);
var utils = require('../util/utils');
var events = require('../util/events');
var Constants = require('../util/constants');
var EventEmitter = require('events').EventEmitter;
var util = require('util');

var MasterWatchdog = function(app, service) {
  EventEmitter.call(this);

  this.app = app;
  this.service = service;
  this.isStarted = false;
  this.count = utils.size(app.getServersFromConfig());

  this.servers = {};
  this.listeners = {};
};
util.inherits(MasterWatchdog, EventEmitter);

module.exports = MasterWatchdog;

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

MasterWatchdog.prototype.reconnectServer = function(server) {
  if(!server) {
    return;
  }
  // 1: replaceServer 
  // 2: notify other server
  var servers = this.servers;
  this.notifyById(server.id, {action: 'replaceServer', servers: servers});
  for(var id in servers){
    this.notifyById(id, {action: 'addServer', server: server});
  }
  this.servers[server.id] = server;
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

MasterWatchdog.prototype.record = function(id) {
  if(!this.isStarted && --this.count < 0) {
    var usedTime = Date.now() - this.app.startTime;
    logger.info('all servers startup in %s ms', usedTime);
    this.notify({action: 'startOver'});
    this.isStarted = true;
  }
};

MasterWatchdog.prototype.notify = function(msg) {
  var listeners = this.listeners;
  for(var id in listeners) {
    this.service.agent.notifyById(id, '__serverwatcher__', msg);
  }
};

MasterWatchdog.prototype.notifyById = function(id, msg) {
  this.service.agent.notifyById(id, '__serverwatcher__', msg);
};