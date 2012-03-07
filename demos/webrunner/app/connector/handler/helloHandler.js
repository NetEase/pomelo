module.exports.sayHello = function(msg, session) {
	session.response(null, {route: msg.route, code: 200, msg: 'hello ' + msg.params.name});
};