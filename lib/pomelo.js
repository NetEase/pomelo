/*!
 * Pomelo
 * Copyright(c) 2012 xiechengchao <xiecc@163.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */
var fs = require('fs');
var path = require('path');
var application = require('./application');


/**
 * Expose `createApplication()`.
 *
 * @module
 */

var Pomelo = module.exports = {};

/**
 * Framework version.
 */

Pomelo.version = '1.1.8';

/**
 * Event definitions that would be emitted by app.event
 */
Pomelo.events = require('./util/events');

/**
 * auto loaded components
 */
Pomelo.components = {};

/**
 * auto loaded filters
 */
Pomelo.filters = {};

/**
 * auto loaded rpc filters
 */
Pomelo.rpcFilters = {};

/**
 * connectors
 */
Pomelo.connectors = {};
Pomelo.connectors.__defineGetter__('sioconnector', load.bind(null, './connectors/sioconnector'));
Pomelo.connectors.__defineGetter__('hybridconnector', load.bind(null, './connectors/hybridconnector'));
Pomelo.connectors.__defineGetter__('udpconnector', load.bind(null, './connectors/udpconnector'));
Pomelo.connectors.__defineGetter__('mqttconnector', load.bind(null, './connectors/mqttconnector'));

/**
 * pushSchedulers
 */
Pomelo.pushSchedulers = {};
Pomelo.pushSchedulers.__defineGetter__('direct', load.bind(null, './pushSchedulers/direct'));
Pomelo.pushSchedulers.__defineGetter__('buffer', load.bind(null, './pushSchedulers/buffer'));

var self = this;

/**
 * Create an pomelo application.
 *
 * @return {Application}
 * @memberOf Pomelo
 * @api public
 */
Pomelo.createApp = function (opts) {
  var app = application;
  app.init(opts);
  self.app = app;
  return app;
};

/**
 * Get application
 */
Object.defineProperty(Pomelo, 'app', {
  get:function () {
    return self.app;
  }
});

/**
 * Auto-load bundled components with getters.
 */
fs.readdirSync(__dirname + '/components').forEach(function (filename) {
  if (!/\.js$/.test(filename)) {
    return;
  }
  var name = path.basename(filename, '.js');
  var _load = load.bind(null, './components/', name);
  
  Pomelo.components.__defineGetter__(name, _load);
  Pomelo.__defineGetter__(name, _load);
});

fs.readdirSync(__dirname + '/filters/handler').forEach(function (filename) {
  if (!/\.js$/.test(filename)) {
    return;
  }
  var name = path.basename(filename, '.js');
  var _load = load.bind(null, './filters/handler/', name);
  
  Pomelo.filters.__defineGetter__(name, _load);
  Pomelo.__defineGetter__(name, _load);
});

fs.readdirSync(__dirname + '/filters/rpc').forEach(function (filename) {
  if (!/\.js$/.test(filename)) {
    return;
  }
  var name = path.basename(filename, '.js');
  var _load = load.bind(null, './filters/rpc/', name);
  
  Pomelo.rpcFilters.__defineGetter__(name, _load);
});

function load(path, name) {
  if (name) {
    return require(path + name);
  }
  return require(path);
}
