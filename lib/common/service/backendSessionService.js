/**
 * backend session service for backend session
 */
var utils = require('../../util/utils');

var EXPORTED_FIELDS = ['id', 'frontendId', 'uid', 'settings'];

/**
 * Service that maintains backend sessions and the communiation with frontend
 * servers.
 *
 * BackendSessionService would be created in each server process and maintains
 * backend sessions for current process and communicates with the relative
 * frontend servers.
 *
 * BackendSessionService instance could be accessed by
 * `app.get('backendSessionService')` or app.backendSessionService.
 *
 * @class
 * @constructor
 */
var BackendSessionService = function(app) {
  this.app = app;
};

module.exports = BackendSessionService;

BackendSessionService.prototype.create = function(opts) {
  if(!opts) {
    throw new Error('opts should not be empty.');
  }
  return new BackendSession(opts, this);
};

/**
 * Get backend session by frontend server id and session id.
 *
 * @param  {String}   frontendId frontend server id that session attached
 * @param  {String}   sid        session id
 * @param  {Function} cb         callback function. args: cb(err, BackendSession)
 *
 * @memberOf BackendSessionService
 */
BackendSessionService.prototype.get = function(frontendId, sid, cb) {
  var namespace = 'sys';
  var service = 'sessionRemote';
  var method = 'getBackendSessionBySid';
  var args = [sid];
  rpcInvoke(this.app, frontendId, namespace, service, method,
            args, BackendSessionCB.bind(null, this, cb));
};

/**
 * Get backend sessions by frontend server id and user id.
 *
 * @param  {String}   frontendId frontend server id that session attached
 * @param  {String}   uid        user id binded with the session
 * @param  {Function} cb         callback function. args: cb(err, BackendSessions)
 *
 * @memberOf BackendSessionService
 */
BackendSessionService.prototype.getByUid = function(frontendId, uid, cb) {
  var namespace = 'sys';
  var service = 'sessionRemote';
  var method = 'getBackendSessionsByUid';
  var args = [uid];
  rpcInvoke(this.app, frontendId, namespace, service, method,
            args, BackendSessionCB.bind(null, this, cb));
};

/**
 * Kick a session by session id.
 *
 * @param  {String}   frontendId cooperating frontend server id
 * @param  {Number}   sid        session id
 * @param  {Function} cb         callback function
 *
 * @memberOf BackendSessionService
 */
BackendSessionService.prototype.kickBySid = function(frontendId, sid, cb) {
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
 * @memberOf BackendSessionService
 */
BackendSessionService.prototype.kickByUid = function(frontendId, uid, cb) {
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
 * @memberOf BackendSessionService
 * @api private
 */
BackendSessionService.prototype.bind = function(frontendId, sid, uid, cb) {
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
 * @memberOf BackendSessionService
 * @api private
 */
BackendSessionService.prototype.unbind = function(frontendId, sid, uid, cb) {
  var namespace = 'sys';
  var service = 'sessionRemote';
  var method = 'unbind';
  var args = [sid, uid];
  rpcInvoke(this.app, frontendId, namespace, service, method, args, cb);
};

/**
 * Push the specified customized change to the frontend internal session.
 *
 * @param  {String}   frontendId cooperating frontend server id
 * @param  {Number}   sid        session id
 * @param  {String}   key        key in session that should be push
 * @param  {Object}   value      value in session, primitive js object
 * @param  {Function} cb         callback function
 *
 * @memberOf BackendSessionService
 * @api private
 */
BackendSessionService.prototype.push = function(frontendId, sid, key, value, cb) {
  var namespace = 'sys';
  var service = 'sessionRemote';
  var method = 'push';
  var args = [sid, key, value];
  rpcInvoke(this.app, frontendId, namespace, service, method, args, cb);
};

/**
 * Push all the customized changes to the frontend internal session.
 *
 * @param  {String}   frontendId cooperating frontend server id
 * @param  {Number}   sid        session id
 * @param  {Object}   settings   key/values in session that should be push
 * @param  {Function} cb         callback function
 *
 * @memberOf BackendSessionService
 * @api private
 */
BackendSessionService.prototype.pushAll = function(frontendId, sid, settings, cb) {
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
 * BackendSession is the proxy for the frontend internal session passed to handlers and
 * it helps to keep the key/value pairs for the server locally.
 * Internal session locates in frontend server and should not be accessed directly.
 *
 * The mainly operation on backend session should be read and any changes happen in backend
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
var BackendSession = function(opts, service) {
  for(var f in opts) {
    this[f] = opts[f];
  }
  this.__sessionService__ = service;
};

/**
 * Bind current session with the user id. It would push the uid to frontend
 * server and bind  uid to the frontend internal session.
 *
 * @param  {Number|String}   uid user id
 * @param  {Function} cb  callback function
 *
 * @memberOf BackendSession
 */
BackendSession.prototype.bind = function(uid, cb) {
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
 * server and unbind uid from the frontend internal session.
 *
 * @param  {Number|String}   uid user id
 * @param  {Function} cb  callback function
 *
 * @memberOf BackendSession
 */
BackendSession.prototype.unbind = function(uid, cb) {
  var self = this;
  this.__sessionService__.unbind(this.frontendId, this.id, uid, function(err) {
    if(!err) {
      self.uid = null;
    }
    utils.invokeCallback(cb, err);
  });
};

/**
 * Set the key/value into backend session.
 *
 * @param {String} key   key
 * @param {Object} value value
 */
BackendSession.prototype.set = function(key, value) {
  this.settings[key] = value;
};

/**
 * Get the value from backend session by key.
 *
 * @param  {String} key key
 * @return {Object}     value
 */
BackendSession.prototype.get = function(key) {
  return this.settings[key];
};

/**
 * Push the key/value in backend session to the front internal session.
 *
 * @param  {String}   key key
 * @param  {Function} cb  callback function
 */
BackendSession.prototype.push = function(key, cb) {
  this.__sessionService__.push(this.frontendId, this.id, key, this.get(key), cb);
};

/**
 * Push all the key/values in backend session to the frontend internal session.
 *
 * @param  {Function} cb callback function
 */
BackendSession.prototype.pushAll = function(cb) {
  this.__sessionService__.pushAll(this.frontendId, this.id, this.settings, cb);
};

/**
 * Export the key/values for serialization.
 *
 * @api private
 */
BackendSession.prototype.export = function() {
  var res = {};
  EXPORTED_FIELDS.forEach(function(field) {
    res[field] = this[field];
  });
  return res;
};

var BackendSessionCB = function(service, cb, err, sinfo) {
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
