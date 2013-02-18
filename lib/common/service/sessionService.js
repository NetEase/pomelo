var EventEmitter = require('events').EventEmitter;
var util = require('util');
var logger = require('pomelo-logger').getLogger(__filename);
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
 *                      opts.sendDirectly - whether send the request to the client or cache them until next flush.
 * @class
 * @constructor
 */
var SessionService = function(opts) {
  opts = opts || {};
  this.sendDirectly = opts.sendDirectly;
  this.sessions = {};     // sid -> session
  this.uidMap = {};       // uid -> session
  this.msgQueues = {};
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
    cb(new Error('session not exist, sid: ' + sid));
    return;
  }

  session.bind(uid);
  cb();
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
 * Get session by userId.
 *
 * @param {Number} uid User id associated with the session
 * @return {Session}
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
  if(session) {
    delete this.sessions[session.id];
    delete this.uidMap[session.uid];
    delete this.msgQueues[session.id];
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
 * Kick a user offline by user id.
 *
 * @param {Number}   uid user id asscociated with the session
 * @param {Function} cb  callback function
 *
 * @memberOf SessionService
 */
SessionService.prototype.kick = function(uid, cb) {
  var session = this.getByUid(uid);

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
    logger.debug('fail to send message for session not exits');
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
  var session = this.uidMap[uid];

  if(!session) {
    logger.debug('fail to send message by uid for session not exist. uid: %j', uid);
    return false;
  }

  return send(this, session, msg);
};

/**
 * Send message to the client that associated with the session.
 *
 * @api private
 */
var send = function(service, session, msg) {
  if(service.sendDirectly) {
    session.__socket__.send(msg);
    return true;
  }

  var sid = session.id;
  var queue = service.msgQueues[sid];
  if(!queue) {
    queue = [];
    service.msgQueues[sid] = queue;
  }

  queue.push(msg);
  return true;
};

/**
 * Flush messages to clients.
 *
 * @memberOf SessionService
 * @api private
 */
SessionService.prototype.flush = function() {
  var queues = this.msgQueues, sessions = this.sessions, queue, session;
  for(var sid in queues) {
    queue = queues[sid];
    if(!queue || queue.length === 0) {
      continue;
    }

    session = sessions[sid];
    if(session && session.__socket__) {
      session.__socket__.sendBatch(queue);
    } else {
      logger.debug('fail to send message for socket not exist.');
    }

    delete queues[sid];
  }
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
  this.__sessionService__.uidMap[uid] = this;
  this.uid = uid;
  this.emit('bind', uid);
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
 * Local session is used as session in the backend servers(see
 * lib/common/service/mockLocalSession.js).
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