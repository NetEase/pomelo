var pomelo = require('../../pomelo');
var logger = require('../../util/log/log').getLogger(__filename);
var sessionService = require('../service/mockSessionService');
var monitorService = require('../service/monitorService');
var utils = require('../../util/utils');

/**
 * forward message from connector server to other server's handlers
 */
module.exports.forwardMessage = function(uid, msg, session, cb) {
  var start = Date.now();
	logger.info('[msgService] recv msg:' + JSON.stringify(msg));
	session.response = function(resp) {
		//console.log('session.response:　resp: '+JSON.stringify(resp));
		utils.invokeCallback(cb, null, resp);
		var end = Date.now();
		monitorService.addTime(msg.route, end-start);
	};
	console.log('myHandlers:' + JSON.stringify(pomelo.getApp().get('handlerMap')));
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