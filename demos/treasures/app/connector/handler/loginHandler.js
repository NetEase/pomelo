var pomelo = require('../../../../../lib/pomelo');
var logger = require('../../../../../lib/util/log/log').getLogger(__filename);

var exp = module.exports;
exp.login = function(msg, session) {
	var username = msg.params.username;
	var pwd = msg.params.password;
	//TODO: add parameters validating logic
	pomelo.getApplication().get('proxyMap').user.login.loginService.checkPassport(username, pwd, function(err, uinfo) {
		if(!!err) {
			logger.error('[login] fail to invoke remote loginService for ' + err.stack);
			session({route: msg.route, code: 500});
			return;
		}
		
		logger.debug('[login] login success, uid:' + uinfo.uid);
		afterLogin(msg, session, uinfo);
	});
};

exp.register = function(msg, session) {
	//TODO: add parameters validating logic
	pomelo.getApplication().get('proxyMap').user.login.loginService.register(msg.params, function(err, uinfo) {
		if(!!err) {
			logger.error('[register] fail to invoke remote loginService for ' + err.stack);
			session.response({route: msg.route, code: 500});
			return;
		}
		
		logger.debug('[register] register success, uid:' + uinfo.uid);
		afterLogin(msg, session, uinfo);
	});
};

var afterLogin = function(msg, session, uinfo) {
	session.userLogined(uinfo.uid);
	session.on('closing', onUserLeave);
	
	session.response({route: msg.route, code: 200, userData: uinfo});
};

var onUserLeave = function(session) {
	if(!session || !session.uid) {
		return;
	}
	//TODO: logout logic
	//TODO: remember to call session.closed() to finish logout flow finally
	session.closed();
};