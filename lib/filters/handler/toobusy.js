/**
 * Filter for toobusy.
 * if the process is toobusy, just skip the new request
 */
var conLogger = require('pomelo-logger').getLogger('con-log', __filename);
var toobusy = require('toobusy');

var DEFAULT_MAXLAG = 70;


module.exports = function(maxLag) {
  return new Filter(maxLag || DEFAULT_MAXLAG);
};

var Filter = function(maxLag) {
  toobusy.maxLag(maxLag);
};

Filter.prototype.before = function(msg, session, next) {
  if (toobusy()) {
    conLogger.warn('[toobusy] reject request msg: ' + msg);
    var err = new Error('Server toobusy!');
    err.code = 500;
    next(err);
  } else {
    next();
  }
};