/**
 * Filter to keep request sequence.
 */
var perror = require('pomelo-logger').getLogger('perror', __filename);
var taskManager = require('../../common/service/taskManager');

module.exports = function() {
  return new Filter();
};

var Filter = function() {
};

/**
 * request serialization after filter
 */
Filter.prototype.before = function(msg, session, next){
  taskManager.addTask(session.id, function(task) {
    session.__serialTask__ = task;
    next();
  }, function() {
    perror.error('[serial filter] msg timeout, msg:' + JSON.stringify(msg));
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
  next(err, resp);
};
