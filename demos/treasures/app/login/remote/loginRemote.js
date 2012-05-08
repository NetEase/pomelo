var exp = module.exports;

/**
 * Login service
 */
var utils = require('../../../../../lib/util/utils');
var logger = require('../../../../../lib/util/log/log').getLogger(__filename);
var userService = require('../../service/userService');

exp.checkPassport = function (username, pwd, cb){
  logger.info('[checkPassport] username:'+ username);
  
  if(!!username && !!pwd){
    userService.getUserInfo(username, pwd, function(err, data){
  		if(!!err){
  			logger.error('[checkPassport] fail to get userinfo, ' + err.stack);
  			utils.invokeCallback(cb, err);
  		}else{
  			logger.debug('[checkPassport] get userInfo:' + JSON.stringify(data));
  			utils.invokeCallback(cb, null, data);
  		}
    });
  }else{
  	utils.invokeCallback(new Error('uesrname or pwd should not be empty.'));
  }
};

exp.register = function(req, cb){
  var username = req.username;
  var name = req.name;
  var pwd = req.password;
  var roleId = req.roleId;
  
  logger.debug('[register] ', {'username':username,'password':pwd, 'roleId':roleId});
  
  if(!!username && !!name && !!roleId){
    userService.register(username, name, roleId, function(err, data){
			if(!!err){
				logger.error('[register] fail to register userinfo, ' + JSON.stringify(err));
  			utils.invokeCallback(cb, err);
			}else{
        logger.debug('[register] register successfully, ' + JSON.stringify(data));
        utils.invokeCallback(cb, null, data);
			}
    });
  } else{
  	utils.invokeCallback(cb, new Error('invalid arguments'));
  }
};