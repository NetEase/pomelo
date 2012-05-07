var pomelo = require('../../../pomelo');
var logger = require('../../../util/log/log').getLogger(__filename);
var sessionService = require('../../service/mockSessionService');
var utils = require('../../../util/utils');

/**
 * forward message from connector server to other server's handlers
 */
module.exports.forwardMessage = function(params, msg, session, cb) {
  var uid = params.uid;
  var areaId = params.areaId;
  
  session.response = function(resp) {
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
