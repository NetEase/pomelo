var manager = module.exports;

var pomelo = require('./pomelo');
var app = pomelo.application;

var handlers = [];

manager.handle = function(session, fn){
	var handler = getHandler(session);  
    handler.call(session, fn);   // use 代理
}

//从路径解析出Handler
var getHandler = function(session) {
    var handlerMap = app.getHandlerMap();
    var handler = handlerMap.get(session.route);
    return handler;
}
