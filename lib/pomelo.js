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
var EventEmitter = require('events').EventEmitter;


/**
 * Expose `createApplication()`.
 */

var exports = module.exports = {};

/**
 * Framework version.
 */

exports.version = '0.1';

/**
 * auto loaded components
 */
exports.components = {};

/**
 * Create an express application.
 *
 * @return {Function}
 * @api public
 */


var self = this;


exports.createApp= function() {
  var app = application;
  app.stack = [].slice.apply(arguments);
  app.init();
  self.app = app;

  return app;
}

exports.getApp = function() {
   return self.app;
}

exports.utils = require('./util/utils');
exports.appTemplate = require('./appTemplate');

exports.handlerManager = require('./handlerManager');
exports.filterManager = require('./filterManager');
exports.logFilter = require('./filters/logFilter');
exports.serialFilter = require('./filters/serialFilter');
exports.timeAdjustFilter = require('./filters/timeAdjustFilter');
exports.timeFilter = require('./filters/timeFilter');
exports.channelService = require('./common/service/channelService');
exports.taskManager = require('./common/service/taskManager');
exports.log = require('./util/log/log');
exports.statusService = require('./common/service/statusService');

/**
 * Auto-load bundled components with getters.
 */
fs.readdirSync(__dirname + '/components').forEach(function(filename){
  if (!/\.js$/.test(filename)) return;
  var name = path.basename(filename, '.js');
  function load(){ return require('./components/' + name); }
  exports.components.__defineGetter__(name, load);
  exports.__defineGetter__(name, load);
});

