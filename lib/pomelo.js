
/*!
 * Pomelo
 * Copyright(c) 2012 xiechengchao <xiecc@163.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var application = require('./application');
var EventEmitter = require('events').EventEmitter;

var log = require('./util/log/log');

/**
 * Expose `createApplication()`.
 */

exports = module.exports;

/**
 * Framework version.
 */

exports.version = '0.1';

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

exports.log = log;
exports.utils = require('./util/utils');
exports.appTemplate = require('./appTemplate');

exports.logFilter = require('./filters/logFilter');

require('./command');





