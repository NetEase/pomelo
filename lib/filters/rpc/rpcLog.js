/**
 * Filter for rpc log.
 * Record used time for remote process call.
 */
var rpcLogger = require('pomelo-logger').getLogger('rpc-log', __filename);
var utils = require('../../util/utils');

module.exports = function() {
  return new Filter();
};

var Filter = function () {
}; 

Filter.prototype.name = 'rpcLog';

/**
 * Before filter for rpc
 */

Filter.prototype.before = function(serverId, msg, opts, next) {
  opts = opts||{};
  opts.__start_time__ = Date.now();
  next();
};

/**
 * After filter for rpc
 */
Filter.prototype.after = function(serverId, msg, opts, next) {
  if(!!opts && !!opts.__start_time__) {
    var start = opts.__start_time__;
    var end = Date.now();
    var timeUsed = end - start;
    var log = {
      route: msg.service,
      args: msg.args,
      time: utils.format(new Date(start)),
      timeUsed: timeUsed
    };
    rpcLogger.info(JSON.stringify(log));
  }
  next();
};
