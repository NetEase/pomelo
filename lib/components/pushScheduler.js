'use strict';

/**
 * Scheduler component to schedule message sending.
 */
const logger = require('pomelo-logger').getLogger('pomelo', __filename);

const DefaultScheduler = require('../pushSchedulers/direct');

module.exports = PushScheduler;

function PushScheduler(app, opts) {
  if (!(this instanceof PushScheduler)) {
    return new PushScheduler(app, opts);
  }

  this.app = app;
  opts = opts || {};
  this.scheduler = _getScheduler(this, app, opts);
}

PushScheduler.prototype.name = '__pushScheduler__';

/**
 * Component lifecycle callback
 *
 * @param {Function} cb
 * @return {Void}
 */
PushScheduler.prototype.afterStart = function(cb) {
  if (this.isSelectable) {
    let k;
    let sch;
    for (k in this.scheduler) {
      sch = this.scheduler[k];
      if (typeof sch.start === 'function') {
        sch.start();
      }
    }
    process.nextTick(cb);
  } else if (typeof this.scheduler.start === 'function') {
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
  if (this.isSelectable) {
    let k;
    let sch;
    for (k in this.scheduler) {
      sch = this.scheduler[k];
      if (typeof sch.stop === 'function') {
        sch.stop();
      }
    }
    process.nextTick(cb);
  } else if (typeof this.scheduler.stop === 'function') {
    this.scheduler.stop(cb);
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
 * @param  {Object}   opts  options
 * @param  {Function} cb
 */

PushScheduler.prototype.schedule = function(reqId, route,
                                            msg, recvs, opts, cb) {
  if (this.isSelectable) {
    if (typeof this.selector === 'function') {
      this.selector(reqId, route, msg, recvs, opts, (id) => {
        if (this.scheduler[id] &&
            typeof this.scheduler[id].schedule === 'function') {
          this.scheduler[id].schedule(reqId, route,
                                      msg, recvs, opts, cb);
        } else {
          logger.error('invalid pushScheduler id, id: %j', id);
        }
      });
    } else {
      logger.error('the selector for pushScheduler is not a function: %j',
                   this.selector);
    }
  } else {
    if (typeof this.scheduler.schedule === 'function') {
      this.scheduler.schedule(reqId, route, msg, recvs, opts, cb);
    } else {
      logger.error('the scheduler does not have a schedule function: %j',
                   this.scheduler);
    }
  }
};

function _getScheduler(pushSchedulerComp, app, opts) {
  const scheduler = opts.scheduler || DefaultScheduler;

  if (typeof scheduler === 'function') {
    return scheduler(app, opts);
  }

  if (Array.isArray(scheduler)) {
    const res = {};

    scheduler.forEach((sch) => {
      if (typeof sch.scheduler === 'function') {
        res[sch.id] = sch.scheduler(app, sch.options);
      } else {
        res[sch.id] = sch.scheduler;
      }
    });

    pushSchedulerComp.isSelectable = true;
    pushSchedulerComp.selector = opts.selector;
    return res;
  }

  return scheduler;
}
