var handler = module.exports;

var treasureService = require('../../service/treasureService');
var logger = require('../../../../../lib/pomelo').log.getLogger(__filename);

/**
 * 生成新的宝物配置
 * 宝物位置可能重叠，未区分位置
 */
handler.generateTreasures = function(msg, session){
    var params = msg.params;
    var sceneId = 0;
	logger.debug('generateTreasures event info'+sceneId);
	treasureService.generateTreasures(sceneId,function(err,data){
        var msg={'type':'onGenerateTreasures', 'code':200 ,'body':data};
//		channelClient.publishState(msg);
        if (err){
        	session.response(err);
        }
        else{
//        	session.response({route: msg.route, code: 200, data: data});
        }
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
