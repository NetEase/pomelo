var handler = module.exports;

var treasureService = require('../../service/treasureService');
var logger = require('../../../../../lib/pomelo').log.getLogger(__filename);

/**
 * 用户把抢宝
 * @param userId
 * @param treasureId
 * @param sceneId
 */ 

handler.pickItem = function (msg, session){
  var params = msg.params;
  var userId = session.userId;
  var treasureId = params.treasureId;
  //var sceneId = session.sceneId;
  var sceneId = 0;
  treasureService.pickItem(userId,treasureId,sceneId,function(err,result){
  logger.debug(userId + ' picked up treasure to logic ' + treasureId + "result:" + result + ' ' + commonConstant.PROTOCOL.SCENE.PICK_TREASURE);
  var msg={'type':commonConstant.PROTOCOL.SCENE.PICK_TREASURE, 'code':200 ,'body':{success:result,treasureId:treasureId}};
  channelClient.publishState(msg);
  handler.updateRankList();
      if (err){
        session.response({route: msg.route, code:500});
      }
      else{
        session.response({route: msg.route, code: 200, result: result});
      }
  //utils.invokeCallback(cb, null, result);
  });
};

handler.getTreasures = function(msg, session){
  treasureService.getAllTreasureInfo(0, function(err, result){
    if (err){
      session.response({route: msg.route, code:500});
    }
    else{
      session.response({route: msg.route, code: 200, result: result});
    }
  });
}

/**
 * 用户移动
 * 日前可以算出时间推给事件服务器
 * 
 * @param move
 */

//
//
///**
// * 排名推送
// *
// */
//
//handler.updateRankList = function(){
//    rankService.getTopN(ServerConstant.top,function(err,data){
//    var msg={'type':clientConstant.RANK_LIST_REFRESH, 'code':200 ,'body':data};
//    channelClient.publishState(msg);
//  });
//};
