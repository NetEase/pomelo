var pomelo = require('../../../../../lib/pomelo');
var logger = require('../../../../../lib/util/log/log').getLogger(__filename);
var utils = require('../../util/utils');

var exp = module.exports;
var areas = require('../../../config/areas.json').area;

exp.login = function(req, session, next) {
	var username = req.username;
	var pwd = req.password;
	//TODO: add parameters validating logic
	pomelo.app.rpc.login.loginRemote.checkPassport(username, pwd, function(err, uinfo) {
		if(!!err) {
			logger.error('[login] fail to invoke loginRemote for ' + err.stack);
			session.response({route: req.route, code: 500});
      utils.invokeCallback(next);
			return;
		}

		logger.debug('[login] login success, uid:' + uinfo.uid);
		afterLogin(req, session, uinfo);
    utils.invokeCallback(next);
	});
};

exp.register = function(req, session, next) {
	//TODO: add parameters validating logic
	pomelo.app.rpc.login.loginRemote.register(req, function(err, uinfo) {
		if(!!err) {
			logger.error('[register] fail to invoke loginRemote for ' + err.stack);
			session.response({route: req.route, code: 500, error:err});
      utils.invokeCallback(next);
			return;
		}

		logger.debug('[register] register success, uid:' + uinfo.uid);
		afterLogin(req, session, uinfo);
    utils.invokeCallback(next);
	});
};

var afterLogin = function (msg, session, uinfo) {
	var app = pomelo.app;
	app.rpc.status.statusRemote.addStatus(uinfo.uid,  app.get('serverId'), function(err) {
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

var onUserLeave = function (session, reason) {
	if(!session || !session.uid) {
		return;
	}

	app.rpc.area.userRemote.userLeave({uid:session.uid, areaId: session.areaId}, function(err) {
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
