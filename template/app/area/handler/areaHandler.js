var pomelo = require('pomelo');

var exp = module.exports;
exp.createPlayer = function(req, session) {
    var uid = req.uid;
    var name = req.name;
    session.response({route: req.route, code: 200, user: uid});
};
