var manager = module.exports;

var pomelo = require('./pomelo');
var logger = require('./util/log/log').getLogger(__filename);
var utils = require('./util/utils');
var msgUtils = require('./util/msg/msgUtils');

var handlers = [];

manager.handle = function(msg, session, fn){
	var type = msgUtils.checkServerType(msg);
	if(!type) {
		utils.invokeCallback(fn, new Error('meet unknown type message %j', msg));
		return;
	}
	
	var app = pomelo.getApplication();
	
	if(app.serverType === 'all' || app.serverType === type) {
		var handler = getHandler(msg);
		if(!handler) {
			logger.error('[handleManager]: fail to find handler for ' + msg.route);
			utils.invokeCallback(fn, new Error('fail to find handler for ' + msg.route));
			return;
		}
		
	  var params = msg.params;
	  handler.method.call(handler.service, msg, session, fn);   // use 代理
	  return;
	}
	
	//should route to other servers
	var proxy = app.get('proxyMap');
	try {
		proxy.sys[type].msgService.forwardMessage(session.uid, msg, session.exportSession(), function(err, resp) {
			if(!!err) {
				logger.error('[handlerManager] fail to process remote message:' + JSON.stringify(err));
				session.response({route: msg.route, code: 500});
				return;
			}
			session.response(resp);
		});
	} catch(err) {
		logger.error('[handlerManager] fail to forward message:' + err.stack);
		session.response({route: msg.route, code: 500});
	}
};

//从路径解析出Handler
var getHandler = function(msg) {
  var app = pomelo.getApplication();
  var handlerMap = app.get('handlerMap');
  console.log('[handlerManager.getHandler] handlerMap: ' + JSON.stringify(handlerMap));
  return getHandlerMethod(msg.route, app.get('handlerMap'));
};

/**
 * pares route string to find the handler method
 * route string: "server-type.service.method"
 */
var getHandlerMethod = function(route, handlerMap) {
	if(!route || !handlerMap) {
		return null;
	}
	
	var ts = route.split('.');
	if(ts.length == 0) {
		return null;
	}
	
	var server = handlerMap[ts[0]];
	if(!server) {
		return null;
	}
	
	var pre = cur = server;
	for(var i=1, l=ts.length; i<l; i++) {
		pre = cur;
		cur = cur[ts[i]];
		if(!cur) {
			return null;
		}
	}
	
	if(typeof cur != 'function') {
		return null;
	}
	
	return {service:pre, method: cur};
}
