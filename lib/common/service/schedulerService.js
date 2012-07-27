var schedule = require('pomelo-schedule');
var pomelo = require('../../pomelo');
var logger = require('../../util/log/log').getLogger(__filename);

module.exports.run = run;

/**
 * schedule task entry
 */
function run (config) {
  var app = pomelo.app;
  var env = app.get('env');

  var serverId = app.get('serverId');
  var triggers = config[serverId];

  for(var key in triggers){
    var trigger = triggers[key];
    schedule.scheduleJob(trigger[0], mailJob, {str:trigger[1], params:trigger[2], serverId: serverId});
  }
}

/**
 * Invoke the schedule task
 */
function mailJob(data){
  var str = data.str;
  var params = data.params;
  var serverId = data.serverId;

  var app = pomelo.app;


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

  //If had set a serverId in params, use the serverId
  if(!!serverId){
    mailBox.dispatch(serverId, msg, {}, function(err){
      if(!!err)
        logger.error("Run schedule Job error ! " + JSON.stringify(err));
    });
  }else{
    router.route({type:service, uid:''}, function(err, serverId){
      mailBox.dispatch(serverId, msg, {}, function(err){
        if(!!err)
          logger.error("Run schedule Job error ! " + JSON.stringify(err));
      });
    });
  }

  return handler[func];
}


