var sessionService = require('../../service/sessionService');
var logger = require('../../../util/log/log').getLogger(__filename);

var exp = module.exports;

exp.changeArea = function(msg, cb){
  var uid = msg.uid;
  
  var session = sessionService.getSessionByUid(uid);
  
  if(!!session){
    session['areaId'] = msg.areaId; 
    utils.invokeCallback(cb, null);
  }else{
    utils.invokeCallback(cb, 'Session for ' + uid + ' not Exist!');
  }
};

/**
 * kick a user offline
 *
 * @param uid user id
 */
exp.kick = function(uid, cb) {
	sessionService.kick(uid, cb);
};
