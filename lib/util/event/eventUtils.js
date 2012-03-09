var utils = require('../utils');
var logger = require('../log/log').getLogger(__filename);

var eventUtils = module.exports;

/**
 * 用户的Timer映射
 * key:userId
 * value:timer
 */
var timeouts = {};//timeout事件
var intervals = {};//interval事件


eventUtils.startEvent = function(event,cb){
  logger.debug('new event in eventServer:');
  logger.debug(event);
  var timeout = null;
  var interval = null;
  if(!!event.loop && event.loop)
  if(!!event.delay ){
    timeout = setTimeout(setInterval(function(){event.method.call(event.params);}, event.period), event.delay);
  }
  else {
    interval = setInterval(function(){event.method.call(event.params);}, event.period);
  }

  if(!!timeout)
    timeouts[event.hash] = timeout;
  if(!!interval)
    intervals[event.hash] = interval;
  
  utils.invokeCallback(cb, null);
};

eventUtils.stopEvent = function(eventHash, cb){
  //logger.debug('stop event in eventServer:');
  //logger.debug(eventHash);
  var t = timeouts[eventHash];
  if(!!t){
    logger.debug("timout:" + t);
    clearTimeout(t);
  }else{
    t = intervals[eventHash];
    logger.debug("interval:"+t);
    if(!!t)
      clearInterval(t);
  }
  logger.debug(eventHash+" has stop");
  utils.invokeCallback(cb, null, eventHash);
};