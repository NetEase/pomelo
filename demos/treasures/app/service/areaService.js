var utils = require('../../../../lib/util/utils');
var pomelo = require('../../../../lib/pomelo');
var Area = require('./area/area');
var Tower = require('./area/tower');
var areaManager = require('./area/areaManager');

var exp = module.exports;
var areas = {};
var console = require('../../../../lib/pomelo').log.getLogger(__filename);

exp.init = function(){
  areaManager.init();
  areas = areaManager.getAreas();
}

/**
 * 向一个场景内增加用户
 */
exp.addUserByUid = function(areaId, uid){
  var area = areaManager.getArea(areaId);
  if(!area){
    console.error('addUserByUid Area not exist! areaId : ' + areaId);
    return;
  }
  return area.addUser(uid);
}

/**
 * 向一个场景内增加用户
 */
exp.addUser = function(areaId, user){
  var area = areaManager.getArea(areaId);
  if(!area){
    console.error('addUser Area not exist! areaId : ' + areaId);
    return;
  }
  
  return area.addUser(user);
}

exp.setUser = function(areaId, user){
  var area = areaManager.getArea(areaId);
  if(!area){
    console.error('setUser Area not exist! areaId : ' + areaId);
    return;
  }
  return area.setUser(user);
}

exp.getUser = function(areaId, uid){
  var area = areaManager.getArea(areaId);
  if(!area){
    console.error('getUser Area not exist! areaId : ' + areaId);
    return;
  }
  return area.getUser(uid);
}

exp.removeUser = function(areaId, uid){
  var area = areaManager.getArea(areaId);
  if(!area){
    console.error('removeUser Area not exist! areaId : ' + areaId);
    return;
  }
  return area.removeUser(uid);
}

/**
 * 获取某个场景内的所有在线用户
 */
exp.getUsers = function(areaId){
  var area = areaManager.getArea(areaId);
  if(!area){
    console.error('getUsers Area not exist! areaId : ' + areaId);
    return;
  }
  return area.getUsers();
}

exp.transferUser = function(msg, cb){
  areaManager.transferUser(msg, cb);
}

/**
 * 向一个Area内的所有对象发送消息
 */
exp.pushMessage = function(areaId, msg){
  var area = areaManager.getArea(areaId);
  if(!area){
    console.error('pushMessage Area not exist! areaId : ' + areaId);
    return;
  }
  area.pushMessage(msg);
}

exp.pushMessageByUids = function(areaId, uids, msg){
  var area = areaManager.getArea(areaId);
  if(!area){
    console.error('pushMessageByUids Area not exist! areaId : ' + areaId);
    return;
  }
	area.pushMessageByUids(uids, msg);  
}

exp.pushMessageByPath = function(areaId, path, msg, cb){
  var area = areaManager.getArea(areaId);
  if(!area){
    console.error('pushMessageByPath Area not exist! areaId : ' + areaId);
    return;
  }
	area.pushMessageByPath(path, msg, cb);  
}

exp.pushMessageToAll = function(msg){
  var areas = areaManager.getAreas();
  
  for(var id in areas){
    areas[id].pushMessage(msg);
  }
}

exp.getMapConfig = function(areaId){
  var area = areaManager.getArea(areaId);
  if(!area){
    console.error('getMapConfig Area not exist! areaId : ' + areaId);
    return;
  }
  return area.mapConfig;
}
