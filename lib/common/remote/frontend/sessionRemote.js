/**
 * Remote session service for frontend server.
 * Set session info for backend servers.
 */
var exp = module.exports;
var sessionService = require('../../service/sessionService');
var utils = require('../../../util/utils');
var logger = require('../../../util/log/log').getLogger(__filename);


var exp = module.exports;

/**
 * Change area info in session.
 *
 * @param msg {Object} route params that with new area id
 * @param cb {Function} callback function
 */
exp.changeArea = function(msg, cb){
  var uid = msg.uid;
  var session = sessionService.getSessionByUid(uid);
  if(!!session){
    session.set('areaId', msg.target);
    utils.invokeCallback(cb, null);
  }else{
    utils.invokeCallback(cb, 'Session for ' + uid + ' not Exist!');
  }
};

/**
 * Kick a user offline
 *
 * @param uid {String} user id
 * @param cb {Function} callback function
 */
exp.kick = function(uid, cb) {
	sessionService.kick(uid, cb);
};
