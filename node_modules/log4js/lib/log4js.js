/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/*jsl:option explicit*/

/**
 * @fileoverview log4js is a library to log in JavaScript in similar manner
 * than in log4j for Java. The API should be nearly the same.
 *
 * <h3>Example:</h3>
 * <pre>
 *  var logging = require('log4js');
 *  //add an appender that logs all messages to stdout.
 *  logging.addAppender(logging.consoleAppender());
 *  //add an appender that logs "some-category" to a file
 *  logging.addAppender(logging.fileAppender("file.log"), "some-category");
 *  //get a logger
 *  var log = logging.getLogger("some-category");
 *  log.setLevel(logging.levels.TRACE); //set the Level
 *
 *  ...
 *
 *  //call the log
 *  log.trace("trace me" );
 * </pre>
 *
 * NOTE: the authors below are the original browser-based log4js authors
 * don't try to contact them about bugs in this version :)
 * @version 1.0
 * @author Stephan Strittmatter - http://jroller.com/page/stritti
 * @author Seth Chisamore - http://www.chisamore.com
 * @since 2005-05-20
 * @static
 * Website: http://log4js.berlios.de
 */
var events = require('events')
, fs = require('fs')
, path = require('path')
, util = require('util')
, layouts = require('./layouts')
, levels = require('./levels')
, consoleAppender = require('./appenders/console').appender
, DEFAULT_CATEGORY = '[default]'
, ALL_CATEGORIES = '[all]'
, appenders = {}
, loggers = {}
, appenderMakers = {};

/**
 * Get a logger instance. Instance is cached on categoryName level.
 * @param  {String} categoryName name of category to log to.
 * @return {Logger} instance of logger for the category
 * @static
 */
function getLogger (categoryName) {

    // Use default logger if categoryName is not specified or invalid
    if (!(typeof categoryName == "string")) {
        categoryName = DEFAULT_CATEGORY;
    }

    var appenderList;
    if (!loggers[categoryName]) {
        // Create the logger for this name if it doesn't already exist
        loggers[categoryName] = new Logger(categoryName);
        if (appenders[categoryName]) {
            appenderList = appenders[categoryName];
            appenderList.forEach(function(appender) {
                loggers[categoryName].addListener("log", appender);
            });
        }
        if (appenders[ALL_CATEGORIES]) {
            appenderList = appenders[ALL_CATEGORIES];
            appenderList.forEach(function(appender) {
                loggers[categoryName].addListener("log", appender);
            });
        }
    }

    return loggers[categoryName];
}

/**
 * args are appender, then zero or more categories
 */
function addAppender () {
    var args = Array.prototype.slice.call(arguments);
    var appender = args.shift();
    if (args.length == 0 || args[0] === undefined) {
        args = [ ALL_CATEGORIES ];
    }
    //argument may already be an array
    if (Array.isArray(args[0])) {
        args = args[0];
    }

    args.forEach(function(category) {
        if (!appenders[category]) {
            appenders[category] = [];
        }
        appenders[category].push(appender);

        if (category === ALL_CATEGORIES) {
            for (var logger in loggers) {
                if (loggers.hasOwnProperty(logger)) {
                    loggers[logger].addListener("log", appender);
                }
            }
        } else if (loggers[category]) {
            loggers[category].addListener("log", appender);
        }
    });
}

function clearAppenders () {
    appenders = {};
    for (var logger in loggers) {
        if (loggers.hasOwnProperty(logger)) {
            loggers[logger].removeAllListeners("log");
        }
    }
}

function configureAppenders(appenderList) {
    clearAppenders();
    if (appenderList) {
        appenderList.forEach(function(appenderConfig) {
            loadAppender(appenderConfig.type);
            var appender;
            appenderConfig.makers = appenderMakers;
            appender = appenderMakers[appenderConfig.type](appenderConfig);
            if (appender) {
                addAppender(appender, appenderConfig.category);
            } else {
                throw new Error("log4js configuration problem for "+util.inspect(appenderConfig));
            }
        });
    } else {
        addAppender(consoleAppender());
    }
}

function configureLevels(levels) {
    if (levels) {
        for (var category in levels) {
            if (levels.hasOwnProperty(category)) {
                getLogger(category).setLevel(levels[category]);
            }
        }
    } else {
        for (l in loggers) {
            if (loggers.hasOwnProperty(l)) {
                loggers[l].setLevel();
            }
        }
    }
}

/**
 * Models a logging event.
 * @constructor
 * @param {String} categoryName name of category
 * @param {Log4js.Level} level level of message
 * @param {Array} data objects to log
 * @param {Log4js.Logger} logger the associated logger
 * @author Seth Chisamore
 */
function LoggingEvent (categoryName, level, data, logger) {
    this.startTime = new Date();
    this.categoryName = categoryName;
    this.data = data;
    this.level = level;
    this.logger = logger;
}

/**
 * Logger to log messages.
 * use {@see Log4js#getLogger(String)} to get an instance.
 * @constructor
 * @param name name of category to log to
 * @author Stephan Strittmatter
 */
function Logger (name, level) {
    this.category = name || DEFAULT_CATEGORY;

    if (! this.level) {
        this.__proto__.level = levels.TRACE;
    }
}
util.inherits(Logger, events.EventEmitter);

Logger.prototype.setLevel = function(level) {
    this.level = levels.toLevel(level, levels.TRACE);
};

Logger.prototype.removeLevel = function() {
    delete this.level;
};

Logger.prototype.log = function() {
    var args = Array.prototype.slice.call(arguments)
  , logLevel = args.shift()
  , loggingEvent = new LoggingEvent(this.category, logLevel, args, this);
    this.emit("log", loggingEvent);
};

