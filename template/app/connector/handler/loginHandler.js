var pomelo = require('pomelo');
var exp = module.exports;

exp.login = function(req, session) {
	var username = req.username;
	var pwd = req.password;
    session.response({route: req.route, code: 200, user: username});
};
