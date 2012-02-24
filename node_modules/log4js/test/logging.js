var vows = require('vows')
, assert = require('assert')
, sandbox = require('sandboxed-module');

function setupConsoleTest() {
    var fakeConsole = {}
  , logEvents = []
  , log4js;

    ['trace','debug','log','info','warn','error'].forEach(function(fn) {
        fakeConsole[fn] = function() {
            throw new Error("this should not be called.");
        };
    });

    log4js = sandbox.require(
        '../lib/log4js'
      , {
          globals: {
              console: fakeConsole
          }
      }
    );

    log4js.clearAppenders();
    log4js.addAppender(function(evt) {
        logEvents.push(evt);
    });

    return { log4js: log4js, logEvents: logEvents, fakeConsole: fakeConsole };
}

vows.describe('log4js').addBatch({
    'getLogger': {
        topic: function() {
            var log4js = require('../lib/log4js');
            log4js.clearAppenders();
            var logger = log4js.getLogger('tests');
            logger.setLevel("DEBUG");
            return logger;
        },

        'should take a category and return a logger': function(logger) {
            assert.equal(logger.category, 'tests');
            assert.equal(logger.level.toString(), "DEBUG");
            assert.isFunction(logger.debug);
            assert.isFunction(logger.info);
            assert.isFunction(logger.warn);
            assert.isFunction(logger.error);
            assert.isFunction(logger.fatal);
        },

        'log events' : {
            topic: function(logger) {
                var events = [];
                logger.addListener("log", function (logEvent) { events.push(logEvent); });
                logger.debug("Debug event");
                logger.trace("Trace event 1");
                logger.trace("Trace event 2");
                logger.warn("Warning event");
                logger.error("Aargh!", new Error("Pants are on fire!"));
                logger.error("Simulated CouchDB problem", { err: 127, cause: "incendiary underwear" });
                return events;
            },

            'should emit log events': function(events) {
                assert.equal(events[0].level.toString(), 'DEBUG');
                assert.equal(events[0].data[0], 'Debug event');
                assert.instanceOf(events[0].startTime, Date);
            },

            'should not emit events of a lower level': function(events) {
                assert.equal(events.length, 4);
                assert.equal(events[1].level.toString(), 'WARN');
            },

            'should include the error if passed in': function (events) {
                assert.instanceOf(events[2].data[1], Error);
                assert.equal(events[2].data[1].message, 'Pants are on fire!');
            }

        },

    },

    'invalid configuration': {
        'should throw an exception': function() {
            assert.throws(function() {
                log4js.configure({ "type": "invalid" });
            });
        }
    },

    'configuration when passed as object': {
        topic: function() {
            var appenderConfig
          , log4js = sandbox.require(
              '../lib/log4js'
            , { requires:
                { './appenders/file':
                  {
                      name: "file"
                    , appender: function() {}
                    , configure: function(configuration) {
                          appenderConfig = configuration;
                          return function() {};
                      }
                  }
                }
              }
          )
          , config = {
                "appenders": [
                    {
                        "type" : "file",
                        "filename" : "cheesy-wotsits.log",
                        "maxLogSize" : 1024,
                        "backups" : 3,
                        "pollInterval" : 15
                    }
                ]
            };
            log4js.configure(config);
            return appenderConfig;
        },
        'should be passed to appender config': function(configuration) {
            assert.equal(configuration.filename, 'cheesy-wotsits.log');
        }
    },

    'configuration when passed as filename': {
        topic: function() {
            var appenderConfig
          , configFilename
          , log4js = sandbox.require(
                '../lib/log4js'
              , { requires:
                  { 'fs':
                    {
                        statSync: function() {
                            return { mtime: Date.now() };
                        },
                        readFileSync: function(filename) {
                            configFilename = filename;
                            return JSON.stringify({
                                appenders: [
                                    { type: "file"
                                    , filename: "whatever.log"
                                    }
                                ]
                            });
                        },
                        readdirSync: function() {
                            return ['file'];
                        }
                    }
                , './appenders/file':
                    {
                      name: "file"
                    , appender: function() {}
                    , configure: function(configuration) {
                          appenderConfig = configuration;
                          return function() {};
                      }
                    }
                  }
                }
          );
            log4js.configure("/path/to/cheese.json");
            return [ configFilename, appenderConfig ];
        },
        'should read the config from a file': function(args) {
            assert.equal(args[0], '/path/to/cheese.json');
        },
        'should pass config to appender': function(args) {
            assert.equal(args[1].filename, "whatever.log");
        }
    },

    'with no appenders defined' : {
        topic: function() {
            var logger
          , that = this
          , fakeConsoleAppender = {
                name: "console"
              , appender: function() {
                    return function(evt) {
                        that.callback(null, evt);
                    }
                }
              , configure: function() {
                    return fakeConsoleAppender.appender();
                }
          }
          , log4js = sandbox.require(
              '../lib/log4js'
            , {
                requires: {
                    './appenders/console': fakeConsoleAppender
                }
              }
          );
            logger = log4js.getLogger("some-logger");
            logger.debug("This is a test");
        },
        'should default to the console appender': function(evt) {
            assert.equal(evt.data[0], "This is a test");
        }
    },

    'addAppender' : {
        topic: function() {
            var log4js = require('../lib/log4js');
            log4js.clearAppenders();
            return log4js;
        },
        'without a category': {
            'should register the function as a listener for all loggers': function (log4js) {
                var appenderEvent, appender = function(evt) { appenderEvent = evt; }, logger = log4js.getLogger("tests");
                log4js.addAppender(appender);
                logger.debug("This is a test");
                assert.equal(appenderEvent.data[0], "This is a test");
                assert.equal(appenderEvent.categoryName, "tests");
                assert.equal(appenderEvent.level.toString(), "DEBUG");
            },
            'should also register as an appender for loggers if an appender for that category is defined': function (log4js) {
                var otherEvent, appenderEvent, cheeseLogger;
                log4js.addAppender(function (evt) { appenderEvent = evt; });
                log4js.addAppender(function (evt) { otherEvent = evt; }, 'cheese');

                cheeseLogger = log4js.getLogger('cheese');
                cheeseLogger.debug('This is a test');
                assert.deepEqual(appenderEvent, otherEvent);
                assert.equal(otherEvent.data[0], 'This is a test');
                assert.equal(otherEvent.categoryName, 'cheese');

                otherEvent = undefined;
                appenderEvent = undefined;
                log4js.getLogger('pants').debug("this should not be propagated to otherEvent");
                assert.isUndefined(otherEvent);
                assert.equal(appenderEvent.data[0], "this should not be propagated to otherEvent");
            }
        },

        'with a category': {
            'should only register the function as a listener for that category': function(log4js) {
                var appenderEvent, appender = function(evt) { appenderEvent = evt; }, logger = log4js.getLogger("tests");
                log4js.addAppender(appender, 'tests');
                logger.debug('this is a category test');
                assert.equal(appenderEvent.data[0], 'this is a category test');

                appenderEvent = undefined;
                log4js.getLogger('some other category').debug('Cheese');
                assert.isUndefined(appenderEvent);
            }
        },

        'with multiple categories': {
            'should register the function as a listener for all the categories': function(log4js) {
                var appenderEvent, appender = function(evt) { appenderEvent = evt; }, logger = log4js.getLogger('tests');
                log4js.addAppender(appender, 'tests', 'biscuits');

                logger.debug('this is a test');
                assert.equal(appenderEvent.data[0], 'this is a test');
                appenderEvent = undefined;

                var otherLogger = log4js.getLogger('biscuits');
                otherLogger.debug("mmm... garibaldis");
                assert.equal(appenderEvent.data[0], "mmm... garibaldis");

                appenderEvent = undefined;

                log4js.getLogger("something else").debug("pants");
                assert.isUndefined(appenderEvent);
            },
            'should register the function when the list of categories is an array': function(log4js) {
                var appenderEvent, appender = function(evt) { appenderEvent = evt; };
                log4js.addAppender(appender, ['tests', 'pants']);

                log4js.getLogger('tests').debug('this is a test');
                assert.equal(appenderEvent.data[0], 'this is a test');

                appenderEvent = undefined;

                log4js.getLogger('pants').debug("big pants");
                assert.equal(appenderEvent.data[0], "big pants");

                appenderEvent = undefined;

                log4js.getLogger("something else").debug("pants");
                assert.isUndefined(appenderEvent);
            }
        }
    },

    'default setup': {
        topic: function() {
            var pathLoaded,
            logger,
            modulePath = require('path').normalize(__dirname + '/../lib/log4js.json'),
            mtime = Date.now(),
            fakeFS = {
                readdirSync: function(dir) {
                    return require('fs').readdirSync(dir);
                },
                readFileSync: function (file, encoding) {
                    pathLoaded = file;
                    assert.equal(encoding, 'utf8');
                    return '{ "appenders" : [ { "type": "console", "layout": { "type": "messagePassThrough" }} ] }';
                },
                statSync: function (path) {
                    if (path === modulePath) {
                        return { mtime: mtime };
                    } else {
                        throw new Error("no such file");
                    }
                }
            },
            appenderEvents = [],
            fakeConsole = {
                'name': 'console'
              , 'appender': function () {
                    return function(evt) { appenderEvents.push(evt); }
                }
              , 'configure': function (config) {
                    return fakeConsole.appender();
                }
            },
            globalConsole = {
                log: function() { throw new Error("I should not be called."); }
            },
            log4js = sandbox.require(
                '../lib/log4js',
                {
                    requires: {
                        'fs': fakeFS
                      , './appenders/console': fakeConsole
                    },
                    globals: {
                        console: globalConsole
                    }
                }
            );

            logger = log4js.getLogger('a-test');
            logger.debug("this is a test");
            globalConsole.log("this should be logged");
            return [ pathLoaded, appenderEvents, modulePath ];
        },

        'should use require.resolve to find log4js.json': function(args) {
            var pathLoaded = args[0], modulePath = args[2];
            assert.equal(pathLoaded, modulePath);
        },

        'should configure log4js from first log4js.json found': function(args) {
            var appenderEvents = args[1];
            assert.equal(appenderEvents[0].data[0], 'this is a test');
        },

        'should replace console.log with log4js version': function(args) {
            var appenderEvents = args[1];
            assert.equal(appenderEvents[1].data[0], 'this should be logged');
        }
    },

    'console' : {
        topic: setupConsoleTest,

        'when replaceConsole called': {
            topic: function(test) {
                test.log4js.replaceConsole();

                test.fakeConsole.log("Some debug message someone put in a module");
                test.fakeConsole.debug("Some debug");
                test.fakeConsole.error("An error");
                test.fakeConsole.info("some info");
                test.fakeConsole.warn("a warning");

                test.fakeConsole.log("cheese (%s) and biscuits (%s)", "gouda", "garibaldis");
                test.fakeConsole.log({ lumpy: "tapioca" });
                test.fakeConsole.log("count %d", 123);
                test.fakeConsole.log("stringify %j", { lumpy: "tapioca" });

                return test.logEvents;
            },

            'should replace console.log methods with log4js ones': function(logEvents) {
                assert.equal(logEvents.length, 9);
                assert.equal(logEvents[0].data[0], "Some debug message someone put in a module");
                assert.equal(logEvents[0].level.toString(), "INFO");
                assert.equal(logEvents[1].data[0], "Some debug");
                assert.equal(logEvents[1].level.toString(), "DEBUG");
                assert.equal(logEvents[2].data[0], "An error");
                assert.equal(logEvents[2].level.toString(), "ERROR");
                assert.equal(logEvents[3].data[0], "some info");
                assert.equal(logEvents[3].level.toString(), "INFO");
                assert.equal(logEvents[4].data[0], "a warning");
                assert.equal(logEvents[4].level.toString(), "WARN");
                assert.equal(logEvents[5].data[0], "cheese (%s) and biscuits (%s)");
                assert.equal(logEvents[5].data[1], "gouda");
                assert.equal(logEvents[5].data[2], "garibaldis");
            }
        },
        'when turned off': {
            topic: function(test) {
                test.log4js.restoreConsole();
                try {
                    test.fakeConsole.log("This should cause the error described in the setup");
                } catch (e) {
                    return e;
                }
            },
            'should call the original console methods': function (err) {
                assert.instanceOf(err, Error);
                assert.equal(err.message, "this should not be called.");
            }
        },
        'configuration': {
            topic: function(test) {
                test.log4js.replaceConsole();
                test.log4js.configure({ doNotReplaceConsole: true });
                try {
                    test.fakeConsole.log("This should cause the error described in the setup");
                } catch (e) {
                    return e;
                }
            },
            'should allow for turning off console replacement': function (err) {
                assert.instanceOf(err, Error);
                assert.equal(err.message, 'this should not be called.');
            }
        }
    },
    'configuration persistence' : {
        'should maintain appenders between requires': function () {
            var logEvent, firstLog4js = require('../lib/log4js'), secondLog4js;
            firstLog4js.clearAppenders();
            firstLog4js.addAppender(function(evt) { logEvent = evt; });

            secondLog4js = require('../lib/log4js');
            secondLog4js.getLogger().info("This should go to the appender defined in firstLog4js");

            assert.equal(logEvent.data[0], "This should go to the appender defined in firstLog4js");
        }
    },
    'configuration reload with configuration changing' : {
        topic: function() {
            var pathsChecked = [],
            logEvents = [],
            logger,
            modulePath = require('path').normalize(__dirname + '/../lib/log4js.json'),
            fakeFS = {
                lastMtime: Date.now(),
                config: { appenders: [ { type: 'console', layout: { type: 'messagePassThrough' } } ],
                          levels: { 'a-test' : 'INFO' } },
                readdirSync: function(dir) {
                    return require('fs').readdirSync(dir);
                },
                readFileSync: function (file, encoding) {
                    assert.equal(file, modulePath);
                    assert.equal(encoding, 'utf8');
                    return JSON.stringify(fakeFS.config);
                },
                statSync: function (path) {
                    pathsChecked.push(path);
                    if (path === modulePath) {
                        fakeFS.lastMtime += 1;
                        return { mtime: new Date(fakeFS.lastMtime) };
                    } else {
                        throw new Error("no such file");
                    }
                }
            },
            fakeConsole = {
                'name': 'console',
                'appender': function () {
                    return function(evt) { logEvents.push(evt); };
                },
                'configure': function (config) {
                    return fakeConsole.appender();
                }
            },
            setIntervalCallback,
            fakeSetInterval = function(cb, timeout) {
                setIntervalCallback = cb;
            },
            log4js = sandbox.require(
                '../lib/log4js',
                {
                    requires: {
                        'fs': fakeFS,
                        './appenders/console': fakeConsole
                    },
                    globals: {
                        'console': fakeConsole,
                        'setInterval' : fakeSetInterval,
                    }
                }
            );

            log4js.configure(undefined, { reloadSecs: 30 });
            logger = log4js.getLogger('a-test');
            logger.info("info1");
            logger.debug("debug2 - should be ignored");
            delete fakeFS.config.levels;
            setIntervalCallback();
            logger.info("info3");
            logger.debug("debug4");

            return [ pathsChecked, logEvents, modulePath ];
        },
        'should configure log4js from first log4js.json found': function(args) {
            var logEvents = args[1];
            assert.equal(logEvents.length, 3);
            assert.equal(logEvents[0].data[0], 'info1');
            assert.equal(logEvents[1].data[0], 'info3');
            assert.equal(logEvents[2].data[0], 'debug4');
        }
    },

    'configuration reload with configuration staying the same' : {
        topic: function() {
            var pathsChecked = [],
            fileRead = 0,
            logEvents = [],
            logger,
            modulePath = require('path').normalize(__dirname + '/../lib/log4js.json'),
            mtime = new Date(),
            fakeFS = {
                config: { appenders: [ { type: 'console', layout: { type: 'messagePassThrough' } } ],
                          levels: { 'a-test' : 'INFO' } },
                readdirSync: function(dir) {
                    return require('fs').readdirSync(dir);
                },
                readFileSync: function (file, encoding) {
                    fileRead += 1;
                    assert.isString(file);
                    assert.equal(file, modulePath);
                    assert.equal(encoding, 'utf8');
                    return JSON.stringify(fakeFS.config);
                },
                statSync: function (path) {
                    pathsChecked.push(path);
                    if (path === modulePath) {
                        return { mtime: mtime };
                    } else {
                        throw new Error("no such file");
                    }
                }
            },
            fakeConsole = {
                'name': 'console',
                'appender': function () {
                    return function(evt) { logEvents.push(evt); };
                },
                'configure': function (config) {
                    return fakeConsole.appender();
                }
            },
            setIntervalCallback,
            fakeSetInterval = function(cb, timeout) {
                setIntervalCallback = cb;
            },
            log4js = sandbox.require(
                '../lib/log4js',
                {
                    requires: {
                        'fs': fakeFS,
                        './appenders/console': fakeConsole
                    },
                    globals: {
                        'console': fakeConsole,
                        'setInterval' : fakeSetInterval,
                    }
                }
            );

            log4js.configure(modulePath, { reloadSecs: 3 });
            logger = log4js.getLogger('a-test');
            logger.info("info1");
            logger.debug("debug2 - should be ignored");
            setIntervalCallback();
            logger.info("info3");
            logger.debug("debug4");

            return [ pathsChecked, logEvents, modulePath, fileRead ];
        },
        'should only read the configuration file once': function(args) {
            var fileRead = args[3];
            assert.equal(fileRead, 1);
        },
        'should configure log4js from first log4js.json found': function(args) {
            var logEvents = args[1];
            assert.equal(logEvents.length, 2);
            assert.equal(logEvents[0].data[0], 'info1');
            assert.equal(logEvents[1].data[0], 'info3');
        }
    }

}).export(module);
