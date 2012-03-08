var pomelo = require('../../pomelo');
var logger = require('../../util/log/log').getLogger(__filename);

module.exports.forwardMessage = function(uid, msg, session, cb) {
	logger.info('[msgService] recv msg:' + JSON.stringify(msg));
	var curSession = {uid: session.uid, response: cb};
	pomelo.getApplication().handle(msg, curSession);
};