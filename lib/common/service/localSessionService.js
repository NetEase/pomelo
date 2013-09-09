/**
 * Mock session service for sessionService
 */
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var utils = require('../../util/utils');

var EXPORT_INCLUDE_FIELDS = ['id', 'frontendId', 'uid', 'settings'];

/**
 * Service that maintains local sessions and the communiation with frontend
 * server.
 *
 * LocalSessionService would be created in each server process and maintains
 * local sessions for current process and communicates with the relative
 * frontend servers.
 *
 * LocalSessionService instance could be accessed by
 * `app.get('localSessionService')`.
 *
 * @class
 * @constructor
 */
var LocalSessionService = function(app) {
  this.app = app;
};

module.exports = LocalSessionService;

LocalSessionService.prototype.create = function(opts) {
  if(!opts) {
    throw new Error('opts should not be empty.');
  }
  return new LocalSession(opts, this);
};

/**
 * Get local session by frontend server id and session id.
 *
 * @param  {String}   frontendId frontend server id that session attached
 * @param  {String}   sid        session id
 * @param  {Function} cb         callback function. args: cb(err, localSession)
 *
 * @memberOf SessionService
 */
LocalSessionService.prototype.get = function(frontendId, sid, cb) {
  var namespace = 'sys';
  var service = 'sessionRemote';
  var method = 'getLocalSessionBySid';
  var args = [sid];
  rpcInvoke(this.app, frontendId, namespace, service, method,
            args, localSessionCB.bind(null, this, cb));

};

/**
 * Get local sessions by frontend server id and user id.
 *
 * @param  {String}   frontendId frontend server id that session attached
 * @param  {String}   uid        user id binded with the session
 * @param  {Function} cb         callback function. args: cb(err, localSessions)
 *
 * @memberOf SessionService
 */
LocalSessionService.prototype.getByUid = function(frontendId, uid, cb) {
  var namespace = 'sys';
  var service = 'sessionRemote';
  var method = 'getLocalSessionByUid';
  var args = [uid];
  rpcInvoke(this.app, frontendId, namespace, service, method,
            args, localSessionCB.bind(null, this, cb));
};

/**
 * Kick a session by session id.
 *
 * @param  {String}   frontendId cooperating frontend server id
 * @param  {Number}   sid        session id
 * @param  {Function} cb         callback function
 *
 * @memberOf SessionService
 */
LocalSessionService.prototype.kickBySid = function(frontendId, sid, cb) {
  var namespace = 'sys';
  var service = 'sessionRemote';
  var method = 'kickBySid';
  var args = [sid];
  rpcInvoke(this.app, frontendId, namespace, service, method, args, cb);
};

/**
 * Kick sessions by user id.
 *
 * @param  {String}          frontendId cooperating frontend server id
 * @param  {Number|String}   uid        user id
 * @param  {Function}        cb         callback function
 *
 * @memberOf SessionService
 */
LocalSessionService.prototype.kickByUid = function(frontendId, uid, cb) {
  var namespace = 'sys';
  var service = 'sessionRemote';
  var method = 'kickByUid';
  var args = [uid];
  rpcInvoke(this.app, frontendId, namespace, service, method, args, cb);
};

/**
 * Bind the session with the specified user id. It would finally invoke the
 * the sessionService.bind in the cooperating frontend server.
 *
 * @param  {String}   frontendId cooperating frontend server id
 * @param  {Number}   sid        session id
 * @param  {String}   uid        user id
 * @param  {Function} cb         callback function
 *
 * @memberOf SessionService
 * @api private
 */
LocalSessionService.prototype.bind = function(frontendId, sid, uid, cb) {
  var namespace = 'sys';
  var service = 'sessionRemote';
  var method = 'bind';
  var args = [sid, uid];
  rpcInvoke(this.app, frontendId, namespace, service, method, args, cb);
};

/**
 * Unbind the session with the specified user id. It would finally invoke the
 * the sessionService.unbind in the cooperating frontend server.
 *
 * @param  {String}   frontendId cooperating frontend server id
 * @param  {Number}   sid        session id
 * @param  {String}   uid        user id
 * @param  {Function} cb         callback function
 *
 * @memberOf SessionService
 * @api private
 */
LocalSessionService.prototype.unbind = function(frontendId, sid, uid, cb) {
  var namespace = 'sys';
  var service = 'sessionRemote';
  var method = 'unbind';
  var args = [sid, uid];
  rpcInvoke(this.app, frontendId, namespace, service, method, args, cb);
};

/**
 * Push the specified local customized change to the global session.
 *
 * @param  {String}   frontendId cooperating frontend server id
 * @param  {Number}   sid        session id
 * @param  {String}   key        key in session that should be push
 * @param  {Object}   value      value in session, primitive js object
 * @param  {Function} cb         callback function
 *
 * @memberOf SessionService
 * @api private
 */
