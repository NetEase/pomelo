'use strict';

/**
 * Filter for toobusy.
 * if the process is toobusy, just skip the new request
 */
const conLogger = require('pomelo-logger').getLogger('con-log', __filename);
const DEFAULT_MAXLAG = 70;

let toobusy = null;

module.exports = function(maxLag) {
  return new Filter(maxLag || DEFAULT_MAXLAG);
};

function Filter(maxLag) {
  if (!(this instanceof Filter)) {
    return new Filter(maxLag);
  }

  try {
    toobusy = require('toobusy');
  } catch (e) {
  }

  if (toobusy) {
    toobusy.maxLag(maxLag);
  }
}

Filter.prototype.before = function(msg, session, next) {
  if (toobusy && toobusy()) {
    conLogger.warn('[toobusy] reject request msg: ' + msg);
    const err = new Error('Server toobusy!');
    err.code = 500;
    next(err);
  } else {
    next();
  }
};
