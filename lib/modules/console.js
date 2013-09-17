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
    case 'addActivity':
      this.app.addActivities([msg.activity]);
    break;
    case 'removeActivity':
      this.app.removeActivities([msg.activity]);
    default:
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
    case 'addActivity':
      addActivity(app, agent, msg, cb);
      break;
    case 'removeActivity':
      removeActivity(app, agent, msg, cb);
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
  var server = parseArgs(msg, ServerInfo, cb);
  if(isReady(ServerInfo)) {
    checkPort(server, function(status){
      if(status === 'busy') {
        cb(new Error('Port occupied already, check your server to add.'));
      } else {
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
    });
  } else {
    cb(new Error('Miss necessary server parameters.'), null);
  }
  reset(ServerInfo);
};

var addActivity = function(app, agent, msg, cb) {
  var activity = parseArgs(msg, ActivityInfo, cb);
  sendActivityInfo(activity, agent, msg, ActivityInfo, cb);
};

var removeActivity = function(app, agent, msg, cb) {
  var activity = parseArgs(msg, RemoveActivity, cb);
  sendActivityInfo(activity, agent, msg, RemoveActivity, cb);
};

var ServerInfo = {
  host: 'unmatched',
  port: 'unmatched',
  id:   'unmatched',
  serverType: 'unmatched'
};

var ActivityInfo = {
  id: 'unmatched',
  job: 'unmatched',
  activity: 'unmatched',
  time: 'unmatched'
};

var RemoveActivity = {
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
    cb('leisure');
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
      cb('busy');
    } else {
      p = server['clientPort'];
      exec(cmd + p, function(err, stdout, stderr) {
        if (stdout) {
          cb('busy'); 
        } else {
          cb('leisure');
        }
      });
    }
  });
}

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

function sendActivityInfo(activity, agent, msg, info, cb) {
  if(isReady(info) && (activity['serverId'] || activity['serverType'])) {
    if(!!activity['serverId']) {
      agent.notifyById(activity['serverId'], module.exports.moduleId, { signal: msg.signal, activity: activity });
    } else {
      agent.notifyByType(activity['serverType'], module.exports.moduleId, { signal: msg.signal, activity: activity });
    }
  } else {
    cb(new Error('Miss necessary server parameters.'), null);
  }
  reset(info);
};