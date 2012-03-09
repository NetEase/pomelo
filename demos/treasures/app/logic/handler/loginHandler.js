var handler = module.exports;

/**
 * Login server
 */
var utils = require('../../../../../lib/util/utils');
var logger = require('../../../../../lib/util/log/log').getLogger(__filename);
var userService = require('../../service/userService');

handler.checkPassport = function (msg, session){
  logger.info('[loginHandler.checkPassport] invoked, msg '+ JSON.stringify(msg));
  var params = msg.params;
  var username = params.username;
  var pwd = params.password;
  
  logger.debug('Start check passport ' + {'username':username,'password':pwd});
  
  if(!!username && !! pwd){
    userService.getUserInfo(username, pwd, function(err, data){
  		if(!!err){
  			session.response({route: msg.route, code: 500});
  		}else{
  			logger.debug('Get userInfo from logic server:' + JSON.stringify(data));
        session.response({route: msg.route, code: 200, userData: data});
  		}
    });
  }else{
  	session.response({route: msg.route, code: 500});
  }
};

handler.register = function(msg, session){
  var params = msg.params;
  var username = params.username;
  var name = params.name;
  var pwd = params.password;
  var roleId = params.roleId;
  
  logger.debug('Start register user ',{'username':username,'password':pwd, 'roleId':roleId});
  
  if(!!username && !!name && !!roleId){
    userService.register(username, name, roleId, function(err, data){
	    logger.debug('[register callback]Register from logic server,  err:'+err+'  data:' + JSON.stringify(data));
			if(!!err){
				session.response({route: msg.route, code: 500});
			}else{
        logger.debug('[register success]Register from logic server' + JSON.stringify(data));
        session.response({route: msg.route, code: 200, userData: data});
			}
    });
  }
  else{
    session.response(new WGError(comConst.RES_CODE.ERR_FAIL, 'User not exist'));
  }
};