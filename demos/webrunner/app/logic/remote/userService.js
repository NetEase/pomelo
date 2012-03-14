var exp = module.exports;
var utils = require('../../../../../lib/util/utils');
var logger = require('../../../../../lib/util/log/log').getLogger(__filename);
var pomelo = require('../../../../../lib/pomelo');

exp.getUserInfo = function(uid, fn) {
	logger.info('[userService.getUserInfo] recv request, uid:' + uid);
  utils.invokeCallback(fn, null, {uid: uid, username: 'username'});
}

exp.joinChannel = function(cname, uid, cb) {
	var cm = pomelo.getApplication().get('channelManager');
	var channel = cm.getChannel(cname);
	if(!channel) {
		channel = cm.createChannel(cname);
	}
	channel.add(uid);
	utils.invokeCallback(cb);
}