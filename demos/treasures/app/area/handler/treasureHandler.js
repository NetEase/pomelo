var handler = module.exports;

var treasureService = require('../../service/treasureService');
var rankService=require('../../service/rankService');
var ServerConstant=require('../../config/serverConstant');
var logger = require('../../../../../lib/pomelo').log.getLogger(__filename);
var utils = require('../../util/utils');
var pomelo = require('../../../../../lib/pomelo');
var areaService = require('../../service/areaService');

/**
 * 用户抢宝
 * @param userId
 * @param treasureId
 * @param sceneId
 */
handler.pickItem = function (req, session, next){
  var uid = session.uid;
  var treasureId = req.treasureId;

  //var sceneId = session.sceneId;
  treasureService.pickItem(uid, treasureId, session.areaId, function(err,success){
			logger.debug(uid + ' picked up treasure to logic ' + treasureId + "result:" + success);
			var result = {route: req.route, code: 200, uid: uid, treasureId: treasureId};
			if (err){
				session.response({route: req.route, code:500});
			}else{
				session.response(result);
				areaService.pushMessage(session.areaId, result);
				updateRankList();
			}
      utils.invokeCallback(next);
  });
};

handler.getTreasures = function(req, session, next){
  var result = treasureService.getAllTreasureInfo(req.areaId);
  session.response({route: req.route, code: 200, result: result});
  utils.invokeCallback(next);
};

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
function updateRankList() {
	rankService.getTopN(ServerConstant.top,function(err,data){
	  if(err){
	   logger.error('updateRankList failed!');
	  }
	  var msg={'route':'area.onRankListChange','rankList':data};
	  areaService.pushMessageToAll(msg);
	  logger.info('pickItem,updateRankList success!!');
	});
}

