var pomelo = require('pomelo');

var channelService = require('pomelo').channelService;

var exp = module.exports;

exp.login = function(req, session) {
	var username = req.username;
	var pwd = req.password;
    console.log(username);
    session.response({route: req.route, code: 200,id:1, user: username, player: {id: 0},__new_format__:false});
};
