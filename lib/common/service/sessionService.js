var EventEmitter = require('events').EventEmitter;
var util = require('util');
var exp = module.exports;
var logger = require('../../util/log/log').getLogger(__filename);
var utils = require('../../util/utils');

var socketMap = {};
var uidMap = {};

var STATUS_ACTIVE = 'active';
var STATUS_LOGIN = 'login';
var STATUS_LOGOUT = 'lougout';
var STATUS_CLOSING = 'closing';
var STATUS_CLOSED = 'closed';

var InterSession = function(opts) {
	EventEmitter.call(this);
	this.uid = '';
	for(var f in opts) {
		this[f] = opts[f];
	}
	this.status = STATUS_ACTIVE;
};
util.inherits(InterSession, EventEmitter);

var pro = InterSession.prototype;

pro.exportSession = function() {
	var res = {};
	
	for(var f in this) {
		if(f === 'key' || f === 'socket' || typeof this[f] === 'function') {
			continue;
		}
		
		res[f] = this[f];
	}
	
	return res;
};

pro.cloneSession = function() {
	var res = {};
	
	for(var f in this) {
		res[f] = this[f];
	}
	
	return res;
};

pro.userLogined = function(uid) {
	//get origin session instance
	var session = exp.getSession(this.key);
	if(!session) {
		return false;
	}
	
	if(!!session.logined) {
		return false;
	}
	this.status = STATUS_LOGIN;
	session.uid = uid;
	uidMap[uid] = session;
	this.emit('login', session);
	return true;
};

pro.set = function(key, value) {
  var session = exp.getSession(this.key);
  if(!session) {
    return false;
  }
  
  session[key] = value;
  this[key] = value;
};

pro.closing = function() {
	if(!!this.isKicked) {
		this.closed();
		return;
	}
	this.status = STATUS_CLOSING;
	this.emit('closing', this);
};

pro.closed = function() {
	if(this.status === STATUS_CLOSED) {
		return;
	}
	var needLogout = this.status === STATUS_LOGIN;
	delete socketMap[this.key];
	if(needLogout) {
		this.logout();
		delete uidMap[this.uid];
	}

	this.status = STATUS_CLOSED;
	
	var reason = this.isKicked ? 'kick' : null;
	this.emit('closed', this, reason);
	this.clearListeners();
};

/**
 * logout session, but not close connection
 */
pro.logout = function() {
	this.status = STATUS_LOGOUT;
	this.emit('logout', this);
	this.logined = false;
	delete uidMap[this.uid];
	delete this.uid;
};

pro.clearListeners = function() {
	this.removeAllListeners('logout');
	this.removeAllListeners('closing');
	this.removeAllListeners('closed');
};

pro.response = function(err, resp) {
//	//default do nothing, use the one passed by constructor opts.response overwrite the prototype one
};

/**
 * create and return session
 * 
 * @param opts {key:obj, uid: str,  and etc.}
 * @param force [boolean] whether replace the origin session if it already existed
 * @return new session or null if fail
 */
exp.createSession = function(opts, force) {
	if(!opts || !opts.key) {
		throw Error('opts or opts.key should not be empty.');
	}
	
	if(!!socketMap[opts.key] && !force) {
		return null;
	}
	
	var session = new InterSession(opts);
	socketMap[opts.key] = session;
	return session;
};

/**
 * get session
 */
exp.getSession = function(key) {
	return socketMap[key];
};

exp.getSessionByUid = function(uid) {
	return uidMap[uid];
};

exp.removeSession = function(key) {
	delete socketMap[key];
};

/**
 * kick a user offline
 */
exp.kick = function(uid, cb) {
	logger.debug('kick off user:' + uid);
	var session = exp.getSessionByUid(uid);

	function afterKick() {
		utils.invokeCallback(cb);
	}

	if(!!session) {
		//make sure has been kicked
		kick(session);
	}
	process.nextTick(afterKick);
};

var kick = function(session) {
	this.isKicked = true;
	session.socket.emit('message', {route: 'onKick'});
	process.nextTick(function() {
		session.socket.disconnect();
	});
};
