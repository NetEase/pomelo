var handler = module.exports;

/**
 * Login server
 */

var utils = require('../../../../../lib/util/utils');
var logger = require('../../../../../lib/util/log/log').getLogger(_filename);
var userService = require('../../service/userService');



handler.checkPassport = function (msg, session, cb){
  var params = msg.params;
  var username = params.username;
  var pwd = params.password;
  
  logger.debug('Start check passport ',+{'username':username,'password':pwd});
  
  if(!!username && !! pwd){
    userService.getUserInfo(username, pwd, function(err, data){
    		if(!!err){
    			cb(err);
    		}else{
    	        logger.debug('Get userInfo from logic server:' + JSON.stringify(data));
    	        cb(null, {type: msg.type, body:data, code: 200}, {type: agentCommonConst.LOGINED, userInfo: {username: data.username,uid:data.uid, roleId: data.roleId}});
    		}
    });
  }else{
  	cb({code: -1, msg:'Username of password error!'});
  }
};

handler.register = function(msg, session, cb){
  var params = msg.params;
  var username = params.username;
  var name = params.name;
  var pwd = params.password;
  var roleId = params.roleId;
  
  logger.debug('Start register user ',{'username':username,'password':pwd});
  
  if(!!username && !!name && !!roleId){
    userService.register(username, name, roleId, function(err, data){
    		if(!!err){
    			cb(err);
    		}else{
	        logger.debug('Register from logic server' + JSON.stringify(data));
	        cb(null, {type: msg.type, body: data, code: 200}, {type: agentCommonConst.REGISTERED, uid: data.uid});
    		}
    });
  }else{
  	cb({code: -1, msg:'Username of password error!'});
  }
};