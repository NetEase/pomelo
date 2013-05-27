/**
 * Scheduler module to schedule message sending.
 */

var pomelo = require('../pomelo');
var DefaultScheduler = require('../scheduler/direct');

module.exports = function(app, opts) {
  return new Scheduler(app, opts);
};

var Scheduler = function(app, opts) {
  this.app = app;
  opts = opts || {};
  this.scheduler = getScheduler(app, opts);
};

Scheduler.prototype.name = '__scheduler__';

Scheduler.prototype.afterStart = function(cb) {
  if(this.scheduler.start) {
    this.scheduler.start(cb);
  } else {
    process.nextTick(cb);
  }
};

Scheduler.prototype.stop = function(force, cb) {
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
Scheduler.prototype.schedule = function(reqId, route, msg, recvs, opts, cb) {
  this.scheduler.schedule(reqId, route, msg, recvs, opts, cb);
};

var getScheduler = function(app, opts) {
  var scheduler = opts.scheduler || require('../scheduler/direct');
  if(typeof scheduler === 'function') {
    return scheduler(app, opts);
  }

  return scheduler;
};
