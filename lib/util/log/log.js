/*
 * 日志统一调用设置
 * var logger = require('./lib/util/log/log.js').getLogger('ClassName');
 * logger.debug("need something",err.stack);
 *
 */

var log4js = require('log4js');
var util = require('util');

/**
 * 覆盖原来的getLogger，添加文件名功能
 * 原有的log4js不变
 */
var getLogger = function(filename) {
	var logger;
	if(!filename) {
		logger = log4js.getLogger();
	}
	logger = log4js.getLogger(filename.replace(process.cwd(),''));
	return logger;
};

var logConf;

var configure = function(logConfFile){
	log4js.configure(logConfFile);
  logConf = require(logConfFile);
}

var getLogConf = function(){
	return logConf;
}

var getAppenderFile = function(category){
	var appenders = logConf.appenders;
	//console.log('appenders: '+ JSON.stringify(appenders));
	for (var i = 0; i < appenders.length; i++) {
		if (appenders[i].type !== 'file'){
			continue;
		}
		if (appenders[i].category === category){
			return appenders[i].filename;
		}
	};
	throw new Error('[log.getAppenderFile] no appenderFile for category: '+ category);
}


module.exports = {
    getLogger: getLogger,
    getDefaultLogger: log4js.getDefaultLogger,

    addAppender: log4js.addAppender,
    loadAppender: log4js.loadAppender,
    clearAppenders: log4js.clearAppenders,
    configure: configure,

    replaceConsole: log4js.replaceConsole,
    restoreConsole: log4js.restoreConsole,

    levels: log4js.levels,
    setGlobalLogLevel: log4js.setGlobalLogLevel,

    layouts: log4js.layouts,
    appenders: log4js.appenders,
    appenderMakers: log4js.appenderMakers,
    connectLogger: log4js.connectLogger,
    getAppenderFile: getAppenderFile,
    getLogConf: getLogConf
};
