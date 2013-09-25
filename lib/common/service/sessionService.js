var EventEmitter = require('events').EventEmitter;
var util = require('util');
var logger = require('pomelo-logger').getLogger('pomelo', __filename);
var utils = require('../../util/utils');

var MOCK_INCLUDE_FIELDS = ['id', 'frontendId', 'uid', '__sessionService__'];
var EXPORT_INCLUDE_FIELDS = ['id', 'frontendId', 'uid', 'settings'];

var ST_INITED = 0;
var ST_CLOSED = 1;

/**
 * Session service manages the sessions for each client connection.
 *
 * Session service is created by session component and is only
 * <b>available</b> in frontend servers. You can access the service by
 * `app.get('sessionService')` in frontend servers.
 *
 * @param {Object} opts constructor parameters
 * @class
 * @constructor
 */
var SessionService = function(opts) {
  opts = opts || {};
  this.singleSession = opts.singleSession;
  this.sessions = {};     // sid -> session
  this.uidMap = {};       // uid -> sessions
};

module.exports = SessionService;

/**
 * Create and return session.
 *
 * @param {Object} opts {key:obj, uid: str,  and etc.}
 * @param {Boolean} force whether replace the origin session if it already existed
 * @return {Session}
 *
 * @memberOf SessionService
 * @api private
 */
SessionService.prototype.create = function(sid, frontendId, socket) {
  var session = new Session(sid, frontendId, socket, this);
  this.sessions[session.id] = session;

  return session;
};

/**
 * Bind the session with a user id.
 *
 * @memberOf SessionService
 * @api private
 */
SessionService.prototype.bind = function(sid, uid, cb) {
  var session = this.sessions[sid];

  if(!session) {
    process.nextTick(function() {
      cb(new Error('session not exist, sid: ' + sid));
    });
    return;
  }

  if(session.uid) {
    if(session.uid === uid) {
      // already binded with the same uid
      cb();
      return;
    }

    // already binded with other uid
    process.nextTick(function() {
      cb(new Error('session has already bind with ' + session.uid));
    });
    return;
  }

  var sessions = this.uidMap[uid];

  if(!!this.singleSession && !!sessions) {
    process.nextTick(function() {
      cb(new Error('singleSession is configured, session has already bind with uid: ' + uid));
    });
    return;
  }

  if(!sessions) {
    sessions = this.uidMap[uid] = [];
  }

  for(var i=0, l=sessions.length; i<l; i++) {
    // session has binded with the uid
    if(sessions[i].id === session.id) {
      process.nextTick(cb);
      return;
    }
  }
  sessions.push(session);

  session.bind(uid);

  if(cb) {
    process.nextTick(cb);
  }
};

/**
 * Unbind a session with the user id.
 *
 * @memberOf SessionService
 * @api private
 */
SessionService.prototype.unbind = function(sid, uid, cb) {
  var session = this.sessions[sid];

  if(!session) {
    process.nextTick(function() {
      cb(new Error('session not exist, sid: ' + sid));
    });
    return;
  }

  if(!session.uid || session.uid !== uid) {
    process.nextTick(function() {
      cb(new Error('session dose not bind with ' + session.uid));
    });
    return;
  }

  var sessions = this.uidMap[uid], sess;
  if(sessions) {
    for(var i=0, l=sessions.length; i<l; i++) {
      sess = sessions[i];
      if(sess.id === sid) {
        sessions.splice(i, 1);
        break;
      }
    }

    if(sessions.length === 0) {
      delete this.uidMap[uid];
    }
  }
  session.unbind(uid);

  if(cb) {
    process.nextTick(cb);
  }
};

/**
 * Get session by id.
 *
 * @param {Number} id The session id
 * @return {Session}
 *
 * @memberOf SessionService
 * @api private
 */
SessionService.prototype.get = function(sid) {
  return this.sessions[sid];
};

/**
 * Get sessions by userId.
 *
 * @param {Number} uid User id associated with the session
 * @return {Array} list of session binded with the uid
 *
 * @memberOf SessionService
 * @api private
 */
SessionService.prototype.getByUid = function(uid) {
  return this.uidMap[uid];
};

/**
 * Remove session by key.
 *
 * @param {Number} sid The session id
 *
 * @memberOf SessionService
 * @api private
 */
