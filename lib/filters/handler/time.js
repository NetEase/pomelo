'use strict';

/**
 * Filter for statistics.
 * Record used time for each request.
 */
const conLogger = require('pomelo-logger').getLogger('con-log', __filename);
const utils = require('../../util/utils');

module.exports = Filter;

function Filter() {
  if (!(this instanceof Filter)) {
    return new Filter();
  }
}

const startTimeSymbol = Symbol('start time');

Filter.prototype.before = function(msg, session, next) {
  session[startTimeSymbol] = Date.now();
  next();
};

Filter.prototype.after = function(err, msg, session, resp, next) {
  const start = session[startTimeSymbol];

  if (typeof start === 'number') {
    const timeUsed = Date.now() - start;
    const log = {
      route: msg.__route__,
      args: msg,
      time: utils.format(new Date(start)),
      timeUsed: timeUsed
    };
    conLogger.info(JSON.stringify(log));
  }
  next(err);
};
