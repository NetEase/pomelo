var pomelo = require('../../../pomelo');
var logger = require('../../../util/log/log').getLogger(__filename);
var sessionService = require('../../service/mockSessionService');
var utils = require('../../../util/utils');
var forward_logger = require('../../../util/log/log').getLogger('forward-log');

/**
 * forward message from connector server to other server's handlers
 */
module.exports.forwardMessage = function(params, msg, session, cb) {
  var uid = params.uid;
  var areaId = params.areaId;
  var start = Date.now();
  session.response = function(resp) {
  	
  	var end=Date.now();
        msg.timeUsed=end-start;
        msg.time=getTime();
        msg.duration=new Date().getTime();
        msg.serverId=pomelo.getApp().serverId;
  	forward_logger.info(JSON.stringify(msg));
	utils.invokeCallback(cb, null, resp);
  };
  pomelo.getApp().handle(msg, sessionService.createSession(session), function(err) {
	if(!!err) {
		utils.invokeCallback(cb, err);
		return;
	}
	logger.warn('found invalid handle flow, uid:' + uid + ', msg:' + JSON.stringify(msg));
  });
};
 // format time
function getTime(){
  var date=new Date();
  var n=date.getFullYear(); 
  var y=date.getMonth();
  var r=date.getDate(); 
  var mytime=date.toLocaleTimeString(); 
  var mytimes=  mytime+'/'+n+ "-" + y + "-" + r;
    return mytimes;
}
