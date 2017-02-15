'use strict';

/**
 * Filter for rpc log.
 * Record used time for remote process call.
 */
const rpcLogger = require('pomelo-logger').getLogger('rpc-log', __filename);
const utils = require('../../util/utils');

module.exports = Filter;

function Filter() {
  if (!(this instanceof Filter)) {
    return new Filter();
  }
}

Filter.prototype.name = 'rpcLog';

const startTimeSymbol = Symbol('rpc start time');

/**
 * Before filter for rpc
 */
Filter.prototype.before = function(serverId, msg, opts, next) {
  opts = opts || {};
  opts[startTimeSymbol] = Date.now();
  next();
};

/**
 * After filter for rpc
 */
Filter.prototype.after = function(serverId, msg, opts, next) {
  if (opts && opts[startTimeSymbol] !== undefined) {
    const start = opts[startTimeSymbol];
    const end = Date.now();
    const timeUsed = end - start;
    const log = {
      route: msg.service,
      args: msg.args,
      time: utils.format(new Date(start)),
      timeUsed: timeUsed
    };
    rpcLogger.info(JSON.stringify(log));
  }
  next();
};
