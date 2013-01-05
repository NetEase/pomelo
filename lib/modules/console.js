/*!
 * Pomelo -- consoleModule serverStop stop/kill
 * Copyright(c) 2012 fantasyni <fantasyni@163.com>
 * MIT Licensed
 */
var logger = require('pomelo-logger').getLogger(__filename);
var monitor = require('pomelo-monitor');
var countDownLatch = require('../util/countDownLatch');
var utils = require('../util/utils');
var TIME_WAIT_KILL = 5000;
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
    if(agent.type === 'master') return;
    this.app.stop(true);
  } else {
    var serverId = agent.id;
    var serverType = agent.type;
    var pid = process.pid;
    var heapUsed = (process.memoryUsage().heapUsed/(1000 * 1000)).toFixed(2);
    var uptime = (process.uptime()/60).toFixed(2);
    cb({
        serverId: serverId,
        body: {serverId:serverId, serverType: serverType, pid:pid, heapUsed:heapUsed, uptime:uptime}
      });
  }
};

Module.prototype.clientHandler = function(agent, msg, cb) {
  var self = this, sid, record;
  if(msg.signal === 'kill') {
    var pids = [];
    var serverIds = [];
    for(sid in agent.idMap) {
      record = agent.idMap[sid];
      serverIds.push(record.id);
      pids.push(record.pid);
    }
    if(!pids.length || !serverIds.length) {
      cb(null, {
        status: "error"
      });
      return;
    }
    setTimeout(function() {
      self.starter.kill(self.app, pids, serverIds);
      cb(null, {
        status: "ok"
      });
    }, TIME_WAIT_KILL);
  } else if(msg.signal === 'stop') {
    agent.notifyAll(module.exports.moduleId, {
      signal: msg.signal
    });
    setTimeout(function(){    
      self.app.stop(true);
      cb(null, {
        status: "ok"
      });
    },TIME_WAIT_STOP);
  } else {
    var serverInfo = {};
    var count = utils.size(agent.idMap);
    var latch = countDownLatch.createCountDownLatch(count, function() {
      cb(null, {
        msg: serverInfo
      });
    });

    for(sid in agent.idMap) {
      record = agent.idMap[sid];
      agent.request(record.id, module.exports.moduleId, {
        signal: msg.signal
      }, function(msg) {
        serverInfo[msg.serverId] = msg.body;
        latch.done();
      });
    }
  }
};