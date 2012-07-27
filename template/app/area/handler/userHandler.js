var pomelo = require('pomelo');

var exp = module.exports;
exp.createPlayer = function(req, session) {
	var uid = req.uid;
	var roleId = req.roleId;
	var name = req.name;
	console.log(name);
    session.response({route: req.route, code: 200, id:6, user: uid, player: {id: 0},__new_format__: true});
};
