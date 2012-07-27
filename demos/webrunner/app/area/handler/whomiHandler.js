var pomelo = require('../../../../../lib/pomelo');

module.exports.getMe = function(msg, session, next) {
	try {
		pomelo.rpc.logic.userService.getUserInfo(msg.params.uid, function(err, uinfo) {
			if(!!err) {
				session.response({route: msg.route, code: 500});
			} else {
				session.response({route: msg.route, code: 200, user: uinfo});
			}
			next();
		});
	} catch(err) {
		logger.error('[whomiHandler.getMe] fail to handle requrest for:' + err.stack);
		session.response({route: msg.route, code: 500});
	}
};
