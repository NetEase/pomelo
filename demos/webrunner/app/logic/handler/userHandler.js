var handler = module.exports;
var logger = require('../../../../../lib/util/log/log').getLogger(__filename);
var pomelo = require('../../../../../lib/pomelo');

handler.getUserInfo = function(msg, session){
  console.log('[userHandler.getUserInfo] route:' + msg.route + ' uid:' + msg.params.uid);
  
  try {
  	pomelo.getApplication().get('proxyMap').user.logic.userService.getUserInfo(msg.params.uid, function(err, uinfo) {
  		session.response(null, {route: msg.route, code: 200, user: uinfo});
  	});
  } catch(err) {
  	logger.error('[userHandler.getUserInfo] fail to handle requrest for:' + err.stack);
  	session.response(err);
  }
}


