var utils = require('../../../../lib/util/utils');
var treasure = require('../meta/treasure');
var WGError = require('../meta/WGError');
var logger = require('../../../../lib/util/log/log').getLogger(__filename);
var trConfig = require('../config/treasureConfig');
var rs = require('./rankService');
var serverConstant = require('../config/serverConstant');
var treasureDao = require('../dao/treasureDao');
var areaManager = require('../area/remote/areaManager');

var trservice = module.exports;
var allTreasureInfo = trConfig.TREASURE_DATA;
var allTreasureId = trConfig.TREASURE_IDS;

var lastGenTime = new Date().getTime();
/**
 * 刷新宝物倒计时
 */
var leftTime = serverConstant.treasurePeriod;

trservice.generateTreasures = function (sceneId,cb){
  var mapConfig = areaManager.getArea(sceneId).mapConfig;
  
  //logger.error(mapConfig);
  
	logger.debug("in treasure service:"+sceneId);
	treasureDao.removeTreasures(sceneId,function(err,data){
		var num = trConfig.TREASURE_NUM;
		var tmpLTreasure = {};
		var newIdList = utils.genRandomNum(num, allTreasureId.length);
		for (var i = 0; i < num; i++){
			var posX = Math.floor(Math.random() * mapConfig.width),
				posY = Math.floor(Math.random() * mapConfig.height),
				trId = allTreasureId[newIdList[i]];
			tmpLTreasure[trId] = treasure.create({
			  id: trId,
				imgId: trId,
				name: allTreasureInfo[trId]['name'],
				score: allTreasureInfo[trId]['score'],
				posX: posX,
				posY: posY
			});
		}
		treasureDao.createTreasureList(sceneId,tmpLTreasure,function(err,data){
			logger.debug('createTreasureList ok' + data);
		});
		lastGenTime = new Date().getTime(); 
		logger.debug('lastGenTime ' + lastGenTime +' geneter treasures: ');
		utils.invokeCallback(cb, null, {treasures:tmpLTreasure,leftTime:leftTime});
	});
};

trservice.pickItem = function (userId, treasureId, areaId, cb){
	treasureDao.getTreasure(areaId,treasureId,function(err,data){
		console.log(' pickItem === ' + JSON.stringify(data));
		if(data == undefined){
			var tipInfo = 'Treasure ' + treasureId + ' has been picked up by another player';
			utils.invokeCallback(cb, new WGError({code: -1, msg: tipInfo}),false);
		}	else {
			
			var treasure = data;
			//TODO 位置验证接口
		  rs.updateUserScore(userId, treasure.score, function (err, res){
		    if(err !== null){
		      utils.invokeCallback(cb, new WGError({code: -1, msg: 'Pick up tresure error'}),res);
		    }  else {
		      treasureDao.removeTreasure(areaId,treasure.id,function(err,data){
		    	  logger.debug(userId + ' picked up ' +  'treasure ' + treasureId);
			      utils.invokeCallback(cb, null,res);
		      });
		    }
		  });
		}
	});
};

/**
 * 根据sceneId和treasureId获取treasure信息
 * @param treasureId
 * @param sceneId
 * @param cb
 */
trservice.getTreasureById = function (treasureId, sceneId, cb){
  treasureDao.getTreasure(sceneId,treasureId,cb);
};

/**
 * 获取场景id为sceneId内的所有宝物信息
 * @param sceneId
 * @param cb
 */
trservice.getAllTreasureInfo = function (sceneId, cb){
  treasureDao.getTreasures(sceneId, cb);
};

/**
 * 用户初始登录时得到宝物的剩余时间
 */
trservice.getLeftTime = function(uid,cb){
	var nowTime = new Date().getTime();
	var userLeftTime = lastGenTime - nowTime + leftTime;
	logger.debug('getLeftTime lastGenTime ' + lastGenTime + ' nowTime '+ nowTime +' userLeftTime ' + userLeftTime);
	utils.invokeCallback(cb, null, {uid:uid,leftTime:userLeftTime});
};