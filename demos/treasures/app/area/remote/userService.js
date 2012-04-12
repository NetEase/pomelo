var exp = module.exports;
var utils = require('../../../../../lib/util/utils');
var userService = require('../../service/userService');
var sceneDao = require('../../dao/sceneDao');

var app = require('../../../../../lib/pomelo').getApp();
var channelManager = app.get('channelManager');
var channel = channelManager.getChannel('pomelo');
if(!channel)
  channel = channelManager.createChannel('pomelo');

/**
 * 用户退出,在场景在移除用户并通知客户端
 */
exp.userLeave = function(msg, cb) {
  var uid = msg.uid;
  var areaId = msg.areaId;
  
	sceneDao.removeUser(areaId, uid);
	channel.leave(uid);
	channel.pushMessage({route:'onUserLeave', code: 200, uid: uid});
	console.log('[userLeave] uid:' + uid);
	utils.invokeCallback(cb);
}

/**
 * 在场景中移除用户,不通知客户端
 */
exp.removeUser = function(msg, cb){
  var uid = msg.uid;
  var areaId = msg.areaId;
  
  sceneDao.removeUser(areaId, uid);
  channel.leave(uid);
  utils.invokeCallback(cb);
}

/**
 * 在场景中加入用户
 */
exp.addUser = function(msg, cb){
  var uid = msg.uid;
  var areaId = msg.areaId;
  
  userService.getUserById(uid, function(err, data){
    sceneDao.addUser(areaId, uid, data.roleId, data.name, {x: initX,y: initY}, function(err,uid) {
      if(!!err) {
        session.response({route: msg.route, code: 500});
      } else {
  //      channel.pushMessage({route:'onUserJoin', user: data});
        channel.add(uid);
  //      logger.debug('[onaddUser] updateRankList');
  //      updateRankList(uid);      
      }
    });
  });
}

exp.showUser = function(msg, cb){
  var uid = msg.uid;
  var areaId = msg.areaId;
  
  sceneDao.getUser(areaId, uid, function(err, user){
    if(!!err){
      utils.invokeCallback(cb,err);
    }else{
      utils.invokeCallback(cb, null, user);
    }
  });
}

/**
 * 当两个场景属于同一服务器时,采用转移的方式
 */
exp.transferUser = function(msg, cb){
  var uid = msg.uid;
  var areaId = msg.userId;
  var oldAreaId = msg.oldAreaId;

  sceneDao.setUserArea(oldAreaId, uid, areaId, function(err){
    if(!!err){
      logger.error("Transfer user error!");
      utils.invokeCallback(cb, err);
    }else{
      utils.invokeCallback(cb);
    }
 });
}
