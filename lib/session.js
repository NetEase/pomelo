var io = require('socket.io');
var util = require('util');
var EventEmitter = require('events').EventEmitter;

// need sessionId

var exports = module.exports; 

var Session = function(route, params) {
	EventEmitter.call(this);
	this.route = route;
    this.params = params;
    this.headers = [];
    this.routes = []; // the session passed servers
}

exports.createSession = function(route, params) {
	return new Session(route, params);
}

util.inherits(Session, EventEmitter);

var pro = Session.prototype;

pro.get = function(name) {
    var name = name.toLowerCase();
	return this.headers[name];
}

pro.set = function(name, value) {
	var name = name.toLowerCase();
	this.headers[name] = value;
}

pro.addPath = function(server) {
	this.servers.push(server);
}


pro.is = function(type){
	  var ct = this.get('Content-Type');
	  if (!ct) return false;
	  ct = ct.split(';')[0];
	  if (!~type.indexOf('/')) type = mime.lookup(type);
	  if (~type.indexOf('*')) {
	    type = type.split('/');
	    ct = ct.split('/');
	    if ('*' == type[0] && type[1] == ct[1]) return true;
	    if ('*' == type[1] && type[0] == ct[0]) return true;
	    return false;
	  }
	  return !! ~ct.indexOf(type);
};