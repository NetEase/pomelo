var manager = module.exports;

var context = require('./context');

var handlers = [];

manager.execHandler = function(msg, cb){
	var handler = getHandler(msg);
	var session ={params: msg.params};
	handler[msg.method](session, cb);
}

//从路径解析出Handler
var getHandler = function(msg) {
	var appPath = context.getAppPath();
    var handler = require(appPath + '/' + msg.serverType + '/handler/' + msg.handler); 
    return handler;
}
