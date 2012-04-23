var handler = module.exports;
var areaManager = require('../remote/areaManager');
var treasureService = require('../../service/treasureService');
var logger = require('../../../../../lib/pomelo').log.getLogger(__filename);

var pomelo = require('../../../../../lib/pomelo');

/**
 * 生成新的宝物配置
 * 宝物位置可能重叠，未区分位置
 */
handler.generateTreasures = function(params){
  //logger.error('generateTreasures event info'+ JSON.stringify(params));
  var areaId = params.areaId;
	var area = areaManager.getArea(areaId);
	
	logger.error(pomelo.getApp().get('serverType'));
	treasureService.generateTreasures(areaId,function(err,data){
    var msg={"route":"area.treasureHandler.getTreasures","code":200,"result":data.treasures};
    area.channel.pushMessage(msg);
	});
};
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
//  	rankService.getTopN(ServerConstant.top,function(err,data){
// 		var msg={'type':clientConstant.RANK_LIST_REFRESH, 'code':200 ,'body':data};
// 		channelClient.publishState(msg);
//	});
//};
