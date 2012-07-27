var handler = module.exports;
var logger = require('../../../../../lib/util/log/log').getLogger(__filename);
var pomelo = require('../../../../../lib/pomelo');

handler.getUserInfo = function(msg, session, next){
  console.log('[userHandler.getUserInfo] route:' + msg.route + ' uid:' + msg.params.uid);

  try {
		pomelo.app.rpc.logic.userService.getUserInfo(msg.params.uid, function(err, uinfo) {
			session.response({route: msg.route, code: 200, user: uinfo});
		});
	} catch(err) {
		logger.error('[userHandler.getUserInfo] fail to handle requrest for:' + err.stack);
		session.response({route: msg.route, code: 500});
		next();
  }
};

handler.broadcast = function(msg, session) {
	var name = 'test-channel';
	var cm = pomelo.channelService;
	var channel = cm.getLocalChannelSync(name);
	if(!channel) {
		logger.error('[broadcast] channel not exist. name:' + name);
		session.response({route: msg.route, code: 500});
		return;
	}

	channel.pushMessage({route: 'logic.userHandler.pushMessage', content: msg.params.content}, function(err) {
		if(!!err) {
			logger.error('[broadcast] fail to push message, ' + err.stack);
			return;
		}
		session.response({route: msg.route, code: 200});
	});
};


