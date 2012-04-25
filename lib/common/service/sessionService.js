var EventEmitter = require('events').EventEmitter;
var util = require('util');
var exp = module.exports;
var logger = require('../../util/log/log').getLogger(__filename);
var utils = require('../../util/utils');

var socketMap = {};
var uidMap = {};

var InterSession = function(opts) {
	EventEmitter.call(this);
	this.uid = '';
	for(var f in opts) {
		this[f] = opts[f];
	}
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
	session.logined = true;
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
	if(!!this.forceClose) {
		this.closed();
		return;
	}
	this.emit('closing', this);
};

pro.closed = function() {
	if(!!this._closed) {
		return;
	}
	this._closed = true;
	delete socketMap[this.key];
	if(!!this.logined) {
		this.logout();
		delete uidMap[this.uid];
	}
	
	this.emit('closed', this);
	this.clearListeners();
};

/**
 * logout session, but not close connection
 */
pro.logout = function() {
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

//pro.makeResponse = (function(){
//    return function(task, oldResp, start){
//        pro.response = function(){
//    		if(task.done()) {
//    			oldResp.apply(session, arguments);
//    		} else {
//    			logger.error('[serialFilter] already timeout, start:' + start + ', return:' + Date.now() + ', msg:' + JSON.stringify(msg));
//    		}	
//        };
//    };
//})();



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
	session.socket.emit('message', {route: 'onKick'});
	session.logout();
};
