var exp = module.exports;
var utils = require('../../../../../lib/util/utils');
var userService = require('../../service/userService');
var sceneDao = require('../../dao/sceneDao');

var app = require('../../../../../lib/pomelo').getApp();
var channelManager = app.get('channelManager');
var channel = channelManager.getChannel('pomelo');
if(!channel)
  channel = channelManager.createChannel('pomelo');

exp.userLeave = function(uid, cb) {
	sceneDao.removeOnline(0, uid);
	channel.leave(uid);
	channel.pushMessage({route:'onUserLeave', code: 200, uid: uid});
	console.log('[userLeave] uid:' + uid);
	utils.invokeCallback(cb);
};