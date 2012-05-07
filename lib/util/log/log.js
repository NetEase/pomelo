/*
 * 日志统一调用设置
 * var logger = require('./lib/util/log/log.js').getLogger('ClassName');
 * logger.debug("need something",err.stack);
 *
 */

var log4js = require('log4js');

// must get serverId in the first place before anything is initialized
var serverType = process.argv[3]===undefined?'master':process.argv[3];
var serverId = process.argv[4]===undefined?'master-server-1':process.argv[4];


/**
 * 覆盖原来的getLogger，添加文件名功能
 * 原有的log4js不变
 */
var getLogger = function(filename) {
	if(!filename) {
		 return log4js.getLogger();
	}
	return log4js.getLogger(filename.replace(process.cwd(),''));
};


var logConf;

var configure = function(logConfFile){
	logConf = require(logConfFile);
	var appenders = logConf.appenders;
	var finalAppenders = [];
	var appender;
	for (var i = 0; i < appenders.length; i++) {
		appender = appenders[i];
		if(appenders[i].type === 'file') {
			if (!!appenders[i].serverType && appenders[i].serverType !== serverType){
				//if server type exist but not equal with current server type then ignore it
				continue;
			}
			
			//change the log filename
			appender.filename = appender.filename.replace('[serverId]', serverId);
		}
		finalAppenders.push(appender);
	}
	logConf.appenders = finalAppenders;
	log4js.configure(logConf);
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
