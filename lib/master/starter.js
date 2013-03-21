var cp = require('child_process');
var logger = require('pomelo-logger').getLogger(__filename);
var starter = module.exports;
var util = require('util');
var utils = require('../util/utils');
var ENV = "production";

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
  var cmd = util.format('cd "%s" && "%s"', app.getBase(), process.execPath);
  var arg = server.args;
  if (arg !== undefined) {
    cmd += arg;
  }
  this.env = app.get('env');

  cmd += util.format(' "%s" env="%s" ', app.get('main'), this.env);
  for(var key in server) {
    cmd += util.format(' "%s"="%s" ', key, server[key]);
  }

  if (isLocal(server.host)) {
    starter.localrun(cmd, cb);
  } else {
    starter.sshrun(cmd, server.host, cb);
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
    if(os.platform() === 'win32') {
      cmd = util.format('taskkill /pid %s /f', pids[i]);
    } else {
      cmd = util.format('kill -9 %s', pids[i]);
    }

    if(isLocal(server.host)) {
      starter.localrun(cmd);
    } else {
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

  var data = [];
  spawnProcess('ssh', [host, cmd], function (err, out) {
    if(err) {
      var msg = 'Execute command ' + cmd + 'fail.' +  ' error code: ' + err;

      if (parseInt(err)===255 || parseInt(err)===127) {
        msg += ' ssh to host ' + host + ' error! check ssh agent forward!';
      }
      logger.error(msg);
      cb(msg);
      return;
    }

    data.push({
      host: host,
      out: out
    });

    utils.invokeCallback(cb, data);
  });
};

/**
 * Run local command.
 *
 * @param {String} cmd
 * @param {Callback} callback
 *
 */
starter.localrun = function (cmd, callback) {
  logger.info('Executing ' + cmd + ' locally');
  spawnProcess(cmd, null, function (err, data) {
    if (err) {
      console.error('FAILED TO RUN, return code: ' + err);
      if (callback) {
  	    callback('FAILED TO RUN, return code: ' + err);
		  }
    } else {
      if (callback) {
        callback(data);
      }
    }
  });
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
var spawnProcess = function(command, options, callback) {
  var child;
  if (!!options) {
    child = cp.spawn(command, options);
  } else {
    child = cp.exec(command);
  }

  var prefix = command === 'ssh' ? '[' + options[0] + '] ' : '';
  child.stderr.on('data', function (chunk) {
    var msg = prefix + chunk.toString();
    console.log(msg);
  });

  var res = [];
  if (this.env !== ENV) {
    child.stdout.on('data', function (chunk) {
      var msg = prefix + chunk.toString();
      res.push(msg);
      console.log(msg);
    });
  }

  child.on('exit', function (code) {
    if (!!callback) {
      callback(code === 0 ? null : code, res && res.join('\n'));
    }
  });
};
