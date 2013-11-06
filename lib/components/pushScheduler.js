/**
 * Scheduler component to schedule message sending.
 */

var pomelo = require('../pomelo');
var DefaultScheduler = require('../pushSchedulers/direct');

module.exports = function(app, opts) {
  return new PushScheduler(app, opts);
};

var PushScheduler = function(app, opts) {
  this.app = app;
  opts = opts || {};
  this.scheduler = getScheduler(app, opts);
};

PushScheduler.prototype.name = '__pushScheduler__';

/**
 * Component lifecycle callback
 *
 * @param {Function} cb
 * @return {Void}
 */
PushScheduler.prototype.afterStart = function(cb) {
  if(this.scheduler.start) {
    this.scheduler.start(cb);
  } else {
    process.nextTick(cb);
  }
};

/**
 * Component lifecycle callback
 *
 * @param {Function} cb
 * @return {Void}
 */
PushScheduler.prototype.stop = function(force, cb) {
  if(this.scheduler.stop) {
    this.scheduler.stop(force, cb);
  } else {
    process.nextTick(cb);
  }
};

/**
 * Schedule how the message to send.
 *
 * @param  {Number}   reqId request id
 * @param  {String}   route route string of the message
 * @param  {Object}   msg   message content after encoded
 * @param  {Array}    recvs array of receiver's session id
 * @param  {Object}   opts  optionals
 * @param  {Function} cb
 */

PushScheduler.prototype.schedule = function(reqId, route, msg, recvs, opts, cb) {
  this.scheduler.schedule(reqId, route, msg, recvs, opts, cb);
};

var getScheduler = function(app, opts) {
  var scheduler = opts.scheduler || DefaultScheduler;
  if(typeof scheduler === 'function') {
    return scheduler(app, opts);
  }

  return scheduler;
};
