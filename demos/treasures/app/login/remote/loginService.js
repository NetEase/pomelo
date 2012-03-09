var exp = module.exports;

/**
 * Login service
 */
var utils = require('../../../../../lib/util/utils');
var logger = require('../../../../../lib/util/log/log').getLogger(__filename);
var userService = require('../../service/userService');

exp.checkPassport = function (username, pwd, cb){
  logger.info('[loginService.checkPassport] username:'+ username);
  
  if(!!username && !!pwd){
    userService.getUserInfo(username, pwd, function(err, data){
  		if(!!err){
  			logger.error('[loginService.checkPassport] fail to get userinfo, ' + err.stack);
  			utils.invokeCallback(err);
  		}else{
  			logger.debug('[loginService.checkPassport] get userInfo:' + JSON.stringify(data));
  			utils.invokeCallback(null, data);
  		}
    });
  }else{
  	utils.invokeCallback(new Error('uesrname or pwd should not be empty.'));
  }
};

exp.register = function(params, cb){
  var username = params.username;
  var name = params.name;
  var pwd = params.password;
  var roleId = params.roleId;
  
  logger.debug('[loginService.register] ', {'username':username,'password':pwd, 'roleId':roleId});
  
  if(!!username && !!name && !!roleId){
    userService.register(username, name, roleId, function(err, data){
			if(!!err){
				logger.error('[loginService.register] fail to register userinfo, ' + err.stack);
  			utils.invokeCallback(err);
			}else{
        logger.debug('[loginService.register] register successfully, ' + JSON.stringify(data));
        session.response({route: msg.route, code: 200, userData: data});
			}
    });
  }
  else{
    session.response(new WGError(comConst.RES_CODE.ERR_FAIL, 'User not exist'));
  }
};