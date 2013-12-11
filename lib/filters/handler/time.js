/**
 * Filter for statistics.
 * Record used time for each request.
 */
var conLogger = require('pomelo-logger').getLogger('con-log', __filename);
var utils = require('../../util/utils');

module.exports = function() {
  return new Filter();
};

var Filter = function() {
};

Filter.prototype.before = function(msg, session, next) {
  session.__startTime__ = Date.now();
  next();
};

Filter.prototype.after = function(err, msg, session, resp, next) {
  var start = session.__startTime__;
  if(typeof start === 'number') {
    var timeUsed = Date.now() - start;
    var log = {
      route : msg.__route__,
      args : msg,
      time : utils.format(new Date(start)),
      timeUsed : timeUsed
    };
    conLogger.info(JSON.stringify(log));
  }
  next(err);
};
