var handler = module.exports;

var userService = require('../../service/userService');
var userRemoteService = require('../remote/userService');
var rankService=require('../../service/rankService');
var areaService = require('../../service/areaService');
var ServerConstant=require('../../config/serverConstant');
var logger = require('../../../../../lib/pomelo').log.getLogger(__filename);
var Move= require('../../meta/move');

var app = require('../../../../../lib/pomelo').getApp();
var schedule = require('pomelo-schedule');
var pomelo = require('../../../../../lib/pomelo');
var initX = 100;
var initY = 100;

var moveJob = {};
      
/**
 * 用户加入uidList
 *  
 * @param uid
 * @param cb
 */
handler.addUser = function(msg, session) {
  var uid = session.uid;
	logger.debug('user login :'+uid+","+ msg.areaId + " serverId:" + app.get('serverId'));
	userService.getUserById(uid, function(err, user){
	  if(!!err || !user && !user.uid && !user.roleId && !user.name){
	    session.response({route: msg.route, code: 500});
	  }else{
	    areaService.addUser(msg.areaId, user);
	    updateRankList(msg.areaId, uid);
	    areaService.pushMessage(msg.areaId, {route:'onUserJoin', user: user});
	    session.response({route: msg.route, code: 200});  
	  }
	});
};
        
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
	
	areaService.pushMessageByPath(areaId, path, {route: 'onMove', uid: uid, path: path, time: time});
	var move = Move.create({uid: uid, startx: startx, starty: starty, speed: speed,path: path, time: time, startTime: (new Date()).getTime()});

  if(!!moveJob[uid]){
    schedule.cancelJob(moveJob[uid]);
    delete moveJob[move.uid];
  }
  logger.debug('user move' + time);
  moveJob[uid] = schedule.scheduleJob({start:Date.now() + time, count: 1}, handler.moveCalc, {areaId: areaId, uid:uid, path: path});
  
	session.response({route: msg.route, body: move, code: 200});
};

handler.moveCalc = function(data){
  var user = areaService.getUser(data.areaId, data.uid);
  if(!user){
    logger.error('set user position failed! [uid]:' + data.uid);
    return;
  }

  var path = data.path;
//   
  //更新用户的位置信息数据
  user.x = path[1].x;
  user.y = path[1].y;

  logger.debug('set user position success! [areaId]:' + data.areaId + '[uid]:' + data.uid + " [x]:" + path[1].x + " [y]:" + path[1].y);
  delete moveJob[data.uid];
};

/**
 * 获取所有在线用户
 */
handler.getOnlineUsers = function(msg, session){
  var users = areaService.getUsers(msg.areaId);
  
  if(!users){
    logger.error('Area not exist! msg: ' + JSON.stringify(msg))
    session.response({route: msg.route, code:500});
    return;
  }
  
  session.response({route: msg.route, code: 200, result: users});
  logger.debug("get online users :" + JSON.stringify(users));
}

/**
 * 排名推送
 */
function updateRankList(areaId, uid){
	rankService.getTopN(ServerConstant.top,function(err,data){
	  if(err){
	   logger.error('updateRankList failed!');
	  }
	  var msg={'route':'area.onRankListChange','rankList':data,'flag':uid, 'code':200};
	  //session.socket.emit('message',msg);
	  var uids=[];
	  uids.push(uid);
	  areaService.pushMessageByUids(areaId, uids, msg);
	  logger.info('logining,updateRankList success!');
	});
}

handler.transferUser = function(msg, session){
  msg.uid = session.uid;
  areaService.transferUser(msg, function(err) {
    //TODO: logout logic
    //TODO: remember to call session.closed() to finish logout flow finally
    if(!!err){
      session.response({route:msg.route, code: 500});
    }else{
      logger.error("transfer user success!!" + JSON.stringify(msg));
      session.response({route:msg.route, code: 200, msg: msg});
    }
  });
}
