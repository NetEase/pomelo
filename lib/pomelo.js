
/*!
 * Pomelo
 * Copyright(c) 2012 xiechengchao <xiecc@163.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var io = require('socket.io')
    , connect = require('connect')
    , application = require('./application')
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
  var app = {};
  connect.utils.merge(app, application);
  connect.utils.merge(app, EventEmitter.prototype);
  app.route = '/';
  app.stack = [].slice.apply(arguments);
  app.init();
  
  exports.application = app;  //export it before return
  return app;
}


//exports.application = application;
exports.session = session;




