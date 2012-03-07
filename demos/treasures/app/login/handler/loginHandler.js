var handler = module.exports;

/**
 * Login server
 */


var logger = require('../util/log/log').getLogger(__filename);





handler.checkPassport = function (msg, cb){
  var msgBody = msg.body;
  var username = msgBody.username;
  var pwd = msgBody.password;
  
  logger.debug('Start check passport ',+{'username':username,'password':pwd});
  
  if(!!username && !! pwd){
    logicServerClient.getUserInfo(username, pwd, function(err, data){
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

handler.register = function(msg, cb){
  var body = msg.body;
  var username = body.username;
  var name = body.name;
  var pwd = body.password;
  var roleId = body.roleId;
  
  logger.debug('Start register user ',{'username':username,'password':pwd});
  
  if(!!username && !!name && !!roleId){
    logicServerClient.register(username, name, roleId, function(err, data){
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