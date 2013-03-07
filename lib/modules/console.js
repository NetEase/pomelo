/*!
 * Pomelo -- consoleModule serverStop stop/kill
 * Copyright(c) 2012 fantasyni <fantasyni@163.com>
 * MIT Licensed
 */
var logger = require('pomelo-logger').getLogger(__filename);
var monitor = require('pomelo-monitor');
var countDownLatch = require('../util/countDownLatch');
var utils = require('../util/utils');
var starter = require('../master/starter');
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
      cb(new Error('The command cannot be recognized, please check.'), null);
      break;
  }
};

var kill = function(app, agent, msg, cb) {
  var sid, record;
  var pids = [];
  var serverIds = [];
  for(sid in agent.idMap) {
    record = agent.idMap[sid];
    if(record.type !== 'master') {
      serverIds.push(record.id);
      pids.push(record.pid);
    }
  }
  if(!pids.length || !serverIds.length) {
      cb(new Error('Cannot find servers to kill.'), null);
      return;
  }
  setTimeout(function() {
    starter.kill(app, pids, serverIds);
    cb(null, { status: "all" });
  }, TIME_WAIT_KILL);
};

var stop = function(app, agent, msg, cb) {
  var serverIds = msg.ids;
  if(!!serverIds.length) {
    var servers = app.getServers();
    for(var i=0; i<serverIds.length; i++) {
      var serverId = serverIds[i];
      if(!servers[serverId])
        cb(new Error('Cannot find the server to stop.'), null);
      else
        agent.notifyById(serverId, module.exports.moduleId, { signal: msg.signal });
    }
    cb(null, { status: "part" });
  }
  else {
    agent.notifyAll(module.exports.moduleId, { signal: msg.signal });
    setTimeout(function(){
      app.stop(true);
      cb(null, { status: "all" });
    },TIME_WAIT_STOP);
  }
};

var list = function(agent, msg, cb) {
  var sid, record;
  var serverInfo = {};
  var count = utils.size(agent.idMap);
  var latch = countDownLatch.createCountDownLatch(count, function() {
    cb(null, { msg: serverInfo });
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
      cb(new Error('Error server parameters format.'), null);
      return;
    }
    var pairs = args[i].split('=');
    var key = pairs[0];
    if(!!ServerInfo[key])
      ServerInfo[key] = 'matched';
    server[pairs[0]] = pairs[1];
  }

  if(isReady()) {
    app.addServers(server);
    starter.run(app, server, function(err) {
      if(err) {
         cb(new Error(err), null);
         return;
      }
    });
    process.nextTick(function() {
      cb(null, { status: "ok" });
    });
  }
  else
    cb(new Error('Miss necessary server parameters.'), null);

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