Logger.prototype.isLevelEnabled = function(otherLevel) {
    return this.level.isLessThanOrEqualTo(otherLevel);
};

['Trace','Debug','Info','Warn','Error','Fatal'].forEach(
    function(levelString) {
        var level = levels.toLevel(levelString);
        Logger.prototype['is'+levelString+'Enabled'] = function() {
            return this.isLevelEnabled(level);
        };

        Logger.prototype[levelString.toLowerCase()] = function () {
            if (this.isLevelEnabled(level)) {
                var args = Array.prototype.slice.call(arguments);
                args.unshift(level);
                Logger.prototype.log.apply(this, args);
            }
        };
    }
);

function setGlobalLogLevel(level) {
    Logger.prototype.level = levels.toLevel(level, levels.TRACE);
}

/**
 * Get the default logger instance.
 * @return {Logger} instance of default logger
 * @static
 */
function getDefaultLogger () {
    return getLogger(DEFAULT_CATEGORY);
}

function findConfiguration(filename) {
    var path;
    try {
        path = require.resolve(filename || 'log4js.json');
    } catch (e) {
        //file not found. default to the one in the log4js module.
        path = filename || __dirname + '/log4js.json';
    }

    return path;
}

var configState = {};

function loadConfigurationFile(filename) {
    filename = findConfiguration(filename);
    if (filename && (!configState.lastFilename || filename !== configState.lastFilename ||
                     !configState.lastMTime || fs.statSync(filename).mtime !== configState.lastMTime)) {
        configState.lastFilename = filename;
        configState.lastMTime = fs.statSync(filename).mtime;
        return JSON.parse(fs.readFileSync(filename, "utf8"));
    }
    return undefined;
}

function configureOnceOff(config) {
    if (config) {
        try {
            configureAppenders(config.appenders);
            configureLevels(config.levels);

            if (config.doNotReplaceConsole) {
                restoreConsole();
            } else {
                replaceConsole();
            }
        } catch (e) {
            throw new Error("Problem reading log4js config " + util.inspect(config) + ". Error was \"" + e.message + "\" ("+e.stack+")");
        }
    }
}

function reloadConfiguration() {
    var filename = findConfiguration(configState.filename),
    mtime;
    if (!filename) {
        // can't find anything to reload
        return;
    }
    try {
        mtime = fs.statSync(filename).mtime;
    } catch (e) {
        getLogger('log4js').warn('Failed to load configuration file ' + filename);
        return;
    }
    if (configState.lastFilename && configState.lastFilename === filename) {
        if (mtime.getTime() > configState.lastMTime.getTime()) {
            configureOnceOff(loadConfigurationFile(filename));
        }
    } else {
        configureOnceOff(loadConfigurationFile(filename));
    }
}

function initReloadConfiguration(filename, options) {
    if (configState.timerId) {
        clearInterval(configState.timerId);
        delete configState.timerId;
    }
    configState.filename = filename;
    configState.timerId = setInterval(reloadConfiguration, options.reloadSecs*1000);
}

function configure (configurationFileOrObject, options) {
    var config = configurationFileOrObject;
    if (config === undefined || config === null || typeof(config) === 'string') {
        options = options || { };
        if (options.reloadSecs) {
            initReloadConfiguration(config, options);
        }
        configureOnceOff(loadConfigurationFile(config));
    } else {
        options = options || {};
        if (options.reloadSecs) {
            getLogger('log4js').warn('Ignoring configuration reload parameter for "object" configuration.');
        }
        configureOnceOff(config);
    }
}

function replaceConsole(logger) {
    function replaceWith(fn) {
        return function() {
            fn.apply(logger, arguments);
        }
    }
    if (console['_preLog4js_log'] === undefined) {
        logger = logger || getLogger("console");
        ['log','debug','info','warn','error'].forEach(function (item) {
            console['_preLog4js_'+item] = console[item];
            console[item] = replaceWith(item === 'log' ? logger.info : logger[item]);
        });
    }
}

function restoreConsole() {
    if (console['_preLog4js_log']) {
        ['log', 'debug', 'info', 'warn', 'error'].forEach(function (item) {
            console[item] = console['_preLog4js_'+item];
            delete console['_preLog4js_'+item];
        });
    }
}

function loadAppender(appender) {
    var appenderModule = require('./appenders/' + appender);
    module.exports.appenders[appenderModule.name] = appenderModule.appender;
    appenderMakers[appenderModule.name] = appenderModule.configure;
}

module.exports = {
    getLogger: getLogger,
    getDefaultLogger: getDefaultLogger,

    addAppender: addAppender,
    loadAppender: loadAppender,
    clearAppenders: clearAppenders,
    configure: configure,

    replaceConsole: replaceConsole,
    restoreConsole: restoreConsole,

    levels: levels,
    setGlobalLogLevel: setGlobalLogLevel,

    layouts: layouts,
    appenders: {},
    appenderMakers: appenderMakers,
    connectLogger: require('./connect-logger').connectLogger
};

//load the old-style appenders
[ 'console', 'file', 'logLevelFilter' ].forEach(function(appender) {
   loadAppender(appender);
});

//set ourselves up if we can find a default log4js.json
configure(findConfiguration());

//keep the old-style layouts
['basicLayout','messagePassThroughLayout','colouredLayout','coloredLayout'].forEach(function(item) {
    module.exports[item] = layouts[item];
});

//and the old-style appenders
module.exports.consoleAppender = module.exports.appenders.console;
module.exports.fileAppender = module.exports.appenders.file;
module.exports.logLevelFilter = module.exports.appenders.logLevelFilter;
