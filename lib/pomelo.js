
/*!
 * Pomelo
 * Copyright(c) 2012 xiechengchao <xiecc@163.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var   application = require('./application')
    , session = require('./session')
    , EventEmitter = require('events').EventEmitter;

/**
 * Expose `createApplication()`.
 */

exports = module.exports = createApplication;

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

function createApplication() {
  var app = application;
  app.stack = [].slice.apply(arguments);
  app.init();
  
  exports.application = app;  //export it before return
  return app;
}


//exports.application = application;
exports.session = session;




