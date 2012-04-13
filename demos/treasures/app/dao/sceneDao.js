/**
 * 场景服务的dao
 */
//var redis = require('./redis/redisClient').redis;

var logger = require('../../../../lib/util/log/log').getLogger(__filename);
var utils = require('../../../../lib/util/utils'); 
var redis = require('./sync').redis;

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
sceneDao.addUser = function(scene, uid, roleId, name, position,cb){
	redis.get(uidKey(scene,uid),function(err, data){
		//logger.debug(data);
		logger.debug('===== begin add user:'+scene+","+uid);
		if(!!data && !!data.uid && !!data.roleId && !!data.name){
		  //logger.debug('===== add user:'+scene+","+uid);
		  redis.sadd(usersOnlineKey(scene), data);
		}else{	
		  //var multi = redis.multi();
		  //logger.debug('===== update add user:'+scene+","+uid);
		  //redis.set(usersOnlineKey(scene), uid);
		  var user = {uid:uid,x:position.x,"y":position.y,"roleId":roleId, "name":name};
		  redis.set(uidKey(scene,uid),user);
		  redis.sadd(usersKey(scene), user);
		  redis.sadd(usersOnlineKey(scene), user);
		  //redis.hmset(uidKey(scene, uid),"x",''+position.x,"y",''+position.y, "uid", ''+uid, "roleId", ''+roleId, "name", name);
		  //multi.exec(cb);
		}
		utils.invokeCallback(cb,null,uid);
	});
};

sceneDao.getUser = function(areaId, uid, cb){
  redis.get(uidKey(scene,uid),function(err, data){
    if(!!data && !!data.uid && !!data.roleId && !!data.name && !err){
      utils.invokeCallback(cb,null,data);
    }else{
      err = !!err?err:"User not exist";
      utils.invokeCallback(cb,err);
    }
  });
}

/**
 * 删除场景的在线信息，但是不善出场景内的用户数据，因为用户仍然属于该场景
 * 
 * @param scene
 * @param uid
 * @param cb
 */
sceneDao.removeOnline = function(scene, uid, cb){
  redis.del(usersOnlineKey(scene), uid, cb);
};
/**
 * 删除场景内的某个用户
 * 
 * @param scene
 * @param uid
 */
sceneDao.removeUser = function(scene, uid, cb){
	redis.del(usersOnlineKey(scene),uid);
	redis.del(usersKey(scene),uid);
	redis.del(uidKey(scene,uid),cb);
};
/**
 * 获取用户列表
 * 
 * @param scene
 * @param cb 处理返回值的回调
 */
sceneDao.getUsers = function(scene,cb){
  redis.get(usersKey(scene),cb);
};

/**
 * 获取在线用户列表
 * 
 * @param scene
 * @param cb
 */
sceneDao.getOnlineUsers = function(areaId, cb){
  redis.get(usersOnlineKey(areaId),cb);
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
			//logger.debug(tmp);
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
	//logger.debug(reslt);
	return reslt;
}

function sortUserInfo(scene, key, cb){
 	redis.get(key, function(err,data){
		console.error('  data' + key + ' ' + JSON.stringify(data));
		//var reslt = getUserInfo(data);
		utils.invokeCallback(cb,null,data);
	});
//	redis.sort(key, "by", "nosort", "get", pattern+'->uid',"get", pattern+"->roleId","get",pattern+'->x','get',pattern+'->y',"get", pattern+"->name", function(err,data){
//		var reslt = getUserInfo(data);
//		utils.invokeCallback(cb,null,reslt);
//	});
}
/**
 * 获取场景内所有用户的信息
 * 
 * @param scene
 * @param cb
 */
sceneDao.getUserInfos = function(scene, cb){
	//sortUserInfo(scene, usersKey(scene), cb);
	var key = usersKey(scene);
	redis.get(key, function(err,data){
		console.error(' getUserInfos data' + data);
		//var reslt = getUserInfo(data);
		utils.invokeCallback(cb,null,data);
	});
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
 * 设置用户的场景
 * @param scene
 * @param uid
 * @param pos
 * @param cb
 */
sceneDao.setUserArea = function(oldAreaId, uid, areaId, cb){
  redis.get(uidKey(oldAreaId,uid),function(error,user){
    if (!!user) {
      user.areaId = areaId;
      redis.del(usersOnlineKey(oldAreaId),uid);
      redis.del(usersKey(oldAreaId),uid);
      redis.del(uidKey(oldAreaId,uid));
      redis.set(uidKey(areaId,uid),user, cb);
    }else{
      utils.invokeCallback(cb, "User not eaist");
    }
  });
};

/**
 * 设置用户的位置
 * @param scene
 * @param uid
 * @param pos
 * @param cb
 */
sceneDao.setUserPos = function(scene, uid, pos, cb){
	redis.get(uidKey(scene,uid),function(error,user){
		if (!!user) {
			user.x = pos.x;
			user.y = pos.y;
			redis.set(uidKey(scene,uid),user, cb);
		}
	});
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