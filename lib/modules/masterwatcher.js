var logger = require('pomelo-logger').getLogger('pomelo', __filename);
var utils = require('../util/utils');
var events = require('../util/events');
var Constants = require('../util/constants');
var MasterWatchdog = require('../master/watchdog');
var EventEmitter = require('events').EventEmitter;
var util = require('util');

module.exports = function(opts, consoleService) {
  return new Module(opts, consoleService);
};

module.exports.moduleId = '__masterwatcher__';

var Module = function(opts, consoleService) {
  this.app = opts.app;
  this.service = consoleService;
  this.id = this.app.getServerId();

  this.watchdog = new MasterWatchdog(this.app, this.service);
  this.service.on('register', onServerAdd.bind(null, this));
  this.service.on('disconnect', onServerLeave.bind(null, this));
  this.service.on('reconnect', onServerReconnect.bind(null, this));
};

Module.prototype.start = function(cb) {
  utils.invokeCallback(cb);
};

Module.prototype.masterHandler = function(agent, msg, cb) {
  if(!msg) {
    logger.warn('master watcher receive empty message.');
    return;
  }
  var func = masterMethods[msg.action];
  if(!func) {
    logger.info('master watchdog unknow action: %j', msg.action);
    return;
  }
  func(this, agent, msg, cb);
};

// ----------------- bind methods -------------------------
var onServerAdd = function(module, record) {
  logger.debug('master receive add server event, with server: %j', record);
  if(!record || record.type === 'client' || !record.serverType) {
    return;
  }

  module.watchdog.addServer(record);
};

var onServerReconnect = function(module, record) {
  logger.debug('master receive reconnect server event, with server: %j', record);
  if(!record || record.type === 'client' || !record.serverType) {
    return;
  }
  module.watchdog.reconnectServer(record);
};

var onServerLeave = function(module, id, type) {
  logger.debug('master receive remove server event, with server: %s, type: %s', id, type);
  if(!id) {
    return;
  }
  if(type !== 'client') {
    module.watchdog.removeServer(id);
  }
};

// ----------------- monitor request methods -------------------------
var subscribe = function(module, agent, msg, cb) {
  if(!msg) {
    utils.invokeCallback(cb, new Error('empty message'));
    return;
  }

  module.watchdog.subscribe(msg.id);
  utils.invokeCallback(cb, null, module.watchdog.query());
};

var unsubscribe = function(module, agent, msg, cb) {
  if(!msg) {
    utils.invokeCallback(cb, new Error('empty message'));
    return;
  }

  module.watchdog.unsubscribe(msg.id);
  utils.invokeCallback(cb);
};

var query = function(module, agent, msg, cb) {
  utils.invokeCallback(cb, null, module.watchdog.query());
};

var record = function(module, agent, msg) {
  if(!msg) {
    logger.warn('empty message');
    return;
  }
  module.watchdog.record(msg.id);
};

var masterMethods = {
  'subscribe': subscribe,
  'unsubscribe': unsubscribe,
  'query': query,
  'record': record
};