/**
 * Filter to keep request sequence.
 */
var logger = require('pomelo-logger').getLogger('pomelo', __filename);
var taskManager = require('../../common/manager/taskManager');

module.exports = function() {
  return new Filter();
};

var Filter = function() {
};

/**
 * request serialization after filter
 */
Filter.prototype.before = function(msg, session, next) {
  taskManager.addTask(session.id, function(task) {
    session.__serialTask__ = task;
    next();
  }, function() {
    logger.error('[serial filter] msg timeout, msg:' + JSON.stringify(msg));
  });
};

/**
 * request serialization after filter
 */
Filter.prototype.after = function(err, msg, session, resp, next) {
  var task = session.__serialTask__;
  if(task) {
    if(!task.done() && !err) {
      err = new Error('task time out. msg:' + JSON.stringify(msg));
    }
  }
  next(err);
};
