var monitorService = require('../common/service/monitorService');
var rpc_logger = require('../util/log/log').getLogger('rpc-log');

var exp = module.exports;

exp.rpcPreFilter = function(serverId, msg, opts, next) {
	opts = opts||{};
	opts.__start_time__ = Date.now();
	next(serverId, msg, opts);
};

exp.rpcAfterFilter = function(serverId, msg, opts, next) {
	if(!!opts && !!opts.__start_time__) {
		var start = opts.__start_time__;
		var end = Date.now();
		msg.timeUsed = end - start;
		msg.time = getTime();
		// msg.duration = new Date().getTime();
		// msg.serverId = serverId;
		rpc_logger.info(JSON.stringify(msg));
		monitorService.addTime(msg.route, msg.timeUsed);
	}
	next(serverId, msg, opts);
};

var getTime = function () {
  var date = new Date();
  var n = date.getFullYear();
  var y = date.getMonth();
  var r = date.getDate();
  var mytime = date.toLocaleTimeString();
  var mytimes = mytime + '/' + n + "-" + y + "-" + r ;
  return mytimes;
};