'use strict';

/**
 * Filter for timeout.
 * Print a warn information when request timeout.
 */
const logger = require('pomelo-logger').getLogger('pomelo', __filename);
const utils = require('../../util/utils');

const DEFAULT_TIMEOUT = 3000;
const DEFAULT_SIZE = 500;

module.exports = Filter;

function Filter(timeout, maxSize) {
  if (!(this instanceof Filter)) {
    return new Filter(timeout);
  }

  if (timeout === undefined) {
    timeout = DEFAULT_TIMEOUT;
  }

  if (maxSize === undefined) {
    maxSize = DEFAULT_SIZE;
  }

  this.timeout = timeout;
  this.maxSize = maxSize;
  this.timeouts = {};
  this.curId = 0;
}

const timeoutIdSymbol = Symbol('timeout id');

Filter.prototype.before = function(msg, session, next) {
  const count = utils.size(this.timeouts);
  if (count > this.maxSize) {
    logger.warn('timeout filter is out of range, ' +
                'current size is %s, max size is %s',
                count, this.maxSize);
    next();
    return;
  }

  this.curId++;

  this.timeouts[this.curId] = setTimeout(() => {
    logger.warn('request %j timeout.', msg.__route__);
  }, this.timeout);

  session[timeoutIdSymbol] = this.curId;
  next();
};

Filter.prototype.after = function(err, msg, session, resp, next) {
  const timeout = this.timeouts[session[timeoutIdSymbol]];
  if (timeout) {
    clearTimeout(timeout);
    delete this.timeouts[session[timeoutIdSymbol]];
  }
  next(err);
};
