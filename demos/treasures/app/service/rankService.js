var utils = require('../../util/Utils');
var dbclient = require('../../dao/mysql/mysql');
var WGError = require('../../meta/WGError');
var comConst = require('../../common/Constant');

var rankService = module.exports;

rankService.updateUserScore = function (userId, score, cb){
	var scoreInt = parseInt(score) || 0;
	if (scoreInt<=0){
		utils.invokeCallback(cb, null, false);
		return ;
	}
  var sql = 'update Hero set score = score + ? where id = ?';
  var args = [scoreInt, userId];
  dbclient.update(sql, args, function(err, res){
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
  dbclient.query(sql, args, function(err, res){
    if(err !== null){
      utils.invokeCallback(cb, new WGError(comConst.RES_CODE.ERR_FAIL, err.message), null);
    }
    else {
      utils.invokeCallback(cb, null, res);
    }
  });
};