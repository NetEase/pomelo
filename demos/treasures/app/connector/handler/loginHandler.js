var pomelo = require('../../../../../lib/pomelo');
var logger = require('../../../../../lib/util/log/log').getLogger(__filename);

var exp = module.exports;
exp.login = function(msg, session) {
	debugger;
	var username = msg.params.username;
	var pwd = msg.params.password;
	//TODO: add parameters validating logic
	pomelo.getApp().get('proxyMap').user.login.loginService.checkPassport(username, pwd, function(err, uinfo) {
		if(!!err) {
			logger.error('[login] fail to invoke remote loginService for ' + err.stack);
			session.response({route: msg.route, code: 500});
			return;
		}

		logger.debug('[login] login success, uid:' + uinfo.uid);
		afterLogin(msg, session, uinfo);
	});
};

exp.register = function(msg, session) {
	//TODO: add parameters validating logic
	pomelo.getApp().get('proxyMap').user.login.loginService.register(msg.params, function(err, uinfo) {
		if(!!err) {
			logger.error('[register] fail to invoke remote loginService for ' + err.stack);
			session.response({route: msg.route, code: 500, error:err});
			return;
		}

		logger.debug('[register] register success, uid:' + uinfo.uid);
		afterLogin(msg, session, uinfo);
	});
};

var afterLogin = function(msg, session, uinfo) {
	var app = pomelo.getApp();
	app.get('proxyMap').user.status.statusService.addStatus(uinfo.uid,  app.get('serverId'), function(err) {
		if(!!err) {
			session.response({route: msg.route, code: 500});
			return;
		}

		session.set('areaId' ,uinfo.sceneId);
		session.set('username', uinfo.username);
		session.userLogined(uinfo.uid);
		session.on('closing', onUserLeave);
	
		session.response({route: msg.route, code: 200, userData: uinfo});
	});
};

var onUserLeave = function(session, reason) {
	if(!session || !session.uid) {
		return;
	}
	
	var proxy = pomelo.getApp().get('proxyMap');
	proxy.user.area.userService.userLeave({uid:session.uid, areaId: session.areaId}, function(err) {
		//TODO: logout logic
		//TODO: remember to call session.closed() to finish logout flow finally
		if(reason !== 'kick') {
			return;
		}
		proxy.user.status.statusService.removeStatus(session.uid, function(err) {
			if(!!err) {
				logger.error('fail to remove status for ' + uid + ', err:' + err.stack);
			}
			session.closed();
		});
	});
};
