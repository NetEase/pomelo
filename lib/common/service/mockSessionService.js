/**
 * Mock session service for sessionService
 */
var EventEmitter = require('events').EventEmitter;
var util = require('util');

/**
 * session service for servers except connector server
 */
var exp = module.exports;

var MockSession = function(opts) {
	EventEmitter.call(this);
	for(var f in opts) {
		this[f] = opts[f];
	}
};
util.inherits(MockSession, EventEmitter);

var pro = MockSession.prototype;

pro.exportSession = function() {
	var res = {};
	
	for(var f in this) {
		if(f === 'key' || typeof this[f] === 'function') {
			continue;
		}
		
		res[f] = this[f];
	}
	
	return res;
};

pro.cloneSession = function() {
  //just for mock
  return this;
};

pro.userLogined = function(uid) {
	return false;
};

pro.closing = function() {
    throw Error('[UnSupportMethod]  closing is not support in mocksession!');
};

pro.closed = function() {
    throw Error('[UnSupportMethod]  closed is not support in mocksession!');
};

pro.response = function(err, resp) {
    throw Error('[UnSupportMethod]  response is not support in mocksession!');
};

exp.createSession = function(opts) {
	if(!opts) {
		throw Error('opts should not be empty.');
	}
	return new MockSession(opts);
};