SessionService.prototype.remove = function(sid) {
  var session = this.sessions[sid];
  var uid = session.uid;
  if(session) {
    delete this.sessions[session.id];

    var sessions = this.uidMap[uid];
    if(!sessions) {
      return;
    }

    for(var i=0, l=sessions.length; i<l; i++) {
      if(sessions[i].id === sid) {
        sessions.splice(i, 1);
        if(sessions.length === 0) {
          delete this.uidMap[uid];
        }
        break;
      }
    }
  }
};

/**
 * Import the key/value into session.
 *
 * @api private
 */
SessionService.prototype.import = function(sid, key, value, cb) {
  var session = this.sessions[sid];
  if(!session) {
    utils.invokeCallback(cb, new Error('session not exist, sid: ' + sid));
    return;
  }
  session.set(key, value);
  utils.invokeCallback(cb);
};

/**
 * Import new value for the existed session.
 *
 * @memberOf SessionService
 * @api private
 */
SessionService.prototype.importAll = function(sid, settings, cb) {
  var session = this.sessions[sid];
  if(!session) {
    utils.invokeCallback(cb, new Error('session not exist, sid: ' + sid));
    return;
  }

  for(var f in settings) {
    session.set(f, settings[f]);
  }
  utils.invokeCallback(cb);
};

/**
 * Kick all the session offline under the user id.
 *
 * @param {Number}   uid user id asscociated with the session
 * @param {Function} cb  callback function
 *
 * @memberOf SessionService
 */
SessionService.prototype.kick = function(uid, cb) {
  var sessions = this.getByUid(uid);

  if(sessions) {
    // notify client
    for(var i=0, l=sessions.length; i<l; i++) {
      sessions[i].closed('kick');
    }
    process.nextTick(function() {
      utils.invokeCallback(cb);
    });
  } else {
    process.nextTick(function() {
      utils.invokeCallback(cb);
    });
  }
};

/**
 * Kick a user offline by session id.
 *
 * @param {Number}   sid session id
 * @param {Function} cb  callback function
 *
 * @memberOf SessionService
 */
SessionService.prototype.kickBySessionId = function(sid, cb) {
  var session = this.get(sid);

  if(session) {
    // notify client
    session.closed('kick');
    process.nextTick(function() {
      utils.invokeCallback(cb);
    });
  } else {
    process.nextTick(function() {
      utils.invokeCallback(cb);
    });
  }
};

/**
 * Send message to the client by session id.
 *
 * @param {String} sid session id
 * @param {Object} msg message to send
 *
 * @memberOf SessionService
 * @api private
 */
SessionService.prototype.sendMessage = function(sid, msg) {
  var session = this.sessions[sid];

  if(!session) {
    logger.debug('Fail to send message for session not exists, sid: ' + sid + ' msg: ' + msg);
    return false;
  }

  return send(this, session, msg);
};

/**
 * Send message to the client by user id.
 *
 * @param {String} uid userId
 * @param {Object} msg message to send
 *
 * @memberOf SessionService
 * @api private
 */
SessionService.prototype.sendMessageByUid = function(uid, msg) {
  var sessions = this.uidMap[uid];

  if(!sessions) {
    logger.debug('fail to send message by uid for session not exist. uid: %j',
        uid);
    return false;
  }

  for(var i=0, l=sessions.length; i<l; i++) {
    send(this, sessions[i], msg);
  }
};

/**
 * Iterate all the session in the session service.
 *
 * @param  {Function} cb callback function to fetch session
 * @api private
 */
SessionService.prototype.forEachSession = function(cb) {
  for(var sid in this.sessions) {
    cb(this.sessions[sid]);
  }
};

/**
 * Iterate all the binded session in the session service.
 *
 * @param  {Function} cb callback function to fetch session
 * @api private
 */
SessionService.prototype.forEachBindedSession = function(cb) {
  var i, l, sessions;
  for(var uid in this.uidMap) {
    sessions = this.uidMap[uid];
    for(i=0, l=sessions.length; i<l; i++) {
      cb(sessions[i]);
    }
  }
};

/**
 * Send message to the client that associated with the session.
 *
 * @api private
 */
var send = function(service, session, msg) {
  session.send(msg);

  return true;
};

/**
 * Session maintains the relationship between client connect and user information.
 * There is a session associated with each client connect. And it should bind to a
 * user id after the client passes the identification.
 *
 * Session is generated in frontend server and should not be access in handler.
 * There is a proxy class called LocalSession in backend servers and MockLocalSession
 * in frontend servers.
 */
