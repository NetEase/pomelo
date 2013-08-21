var cp = require('child_process');
var logger = require('pomelo-logger').getLogger('pomelo', __filename);
var starter = module.exports;
var util = require('util');
var utils = require('../util/utils');
var ENV_PRODUCTION = "production";
var env = "development";
var os=require('os');
var cpus = {}; 

/**
 * Run all servers
 *
 * @param {Object} app current application  context
 * @return {Void}
 */
 starter.runServers = function(app) {
  var servers = app.getServersFromConfig();
  for (var serverId in servers) {
    this.run(app, servers[serverId]);
  }
};

/**
 * Run server
 *
 * @param {Object} app current application context
 * @param {Object} server
 * @return {Void}
 */
starter.run = function(app, server, cb) {
  env = app.get('env');
  var cmd, key;
  if (utils.isLocal(server.host)) {
    var options = [];
    if (!!server.args) {
      if(typeof server.args === 'string') {
        options.push(server.args.trim());
      } else {
        options.push(server.args);
      }
    }
    cmd = app.get('main');
    options.push(cmd);
    options.push(util.format('env=%s',  env));
    for(key in server) {
      if(key === 'cpu') {
        cpus[server['id']] = server[key];
      }
      options.push(util.format('%s=%s', key, server[key]));
    }
    starter.localrun(process.execPath, null, options, cb);
  } else {
    cmd = util.format('cd "%s" && "%s"', app.getBase(), process.execPath);
    var arg = server.args;
    if (arg !== undefined) {
      cmd += arg;
    }
    cmd += util.format(' "%s" env=%s ', app.get('main'), env);
    for(key in server) {
      if(key === 'cpu') {
        cpus[server['id']] = server[key];
      }
      cmd += util.format(' %s=%s ', key, server[key]);
    }
    starter.sshrun(cmd, server.host, cb);
  }
};

/**
 * Bind process with cpu
 *
 * @param {String} sid server id
 * @param {String} pid process id
 * @param {String} host server host
 * @return {Void}
 */
starter.bindCpu = function(sid, pid, host) {
  if(os.platform() === 'linux' && cpus[sid] !== undefined) {
    if (utils.isLocal(host)) {
      var options = [];
      options.push('-pc');
      options.push(cpus[sid]);
      options.push(pid);
      starter.localrun('taskset', null, options);
    }
    else {
      var cmd = util.format('taskset -pc "%s" "%s"', cpus[sid], pid);
      starter.sshrun(cmd, host, null);
    }
  }
};

/**
 * Kill application in all servers
 *
 * @param {String} pids  array of server's pid
 * @param {String} serverIds array of serverId
 */
starter.kill = function(app, pids, serverIds) {
  var cmd;
  for(var i = 0; i < serverIds.length; i++) {
    var server = app.getServerById(serverIds[i]);
    if(!server) {
      continue;
    }
    if(utils.isLocal(server.host)) {
      var options = [];
      if(os.platform() === 'win32') {
        cmd = 'taskkill';
        options.push('/pid');
        options.push('/f');
      } else {
        cmd = 'kill';
        options.push(-9);
      }
      options.push(pids[i]);
      starter.localrun(cmd,null,options);
    } else {
      if(os.platform() === 'win32') {
        cmd = util.format('taskkill /pid %s /f', pids[i]);
      } else {
        cmd = util.format('kill -9 %s', pids[i]);
      }
      starter.sshrun(cmd, server.host);
    }
  }
};

/**
 * Use ssh to run command.
 *
 * @param {String} cmd command that would be executed in the remote server
 * @param {String} host remote server host
 * @param {Function} cb callback function
 *
 */
starter.sshrun = function(cmd, host, cb) {
  logger.info('Executing ' + cmd + ' on ' + host);
  spawnProcess('ssh', host,[host, cmd], cb);
  return;
};

/**
 * Run local command.
 *
 * @param {String} cmd
 * @param {Callback} callback
 *
 */
starter.localrun = function (cmd, host, options, callback) {
  logger.info('Executing ' + cmd + ' ' + options + ' locally');
  spawnProcess(cmd, host, options, callback);
};

/**
 * Fork child process to run command.
 *
 * @param {String} command
 * @param {Object} options
 * @param {Callback} callback
 *
 */
var spawnProcess = function(command, host, options, cb) {
  var child = cp.spawn(command, options);
  var prefix = command === 'ssh' ? '[' + host + '] ' : '';

  child.stderr.on('data', function (chunk) {
    var msg = chunk.toString();
    process.stderr.write(msg);
    cb && cb(msg);
  });

  child.stdout.on('data', function (chunk) {
    var msg = prefix + chunk.toString();
    process.stdout.write(msg);
  });

  child.on('exit', function (code) {
    cb && cb(code === 0 ? null : code);
  });
};
