var exp = module.exports;
var utils = require('../../../../../lib/util/utils');
var userService = require('../../service/userService');
var sceneDao = require('../../dao/sceneDao');

var pomelo = require('../../../../../lib/pomelo');
var areaManager = require('./areaManager');
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
  
  var area = areaManager.getArea(areaId);
  var i = 0;
  logger.error(msg);
  sceneDao.removeUser(areaId, uid);
  userService.getUserById(uid, function(err, data){
    area.removeUser(data);
  });
  
	area.channel.pushMessage({route:'onUserLeave', code: 200, uid: uid});
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
  areaManager.getArea(areaId).channel.leave(uid);
  utils.invokeCallback(cb);
}

/**
 * 在场景中加入用户
 */
exp.addUser = function(msg){
  var uid = msg.uid;
  var areaId = msg.areaId;
  var area = areaManager.getArea(msg.areaId);
  
  userService.getUserById(uid, function(err, data){
    sceneDao.addUser(areaId, uid, data.roleId, data.name, {x: initX,y: initY}, function(err,uid) {
      if(!!err) {
        session.response({route: msg.route, code: 500});
      } else {
        area.addUser(data);
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
  var areaId = msg.target;
  var oldAreaId = msg.areaId;

  logger.error("transfer user : " + JSON.stringify(msg));
  sceneDao.setUserArea(oldAreaId, uid, areaId, function(err){
    if(!!err){
      logger.error("Transfer user error! error: " + err);
      utils.invokeCallback(cb, err);
    }else{
      utils.invokeCallback(cb);
    }
 });
}