var Session = function(sid, frontendId, socket, service) {
  EventEmitter.call(this);
  this.id = sid;          // r
  this.frontendId = frontendId; // r
  this.uid = null;        // r
  this.settings = {};

  // private
  this.__socket__ = socket;
  this.__sessionService__ = service;
  this.__state__ = ST_INITED;
};

util.inherits(Session, EventEmitter);

/**
 * Export current session as mock local session.
 */
Session.prototype.mockLocalSession = function() {
  return new MockLocalSession(this);
};

/**
 * Bind the session with the the uid.
 *
 * @param {Number} uid User id
 * @api public
 */
Session.prototype.bind = function(uid) {
  this.uid = uid;
  this.emit('bind', uid);
};

/**
 * Unbind the session with the the uid.
 *
 * @param {Number} uid User id
 * @api private
 */
Session.prototype.unbind = function(uid) {
  this.uid = null;
  this.emit('unbind', uid);
};

/**
 * Set value for the session.
 *
 * @param {String} key session key
 * @param {Object} value session value
 * @api public
 */
Session.prototype.set = function(key, value) {
  this.settings[key] = value;
};

/**
 * Get value from the session.
 *
 * @param {String} key session key
 * @return {Object} value associated with session key
 * @api public
 */
Session.prototype.get = function(key, value) {
  return this.settings[key];
};

/**
 * Send message to the session.
 *
 * @param  {Object} msg final message sent to client
 */
Session.prototype.send = function(msg) {
  this.__socket__.send(msg);
};

/**
 * Send message to the session in batch.
 *
 * @param  {Array} msgs list of message
 */
Session.prototype.sendBatch = function(msgs) {
  this.__socket__.sendBatch(msgs);
};

/**
 * Closed callback for the session which would disconnect client in next tick.
 *
 * @api public
 */
Session.prototype.closed = function(reason) {
  if(this.__state__ === ST_CLOSED) {
    return;
  }
  this.__state__ = ST_CLOSED;
  this.__sessionService__.remove(this.id);
  this.emit('closed', this.mockLocalSession(), reason);
  this.__socket__.emit('closing', reason);

  var self = this;
  // give a chance to send disconnect message to client
  process.nextTick(function() {
    self.__socket__.disconnect();
  });
};

/**
 * Mock local session for frontend server.
 * Local session is used as session in the backend servers.
 */
var MockLocalSession = function(session) {
  EventEmitter.call(this);
  clone(session, this, MOCK_INCLUDE_FIELDS);
  // deep copy for settings
  this.settings = dclone(session.settings);
  this.__session__ = session;
};

util.inherits(MockLocalSession, EventEmitter);

MockLocalSession.prototype.bind = function(uid, cb) {
  var self = this;
  this.__sessionService__.bind(this.id, uid, function(err) {
    if(!err) {
      self.uid = uid;
    }
    utils.invokeCallback(cb, err);
  });
};

MockLocalSession.prototype.unbind = function(uid, cb) {
  var self = this;
  this.__sessionService__.unbind(this.id, uid, function(err) {
    if(!err) {
      self.uid = null;
    }
    utils.invokeCallback(cb, err);
  });
};

MockLocalSession.prototype.set = function(key, value) {
  this.settings[key] = value;
};

MockLocalSession.prototype.get = function(key) {
  return this.settings[key];
};

MockLocalSession.prototype.push = function(key, cb) {
  this.__sessionService__.import(this.id, key, this.get(key), cb);
};

MockLocalSession.prototype.pushAll = function(cb) {
  this.__sessionService__.importAll(this.id, this.settings, cb);
};

MockLocalSession.prototype.on = function(event, listener) {
  EventEmitter.prototype.on.call(this, event, listener);
  this.__session__.on(event, listener);
};

/**
 * Export the key/values for serialization.
 *
 * @api private
 */
MockLocalSession.prototype.export = function() {
  var res = {};
  clone(this, res, EXPORT_INCLUDE_FIELDS);
  return res;
};

var clone = function(src, dest, includes) {
  var f;
  for(var i=0, l=includes.length; i<l; i++) {
    f = includes[i];
    dest[f] = src[f];
  }
};

var dclone = function(src) {
  var res = {};
  for(var f in src) {
    res[f] = src[f];
  }
  return res;
};
