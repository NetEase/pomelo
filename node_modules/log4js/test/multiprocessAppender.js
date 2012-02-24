var vows = require('vows');
var assert = require('assert');
var sandbox = require('sandboxed-module');
var _ = require('underscore');

function fancyResultingMultiprocessAppender(opts) {
  var result = { clientOns: {}, serverOns: {}, logged: [], ended: [] };

  var fakeSocket = {
    on: function (event, fn)  {
      result.clientOns[event] = fn;
      if (event === 'connect') {
        fn();
      }
    },
    end: function (data, encoding) {
      result.ended.push({ data: data, encoding: encoding });
    }
  }

  var fakeServerSocket = {
    on: function (event, fn)  {
      result.serverOns[event] = fn;
      if (event === 'connect') {
        fn();
      }
    }
  }

  var fakeServer = {
    listen: function (port, host) {
      result.listenPort = port;
      result.listenHost = host;
    }
  }

  var fakeNet = {
    createServer: function (fn) {
      fn(fakeServerSocket);
      return fakeServer;
    },
    createConnection: function (port, host) {
      result.connectPort = port;
      result.connectHost = host;
      return fakeSocket;
    }
  }

  var fakeLog4Js = {
    appenderMakers: {}
  };
  fakeLog4Js.loadAppender = function (appender) {
    fakeLog4Js.appenderMakers[appender] = function (config) {
      result.actualLoggerConfig = config;
      return function log(logEvent) {
        result.logged.push(logEvent);
      }
    };
  };

  return { theResult: result,
    theModule: sandbox.require('../lib/appenders/multiprocess', {
      requires: {
        '../log4js': fakeLog4Js,
        'net': fakeNet
      }
    })
  };
}

function logMessages(result, logs, raw) {
  logs.forEach(function log(item) {
    var logItem = { startTime: "Wed, 02 Nov 2011 21:46:39 GMT", level: { levelStr: 'DEBUG' }, data: [ item ] };
    result.serverOns.data(JSON.stringify(logItem));
    result.serverOns.end();
    result.serverOns.connect();
  });
  if (raw) {
    raw.forEach(function log(rawItem) {
      result.serverOns.data(rawItem);
      result.serverOns.end();
      result.serverOns.connect();
    });
  }
}


vows.describe('log4js multiprocessAppender').addBatch({
  'master': {
    topic: function() {
      var fancy = fancyResultingMultiprocessAppender();
      var logger = fancy.theModule.configure({ mode: 'master', 'loggerPort': 5001, 'loggerHost': 'abba', appender: { type: 'file' } });
      logMessages(fancy.theResult, [ 'ALRIGHTY THEN', 'OH WOW' ]);
      return fancy.theResult;
    },

    'should write to the actual appender': function (result) {
      assert.equal(result.listenPort, 5001);
      assert.equal(result.listenHost, 'abba');
      assert.equal(result.logged.length, 2);
      assert.equal(result.logged[0].data[0], 'ALRIGHTY THEN');
      assert.equal(result.logged[1].data[0], 'OH WOW');
    },

    'data written should be formatted correctly': function (result) {
      assert.equal(result.logged[0].level.toString(), 'DEBUG');
      assert.equal(result.logged[0].data, 'ALRIGHTY THEN');
      assert.isTrue(typeof(result.logged[0].startTime) === 'object');
      assert.equal(result.logged[1].level.toString(), 'DEBUG');
      assert.equal(result.logged[1].data, 'OH WOW');
      assert.isTrue(typeof(result.logged[1].startTime) === 'object');
    },

    'the actual logger should get the right config': function (result) {
      assert.equal(result.actualLoggerConfig.type, 'file');
    },

    'client should not be called': function (result) {
      assert.equal(_.keys(result.clientOns).length, 0);
    }
  },
  'master with bad request': {
    topic: function() {
      var fancy = fancyResultingMultiprocessAppender();
      var logger = fancy.theModule.configure({ mode: 'master', 'loggerPort': 5001, 'loggerHost': 'abba', appender: { type: 'file' } });
      logMessages(fancy.theResult, [], [ 'ALRIGHTY THEN', 'OH WOW' ]);
      return fancy.theResult;
    },

    'should write to the actual appender': function (result) {
      assert.equal(result.listenPort, 5001);
      assert.equal(result.listenHost, 'abba');
      assert.equal(result.logged.length, 2);
      assert.equal(result.logged[0].data[0], 'Unable to parse log: ALRIGHTY THEN');
      assert.equal(result.logged[1].data[0], 'Unable to parse log: OH WOW');
    },

    'data written should be formatted correctly': function (result) {
      assert.equal(result.logged[0].level.toString(), 'ERROR');
      assert.equal(result.logged[0].data, 'Unable to parse log: ALRIGHTY THEN');
      assert.isTrue(typeof(result.logged[0].startTime) === 'object');
      assert.equal(result.logged[1].level.toString(), 'ERROR');
      assert.equal(result.logged[1].data, 'Unable to parse log: OH WOW');
      assert.isTrue(typeof(result.logged[1].startTime) === 'object');
    }
  },
  'worker': {
    'should emit logging events to the master': {
      topic: function() {
        var fancy = fancyResultingMultiprocessAppender();
        var logger = fancy.theModule.configure({ loggerHost: 'baba', loggerPort: 1232, name: 'ohno', mode: 'worker', appender: { type: 'file' } });
        logger({ level: { levelStr: 'INFO' }, data: "ALRIGHTY THEN", startTime: '2011-10-27T03:53:16.031Z' });
        logger({ level: { levelStr: 'DEBUG' }, data: "OH WOW", startTime: '2011-10-27T04:53:16.031Z'});
        return fancy.theResult;
      },

      'client configuration should be correct': function (result) {
        assert.equal(result.connectHost, 'baba');
        assert.equal(result.connectPort, 1232);
      },

      'should not write to the actual appender': function (result) {
        assert.equal(result.logged.length, 0);
        assert.equal(result.ended.length, 2);
        assert.equal(result.ended[0].data, JSON.stringify({ level: { levelStr: 'INFO' }, data: "ALRIGHTY THEN", startTime: '2011-10-27T03:53:16.031Z' }));
        assert.equal(result.ended[0].encoding, 'utf8');
        assert.equal(result.ended[1].data, JSON.stringify({ level: { levelStr: 'DEBUG' }, data: "OH WOW", startTime: '2011-10-27T04:53:16.031Z'}));
        assert.equal(result.ended[1].encoding, 'utf8');
        assert.equal(_.keys(result.serverOns).length, 0);
      }
    }
  }
}).exportTo(module);
