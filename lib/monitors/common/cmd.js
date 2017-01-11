'use strict';

var logger = require('pomelo-logger').getLogger('pomelo', __filename);
var constants = require('../../util/constants');
var Command = module.exports;
var vm = require('vm');
var util = require('util');

Command.init = function(client, data) {
  logger.debug('server: %s receive command, with data: %j', client.app.serverId, data);
  if(!data) {
    logger.warn('server: %s command data is null.', client.app.serverId);
    return;
  }
  data = JSON.parse(data);
  switch(data.command) {
    case 'stop':
      stop(client);
      break;
    case 'kill':
      kill(client);
      break;
    case 'addCron':
      addCron(client, data);
      break;
    case 'removeCron':
      removeCron(client, data);
      break;
    case 'blacklist':
      addBlacklist(client, data);
      break;
    case 'set':
      set(client, data);
      break;
    case 'get':
      get(client, data);
      break;
    case 'enable':
      enable(client, data);
      break;
    case 'disable':
      disable(client, data);
      break;
    case 'run':
      run(client, data);
      break;
    case 'exec':
      exec(client, data);
      break;
    case 'show':
      show(client);
      break;
    default:
      logger.debug('server: %s receive unknown command, with data: %j', client.app.serverId, data);
      break;
}
};

var stop = function(client) {
  logger.info('server : %s is stopped', client.app.serverId);
  client.app.set(constants.RESERVED.STOP_FLAG, true);
  client.app.stop();
};

var kill = function(client) {
  logger.info('server: %s is forced killed.', client.app.serverId);
  process.exit(0);
};

var addCron = function(client, msg) {
  logger.info('addCron %s to server %s', msg.cron, client.app.serverId);
  client.app.addCrons([msg.cron]);
};

var removeCron = function(client, msg) {
  logger.info('removeCron %s to server %s', msg.cron, client.app.serverId);
  client.app.removeCrons([msg.cron]);
};

var addBlacklist = function(client, msg) {
  if(client.app.isFrontend()) {
    logger.info('addBlacklist %s to server %s', msg.blacklist, client.app.serverId);
    var connector = client.app.components.__connector__;
    connector.blacklist = connector.blacklist.concat(msg.blacklist);
  }
};

var set = function(client, msg) {
  var key = msg.param['key'];
  var value = msg.param['value'];
  logger.info('set %s to value %s in server %s', key, value, client.app.serverId);
  client.app.set(key, value);
};

var get = function(client, msg) {
  var value = client.app.get(msg.param);
  if (!checkJSON(value)) {
        value = 'object';
  }

  logger.info('get %s the value is %s in server %s', msg.param, value, client.app.serverId);
  if (!value) value = 'undefined';
  client.sendCommandResult(value);
};

var enable = function(client, msg) {
  logger.info('enable %s in server %s', msg.param, client.app.serverId);
  client.app.enable(msg.param);
};

var disable = function(client, msg) {
  logger.info('disable %s in server %s', msg.param, client.app.serverId);
  client.app.disable(msg.param);
};

var run = function(client, msg) {
  var ctx = {
    app: client.app,
    result: null
  };
  try {
    vm.runInNewContext('result = ' + msg.param, ctx, 'myApp.vm');
    logger.info('run %s in server %s with result %s', msg.param, client.app.serverId, util.inspect(ctx.result));
    client.sendCommandResult(util.inspect(ctx.result));
  } catch(e) {
    logger.error('run %s in server %s with err %s', msg.param, client.app.serverId, e.toString());
    client.sendCommandResult(e.toString());
  }
};

var exec = function(client, msg) {
  var context = {
    app: client.app,
    require: require,
    os: require('os'),
    fs: require('fs'),
    process: process,
    util: util
  };
  try {
    vm.runInNewContext(msg.script, context);
    logger.info('exec %s in server %s with result %s', msg.script, client.app.serverId, context.result);
    var result = context.result;
    if (!result) {
      client.sendCommandResult("script result should be assigned to result value to script module context");
    } else {
      client.sendCommandResult(result.toString());
    }
  } catch (e) {
    logger.error('exec %s in server %s with err %s', msg.script, client.app.serverId, e.toString());
    client.sendCommandResult(e.toString());
  }
};

