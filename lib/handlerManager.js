var manager = module.exports;

var pomelo = require('./pomelo');
var logger = require('./util/log/log').getLogger(__filename);
var utils = require('./util/utils');
var msgUtils = require('./util/msg/msgUtils');

var handlers = [];

/**
 * Handler the request.
 * Process the request directly if the route type matches current server type.
 * Or just forward to the other server if the route type dose not match.
 *
 * @param msg {Object}: client request message.
 * @param session {Object}: session object for current request
 * @param cb {Function}: callback function for the handler has finished.
 */
manager.handle = function(msg, session, cb){
	var type = msgUtils.checkServerType(msg);
	if(!type) {
		utils.invokeCallback(cb, new Error('meet unknown type message %j', msg));
		return;
	}

	var app = pomelo.app;
	if(app.serverType === type) {
		// the request should be processed by current server
		var handler = getHandler(msg);
		if(!handler) {
			logger.error('[handleManager]: fail to find handler for ' + msg.route);
			utils.invokeCallback(cb, new Error('fail to find handler for ' + msg.route));
			return;
		}
    handler.method.call(handler.service, msg, session, fn);
    return;
	}

	//should route to other servers
	try {
		//console.log(proxy);
		app.sysrpc[type].msgRemote.forwardMessage({
			uid: session.uid,
			areaId: session.areaId},
			msg, session.exportSession(), function(err, resp) {
			if(!!err) {
				logger.error('[handlerManager] fail to process remote message:' + err.stack);
        utils.invokeCallback(cb, err);
				return;
			}
      if(resp) {
        session.response(resp);
      }
      utils.invokeCallback(cb);
		});
	} catch(err) {
		logger.error('[handlerManager] fail to forward message:' + err.stack);
    utils.invokeCallback(cb, err);
	}
};

/**
 * Get handler by message.
 *
 * @param msg {Object} client request message
 * @return handler instance if any or null for invalid route
 * get handler by route
 */
var getHandler = function(msg) {
  return getHandlerMethod(msg.route, pomelo.app.get('handlerMap'));
};

/**
 * Parse route string to find the handler method.
 *
 * @param route {String}: route string, format: "serverType.handlerName.method"
 * @param handlerMap {Object}: handler map, key: serverType, value: handler instance
 * @return {service: serviceName, method: methodName}
 */
var getHandlerMethod = function (route, handlerMap) {
	if(!route || !handlerMap) {
		return null;
	}

	var ts = route.split('.');
	if(ts.length === 0) {
		return null;
	}

	var server = handlerMap[ts[0]];
	if(!server) {
		return null;
	}

	var cur = server;
	var pre = server;
	var i = 1;
	for(i=1; i<ts.length; i++) {
		pre = cur;
		cur = cur[ts[i]];
		if(!cur) {
			return null;
		}
	}

	if(typeof cur !== 'function') {
		return null;
	}
	return {service:pre, method: cur};
};
