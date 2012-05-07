var monitor = module.exports;
var logger = require('../../util/log/log').getLogger(__filename);

var dataMap = {};

var limit = 10;

monitor.getDataMap = function(){
  return dataMap;

};

monitor.addTime = function(route, time){
  if(!dataMap[route])
    dataMap[route] = buildData();

  var data = dataMap[route];

  if(data.max < time)
    data.max = time;
  if(data.min > time) data.min = time;
  data.count++;
  if(data.history.length >= limit)
    data.history.pop();
  data.history.unshift(time);

  data.avg += (time-data.avg)/data.count;
  //console.log(dataMap);
};

function buildData () {
  var data = {};
  data.max = 0;
  data.min = Number.MAX_VALUE;
  data.count = 0;
  data.avg = 0;
  data.history = [];

  return data;
}
