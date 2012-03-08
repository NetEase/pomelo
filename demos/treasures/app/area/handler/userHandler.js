var handler = module.exports;

var sceneDao = require('../../dao/sceneDao');
    

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
};
		/**
		 * 用户加入uidList
		 *  
		 * @param uid
		 * @param cb
		 */
handler.addUser = function(msg, session) {
    var uid = msg.params.uid;
	logger.debug('user login :'+uid+","+this.name);
	var sceneId = this.name;
	userService.getUserById(uid,function(err, data){
		sceneDao.addUser(sceneId, uid, data.roleId, data.name, {x: initX,y: initY},cb);
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
	var uid = msg.context.uid;
	var startx = msg.path[0].x;
	var starty = msg.path[0].y;
	var path = msg.path;
	var speed = msg.speed;
	var time = msg.time;
	logger.debug('in scene server move:');
	logger.debug(uid+","+startx+","+starty+","+speed+","+path);
	//先结束上次的移动
	handler.stopEvent(handler.getSceneServer()+":moveCalc:"+uid,function(err,data){
		logger.debug("in move cb:");
		logger.debug(data);
		//更新用户的位置信息数据
		sceneDao.setUserPos(handler.host.id, uid, {x: path[1].x, y: path[1].y});
		var period = 100; //算出时间？TODO
		var move = Move.create({uid: uid, startx: startx, starty: starty, speed: speed,path: path, time: time, startTime: (new Date()).getTime()});
		var event = Event.create({period: period, loop: false, method: "moveCalc", params: move, host: handler.host, hash: handler.getSceneServer()+":moveCalc:"+move.uid});
		addEvent(event);
		session.response(null,{type: msg.type,code: 200});
	});
};
