var utils = require('../../../../lib/util/utils');
var pomelo = require('../../../../lib/pomelo');
var Area = require('./area/area');
var Tower = require('./area/tower');
var areaManager = require('./area/areaManager');

var exp = module.exports;
var areas = {};
var logger = require('../../../../lib/pomelo').log.getLogger(__filename);

exp.init = function(){
  areaManager.init();
  areas = areaManager.getAreas();
}

/**
 * 向一个场景内增加用户
 */
exp.addUserByUid = function(areaId, uid){
  return areaManager.getArea(areaId).addUser(uid);
}

/**
 * 向一个场景内增加用户
 */
exp.addUser = function(areaId, user){
  var area = areaManager.getArea(areaId);
  if(!area){
    logger.error('Area not exist! areaId : ' + areaId);
    return;
  }
  
  return area.addUser(user);
}

exp.setUser = function(areaId, user){
  return areaManager.getArea(areaId).setUser(user);
}

exp.getUser = function(areaId, uid){
  return areaManager.getArea(areaId).getUser(uid);
}

exp.removeUser = function(areaId, uid){
  return areaManager.getArea(areaId).removeUser(uid);
}

/**
 * 获取某个场景内的所有在线用户
 */
exp.getUsers = function(areaId){
  return areaManager.getArea(areaId).getUsers();
}

exp.transferUser = function(msg, cb){
  areaManager.transferUser(msg, cb);
}

/**
 * 向一个Area内的所有对象发送消息
 */
exp.pushMessage = function(areaId, msg){
  areaManager.getArea(areaId).pushMessage(msg);
}

exp.pushMessageByPath = function(areaId, path, msg, cb){
  areaManager.getArea(areaId).pushMessageByPath(path, msg, cb);  
}

exp.pushMessageToAll = function(msg){
  
}

exp.getMapConfig = function(areaId){
  return areaManager.getArea(areaId).mapConfig;
}
