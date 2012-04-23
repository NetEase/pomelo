var EventEmitter = require('events').EventEmitter;
var util = require('util');
var exp = module.exports;

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
	
	if(!!session._logined) {
		return false;
	}
	session._login = true;
	session.uid = uid;
	uidMap[uid] = session;
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
	console.log('user session closing, uid:' + this.uid + ', ' + this.areaId);
	this.emit('closing', this); 
};

pro.closed = function() {
	if(!!this._closed) {
		return;
	}
	console.log('user session closed, uid:' + this.uid);
	this._closed = true;
	delete socketMap[this.key];
	if(!!this.logined) {
		delete uidMap[this.uid];
	}
	
	this.emit('closed', this);
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

