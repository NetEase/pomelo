/*!
 * Pomelo -- consoleModule serverStop stop/kill
 * Copyright(c) 2012 fantasyni <fantasyni@163.com>
 * MIT Licensed
 */
var logger = require('pomelo-logger').getLogger('pomelo', __filename);
var countDownLatch = require('../util/countDownLatch');
var utils = require('../util/utils');
var Constants = require('../util/constants');
var starter = require('../master/starter');
var exec = require('child_process').exec;

module.exports = function(opts) {
  return new Module(opts);
};

module.exports.moduleId = '__console__';

var Module = function(opts) {
  opts = opts || {};
  this.app = opts.app;
  this.starter = opts.starter;
};

Module.prototype.monitorHandler = function(agent, msg, cb) {
  var serverId = agent.id;
  switch(msg.signal) {
    case 'stop':
      if(agent.type === Constants.RESERVED.MASTER) {
        return;
      }
      this.app.stop(true);
      break;
    case 'list':
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
      break;
    case 'kill':
      utils.invokeCallback(cb, serverId);
      if (agent.type !== 'master') {
        setTimeout(function() {
          process.exit(-1);
        }, Constants.TIME.TIME_WAIT_MONITOR_KILL);
      }
      break;
    case 'addCron':
      this.app.addCrons([msg.cron]);
      break;
    case 'removeCron':
      this.app.removeCrons([msg.cron]);
      break;
    case 'blacklist':
      if(this.app.isFrontend()) {
        var connector = this.app.components.__connector__;
        connector.blacklist = connector.blacklist.concat(msg.blacklist);
      }
      break;
    case 'restart':
      if(agent.type === Constants.RESERVED.MASTER) {
        return;
      }
      var self = this;
      var server = this.app.get(Constants.RESERVED.CURRENT_SERVER);
      utils.invokeCallback(cb, server);
      process.nextTick(function() {
        self.app.stop(true);
      });
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
    case 'blacklist':
      blacklist(agent, msg, cb);
      break;
    case 'restart':
      restart(app, agent, msg, cb);
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
  var latch = countDownLatch.createCountDownLatch(count, {timeout: Constants.TIME.TIME_WAIT_MASTER_KILL}, function(isTimeout) {
    if (!isTimeout) {
      utils.invokeCallback(cb, null, {code: 'ok'});
    } else {
      utils.invokeCallback(cb, null, {code: 'remained', serverIds: serverIds});
    }
    setTimeout(function() {
      process.exit(-1);
    }, Constants.TIME.TIME_WAIT_MONITOR_KILL);
  });

  var agentRequestCallback = function(msg) {
      for (var i = 0; i < serverIds.length; ++i) {
        if (serverIds[i] === msg) {
          serverIds.splice(i,1);
          latch.done();
          break;
        }
      }
  };

  for(sid in agent.idMap) {
    record = agent.idMap[sid];
    serverIds.push(record.id);
    agent.request(record.id, module.exports.moduleId, { signal: msg.signal }, agentRequestCallback);
  }
};

var stop = function(app, agent, msg, cb) {
  var serverIds = msg.ids;
  if(!!serverIds.length) {
    var servers = app.getServers();
    app.set(Constants.RESERVED.STOP_SERVERS, serverIds);
    for(var i=0; i<serverIds.length; i++) {
      var serverId = serverIds[i];
      if(!servers[serverId]) {
        utils.invokeCallback(cb, new Error('Cannot find the server to stop.'), null);
      } else {
        agent.notifyById(serverId, module.exports.moduleId, { signal: msg.signal });
      }
    }
    utils.invokeCallback(cb, null, { status: "part" });
  } else {
    agent.notifyAll(module.exports.moduleId, { signal: msg.signal });
    setTimeout(function() {
      app.stop(true);
      utils.invokeCallback(cb, null, { status: "all" });
    }, Constants.TIME.TIME_WAIT_STOP);
  }
};

var restart = function(app, agent, msg, cb) {
  var successFlag;
  var successIds = [];
  var serverIds = msg.ids;
  var type = msg.type;
  var servers;
  if(!serverIds.length && !!type) {
    servers = app.getServersByType(type);
    if(!servers) {
      utils.invokeCallback(cb, new Error('restart servers with unknown server type: ' + type));
      return;
    }
    for(var i=0; i<servers.length; i++) {
      serverIds.push(servers[i].id);
    }
  } else if(!serverIds.length) {
    servers = app.getServers();
    for(var key in servers) {
      serverIds.push(key);
    }
  }  
  var count = serverIds.length;
  var latch = countDownLatch.createCountDownLatch(count, {timeout: Constants.TIME.TIME_WAIT_COUNTDOWN}, function() {
    if(!successFlag) {
      utils.invokeCallback(cb, new Error('all servers start failed.'));
      return;
    }
    utils.invokeCallback(cb, null, utils.arrayDiff(serverIds, successIds));
  });

  var request = function(id) {
    return (function() {
      agent.request(id, module.exports.moduleId, { signal: msg.signal }, function(msg) {
        if(!utils.size(msg)) {
          latch.done();
          return;
        }
        setTimeout(function() {
         runServer(app, msg, function(err, status) {
          if(!!err) {
            logger.error('restart ' + id + ' failed.');
          } else {
            successIds.push(id);
            successFlag = true;
          }
          latch.done();
        });
       }, Constants.TIME.TIME_WAIT_RESTART);
      });
    })();
  };

  for(var j=0; j<serverIds.length; j++) {
    request(serverIds[j]);
  }
};

var list = function(agent, msg, cb) {
  var sid, record;
  var serverInfo = {};
  var count = utils.size(agent.idMap);
  var latch = countDownLatch.createCountDownLatch(count, {timeout: Constants.TIME.TIME_WAIT_COUNTDOWN}, function() {
    utils.invokeCallback(cb, null, { msg: serverInfo });
  });

  var callback = function(msg) {
    serverInfo[msg.serverId] = msg.body;
    latch.done();
  };
  for(sid in agent.idMap) {
    record = agent.idMap[sid];
    agent.request(record.id, module.exports.moduleId, { signal: msg.signal }, callback);
  }
};

var add = function(app, msg, cb) {
  if(checkCluster(msg)) {
    startCluster(app, msg, cb);
  } else {
    startServer(app, msg, cb);
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

var blacklist = function(agent, msg, cb) {
  var ips = msg.args;
  for(var i=0; i<ips.length; i++) {
    if(!(new RegExp(/(\d+)\.(\d+)\.(\d+)\.(\d+)/g).test(ips[i]))) {
      utils.invokeCallback(cb, new Error('blacklist ip: ' + ips[i] + ' is error format.'), null);
      return;
    }
  }
  agent.notifyAll(module.exports.moduleId, { signal: msg.signal, blacklist: msg.args });
  process.nextTick(function() {
    cb(null, { status: "ok" });
  });
};

var checkPort = function(server, cb) {
  if (!server.port && !server.clientPort) {
    utils.invokeCallback(cb, 'leisure');
    return;
  }

  var p = server.port || server.clientPort;
  var host = server.host;
  var cmd = 'netstat -tln | grep ';
  if (!utils.isLocal(host)) {
    cmd = 'ssh ' + host + ' ' + cmd;
  }

  exec(cmd + p, function(err, stdout, stderr) {
    if (stdout || stderr) {
      utils.invokeCallback(cb, 'busy');
    } else {
      p = server.clientPort;
      exec(cmd + p, function(err, stdout, stderr) {
        if (stdout || stderr) {
          utils.invokeCallback(cb, 'busy');
        } else {
          utils.invokeCallback(cb, 'leisure');
        }
      });
    }
  });
};

var parseArgs = function(msg, info, cb) {
  var rs = {};
  var args = msg.args;
  for(var i =0; i<args.length; i++) {
    if(args[i].indexOf('=') < 0) {
      cb(new Error('Error server parameters format.'), null);
      return;
    }
    var pairs = args[i].split('=');
    var key = pairs[0];
    if(!!info[key]) {
      info[key] = 1;
    }
    rs[pairs[0]] = pairs[1];
  }
  return rs;
};

var sendCronInfo = function(cron, agent, msg, info, cb) {
  if(isReady(info) && (cron.serverId || cron.serverType)) {
    if(!!cron.serverId) {
      agent.notifyById(cron.serverId, module.exports.moduleId, { signal: msg.signal, cron: cron });
    } else {
      agent.notifyByType(cron.serverType, module.exports.moduleId, { signal: msg.signal, cron: cron });
    }
    process.nextTick(function() {
      cb(null, { status: "ok" });
    });
  } else {
    cb(new Error('Miss necessary server parameters.'), null);
  }
  reset(info);
};

var startServer = function(app, msg, cb) {
  var server = parseArgs(msg, ServerInfo, cb);
  if(isReady(ServerInfo)) {
    runServer(app, server, cb);
  } else {
    cb(new Error('Miss necessary server parameters.'), null);
  }
};

var runServer = function(app, server, cb) {
  checkPort(server, function(status) {
    if(status === 'busy') {
      utils.invokeCallback(cb, new Error('Port occupied already, check your server to add.'));
    } else {
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
};

var startCluster = function(app, msg, cb) {
  var serverMap = {};
  var fails = [];
  var successFlag;
  var serverInfo = parseArgs(msg, ClusterInfo, cb);
  utils.loadCluster(app, serverInfo, serverMap);
  var count = utils.size(serverMap);
  var latch = countDownLatch.createCountDownLatch(count, function() {
    if(!successFlag) {
      utils.invokeCallback(cb, new Error('all servers start failed.'));
      return;
    }
    utils.invokeCallback(cb, null, fails);
  });

  var start = function(server) {
    return (function() {
      checkPort(server, function(status) {
        if(status === 'busy') {
          fails.push(server);
          latch.done();
        } else {
          starter.run(app, server, function(err) {
            if(err) {
              fails.push(server);
              latch.done();
            }
          });
          process.nextTick(function() {
            successFlag = true;
            latch.done();
          });
        }
      });
    })();
  };
  for(var key in serverMap) {
    var server = serverMap[key];
    start(server);
  }
};

var checkCluster = function(msg) {
  var flag = false;
  var args = msg.args;
  for(var i=0; i < args.length; i++) {
    if(utils.startsWith(args[i], Constants.RESERVED.CLUSTER_COUNT)) {
      flag = true;
    }
  }
  return flag;
};

var isReady = function(info) {
  for(var key in info) {
    if(info[key]) {
      return false;
    }
  }
  return true;
};

var reset = function(info) {
  for(var key in info) {
    info[key] = 0;
  }
};

var ServerInfo = {
  host: 0,
  port: 0,
  id:   0,
  serverType: 0
};

var CronInfo = {
  id: 0,
  action: 0,
  time: 0
};

var RemoveCron = {
  id: 0
};

var ClusterInfo = {
  host: 0,
  port: 0,
  clusterCount: 0
};