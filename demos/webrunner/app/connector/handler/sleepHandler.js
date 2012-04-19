var logger = require('../../../../../lib/util/log/log').getLogger(__filename);

var exp = module.exports;

exp.doSleep = function(msg, session) {
	var params = msg.params;
	if(!params.time) {
		params.time = 1000;
	}
	logger.error('%s: %s start to sleep %s ms.', Date.now(), params.name, params.time);
	setTimeout(function() {
		logger.error('%s: %s wakeup.', Date.now(), params.name);
		session.response({route: msg.route, code: 200, name: params.name});
	}, params.time);
};