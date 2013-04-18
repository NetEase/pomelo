/**
 * Scheduler module to schedule message sending.
 */

var pomelo = require('../pomelo');

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

Scheduler.prototype.schedule = function(route, msg, recvs, opts, cb) {
  this.scheduler.schedule(route, msg, recvs, opts, cb);
};

var getScheduler = function(app, opts) {
  var scheduler = opts.scheduler || require('../scheduler/buffer');
  console.error('scheduler~~~~: %j, %j, %j', scheduler, opts, require('../scheduler/buffer'));
  if(typeof scheduler === 'function') {
    return scheduler(app, opts);
  } else {
    return scheduler;
  }
};
