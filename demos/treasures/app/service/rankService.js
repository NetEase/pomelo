var utils = require('../../../../lib/util/utils');
var WGError = require('../meta/WGError');
var comConst = require('../config/constant');
var pomelo = require('../../../../lib/pomelo');
var rankService = module.exports;

rankService.updateUserScore = function (userId, score, cb){
	var scoreInt = parseInt(score,10) || 0;
	if (scoreInt<=0){
		utils.invokeCallback(cb, null, false);
		return ;
	}
  var sql = 'update Hero set score = score + ? where id = ?';
  var args = [scoreInt, userId];
    pomelo.app.dbclient.update(sql, args, function(err, res){
    if(err !== null){
      utils.invokeCallback(cb, new WGError(comConst.RES_CODE.ERR_FAIL, err.message), false);
    }
    else {
      if(res !== null && res.affectedRows>0){
        utils.invokeCallback(cb, null, true);
      }
      else {
        utils.invokeCallback(cb, new WGError(comConst.RES_CODE.ERR_FAIL, 'User not exist'), false);
      }
    }
  });
};

rankService.getTopN = function (n, cb){
  var sql = 'select id, name, score from Hero order by score desc limit ?';
  var args = [n];
    pomelo.app.dbclient.query(sql, args, function(err, res){
    if(err !== null){
      utils.invokeCallback(cb, new WGError(comConst.RES_CODE.ERR_FAIL, err.message), null);
    }
    else {
      utils.invokeCallback(cb, null, res);
    }
  });
};