LocalSessionService.prototype.push = function(frontendId, sid, key, value, cb) {
  var namespace = 'sys';
  var service = 'sessionRemote';
  var method = 'push';
  var args = [sid, key, value];
  rpcInvoke(this.app, frontendId, namespace, service, method, args, cb);
};

/**
 * Push all the local customized changes to the global session.
 *
 * @param  {String}   frontendId cooperating frontend server id
 * @param  {Number}   sid        session id
 * @param  {Object}   settings   key/values in session that should be push
 * @param  {Function} cb         callback function
 *
 * @memberOf SessionService
 * @api private
 */
LocalSessionService.prototype.pushAll = function(frontendId, sid, settings, cb) {
  var namespace = 'sys';
  var service = 'sessionRemote';
  var method = 'pushAll';
  var args = [sid, settings];
  rpcInvoke(this.app, frontendId, namespace, service, method, args, cb);
};

var rpcInvoke = function(app, sid, namespace, service, method, args, cb) {
  app.rpcInvoke(sid, {namespace: namespace, service: service, method: method, args: args}, cb);
};

/**
 * LocalSession is the proxy for global session passed to handlers and it helps to keep
 * the key/value pairs for the server local. Global session locates in frontend server
 * and should not be accessed directly.
 *
 * The mainly operation on local session should be read and any changes happen in local
 * session is local and would be discarded in next request. You have to push the
 * changes to the frontend manually if necessary. Any push would overwrite the last push
 * of the same key silently and the changes would be saw in next request.
 * And you have to make sure the transaction outside if you would push the session
 * concurrently in different processes.
 *
 * See the api below for more details.
 *
 * @class
 * @constructor
 */
var LocalSession = function(opts, service) {
  EventEmitter.call(this);
  for(var f in opts) {
    this[f] = opts[f];
  }
  this.__sessionService__ = service;
};

util.inherits(LocalSession, EventEmitter);

/**
 * Bind current session with the user id. It would push the uid to frontend
 * server and bind  uid to the global session.
 *
 * @param  {Number|String}   uid user id
 * @param  {Function} cb  callback function
 *
 * @memberOf LocalSession
 */
LocalSession.prototype.bind = function(uid, cb) {
  var self = this;
  this.__sessionService__.bind(this.frontendId, this.id, uid, function(err) {
    if(!err) {
      self.uid = uid;
    }
    utils.invokeCallback(cb, err);
  });
};

/**
 * Unbind current session with the user id. It would push the uid to frontend
 * server and unbind uid to the global session.
 *
 * @param  {Number|String}   uid user id
 * @param  {Function} cb  callback function
 *
 * @memberOf LocalSession
 */
LocalSession.prototype.unbind = function(uid, cb) {
  var self = this;
  this.__sessionService__.unbind(this.frontendId, this.id, uid, function(err) {
    if(!err) {
      self.uid = null;
    }
    utils.invokeCallback(cb, err);
  });
};

/**
 * Set the key/value into local session.
 *
 * @param {String} key   key
 * @param {Object} value value
 */
LocalSession.prototype.set = function(key, value) {
  this.settings[key] = value;
};

/**
 * Get the value from local session by key.
 *
 * @param  {String} key key
 * @return {Object}     value
 */
LocalSession.prototype.get = function(key) {
  return this.settings[key];
};

/**
 * Push the key/value in local session to the global session.
 *
 * @param  {String}   key key
 * @param  {Function} cb  callback function
 */
LocalSession.prototype.push = function(key, cb) {
  this.__sessionService__.push(this.frontendId, this.id, key, this.get(key), cb);
};

/**
 * Push all the key/values in local session to the global session.
 *
 * @param  {Function} cb callback function
 */
LocalSession.prototype.pushAll = function(cb) {
  this.__sessionService__.pushAll(this.frontendId, this.id, this.settings, cb);
};

/**
 * Export the key/values for serialization.
 *
 * @api private
 */
LocalSession.prototype.export = function() {
  var res = {}, f;
  for(var i=0, l=EXPORT_INCLUDE_FIELDS.length; i<l; i++) {
    f = EXPORT_INCLUDE_FIELDS[i];
    res[f] = this[f];
  }

  return res;
};

var localSessionCB = function(service, cb, err, sinfo) {
  if(err) {
    utils.invokeCallback(cb, err);
    return;
  }

  if(!sinfo) {
    utils.invokeCallback(cb);
    return;
  }
  var sessions = [];
  if(Array.isArray(sinfo)){
      // #getByUid
      for(var i = 0,k = sinfo.length;i<k;i++){
          sessions.push(service.create(sinfo[i]));
      }
  }
  else{
      // #get
      sessions = service.create(sinfo);
  }
  utils.invokeCallback(cb, null, sessions);
};
