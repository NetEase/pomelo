
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
  , utils = require('./util/utils');

// prototype

var manager = module.exports = {};

var stack = [];

manager.use = function(route, handler){
  // default route to '/'
  if ('string' != typeof route) {
    fn = route;
    route = '';
  }

  // add the middleware
  stack.push({route: route, handler: handler});

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
	
    //console.log(' filter info: '+ JSON.stringify(stack[fIndex])+' index: '+fIndex);
    var handler = stack[fIndex].handler;
	handler.handle(session, function(session) {
		doFilterInternal(fIndex + 1, session, fn);
	});
}