var show = function(client) {
  var result = {};
  result.connectionInfo = getConnectionInfo(client);
  result.proxyInfo = getProxyInfo(client);
  result.handlerInfo = getHandlerInfo(client);
  result.componentInfo = getComponentInfo(client);
  result.settingInfo = getSettingInfo(client);

  client.sendCommandResult(JSON.stringify(result), 'show');
};

var getConnectionInfo = function(client) {
  var connectionInfo = {};
  var connection = client.app.components.__connection__;
  connectionInfo.serverId = client.app.serverId;
  
  if (connection) {
    connectionInfo.connectionInfo = connection.getStatisticsInfo();
  } else {
    connectionInfo.connectionInfo = 'no connection';
  }
  return connectionInfo;
};

var getProxyInfo = function(client) {
  var proxyInfo = {};
  var __proxy__ = client.app.components.__proxy__;
  if (__proxy__ && __proxy__.client && __proxy__.client.proxies.user) {
    var proxies = __proxy__.client.proxies.user;
    var server = client.app.getServerById(client.app.serverId);
    if (!server) {
      logger.error('no server with this id ' + client.app.serverId);
    } else {
      var type = server['serverType'];
      var tmp = proxies[type];
      proxyInfo[type] = {};
      for (var _proxy in tmp) {
        var r = tmp[_proxy];
        proxyInfo[type][_proxy] = {};
        for (var _rpc in r) {
          if (typeof r[_rpc] === 'function') {
            proxyInfo[type][_proxy][_rpc] = 'function';
          }
        }
      }
    }
  } else {
    proxyInfo = 'no proxy loaded';
  }
  return proxyInfo;
};

var getHandlerInfo = function(client) {
  var handlerInfo = {};
  var __server__ = client.app.components.__server__;
  if (__server__ && __server__.server && __server__.server.handlerService.handlerMap) {
    var handles = __server__.server.handlerService.handlerMap;
    var server = client.app.getServerById(client.app.serverId);
    if (!server) {
      logger.error('no server with this id ' + client.app.serverId);
    } else {
      var type = server['serverType'];
      var tmp = handles;
      handlerInfo[type] = {};
      for (var _p in tmp) {
        var r = tmp[_p];
        handlerInfo[type][_p] = {};
        for (var _r in r) {
          var g = r[_r];
          for(var _g in g) {
            if (typeof g[_g] === 'function') {
              handlerInfo[type][_p][_g] = 'function';
            }
          }
        }
      }
    }
  } else {
    handlerInfo = 'no handler loaded';
  }
  return handlerInfo;
};

var getComponentInfo = function(client) {
  var _components = client.app.components;
  var res = {};
  for (var key in _components) {
    var name = getComponentName(key);
    res[name] = clone(name, client.app.get(name + 'Config'));
  }
  return res;
};

var getSettingInfo = function(client) {
  var _settings = client.app.settings;
  var res = {};
  for (var key in _settings) {
    if (key.match(/^__\w+__$/) || key.match(/\w+Config$/)) {
      continue;
    }
    if (!checkJSON(_settings[key])) {
      res[key] = 'Object';
      continue;
    }
    res[key] = _settings[key];
  }
  return res;
};

function clone(param, obj) {
  var result = {};
  var flag = 1;
  for (var key in obj) {
    if (typeof obj[key] === 'function' || typeof obj[key] === 'object') {
      continue;
    }
    flag = 0;
    result[key] = obj[key];
  }
  if (flag) {
    // return 'no ' + param + 'Config info';
  }
  return result;
};

function getComponentName(c) {
  var t = c.match(/^__(\w+)__$/);
  if (t) {
    t = t[1];
  }
  return t;
};

function checkJSON(obj) {
  if (!obj) {
    return true;
  }
  try {
    JSON.stringify(obj);
  } catch (e) {
    return false;
  }
  return true;
};
