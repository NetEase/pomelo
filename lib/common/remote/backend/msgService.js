var pomelo = require('../../../pomelo');
var logger = require('../../../util/log/log').getLogger(__filename);
var sessionService = require('../../service/mockSessionService');
var monitorService = require('../../service/monitorService');
var utils = require('../../../util/utils');

var rpc_logger = require('../../../util/log/log').getLogger('rpc-log');

/**
 * forward message from connector server to other server's handlers
 */
module.exports.forwardMessage = function(params, msg, session, cb) {
  var uid = params.uid;
  var areaId = params.areaId;
  
  var start = Date.now();
	// logger.info('[msgService] recv msg:' + JSON.stringify(msg));
	session.response = function(resp) {
		//console.log('session.response:　resp: '+JSON.stringify(resp));
		utils.invokeCallback(cb, null, resp);
		var end = Date.now();
		// vat timeout=end-start;
		msg.timeUsed=end-start;
		msg.time=getTime();
		msg.duration=new Date().getTime();
		msg.serverId=pomelo.getApp().serverId;
		// console.error('serverId'+pomelo.getApp().serverId);
		rpc_logger.info(JSON.stringify(msg));
		monitorService.addTime(msg.route, end-start);
	};
	pomelo.getApp().handle(msg, sessionService.createSession(session), function(err) {
		if(!!err) {
			utils.invokeCallback(cb, err);
			var end = Date.now();
			monitorService.addTime(msg.route, end-start);
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
  var mytimes= mytime+'/'+n+ "-" + y + "-" + r ;
    return mytimes;
}
