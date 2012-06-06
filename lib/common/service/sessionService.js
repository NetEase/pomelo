var EventEmitter = require('events').EventEmitter;
var util = require('util');
var exp = module.exports;
var logger = require('../../util/log/log').getLogger(__filename);
var utils = require('../../util/utils');

var socketMap = {};
var uidMap = {};
var msgQueues = {};

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
	set(this, '_logined', true);
	set(this, 'uid', uid);
	uidMap[uid] = session;
	this.emit('login', session);
	return true;
};

pro.set = function(key, value) {
  set(this, key, value);
};

pro.on = function() {
	var session = exp.getSession(this.key);
	if(!session) {
		return false;
	}
	EventEmitter.prototype.on.apply(session, arguments);
};

pro.emit = function() {
	var session = exp.getSession(this.key);
	if(!session) {
		return false;
	}
	EventEmitter.prototype.emit.apply(session, arguments);
};

pro.closing = function() {
	var reason = this.isKicked ? 'kick' : null;
	this.emit('closing', this, reason);
};

pro.closed = function() {
	if(!!this._closed) {
		return;
	}
	set(this, '_closed', true);
	set(this, '_logined', false);
	delete socketMap[this.key];
  delete msgQueues[this.key];

	var reason = this.isKicked ? 'kick' : null;
	this.emit('closed', this, reason);
};

pro.response = function(err, resp) {
//	default do nothing, use the one passed by constructor opts.response overwrite the prototype one
};

/**
 * Send message to client directly or cache it in a queue and flush later
 */
exp.sendDirectly = false;

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

/**
 * Send message to the client by session id
 *
 * @param id {String} session id
 * @param msg {Object} message
 */
exp.sendMessage = function(id, msg) {
  if(!socketMap[id]) {
    logger.error('fail to send message for socket not exits');
    return false;
  }

  if(!!exp.sendDirectly) {
    socketMap[id].socket.emit('message', msg);
    return true;
  }

  var queue = msgQueues[id];
  if(!queue) {
    queue = [];
    msgQueues[id] = queue;
  }

  queue.push(msg);
  return true;
};

/**
 * Send message to the client by user id
 *
 * @param uid {String} uid
 * @param msg {Object} message
 */
exp.sendMessageByUid = function(uid, msg) {
  var session = uidMap[uid];
  if(!session) {
    return false;
  }

  return exp.sendMessage(session.key, msg);
};

/**
 * flush messages to clients
 */
exp.flush = function() {
  var queue, session;
  for(var id in msgQueues) {
    queue = msgQueues[id];
    if(!queue || queue.length === 0) {
      continue;
    }

    session = socketMap[id];
    if(!session || !session.socket) {
      logger.error('fail to send message for socket not exist.');
      delete msgQeuues[id];
      continue;
    }
    
    session.socket.emit('message', msgQueues[id]);
    msgQueues[id] = [];
  }
};

var kick = function(session) {
	session.isKicked = true;
	session.socket.emit('message', {route: 'onKick'});
	process.nextTick(function() {
		session.socket.disconnect();
	});
};

var set = function(origin, key, value) {
	var session = exp.getSession(origin.key);
	if(!session) {
		return false;
	}

	session[key] = value;
	origin[key] = value;
};

var unset = function(origin, key) {
	var session = exp.getSession(origin.key);
	if(!session) {
		return false;
	}

	delete session[key];
	delete origin[key];
};
