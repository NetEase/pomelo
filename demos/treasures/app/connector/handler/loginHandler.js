var pomelo = require('../../../../../lib/pomelo');
var logger = require('../../../../../lib/util/log/log').getLogger(__filename);

var exp = module.exports;
var areas = require('../../../config/areas.json')['areas'];

exp.login = function(req, session) {
	var username = req.username;
	var pwd = req.password;
	//TODO: add parameters validating logic
	pomelo.getApp().get('proxyMap').user.login.loginRemote.checkPassport(username, pwd, function(err, uinfo) {
		if(!!err) {
			logger.error('[login] fail to invoke loginRemote for ' + err.stack);
			session.response({route: req.route, code: 500});
			return;
		}

		logger.debug('[login] login success, uid:' + uinfo.uid);
		afterLogin(req, session, uinfo);
	});
};

exp.register = function(req, session) {
	//TODO: add parameters validating logic
	pomelo.getApp().get('proxyMap').user.login.loginRemote.register(req, function(err, uinfo) {
		if(!!err) {
			logger.error('[register] fail to invoke loginRemote for ' + err.stack);
			session.response({route: req.route, code: 500, error:err});
			return;
		}

		logger.debug('[register] register success, uid:' + uinfo.uid);
		afterLogin(req, session, uinfo);
	});
};

var afterLogin = function(msg, session, uinfo) {
	var app = pomelo.getApp();
	app.get('proxyMap').user.status.statusRemote.addStatus(uinfo.uid,  app.get('serverId'), function(err) {
		if(!!err) {
			session.response({route: msg.route, code: 500});
			return;
		}

		session.set('areaId' ,uinfo.sceneId);
		session.set('username', uinfo.username);
		session.userLogined(uinfo.uid);
		session.on('closing', onUserLeave);
	
		session.response({route: msg.route, code: 200, userData: uinfo, areaData: app.get('areas')});
	});
};

var onUserLeave = function(session, reason) {
	if(!session || !session.uid) {
		return;
	}
	
	var proxy = pomelo.getApp().get('proxyMap');
	proxy.user.area.userRemote.userLeave({uid:session.uid, areaId: session.areaId}, function(err) {
		//TODO: logout logic
		//TODO: remember to call session.closed() to finish logout flow finally
		if(reason === 'kick') {
			session.closed();
			return;
		}
		proxy.user.status.statusRemote.removeStatus(session.uid, function(err) {
			if(!!err) {
				logger.error('fail to remove status for ' + uid + ', err:' + err.stack);
			}
			session.closed();
		});
	});
};
