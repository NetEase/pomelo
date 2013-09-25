/**
 * Scheduler module to schedule message sending.
 */

var pomelo = require('../pomelo');
var DefaultScheduler = require('../scheduler/direct');

module.exports = function(app, opts) {
  return new Component(app, opts);
};

var Component = function(app, opts) {
  this.app = app;
  opts = opts || {};
  this.scheduler = getScheduler(app, opts);
};

var pro = Component.prototype;

pro.name = '__scheduler__';

pro.afterStart = function(cb) {
  if(this.scheduler.start) {
    this.scheduler.start(cb);
  } else {
    process.nextTick(cb);
  }
};

pro.stop = function(force, cb) {
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
pro.schedule = function(reqId, route, msg, recvs, opts, cb) {
  this.scheduler.schedule(reqId, route, msg, recvs, opts, cb);
};

var getScheduler = function(app, opts) {
  var scheduler = opts.scheduler || DefaultScheduler;
  if(typeof scheduler === 'function') {
    return scheduler(app, opts);
  }

  return scheduler;
};
