var handler = module.exports;
var treasureService = require('../../service/treasureService');
var logger = require('../../../../../lib/pomelo').log.getLogger(__filename);
var areaService = require('../../service/areaService');
var pomelo = require('../../../../../lib/pomelo');

/**
 * 生成新的宝物配置
 * 宝物位置可能重叠，未区分位置
 */
handler.generateTreasures = function(req){
	treasureService.generateTreasures(req,function(err,data){
    var res={"route":"area.treasureHandler.getTreasures","code":200,"result":data.treasures};
    areaService.pushMessage(req.areaId, res);
	});
};
/**
 * 用户移动
 * 日前可以算出时间推给事件服务器
 *
 * @param move
 */

