/**
 * 日志统一调用设置
 * var logger = require('./lib/util/log/log.js').getLogger('ClassName');
 * logger.debug("need something",err.stack);
 * 
 */
var log4js = require('log4js'); 
log4js.configure('./log4js.json');

var logger = module.exports ;
var _path = __dirname.substr(0,__dirname.indexOf("lib"));

//var _log = null;

var Logger = function(_log) {
	this._log = _log;
};

logger.getLogger = function(filename) {
 	var _log = log4js.getLogger(filename.replace(_path,""));
 	return new Logger(_log);
};

/**
 * 支持参数的debug方法,PARAM JSON 格式
 * logger.info("login",{"usrname":'test',"age":44});
 * @param method
 * @param params
 * @returns
 */
Logger.prototype.debug = function(msg,params) {
	this._log.debug(_format(msg,params));
};

/**
 * 支持参数的info方法
 * @param method
 * @param params
 * @returns
 */
Logger.prototype.info = function(msg,params) {
	this._log.info(_format(msg,params));
};

Logger.prototype.error = function(msg, params){
	this._log.error(_format(msg,params));
};

/**
 * 私有的格式化方法
 * WS的拼凑方法
 * @param method
 * @param params
 * @returns {String}
 */
_format = function(method,params){
	var paramStr = "";
  	for(var key in params) {
		paramStr += key + "=" + params[key] + ","
	}
	return method+ ":" + " " + paramStr.substr(0,paramStr.length-1);
}

//var loga = logger.getLogger('a');
//var logb = logger.getLogger('b');
//
//loga.debug('xxxx',{"fds":"fds"});
//logb.debug('yyyy',{"fds":"fds"});
