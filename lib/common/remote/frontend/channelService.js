var logger = require('../../../util/log/log').getLogger(__filename);
var utils = require('../../../util/utils');
var sessionService = require('../../service/sessionService');

var exp = module.exports;

exp.pushMessage = function(msg, uids, cb) {
	try {
		for(var i=0, l=uids.length; i<l; i++) {
			var session = sessionService.getSessionByUid(uids[i]);
			if(!session || !session.socket) 
				continue;
			session.socket.emit('message', msg);
		}
		utils.invokeCallback(cb);
	} catch(err) {
		logger.error('fail to send message for ' + err.stack);
		utils.invokeCallback(cb, err);
	}
};