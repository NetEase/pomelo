var handler = module.exports;

var sceneDao = require('../../dao/sceneDao');
var userService = require('../../service/userService');
var rankService=require('../../service/rankService');
var ServerConstant=require('../../config/serverConstant');
var logger = require('../../../../../lib/pomelo').log.getLogger(__filename);
var Move= require('../../meta/move');

var app = require('../../../../../lib/pomelo').getApp();
var channelManager = app.get('channelManager');
var channel = channelManager.getChannel('pomelo');
if(!channel)
  channel = channelManager.createChannel('pomelo');
  
var schedule = require('pomelo-schedule');

var initX = 100;
var initY = 100;
var sceneId = 0;
var moveJob = {};
      
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
		sceneDao.addUser(sceneId, uid, data.roleId, data.name, {x: initX,y: initY}, function(err,uid) {
			if(!!err) {
				session.response({route: msg.route, code: 500});
			} else {
			  channel.pushMessage({route:'onUserJoin', user: data});
			  channel.add(uid);
			  logger.debug('[onaddUser] updateRankList');
			  updateRankList(uid);
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
 * 目前可以算出时间推给事件服务器
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
	if(!!moveJob[uid])
		schedule.cancelJob(moveJob[uid]);
	
	//更新用户的位置信息数据
	sceneDao.setUserPos(0, uid, {x: path[1].x, y: path[1].y});
	var period = 100; //算出时间？TODO
	var move = Move.create({uid: uid, startx: startx, starty: starty, speed: speed,path: path, time: time, startTime: (new Date()).getTime()});

	
	schedule.scheduleJob({period: period, count: 1}, handler.moveCalc, {move: move, channel: channel, route:'onMove'});
      console.log('[move]  msg: ' + JSON.stringify(msg));
	session.response({route: msg.route, body: move, code: 200});
};

handler.moveCalc = function(data){
  var move = data.move;
  var channel = data.channel;
  
  logger.debug('invoke move:');
  var startx = move.startx;
  var starty = move.starty;
  var target = move.path[1];
  var time = move.time;
  logger.debug(startx+","+starty+","+time+","+target.x+","+target.y);
  delete moveJob[move.uid];
  channel.pushMessage({route: data.route, uid: move.uid, path: [{x: startx, y: starty},{x: target.x, y: target.y}], time: time});
};

/**
 * 获取所有在线用户
 */
handler.getOnlineUsers = function(msg, session){
  sceneDao.getOnlineUserInfos(0, function(err, result){
    console.log("users :" + JSON.stringify(result));
    if (err){
      session.response({route: msg.route, code:500});
    }
    else{
      session.response({route: msg.route, code: 200, result: result});
    }
  })
}
/**
 * 排名推送
 */
function updateRankList(uid){
	rankService.getTopN(ServerConstant.top,function(err,data){
	  if(err){
	   logger.error('updateRankList failed!');
	  }
	  var msg={'route':'area.onRankListChange','rankList':data,'flag':uid, 'code':200};
	  //session.socket.emit('message',msg);
	  var uids=[];
	  uids.push(uid);
	  channel.pushMessageByUids(msg,uids,function(){});
	  logger.info('logining,updateRankList success!');
	});
}
