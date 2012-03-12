var EventEmitter = require('events').EventEmitter;
var util = require('util');

/**
 * session service for servers except connector server
 */
var exp = module.exports;

var MockSession = function(opts) {
	EventEmitter(this);
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

pro.userLogined = function(uid) {
	return false;
};

pro.closing = function() {
};

pro.closed = function() {
};

pro.response = function(err, resp) {
	//default do nothing, use the one passed by constructor opts.response overwrite the prototype one
};

exp.createSession = function(opts) {
	if(!opts) {
		throw Error('opts should not be empty.');
	}
	return new MockSession(opts);
};