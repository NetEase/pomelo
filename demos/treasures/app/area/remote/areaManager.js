var utils = require('../../../../../lib/util/utils');
var app = require('../../../../../lib/pomelo').getApp();

var exp = module.exports;
var areas = {};


exp.init = function(){
  areas = app.get('areas');
}

/**
 * Return the area id list
 * @returns {Array} The area id list
 */
exp.getAreaList = function(){
  var ids = [];
  for (var key in areas) {
    ids.push(key);
  }
  return ids;
}

// exp.registerArea = function(id, cb){
  // var area = areaList[areaKey];
  // if (!!area) {//TODO 
    // utils.invokeCallback(cb, sceneKey + " existed ", scene);
  // } else {
    // var proxy=utils.findInArray(scenes, 'id', sceneKey);
    // if (proxy==null){
      // utils.invokCallback(cb, new WGError(commonConst.RES_CODE.ERR_FAIL, 'invalid scene server key:'+sceneKey));
    // }
    // else{
      // proxy.type=config.sceneType || {};
      // var cProxy = ClientProxy.createProxy({id:proxy.id,host:proxy.host,port:8050});
      // cProxy.type = proxy.type;
      // var scene = Scene.create({id:sceneKey,name:sceneKey,proxy: cProxy});
      // sceneList[sceneKey] = scene;
      // logger.debug(sceneList[sceneKey]);
      // utils.invokeCallback(cb, null, scene);
    // }
  // }
// }

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
  var areaId = msg.userId;
  var oldAreaId = msg.oldAreaId;
  var areas = app.get('areas');
  
  var oldServerId = areas[oldAreaId].server;
  var serverId = areas[areaId].server; 
  
  var proxy =  pomelo.getApp().get('proxyMap');
  
  //If the target and the start are in the same server, use the in server transfer
  if(server == oldServer){
   proxy.user.area.userService.transferUser(msg, function(err) {
      if(!!err){
        utils.invokeCallback(cb, err);
      }else{
        utils.invokeCallback(cb, null);
        //通知connector
        proxy.sys.connnector.sessionService.changeArea(msg, function(err){
          if(!!err){
            utils.invokeCallback(cb, err);
          }else{
            utils.invokeCallback(cb);
          }
        });
      }
    });
  }else{
    var newMsg = {
      service : 'user.area.userService',
      method : 'addUser',
      args: msg
    }
    app.get('mailBox').dispatch(serverId, newMsg, null, function(err){
      if(!!err){
        utils.invokeCallback(cb, err);
      }else{
        proxy.sys.connnector.sessionService.changeArea(msg, function(err){
          if(!!err){
            utils.invokeCallback(cb, err);
          }else{
            newMsg.method = 'showUser';
            app.get('mailBox').dispatch(serverId, newMsg, null, function(err){
              if(!!err){
                utils.invokeCallback(cb, err);
              }else{
                utils.invokeCallback(cb);
              }
            });
          }
        });
      }
    });
  }
}
