var manager = module.exports;

var pomelo = require('./pomelo');
var logger = require('./util/log/log').getLogger(__filename);

var handlers = [];

manager.handle = function(session, fn){
    //logger.info('[handle session] '+session.route+'  params: '+JSON.stringify(session.params));
	var handler = getHandler(session);  
    var params = session.params;
    console.log('[handleManager]  params: '+ JSON.stringify(params));
    handler.call(this,session, fn);   // use 代理
}

//从路径解析出Handler
var getHandler = function(session) {
    var app = pomelo.getApplication();
    console.log('handleManager app: '+app);
    var handlerMap = app.getHandlerMap();
    var handler = handlerMap[session.route];
    return handler;
}
