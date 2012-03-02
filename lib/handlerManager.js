var manager = module.exports;

var pomelo = require('./pomelo');
var app = pomelo.application;
var logger = require('./util/log/log').getLogger(__filename);

var handlers = [];

manager.handle = function(session, fn){
	var handler = getHandler(session);  
    logger.info('[handle session] '+session.route+'  params: '+JSON.stringify(session.params));
    handler.call(session, fn);   // use 代理
}

//从路径解析出Handler
var getHandler = function(session) {
    var handlerMap = app.getHandlerMap();
    var handler = handlerMap.get(session.route);
    return handler;
}
