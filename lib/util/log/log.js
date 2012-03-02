/**
 * 日志统一调用设置
 * var logger = require('./lib/util/log/log.js').getLogger('ClassName');
 * logger.debug("need something",err.stack);
 * 
 */
var log4js = require('log4js'); 
log4js.configure('./config/log4js.json');
module.exports = log4js;

var _path = __dirname.substr(0,__dirname.indexOf("lib"));

//保存原来的getLogger
log4js._getLogger = log4js.getLogger;

/**
 * 覆盖原来的getLogger，添加文件名功能
 */
log4js.getLogger = function(filename) {
	if(!filename) {
		return this._getLogger();
	}
	return this._getLogger(filename.replace(_path,""));
};

module.exports = log4js;
