var handler = module.exports;

var treasureService = require('../../service/treasureService');

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
        	session.response(err);
        }
        else{
        	session.response(null, {result: result});
        }
		//utils.invokeCallback(cb, null, result);
	});
};

/**
 * 生成新的宝物配置
 * 宝物位置可能重叠，未区分位置
 */
handler.generateTreasures = function(msg, session){
    var params = msg.params;
    var sceneId = 0;
	logger.debug('generateTreasures event info'+sceneId);
	treasureService.generateTreasures(sceneId,function(err,data){
        var msg={'type':clientConstant.CREATE_TREASURE, 'code':200 ,'body':data};
		channelClient.publishState(msg);
        if (err){
        	session.response(err);
        }
        else{
        	session.response(null, {data: data});
        }
	});
};
/**
 * 用户移动
 * 日前可以算出时间推给事件服务器
 * 
 * @param move
 */
//handler.moveCalc = function(move){
//  logger.debug('invoke move:');
//  var startx = move.startx;
//  var starty = move.starty;
//  var target = move.path[1];
//  var time = move.time;
//  logger.debug(startx+","+starty+","+time+","+target.x+","+target.y);
//  channelClient.publishStateByExcept([move.uid],{uid: move.uid, path: [{x: startx, y: starty},{x: target.x, y: target.y}], time: time},clientConstant.USER_MOVE);
//};
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
