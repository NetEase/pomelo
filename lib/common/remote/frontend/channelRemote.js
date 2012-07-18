/**
 * Remote channel service for frontend server.
 * Receive push request from backend servers and push it to clients.
 */
var logger = require('../../../util/log/log').getLogger(__filename);
var utils = require('../../../util/utils');
var sessionService = require('../../service/sessionService');

var exp = module.exports;

/**
 * Push message to client by uids
 *
 * @param msg {Object} message that would be push to clients
 * @param uids {Array} user ids that would receive the message
 * @param cb {Function} callback function
 */
exp.pushMessage = function(msg, uids, cb) {
	try {
		for(var i=0, l=uids.length; i<l; i++) {
			//var session = sessionService.getSessionByUid(uids[i]);
			//if(!session || !session.socket)
			//	continue;
			//session.socket.emit('message', msg);
      sessionService.sendMessageByUid(uids[i], msg);
		}
		utils.invokeCallback(cb);
	} catch(err) {
		logger.error('fail to send message for ' + err.stack);
		utils.invokeCallback(cb, err);
	}
};
