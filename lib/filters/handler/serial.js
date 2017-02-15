'use strict';

/**
 * Filter to keep request sequence.
 */
const logger = require('pomelo-logger').getLogger('pomelo', __filename);
const taskManager = require('../../common/manager/taskManager');

module.exports = Filter;

function Filter(timeout) {
  if (!(this instanceof Filter)) {
    return new Filter(timeout);
  }

  this.timeout = timeout;
}

const serialTaskSymbol = Symbol('serialTask');

/**
 * request serialization after filter
 */
Filter.prototype.before = function(msg, session, next) {
  taskManager.addTask(session.id, (task) => {
    session[serialTaskSymbol] = task;
    next();
  }, () => {
    logger.error('[serial filter] msg timeout, msg:' + JSON.stringify(msg));
  }, this.timeout);
};

/**
 * request serialization after filter
 */
Filter.prototype.after = function(err, msg, session, resp, next) {
  const task = session[serialTaskSymbol];

  if (task) {
    if (!task.done() && !err) {
      err = new Error('task time out. msg:' + JSON.stringify(msg));
    }
  }
  session[serialTaskSymbol] = null;
  next(err);
};
