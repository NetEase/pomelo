var pomelo = require('../../../../../lib/pomelo');

module.exports.login = function(msg, session, next) {
	var name = 'test-channel';
	var uid = msg.params.uid;
	session.userLogined(uid);
	session.on('closing', function(session) {
		session.closed();
	});
	pomelo.app.rpc.logic.userService.joinChannel(name, uid, function(err) {
		if(!!err) {
			console.log('fail to join channel ' + err.stack);
			return;
		}
		session.response({route: msg.route, code: 200});
		next();
	});
};
