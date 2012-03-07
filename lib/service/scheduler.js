var schedule = require('pomelo-schedule');

module.exports.run = run;

function run(triggers){
  console.log(typeof(triggers));
  for(var key in triggers){
    var trigger = triggers[key];
    schedule.scheduleJob(trigger[0], testJob, trigger[2]);
  }  
}

/**
 * Get job from job string, need to work with mailbox
 */
function getFunc(str){
  var handler = require(str.substr(0,str.lastIndexOf('.')));
  
  var func = str.slice(str.lastIndexOf('.')+1, str.length-1);
  
  return handler[func];
}

var testJob = function(data){
   console.log("run for Job :" + data.name  + " at time " + (new Date()));
}


