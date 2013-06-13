var cp = require('child_process');
var logger = require('pomelo-logger').getLogger();
var starter = module.exports;
var util = require('util');
var ENV_PRODUCTION = "production";
var env = "development";
var os=require('os');

var localIps = function () {
  var ifaces = os.networkInterfaces();
  var ips = [];
  var func = function(details) {
    if (details.family === 'IPv4') {
      ips.push(details.address);
    }
  };
  for (var dev in ifaces) {
    ifaces[dev].forEach(func);
  }
  return ips;
}();

/**
 * Run all servers
 *
 * @param {Object} app current application  context
 * @return {Void}
 */
 starter.runServers = function (app) {
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
starter.run = function (app, server, cb) {
  env = app.get('env');
  var cmd, key;
  if (isLocal(server.host)) {
    var options = [];
    if (!!server.args) {
      options.push(server.args);
    }
    cmd = app.get('main');
    options.push(cmd);
    options.push(util.format('env=%s',  env));
    for(key in server) {
      options.push(util.format('%s=%s', key, server[key]));
    }
    starter.localrun(process.execPath,null,options, cb);
  } else {
    cmd = util.format('cd "%s" && "%s"', app.getBase(), process.execPath);
    var arg = server.args;
    if (arg !== undefined) {
      cmd += arg;
    }
    cmd += util.format(' "%s" env=%s ', app.get('main'), env);
    for(key in server) {
      cmd += util.format(' %s=%s ', key, server[key]);
    }
    starter.sshrun(cmd,server.host, cb);
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
    if(isLocal(server.host)) {
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
starter.sshrun = function (cmd, host, cb) {
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
starter.localrun = function (cmd,host,options,callback) {
  logger.info('Executing ' + cmd + ' ' + options + ' locally');
  spawnProcess(cmd,host,options, callback);
};

var isLocal = function(host) {
  return host === '127.0.0.1' || host === 'localhost' || inLocal(host);
};

var inLocal = function(host) {
  for (var index in localIps) {
    if (host === localIps[index]) {
      return true;
    }
  }
  return false;
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
    var err = chunk.toString();
    var msg = err;
    if (parseInt(err) === 255 || parseInt(err) === 127) {
      msg += ' ssh to host ' + host + ' error! check ssh agent forward!';
    } else {
      msg = 'Execute command ' + command + 'fail.' +  ' error code: ' + err;
    }
    logger.error(msg);
    cb && cb(msg);
  });
  if (env !== ENV_PRODUCTION) {
    child.stdout.on('data', function (chunk) {
      var msg = prefix + chunk.toString();
      logger.info(msg);
    });
  }

  child.on('exit', function (code) {
    cb && cb(code === 0 ? null : code);
  });
};
