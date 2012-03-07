
/*!
 * Pomelo
 * Copyright(c) 2012 xiechengchao <xiecc@163.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var application = require('./application');
var session = require('./session');
var EventEmitter = require('events').EventEmitter;

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


exports.createApplication = function() {
  var app = application;
  app.stack = [].slice.apply(arguments);
  app.init();
  self.app = app;
  
  return app;
}

exports.getApplication = function() {
   return self.app;
}




