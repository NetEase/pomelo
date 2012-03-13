var pomelo = require('../../../../../lib/pomelo');

module.exports.login = function(msg, session) {
	var name = 'test-channel';
	var uid = msg.params.uid;
	session.userLogined(uid);
	var proxy = pomelo.getApplication().get('proxyMap');
	proxy.user.logic.userService.joinChannel(name, uid, function(err) {
		if(!!err) {
			console.log('fail to join channel ' + err.stack);
			return;
		}
		session.response({route: msg.route, code: 200});
	});
};