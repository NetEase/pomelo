var pomelo = require('../../../../../lib/pomelo');
var logger = require('../../../../../lib/util/log/log').getLogger(__filename);

var exp = module.exports;
exp.login = function(msg, session) {
	var username = msg.params.username;
	var pwd = msg.params.password;
	//TODO: add parameters validating logic
	pomelo.getApplication().get('proxyMap').user.login.loginService.checkPassport(username, pwd, function(err, uinfo) {
		if(!!err) {
			logger.error('fail to invoke remote loginService for ' + err.stack);
			session({route: msg.route, code: 500});
			return;
		}
		
		logger.debug('login success, uid:' + uinfo.uid);
		session.userLogined(uinfo.uid);
		session.on('closed', function(session) {
			if(!session || !session.uid) {
				return;
			}
			//TODO: logout logic
		});
		
		session.response({route: msg.route, code: 200, userData: uinfo});
	});
};