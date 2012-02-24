var log4js = require('../log4js');
var layouts = require('../layouts');
var net = require('net');
var util = require('util');

var LogServer = function createLogServer(config) {
  var actualAppender = config.actualAppender;
  var server = net.createServer(function serverCreated(clientSocket) {
    clientSocket.on('connect', function clientConnected() {
      var logMessage = '';
      clientSocket.on('data', function chunkReceived(chunk) {
        logMessage += chunk;
      });
      clientSocket.on('end', function gotChunks() {
        try {
          var loggingEvent = JSON.parse(logMessage);
          deserializeLoggingEvent(loggingEvent);
          actualAppender(loggingEvent);
        } catch (e) {
          // JSON.parse failed, just log the contents probably a naughty.
          actualAppender(createLoggingEvent('ERROR', 'Unable to parse log: ' + logMessage));
        }
      });
    });
  });
  server.listen(config.loggerPort || 5000, config.loggerHost || 'localhost');
}

function createLoggingEvent(level, message) {
  return {
    startTime: new Date(),
    categoryName: 'log4js',
    level: { toString: function () {
      return level;
    }},
    data: [ message ]
  };
}

function deserializeLoggingEvent(loggingEvent) {
  loggingEvent.startTime = new Date(loggingEvent.startTime);
  loggingEvent.level.toString = function levelToString() {
    return loggingEvent.level.levelStr;
  };
}

function workerAppender(config) {
  return function log(loggingEvent) {
    var socket = net.createConnection(config.loggerPort || 5000, config.loggerHost || 'localhost');
    socket.on('connect', function socketConnected() {
      socket.end(JSON.stringify(loggingEvent), 'utf8');
    });
  };
}

function createAppender(config) {
  if (config.mode === 'master') {
    var server = new LogServer(config);
    return config.actualAppender;
  } else {
    return workerAppender(config);
  }
}

function configure(config) {
  var actualAppender;
  if (config.appender && config.mode === 'master') {
    log4js.loadAppender(config.appender.type);
    actualAppender = log4js.appenderMakers[config.appender.type](config.appender);
    config.actualAppender = actualAppender;
  }
  return createAppender(config);
}

exports.name = 'multiprocess';
exports.appender = createAppender;
exports.configure = configure;
