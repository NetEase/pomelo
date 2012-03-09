var exp = module.exports;

exp.login = function(msg, session) {
	var uid = '000001';
	session.userLogined(uid);
	session.response({route: msg.route, code: 200, uid: uid});
};