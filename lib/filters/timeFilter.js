var utils = require('../util/utils');
var con_logger = require('../util/log/log').getLogger('con-log');
var filter = module.exports;

filter.before = function(msg, session, next) {
  session.__startTime__ = Date.now();
  utils.invokeCallback(next);
};

filter.after = function(err, msg, session, next) {
  var start = session.__startTime__;
  if(typeof start === 'number') {
    msg.timeUsed = Date.now() - start;
    msg.time = getTime();
    msg.duration = new Date().getTime();
    con_logger.info(JSON.stringify(msg));
  }
  utils.invokeCallback(next, err);
};

// format time
var getTime = function() {
  var date = new Date();
  var n = date.getFullYear();
  var y = date.getMonth();
  var r = date.getDate();
  var mytime = date.toLocaleTimeString();
  var mytimes = mytime + '/' + n + '-' + y + '-' + r;
	return mytimes;
}
