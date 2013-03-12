/**
 * Remote session service for frontend server.
 * Set session info for backend servers.
 */
var logger = require('pomelo-logger').getLogger(__filename);


module.exports = function(app) {
  return new Remote(app);
};

var Remote = function(app) {
  this.app = app;
};

Remote.prototype.bind = function(sid, uid, cb) {
  this.app.get('sessionService').bind(sid, uid, cb);
};

Remote.prototype.push = function(sid, key, value, cb) {
  this.app.get('sessionService').import(sid, key, value, cb);
};

Remote.prototype.pushAll = function(sid, settings, cb) {
  this.app.get('sessionService').importAll(sid, settings, cb);
};

/**
 * Get session informations with session id.
 *
 * @param  {String}   sid session id binded with the session
 * @param  {Function} cb(err, sinfo)  callback funtion, sinfo would be null if the session not exist.
 */
Remote.prototype.getLocalSessionBySid = function(sid, cb) {
  var session = this.app.get('sessionService').get(sid);
  if(!session) {
    cb();
    return;
  }

  cb(null, session.mockLocalSession().export());
};

/**
 * Get session informations with user id.
 *
 * @param  {String}   uid user id binded with the session
 * @param  {Function} cb(err, sinfo)  callback funtion, sinfo would be null if the session not exist.
 */
Remote.prototype.getLocalSessionByUid = function(uid, cb) {
  var session = this.app.get('sessionService').getByUid(uid);
  if(!session) {
    cb();
    return;
  }

  cb(null, session.mockLocalSession().export());
};

/**
 * Kick a session by session id.
 *
 * @param  {Number}   sid session id
 * @param  {Function} cb  callback function
 */
Remote.prototype.kickBySid = function(sid, cb) {
  this.app.get('sessionService').kickBySessionId(sid, cb);
};

/**
 * Kick a session by user id.
 *
 * @param  {Number|String}   uid user id
 * @param  {Function} cb     callback function
 */
Remote.prototype.kickByUid = function(uid, cb) {
  this.app.get('sessionService').kick(uid, cb);
};