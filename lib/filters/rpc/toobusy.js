/**
 * Filter for rpc log.
 * Reject rpc request when toobusy
 */
var rpcLogger = require('pomelo-logger').getLogger('rpc-log', __filename);
var toobusy = require('toobusy');

var exp = module.exports;

exp.name = 'toobusy';

/**
 * Before filter for rpc
 */
exp.before = function(serverId, msg, opts, next) {
  opts = opts || {};
  if (toobusy()) {
    rpcLogger.warn('Server is too busy for rpc request, serverId:' + serverId + ' msg: ' + msg);
    var err = new Error('Backend server ' + serverId + ' is too busy now!');
    err.code = 500;
    next(err);
  } else {
    next(serverId, msg, opts);
  }
};