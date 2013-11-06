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
  switch(msg.signal) {
    case 'stop':
      if(agent.type === 'master') return;
      this.app.stop(true);
      break;
    case 'list':
      var serverId = agent.id;
      var serverType = agent.type;
      var pid = process.pid;
      var heapUsed = (process.memoryUsage().heapUsed/(1000 * 1000)).toFixed(2);
      var uptime = (process.uptime()/60).toFixed(2);
      cb({
        serverId: serverId,
        body: {serverId:serverId, serverType: serverType, pid:pid, heapUsed:heapUsed, uptime:uptime}
      });
      break;
    case 'addCron':
      this.app.addCrons([msg.cron]);
      break;
    case 'removeCron':
      this.app.removeCrons([msg.cron]);
      break;
    default:
      logger.error('receive error signal: %j', msg);
      break;
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
    case 'addCron':
      addCron(app, agent, msg, cb);
      break;
    case 'removeCron':
      removeCron(app, agent, msg, cb);
      break;
    default:
      utils.invokeCallback(cb, new Error('The command cannot be recognized, please check.'), null);
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
      utils.invokeCallback(cb, new Error('Cannot find servers to kill.'), null);
      return;
  }
  setTimeout(function() {
    starter.kill(app, pids, serverIds);
    utils.invokeCallback(cb, null, { status: "all" });
  }, TIME_WAIT_KILL);
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
  var server = parseArgs(msg, ServerInfo, cb);
  if(isReady(ServerInfo)) {
    checkPort(server, function(status){
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
  } else {
    cb(new Error('Miss necessary server parameters.'), null);
  }
  reset(ServerInfo);
};

var addCron = function(app, agent, msg, cb) {
  var cron = parseArgs(msg, CronInfo, cb);
  sendCronInfo(cron, agent, msg, CronInfo, cb);
};

var removeCron = function(app, agent, msg, cb) {
  var cron = parseArgs(msg, RemoveCron, cb);
  sendCronInfo(cron, agent, msg, RemoveCron, cb);
};

var ServerInfo = {
  host: 'unmatched',
  port: 'unmatched',
  id:   'unmatched',
  serverType: 'unmatched'
};

var CronInfo = {
  id: 'unmatched',
  action: 'unmatched',
  time: 'unmatched'
};

var RemoveCron = {
  id: 'unmatched'
};

function isReady(info) {
  for(var key in info) {
    if(info[key] === 'unmatched')
      return false;
  }
  return true;
};

function checkPort(server, cb) {
  if (!server['port'] && !server['clientPort']) {
    utils.invokeCallback(cb, 'leisure');
    return;
  }

  var p = server['port'] || server['clientPort'];
  var host = server['host'];
  var cmd = 'netstat -tln | grep ';
  if (!utils.isLocal(host)) {
    cmd = 'ssh ' + host + ' ' + cmd;
  }

  var child = exec(cmd + p, function(err, stdout, stderr) {
    if (stdout) {
      utils.invokeCallback(cb, 'busy');
    } else {
      p = server['clientPort'];
      exec(cmd + p, function(err, stdout, stderr) {
        if (stdout) {
          utils.invokeCallback(cb, 'busy');
        } else {
          utils.invokeCallback(cb, 'leisure');
        }
      });
    }
  });
};

function reset(info) {
  for(var key in info){
    info[key] = 'unmatched';
  }
};

function parseArgs(msg, info, cb) {
  var rs = {};
  var args = msg.args;
  for(var i =0; i<args.length; i++) {
    if(args[i].indexOf('=') < 0) {
      cb(new Error('Error server parameters format.'), null);
      return;
    }
    var pairs = args[i].split('=');
    var key = pairs[0];
    if(!!info[key])
      info[key] = 'matched';
    rs[pairs[0]] = pairs[1];
  }
  return rs;
};

function sendCronInfo(cron, agent, msg, info, cb) {
  if(isReady(info) && (cron['serverId'] || cron['serverType'])) {
    if(!!cron['serverId']) {
      agent.notifyById(cron['serverId'], module.exports.moduleId, { signal: msg.signal, cron: cron });
    } else {
      agent.notifyByType(cron['serverType'], module.exports.moduleId, { signal: msg.signal, cron: cron });
    }
    process.nextTick(function() {
      cb(null, { status: "ok" });
    });
  } else {
    cb(new Error('Miss necessary server parameters.'), null);
  }
  reset(info);
};