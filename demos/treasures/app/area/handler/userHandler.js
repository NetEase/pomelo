var handler = module.exports;

var sceneDao = require('../../dao/sceneDao');
var userService = require('../../service/userService');
var logger = require('../../../../../lib/pomelo').log.getLogger(__filename);
var eventUtils = require('../../../../../lib/util/event/eventUtils');
var Event= require('../../../../../lib/util/event/event');
var Move= require('../../meta/move');
 

var initX = 100;
var initY = 100;
var sceneId = 0;
      
/**
 * 用户退出场景
 * 
 * @param uid
 * @param cb
 */
handler.removeUser = function(msg, session) {
    var uid = msg.params.uid;
    logger.debug('user logout :'+uid);
    sceneDao.removeOnline(this.name,uid);
    //delete this.uidList[uid];
    session.response({route: msg.route, code: 200})
};

/**
 * 用户加入uidList
 *  
 * @param uid
 * @param cb
 */
handler.addUser = function(msg, session) {
  var uid = session.uid;
	logger.debug('user login :'+uid+","+this.name);
	userService.getUserById(uid,function(err, data){
		sceneDao.addUser(sceneId, uid, data.roleId, data.name, {x: initX,y: initY}, function(err) {
			if(!!err) {
				session.response({route: msg.route, code: 500});
			} else {
				session.response({route: msg.route, code: 200});
			}
		});
	});
};

/**
 * 用户移动
 * 1、删除原来的寻路数据
 * 2、新增新的寻路数据
 * @param move
 */
//handler.addMove = function(move) {
//	delete this.moveMap[move.uid];
//	this.moveMap[move.uid] = move;
//},
        
/**
 * 用户移动
 * 日前可以算出时间推给事件服务器
 * 是否需要通过逻辑服务器验证
 * 
 * @param msg
 */
handler.move = function (msg, session){
    var params = msg.params;
	var uid = params.uid;
	var startx = params.path[0].x;
	var starty = params.path[0].y;
	var path = params.path;
	var speed = params.speed;
	var time = params.time;
	logger.debug('in scene server move:');
	logger.debug(uid+","+startx+","+starty+","+speed+","+path);
	//先结束上次的移动
	eventUtils.stopEvent("areaId:0;moveCalc:"+uid,function(err,data){
		logger.debug("in move cb:");
		logger.debug(data);
		//更新用户的位置信息数据
		sceneDao.setUserPos(0, uid, {x: path[1].x, y: path[1].y});
		var period = 100; //算出时间？TODO
		var move = Move.create({uid: uid, startx: startx, starty: starty, speed: speed,path: path, time: time, startTime: (new Date()).getTime()});
		var event = Event.create({period: period, loop: false, method: handler.moveCalc, params: move, host: handler.host, hash: "areaId:0;moveCalc:"+move.uid});
		eventUtils.startEvent(event);
    console.log('[move]  msg: ' + JSON.stringify(msg));
		session.response({route: msg.route, body: move, code: 200});
	});
};

handler.moveCalc = function(move){
  logger.debug('invoke move:');
  var startx = move.startx;
  var starty = move.starty;
  var target = move.path[1];
  var time = move.time;
  logger.debug(startx+","+starty+","+time+","+target.x+","+target.y);
  channelClient.publishStateByExcept([move.uid],{uid: move.uid, path: [{x: startx, y: starty},{x: target.x, y: target.y}], time: time},clientConstant.USER_MOVE);
};

/**
 * 获取所有在线用户
 */
handler.getOnlineUsers = function(msg, session){
  sceneDao.getOnlineUsers(0, function(err, result){
    console.log("users :" + JSON.stringify(result));
    if (err){
      session.response({route: msg.route, code:500});
    }
    else{
      session.response({route: msg.route, code: 200, result: result});
    }
  })
}
