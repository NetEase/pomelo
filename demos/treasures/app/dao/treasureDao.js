/**
 * 宝贝的dao
 */
//var redis = require('../dao/redis/redisClient').redis;
var logger = require('../../../../lib/util/log/log').getLogger(__filename);
var utils = require('../../../../lib/util/utils'); 
var trConfig = require('../config/treasureConfig');
var Treasure = require('../meta/treasure');
var WGError = require('../meta/WGError');

var redis = require('./sync').redis;

var treasureDao = module.exports;

function treasuresKey(scene){
	return scene+"_treasures";
}

function tidKey(scene, tid){
	return scene+"_t_"+tid;
}

function tidKeyPattern(scene){
	return scene+"_t_*->";
}
/**
 * 创建场景内的宝贝
 * 
 * @param sceneId
 * @param treasure
 * @param cb
 */
treasureDao.createTreasure = function(sceneId, treasure, cb){
  logger.debug("in treasure dao: create");
  //logger.debug(treasure);
  //var multi = redis.multi();
  redis.set(treasuresKey(sceneId),treasure.id);
  redis.hmset(tidKey(sceneId,treasure.id),"id",treasure.id,"imgId",treasure.imgId,"name",treasure.name,"score",treasure.score+"","posX",treasure.posX+"","posY",treasure.posY+"");
  utils.invokeCallback(cb,null,null);
  //multi.exec(cb);
};

treasureDao.createTreasureList = function(sceneId, treasures, cb){
	logger.debug("in treasure dao: create list");
	//logger.debug(treasures);
	//var multi = redis.multi();
	var tsKey = treasuresKey(sceneId);
	redis.set(tsKey,treasures);
	for(var t in treasures){
		var treasure = treasures[t];
		redis.set(tidKey(sceneId,treasure.id),treasure);
	}
	utils.invokeCallback(cb,null,treasures);
	//multi.exec(cb);
};
/**
 * 获取某个宝贝的具体信息
 * 
 * @param sceneId
 * @param tid
 * @param cb
 */
treasureDao.getTreasure = function(sceneId, tid, cb){
  redis.get(tidKey(sceneId,tid),cb);
};

function getTreasureInfo(data){
	var reslt = [];
	var tmp = null;
	for(var i in data){
		var t = i % 6;
		if (t == 0){
			//logger.debug(tmp);
			tmp = {};
			tmp.id = data[i];
		}else {if(t == 1){
			tmp.imgId = data[i];
		}else {if(t == 2){
			tmp.name = data[i];
		}else{ if(t == 3) {
			tmp.score = data[i];
		}else{ if(t == 4) {
			tmp.posX = data[i];
		}else{ if(t == 5) {
			tmp.posY = data[i];
			reslt.push(tmp);
		}}}}}};
	}
	//logger.debug(reslt);
	return reslt;
};
/**
 * 获取场景内的全部宝贝
 * 
 * @param sceneId
 * @param cb
 */
treasureDao.getTreasures = function(sceneId, cb){
	logger.debug("in treasure dao: get treasures sceneId:" + sceneId + ' ' + treasuresKey(sceneId));
	var pattern = tidKeyPattern(sceneId);
	redis.get(treasuresKey(sceneId),function(err,data){
		//logger.debug(data);
		//var reslt = getTreasureInfo(data);
		utils.invokeCallback(cb,null,data);
	});
};
/**
 * 删除某个宝贝的数据
 * 
 * @param sceneId
 * @param tid
 * @param cb
 */
treasureDao.removeTreasure = function(sceneId, tid, cb){
  //logger.debug("in treasure dao: remove treasure");
  //var multi = redis.multi();
  //redis.del(treasuresKey(sceneId),tid);
  redis.del(tidKey(sceneId,tid),cb);
  //multi.exec(cb);
};
/**
 * 删除场景内的所有宝贝
 * 
 * @param sceneId
 * @param cb
 */
treasureDao.removeTreasures = function(sceneId, cb){
	 //logger.debug("in treasure dao: remove all treasure");
	 redis.get(treasuresKey(sceneId),function(err, data){
	   var keys = [];
	   //logger.debug(data);
	   for(var key in data){
		   keys.push(tidKey(sceneId,data[key]));
	   }
	   //logger.debug("keys is:");
	   //logger.debug(keys);
	   redis.del(keys,function(err,data){
		  redis.del(treasuresKey(sceneId),cb); 
	   });
	 });
};