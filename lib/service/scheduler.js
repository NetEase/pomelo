var schedule = require('pomelo-schedule');
var pomelo = require('../pomelo');

module.exports.run = run;

function run(triggers){
  console.log(typeof(triggers));
  for(var key in triggers){
    var trigger = triggers[key];
    schedule.scheduleJob(trigger[0], mailJob, {str:trigger[1], params:trigger[2]});
  }  
}

function mailJob(data){
  var str = data.str;
  var params = data.params;
  
  var app = pomelo.getApplication();
  

  var router = app.get('mailRouter');
  var mailBox = app.get('mailBox');
  
  var handler = str.substr(0,str.lastIndexOf('.'));
  var service = str.substr(0,str.indexOf('.'));
  var func = str.slice(str.lastIndexOf('.')+1, str.length);
  
//  var service = 'area';
  var msg = {
    service: 'user.' + handler,
    method: func,
    args: [data.params]
  }
  
//  console.log(" msg" + JSON.stringify(msg) + ' router: ' + router.route + ' mailBox ' + mailBox);
  router.route({type:service,uid:''}, function(err, serverId){
    console.log(serverId);
    mailBox.dispatch(serverId, msg, {}, function(err){
      console.log("定时任务回调！！！！！！！" + " err " + JSON.stringify(err));
    });
  });
  
  
  return handler[func];
}

/**
 * Get job from job string, need to work with mailbox
 */
function getFunc(str){
  
}

var testJob = function(data){
   console.log("run for Job :" + data.name  + " at time " + (new Date()));
}


