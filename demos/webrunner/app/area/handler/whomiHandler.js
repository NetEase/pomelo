var pomelo = require('../../../../../lib/pomelo');

module.exports.getMe = function(msg, session) {
	 try {
	  	pomelo.getApplication().get('proxyMap').user.logic.userService.getUserInfo(msg.params.uid, function(err, uinfo) {
	  		session.response({route: msg.route, code: 200, user: uinfo});
	  	});
	  } catch(err) {
	  	logger.error('[whomiHandler.getMe] fail to handle requrest for:' + err.stack);
	  	session.response({route: msg.route, code: 500});
	  }
};