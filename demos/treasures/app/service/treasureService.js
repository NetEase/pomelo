var utils = require('../../../../lib/util/utils');
var treasure = require('../meta/treasure');
var WGError = require('../meta/WGError');
var logger = require('../../../../lib/util/log/log').getLogger(__filename);
var trConfig = require('../config/treasureConfig');
var rs = require('./rankService');
var serverConstant = require('../config/serverConstant');
var treasureDao = require('../dao/treasureDao');
var pomelo = require('../../../../lib/pomelo');
var areaService = require('./areaService');

var trservice = module.exports;
var allTreasureInfo = trConfig.TREASURE_DATA;
var allTreasureId = trConfig.TREASURE_IDS;

var lastGenTime = new Date().getTime();
/**
 * 刷新宝物倒计时
 */
var leftTime = serverConstant.treasurePeriod;

trservice.generateTreasures = function (params, cb){
  var areaId = params.areaId;
  var times = params.times;
  var multi = params.multi;
  
  var mapConfig = areaService.getMapConfig(areaId);

	treasureDao.removeTreasures(areaId);
	var num = trConfig.TREASURE_NUM;
	var tmpLTreasure = {};
	var newIdList = utils.genRandomNum(num, allTreasureId.length);
      
	for(var i = 0; i < num; i++){
	  //控制宝物生成的倍数
	  for(var j = 0; j < times; j++){
	    //宝物不会出现在地图边缘
	    var posX = Math.floor(Math.random() * (mapConfig.width-200)) +100;
			var	posY = Math.floor(Math.random() * (mapConfig.height-200)) +100;
			var	trId = allTreasureId[newIdList[i]];
			//var newTrId = trId + 
			tmpLTreasure[trId*(j+1)] = treasure.create({
			  id: trId*(j+1),
				imgId: trId,
				name: allTreasureInfo[trId]['name'],
				score: allTreasureInfo[trId]['score'] * multi,
				posX: posX,
				posY: posY
			});
		}
	}
	
	treasureDao.createTreasureList(areaId,tmpLTreasure);
	lastGenTime = new Date().getTime();
	//logger.debug('lastGenTime ' + lastGenTime +' geneter treasures: ');
	utils.invokeCallback(cb, null, {treasures:tmpLTreasure,leftTime:leftTime});
};

trservice.pickItem = function (userId, treasureId, areaId, cb){
	var data = treasureDao.getTreasure(areaId,treasureId)
	console.log(' pickItem === ' + JSON.stringify(data));
	if(!data){
		var tipInfo = 'Treasure ' + treasureId + ' has been picked up by another player';
		utils.invokeCallback(cb, new WGError({code: -1, msg: tipInfo}),false);
	}	else {

		var treasure = data;
		//TODO 位置验证接口
	  rs.updateUserScore(userId, treasure.score, function (err, res){
	    if(err !== null){
	      utils.invokeCallback(cb, new WGError({code: -1, msg: 'Pick up tresure error'}),res);
	    }  else {
	      treasureDao.removeTreasure(areaId,treasure.id);
    	  logger.debug(userId + ' picked up ' +  'treasure ' + treasureId);
	      utils.invokeCallback(cb, null,res);
	    }
	  });
	}
};

/**
 * 根据sceneId和treasureId获取treasure信息
 * @param treasureId
 * @param sceneId
 * @param cb
 */
trservice.getTreasureById = function (treasureId, sceneId){
  return treasureDao.getTreasure(sceneId,treasureId);
};

/**
 * 获取场景id为sceneId内的所有宝物信息
 * @param sceneId
 * @param cb
 */
trservice.getAllTreasureInfo = function (sceneId){
  return treasureDao.getTreasures(sceneId);
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
