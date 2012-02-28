
/*!
 * the same as connect's proto.js
 * Copyright(c) 2012 netease
 * Copyright(c) 2012 xiechengchao
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var http = require('http')
  , parse = require('url').parse
  , utils = require('./utils');

// prototype

var manager = module.exports = {};

var stack = [];

manager.use = function(route, fn){
  // default route to '/'
  if ('string' != typeof route) {
    fn = route;
    route = '/';
  }

  // wrap sub-apps
  if ('function' == typeof fn.handle) {
    var server = fn;
    fn.route = route;
    fn = function(session , next){
      server.filter(session, next);
    };
  }

  // add the middleware
  stack.push({ route: route, handle: fn });

  return this;
};

/**
 * Handle server requests, punting them down
 * the middleware stack.
 *
 * @api private
 */

manager.filter = function(session , fn) {
	doFilterInternal(0,  session, fn); 
};


var doFilterInternal = function(fIndex, session, fn) {
	if(fIndex >= stack.length) {
		utils.invokeCallback(session, fn);
		return;
	}
	
	stack[fIndex].handle(session, function(session) {
		doFilterInternal(fIndex + 1, session, fn);
	});
}

