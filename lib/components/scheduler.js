/**
 * Scheduler module to schedule message sending.
 */

var pomelo = require('../pomelo');
var DefaultScheduler = require('../scheduler/buffer');

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

Scheduler.prototype.schedule = function(route, msg, recvs, opts) {
  this.scheduler.schedule(route, msg, recvs, opts);
};

var getScheduler = function(app, opts) {
  return opts.scheduler || new DefaultScheduler(app, opts);
};
