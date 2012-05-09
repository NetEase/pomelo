var exp = module.exports;
var utils = require('../../../../../lib/util/utils');
var userService = require('../../service/userService');
var areaService = require('../../service/areaService');

var pomelo = require('../../../../../lib/pomelo');
var initX = 100;
var initY = 100;

var logger = require('../../../../../lib/util/log/log').getLogger(__filename);

// var channelManager = app.get('channelManager');
// var channel = channelManager.getChannel('pomelo');
// if(!channel)
  // channel = channelManager.createChannel('pomelo');

/**
 * 用户退出,在场景在移除用户并通知客户端
 */
exp.userLeave = function(msg, cb) {
  var uid = msg.uid;
  var areaId = msg.areaId;
  
  var i = 0;
  
  areaService.removeUser(areaId, uid);
	areaService.pushMessage(areaId, {route:'onUserLeave', code: 200, uid: uid});
	console.log('[userLeave] uid:' + uid);
	utils.invokeCallback(cb);
}

/**
 * 在场景中加入用户
 */
exp.addUser = function(msg, cb){
  var uid = msg.uid;
  var areaId = msg.areaId;
  
  //logger.error('serverId ' + pomelo.getApp().get('serverId') + ', areaId :' + areaId);
  userService.getUserById(uid, function(err, user){
    if(!!err){
      utils.invokeCallback(cb, err);
    }else{
      user.x = initX;
      user.y = initY;
      user.areaId = areaId;
      
      if(areaService.addUser(areaId, user)){
        utils.invokeCallback(cb);
      }else{
        utils.invokeCallback(cb, 'User not exist!');
      }
    }
  });
}
