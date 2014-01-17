/**
 * Filter for timeout.
 * Print a warn information when request timeout.
 */
var logger = require('pomelo-logger').getLogger('pomelo', __filename);
var utils = require('../../util/utils');

var DEFAULT_TIMEOUT = 3000;
var DEFAULT_SIZE = 500;

module.exports = function(timeout, maxSize) {
  return new Filter(timeout || DEFAULT_TIMEOUT, maxSize || DEFAULT_SIZE);
};

var Filter = function(timeout, maxSize) {
  this.timeout = timeout;
  this.maxSize = maxSize;
  this.timeouts = {};
  this.curId = 0;
};

Filter.prototype.before = function(msg, session, next) {
  var count = utils.size(this.timeouts);
  if(count > DEFAULT_SIZE) {
    logger.warn('timeout filter is out of range, current size is %s, max size is %s', count, this.maxSize);
    next();
    return;
  }
  this.curId++;
  this.timeouts[this.curId] = setTimeout(function() {
    logger.warn('request %j timeout.', msg.__route__);
  }, this.timeout);
  session.__timeout__ = this.curId;
  next();
};

Filter.prototype.after = function(err, msg, session, resp, next) {
  var timeout = this.timeouts[session.__timeout__];
  if(timeout) {
    clearTimeout(timeout);
    delete this.timeouts[session.__timeout__];
  }
  next(err);
};
