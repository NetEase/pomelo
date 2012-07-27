module.exports.sayHello = function(msg, session, next) {
	session.response({route: msg.route, code: 200, msg: 'hello ' + msg.params.name});
	next();
};
