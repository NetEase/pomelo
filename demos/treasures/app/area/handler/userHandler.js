var handler = module.exports;

var sceneDao = require('../../dao/sceneDao');
var userService = require('../../service/userService');
var rankService=require('../../service/rankService');
var ServerConstant=require('../../config/serverConstant');
var logger = require('../../../../../lib/pomelo').log.getLogger(__filename);
var Move= require('../../meta/move');

var app = require('../../../../../lib/pomelo').getApp();
var schedule = require('pomelo-schedule');
var pomelo = require('../../../../../lib/pomelo');
var areaManager = require('../remote/areaManager');
var initX = 100;
var initY = 100;

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
    sceneDao.removeOnline(msg.areaId, uid);
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
  var area = areaManager.getArea(msg.areaId);
	logger.debug('user login :'+uid+","+ msg.areaId);
	userService.getUserById(uid, function(err, data){
		sceneDao.addUser(data.sceneId, uid, data.roleId, data.name, {x: initX,y: initY}, function(err,uid) {
			if(!!err) {
				session.response({route: msg.route, code: 500});
			} else {
			  area.channel.pushMessage({route:'onUserJoin', user: data});
			  
			  //加入全局channel
        area.addUser(data);
			  logger.debug('[onaddUser] updateRankList');
			  updateRankList(msg.areaId, uid);
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
  var areaId = msg.areaId;
  var params = msg.params;
	var uid = params.uid;
	var startx = params.path[0].x;
	var starty = params.path[0].y;
	var path = params.path;
	var speed = params.speed;
	var time = params.time;
	
	//channel.pushMessage({route: 'onMove', uid: uid, path: path, time: time});
	
	areaManager.getArea(areaId).pushMessageByPath(path, {route: 'onMove', uid: uid, path: path, time: time});
	var move = Move.create({uid: uid, startx: startx, starty: starty, speed: speed,path: path, time: time, startTime: (new Date()).getTime()});

  if(!!moveJob[uid]){
    schedule.cancelJob(moveJob[uid]);
    delete moveJob[move.uid];
  }
  console.error(time);
  moveJob[uid] = schedule.scheduleJob({start:Date.now() + time, count: 1}, handler.moveCalc, {areaId: areaId, uid:uid, path: path});
  
  console.log('[move]  msg: ' + JSON.stringify(msg));
	session.response({route: msg.route, body: move, code: 200});
};

handler.moveCalc = function(data){
  var path = data.path;
  
  logger.debug('invoke move:');
  //更新用户的位置信息数据
  sceneDao.setUserPos(data.areaId, data.uid, {x: path[1].x, y: path[1].y}, function(err){
    if(!!err){
      logger.error('set user position failed! [uid]:' + data.uid);
    }else{
      logger.error('set user position success! [areaId]:' + data.areaId + '[uid]:' + data.uid + " [x]:" + path[1].x + " [y]:" + path[1].y);
    }
  });
  delete moveJob[data.uid];
};

/**
 * 获取所有在线用户
 */
handler.getOnlineUsers = function(msg, session){
  sceneDao.getOnlineUserInfos(msg.areaId, function(err, result){
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
function updateRankList(areaId, uid){
  var area = areaManager.getArea(areaId);
  
	rankService.getTopN(ServerConstant.top,function(err,data){
	  if(err){
	   logger.error('updateRankList failed!');
	  }
	  var msg={'route':'area.onRankListChange','rankList':data,'flag':uid, 'code':200};
	  //session.socket.emit('message',msg);
	  var uids=[];
	  uids.push(uid);
	  area.pushMessageByUids(msg,uids,function(){});
	  logger.info('logining,updateRankList success!');
	});
}

function transferUser(msg, session){
  pomelo.getApp().get('proxyMap').user.area.areaManager.userTransfer(session.uid, function(err) {
    //TODO: logout logic
    //TODO: remember to call session.closed() to finish logout flow finally
    if(!!err){
      session({route:msg.route, code: 500});
    }else{
      session({route:msg.route, code: 200});
    }
  });
}
