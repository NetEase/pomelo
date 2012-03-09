var filter = module.exports;
var logger = require('../util/log/log').getLogger(__filename);

var dataMap = {};

var limit = 10;

filter.handle = function(msg, session, next){
  logger.info("Monitro filter before");
  var start = Date.now();
  next(null, msg, session);
  var end = Date.now();
  
  var time = end - start;
  if(!dataMap[msg.route])
    dataMap[msg.route] = buildData();
  
  addTime(dataMap[msg.route], time);
  
  logger.info(dataMap);
}

filter.getDataMap = function(){
  return dataMap;
}

function buildData(){
  var data = {};
  data.max = 0;
  data.min = Number.MAX_VALUE;
  data.count = 0;
  data.avg = 0;
  data.history = [];
  
  return data;
}

function addTime(data, time){
  if(data.max < time)
    data.max = time;
  if(data.min > time)
    data.min = time;
  data.count++;
  if(data.history.length >= limit)
    data.history.pop();
  data.history.unshift(time);
  
  data.avg += (time-data.avg)/data.count;
  
  return data;
}