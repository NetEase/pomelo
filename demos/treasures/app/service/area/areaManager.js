var utils = require('../../../../../lib/util/utils');
var pomelo = require('../../../../../lib/pomelo');
var Area = require('./area');
var Tower = require('./tower');

var exp = module.exports;
var areas = {};
var logger = require('../../../../../lib/pomelo').log.getLogger(__filename);

exp.init = function(){
  var app = pomelo.getApp();
  var areasConfig = app.get('areas');
  var areasMapConfig = app.get('areasMap');
  
  var areaList = areasMapConfig[app.get('serverId')];
  
  if(!areaList)
    return;
    
  for(var key in areaList){
    var areaId = areaList[key];
    
    var area = areasConfig[areaId];
    area.id = areaId;
    areas[areaId] = Area.create(area);
  }
}

/**
 * Return the area id list
 * @returns {Array} The area id list
 */
exp.getArea = function(areaId){
  return areas[areaId];
}

exp.getAreas = function(){
  return areas;
}

/**
 * Remove the area
 * @param id Area id
 */
exp.removeArea = function(id, cb){
  var area = areas[id];
  
  if(!!area){
    delete areas[id];
    utils.invokeCallback(cb, null, area);
  }else {
    utils.invokeCallback(cb, id + " not exist ", null);
  }
}

exp.transferUser = function(msg, cb){
  var uid = msg.uid;
  var areaId = msg.target;
  var oldAreaId = msg.areaId;
  var app = pomelo.getApp();
  var areasConfig = app.get('areas');
  
  var oldServerId = areasConfig[oldAreaId].server;
  var serverId = areasConfig[areaId].server; 
  
  var proxy =  pomelo.getApp().get('proxyMap');
  
  //If the target and the start are in the same server, use the in server transfer
  if(serverId == oldServerId){
    var oldArea = areas[oldAreaId];
    var area = areas[areaId];
    if(!oldArea || !area){
      utils.invokeCallback(cb, 'Area not exist!');
      return;
    }
    
    var user = oldArea.getUser(uid);
    
    if(!user){
      utils.invokeCallback(cb, 'User not exist!');
      return;
    }
    
    proxy.sys.connector.sessionRemote.changeArea(msg, function(err){
      if(!!err){
        oldArea.setUser(user);
        utils.invokeCallback(cb, err);
        logger.error('Change area for session service failed! ' + err);
      }else{
        oldArea.removeUser(uid);
        oldArea.pushMessage({route:'onUserLeave', code: 200, uid: uid});
        user.x = 200;
        user.y = 200;
        user.sceneId = areaId;
        
        area.addUser(user);
        utils.invokeCallback(cb);
      }
    });
  }else{
    var newMsg = {
      service : 'user.area.userRemote',
      method : 'addUser',
      args: [{areaId:areaId, uid: uid}]
    }
    
    var oldArea = areas[oldAreaId];
    var user = oldArea.getUser(uid);
    
    app.get('mailBox').dispatch(serverId, newMsg, null, function(err){
      if(!!err){
        logger.error('!!!!!!!!!!!!! add user failed!');
        userService.setUser(areaId, user);
        
        utils.invokeCallback(cb, err);
      }else{
        oldArea.removeUser(areaId, uid);
        proxy.sys.connector.sessionRemote.changeArea(msg, function(err){
          if(!!err){
            oldArea.setUser(user);
            utils.invokeCallback(cb, err);
            logger.error('Change area for session service failed! ' + err);
          }else{
            utils.invokeCallback(cb);
          }
        });
      }
    });
  }
}