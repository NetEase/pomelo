/*!
 * Pomelo -- consoleModule serverStop stop/kill
 * Copyright(c) 2012 fantasyni <fantasyni@163.com>
 * MIT Licensed
 */
var logger = require('pomelo-logger').getLogger('pomelo', __filename);
var monitor = require('pomelo-monitor');
var countDownLatch = require('../util/countDownLatch');
var utils = require('../util/utils');
var starter = require('../master/starter');
var exec = require('child_process').exec;

// master would wait for 2 minutes while killing
var MASTER_WAIT_KILL = 2 * 60 * 1000;

// monitor will delay 2 second to exit after recieving the kill signal
var MONITOR_KILL_DELAY = 2 * 1000; 
var TIME_WAIT_STOP = 3000;

module.exports = function(opts) {
  return new Module(opts);
};

module.exports.moduleId = '__console__';

var Module = function(opts) {
  opts = opts || {};
  this.app = opts.app;
  this.starter = opts.starter;
  this.interval = opts.interval || 5;
};

Module.prototype.monitorHandler = function(agent, msg, cb) {
  if(msg.signal === 'stop') {
    if(agent.type === 'master')
      return;
    this.app.stop(true);
  } else if(msg.signal === 'kill') {
        var serverId = agent.id;
    utils.invokeCallback(cb, serverId);

    if(agent.type !== 'master') {
      setTimeout(function() {
        process.exit(-1);
      }, MONITOR_KILL_DELAY);
    }
  } else {
    var serverId = agent.id;
    var serverType = agent.type;
    var pid = process.pid;
    var heapUsed = (process.memoryUsage().heapUsed/(1024 * 1024)).toFixed(2);
    var rss = (process.memoryUsage().rss/(1024 * 1024)).toFixed(2);
    var heapTotal = (process.memoryUsage().heapTotal/(1024 * 1024)).toFixed(2);
    var uptime = (process.uptime()/60).toFixed(2);
    utils.invokeCallback(cb, {
        serverId: serverId,
        body: {serverId:serverId, serverType: serverType, pid:pid, rss: rss, heapTotal: heapTotal, heapUsed:heapUsed, uptime:uptime}
    });
  }
};

Module.prototype.clientHandler = function(agent, msg, cb) {
  var app = this.app;
  switch(msg.signal) {
    case 'kill':
      kill(app, agent, msg, cb);
      break;
    case 'stop':
      stop(app, agent, msg, cb);
      break;
    case 'list':
      list(agent, msg, cb);
      break;
    case 'add':
      add(app, msg, cb);
      break;
    default:
      utils.invokeCallback(cb, new Error('The command cannot be recognized, please check.'), null);
      break;
  }
};

var kill = function(app, agent, msg, cb) {
  var sid, record;
  var serverIds = []; 
  var count = utils.size(agent.idMap);
  var latch = countDownLatch.createCountDownLatchWithTimeout(count, MASTER_WAIT_KILL, function(isTimeout) {
    if(!isTimeout) {
      utils.invokeCallback(cb, null, {code: 'ok'});
    } else {
      utils.invokeCallback(cb, null, {code: 'remain', serverIds: serverIds});
    }
    setTimeout(function() {
      process.exit(-1);
    }, MONITOR_KILL_DELAY);
  });

  for(sid in agent.idMap) {
    record = agent.idMap[sid];
    serverIds.push(record.id);
    agent.request(record.id, module.exports.moduleId, { signal: msg.signal }, function(msg) {
      for (var i = 0; i < serverIds.length; ++i) {
        if (serverIds[i] === msg) {
          serverIds.splice(i, 1);
          latch.done();
          break;
        }
      }
    });
  }
};

var stop = function(app, agent, msg, cb) {
  var serverIds = msg.ids;
  if(!!serverIds.length) {
    var servers = app.getServers();
    for(var i=0; i<serverIds.length; i++) {
      var serverId = serverIds[i];
      if(!servers[serverId])
        utils.invokeCallback(cb, new Error('Cannot find the server to stop.'), null);
      else
        agent.notifyById(serverId, module.exports.moduleId, { signal: msg.signal });
    }
    utils.invokeCallback(cb, null, { status: "part" });
  }
  else {
    agent.notifyAll(module.exports.moduleId, { signal: msg.signal });
    setTimeout(function(){
      app.stop(true);
      utils.invokeCallback(cb, null, { status: "all" });
    },TIME_WAIT_STOP);
  }
};

var list = function(agent, msg, cb) {
  var sid, record;
  var serverInfo = {};
  var count = utils.size(agent.idMap);
  var latch = countDownLatch.createCountDownLatch(count, function() {
    utils.invokeCallback(cb, null, { msg: serverInfo });
  });

  for(sid in agent.idMap) {
    record = agent.idMap[sid];
    agent.request(record.id, module.exports.moduleId, { signal: msg.signal }, function(msg) {
        serverInfo[msg.serverId] = msg.body;
        latch.done();
    });
  }
};

var add = function(app, msg, cb) {
  var server = {};
  var args = msg.args;
  for(var i =0; i<args.length; i++) {
    if(args[i].indexOf('=') < 0) {
      utils.invokeCallback(cb, new Error('Error server parameters format.'), null);
      return;
    }
    var pairs = args[i].split('=');
    var key = pairs[0];
    if(!!ServerInfo[key])
      ServerInfo[key] = 'matched';
    server[pairs[0]] = pairs[1];
  }

  if(isReady()) {
    utils.checkPort(server, function(status){
      if(status === 'busy') {
        utils.invokeCallback(cb, new Error('Port occupied already, check your server to add.'));
      } else {
        app.addServers(server);
        starter.run(app, server, function(err) {
          if(err) {
            utils.invokeCallback(cb, new Error(err), null);
            return;
          }
        });
        process.nextTick(function() {
          utils.invokeCallback(cb, null, { status: "ok" });
        });
      }
    });
  }
  else
    utils.invokeCallback(cb, new Error('Miss necessary server parameters.'), null);

  reset();
};

var ServerInfo = {
  host: 'unmatched',
  port: 'unmatched',
  id:   'unmatched',
  serverType: 'unmatched'
};

function isReady() {
  for(var key in ServerInfo) {
    if(ServerInfo[key] === 'unmatched')
      return false;
  }
  return true;
};

function reset() {
  for(var key in ServerInfo){
    ServerInfo[key] = 'unmatched';
  }
};
