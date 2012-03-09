module.exports.sayHello = function(msg, session) {
	session.response({route: msg.route, code: 200, msg: 'hello ' + msg.params.name});
};