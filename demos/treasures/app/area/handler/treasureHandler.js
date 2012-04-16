var handler = module.exports;

var treasureService = require('../../service/treasureService');
var rankService=require('../../service/rankService');
var ServerConstant=require('../../config/serverConstant');
var logger = require('../../../../../lib/pomelo').log.getLogger(__filename);

var app = require('../../../../../lib/pomelo').getApp();
var channelManager = app.get('channelManager');
var channel = channelManager.getChannel('pomelo');
if(!channel)
  channel = channelManager.createChannel('pomelo');

/**
 * 用户抢宝
 * @param userId
 * @param treasureId
 * @param sceneId
 */ 
handler.pickItem = function (msg, session){
  var params = msg.params;
  var uid = session.uid;
  var treasureId = params.treasureId;
  //var sceneId = session.sceneId;
  treasureService.pickItem(uid,treasureId,msg.areaId,function(err,result){
  	logger.debug(uid + ' picked up treasure to logic ' + treasureId + "result:" + result);
  	var result ={route:msg.route, code:200 ,success:result,treasureId:treasureId};
    if (err){
        session.response({route: msg.route, code:500});
      }
    else{
         channel.pushMessage(result);
         updateRankList();
      }
  });
};

handler.getTreasures = function(msg, session){
  treasureService.getAllTreasureInfo(msg.areaId, function(err, result){
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
/**
 * 排名推送
 *
 */
function updateRankList(){
	rankService.getTopN(ServerConstant.top,function(err,data){
	  if(err){
	   logger.error('updateRankList failed!');
	  }
	  var msg={'route':'area.onRankListChange','rankList':data};
	  channel.pushMessage(msg);
	  logger.info('pickItem,updateRankList success!!');
	});
}

