/**
 * 场景服务的dao
 */
var redis = require('../../store/redis/redisClient').redis;
var logger = require('../../util/log/log').getLogger(__filename);
var utils = require('../../util/Utils'); 


var sceneDao = module.exports;

function usersKey(scene){
	return scene+"_users";
}

function usersOnlineKey(scene){
	return scene+"_online_users";
}

function uidKey(scene, uid){
	return scene+"_u_"+uid;
}

function uidKeyPattern(scene){
	return scene+"_u_*";
}
/**
 * 增加一个用户到场景,如果没有数据才初始化数据
 * 
 * @param scene 场景的id或者name
 * @param uid
 * @param position {x:x,y:y}
 */
sceneDao.addUser = function(scene, uid, roleId, name, position, cb){
	redis.hgetall(uidKey(scene,uid),function(err, data){
		logger.debug('add user:'+scene+","+uid);
		logger.debug(data);
		if(!!data && !!data.uid && !!data.roleId && !!data.name){
		  redis.sadd(usersOnlineKey(scene), uid, cb);
		}else{	
		  var multi = redis.multi();
		  multi.sadd(usersOnlineKey(scene), uid);
		  multi.sadd(usersKey(scene), uid);
		  multi.hmset(uidKey(scene, uid),"x",''+position.x,"y",''+position.y, "uid", ''+uid, "roleId", ''+roleId, "name", name);
		  multi.exec(cb);
		}
	});
};

/**
 * 删除场景的在线信息，但是不善出场景内的用户数据，因为用户仍然属于该场景
 * 
 * @param scene
 * @param uid
 * @param cb
 */
sceneDao.removeOnline = function(scene, uid, cb){
  redis.srem(usersOnlineKey(scene), uid, cb);
};
/**
 * 删除场景内的某个用户
 * 
 * @param scene
 * @param uid
 */
sceneDao.removeUser = function(scene, uid, cb){
	var multi = redis.multi();
	multi.srem(usersOnlineKey(scene),uid);
	multi.srem(usersKey(scene),uid);
	multi.del(uidKey(scene,uid));
	multi.exec(cb);
};
/**
 * 获取用户列表
 * 
 * @param scene
 * @param cb 处理返回值的回调
 */
sceneDao.getUsers = function(scene,cb){
  redis.smembers(usersKey(scene),cb);
};

/**
 * 获取在线用户列表
 * 
 * @param scene
 * @param cb
 */
sceneDao.getOnlineUsers = function(scene, cb){
  redis.smembers(usersOnlineKey(scene),cb);
};

/**
 * 获取场景内所有在线用户的信息
 * 
 * @param scene
 * @param cb
 */
sceneDao.getOnlineUserInfos = function(scene, cb){
	sortUserInfo(scene, usersOnlineKey(scene), cb);
};

function getUserInfo(data){
	var reslt = [];
	var tmp = null;
	for(var i in data){
		var t = i % 5;
		if (t == 0){
			logger.debug(tmp);
			tmp = {};
			tmp.uid = data[i];
		}else {if(t == 1){
			tmp.roleId = data[i];
		}else {if(t == 2){
			tmp.x = data[i];
		}else{ if(t == 3) {
			tmp.y = data[i];
		}else{ if(t == 4) {
		    tmp.name = data[i];
		    reslt.push(tmp);
		}
		}
		}}};
	}
	logger.debug(reslt);
	return reslt;
}

function sortUserInfo(scene, key, cb){
	var pattern = uidKeyPattern(scene);
	redis.sort(key, "by", "nosort", "get", pattern+'->uid',"get", pattern+"->roleId","get",pattern+'->x','get',pattern+'->y',"get", pattern+"->name", function(err,data){
		var reslt = getUserInfo(data);
		utils.invokeCallback(cb,null,reslt);
	});
}
/**
 * 获取场景内所有用户的信息
 * 
 * @param scene
 * @param cb
 */
sceneDao.getUserInfos = function(scene, cb){
	sortUserInfo(scene, usersKey(scene), cb);
};
/**
 * 获取用户场景内的详细信息
 * 
 * @param scene
 * @param uid
 * @param cb
 */
sceneDao.getSceneUserInfo = function(scene, uid, cb){
	redis.hgetall(uidKey(scene,uid),cb);
};
/**
 * 设置用户信息
 * 
 * @param scene
 * @param uid
 * @param field
 * @param value
 * @param cb
 */
sceneDao.setUserInfo = function(scene, uid, field, value, cb){
	redis.hset(uidKey(scene,uid),field,value,cb);
};

/**
 * 设置用户的位置
 * @param scene
 * @param uid
 * @param pos
 * @param cb
 */
sceneDao.setUserPos = function(scene, uid, pos, cb){
	redis.hmset(uidKey(scene,uid),"x",''+pos.x,"y",''+pos.y, cb);
};
/**
 * 获取用户场景内的详细信息 TODO test
 * @param scene
 * @param uid
 * @param field 获取某些字段
 * @param cb
 */
sceneDao.getSceneUserInfoDetail = function(scene, uid, field, cb){
	redis.hget(uidKey(scene,uid),field,cb);
};