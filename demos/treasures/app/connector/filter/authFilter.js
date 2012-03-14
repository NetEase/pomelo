var logger = require('../../../../../lib/util/log/log').getLogger(__filename);
var utils = require('../../util/utils');

/**
 * FIXME：暂时把登录和选角色都归为一类状态吧。详细的状态应该分为：未登录，登录但未选角色，已选角色
 */
var ignoreTypes = [
	'connector.loginHandler.login', 
	'connector.loginHandler.register'
];

/**
 * 检查请求登录信息的filter
 * 
 * @param msg 客户端发送的请求
 * @param session 会话上下文
 * @param next(err, msg, session) 触发下个filter的回调，将socket, msg, context参数传递下去.如果有错误，则通过err来传递
 */
var handle = function(msg, session, next) {
	if(!checkIgnore(msg.route) && !session.uid) {
		utils.invokeCallback(next, new Error('unlogin session.'));
		return;
	}
	utils.invokeCallback(next, null, msg, session);
};

var checkIgnore = function(type) {
	for(var i=0; i<ignoreTypes.length; i++) {
		if(type === ignoreTypes[i]) {
			return true;
		}
	}
	return false;
};

module.exports.handle = handle;