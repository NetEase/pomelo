'use strict';

const vm = require('vm');
const util = require('util');

const logger = require('pomelo-logger').getLogger('pomelo', __filename);
const constants = require('../../util/constants');

const Command = module.exports;

Command.init = function(client, data) {
  logger.debug('server: %s receive command, with data: %j',
               client.app.serverId, data);

  if (!data) {
    logger.warn('server: %s command data is null.', client.app.serverId);
    return;
  }

  data = JSON.parse(data);
  switch (data.command) {
    case 'stop':
      _stop(client);
      break;
    case 'kill':
      _kill(client);
      break;
    case 'addCron':
      _addCron(client, data);
      break;
    case 'removeCron':
      _removeCron(client, data);
      break;
    case 'blacklist':
      _addBlacklist(client, data);
      break;
    case 'set':
      _set(client, data);
      break;
    case 'get':
      _get(client, data);
      break;
    case 'enable':
      _enable(client, data);
      break;
    case 'disable':
      _disable(client, data);
      break;
    case 'run':
      _run(client, data);
      break;
    case 'exec':
      _exec(client, data);
      break;
    case 'show':
      _show(client);
      break;
    default:
      logger.debug('server: %s receive unknown command, with data: %j',
                   client.app.serverId, data);
      break;
  } // end of switch
};

function _stop(client) {
  logger.info('server : %s is stopped', client.app.serverId);
  client.app.set(constants.RESERVED.STOP_FLAG, true);
  client.app.stop();
}

function _kill(client) {
  logger.info('server: %s is forced killed.', client.app.serverId);
  process.exit(0);
}

function _addCron(client, msg) {
  logger.info('addCron %s to server %s', msg.cron, client.app.serverId);
  client.app.addCrons([msg.cron]);
}

function _removeCron(client, msg) {
  logger.info('removeCron %s to server %s', msg.cron, client.app.serverId);
  client.app.removeCrons([msg.cron]);
}

function _addBlacklist(client, msg) {
  if (client.app.isFrontend()) {
    logger.info('addBlacklist %s to server %s',
                msg.blacklist, client.app.serverId);
    const connector = client.app.components.__connector__;
    connector.blacklist = connector.blacklist.concat(msg.blacklist);
  }
}

function _set(client, msg) {
  const key = msg.param['key'];
  const value = msg.param['value'];
  logger.info('set %s to value %s in server %s',
              key, value, client.app.serverId);
  client.app.set(key, value);
}

function _get(client, msg) {
  let value = client.app.get(msg.param);
  if (!_checkJSON(value)) {
    value = 'object';
  }

  logger.info('get %s the value is %s in server %s',
              msg.param, value, client.app.serverId);

  if (!value) {
    value = 'undefined';
  }
  client.sendCommandResult(value);
}

function _enable(client, msg) {
  logger.info('enable %s in server %s',
              msg.param, client.app.serverId);
  client.app.enable(msg.param);
}

function _disable(client, msg) {
  logger.info('disable %s in server %s', msg.param, client.app.serverId);
  client.app.disable(msg.param);
}

function _run(client, msg) {
  const ctx = {
    app: client.app,
    result: null
  };

  try {
    vm.runInNewContext('result = ' + msg.param, ctx, 'myApp.vm');
    logger.info('run %s in server %s with result %s',
                msg.param, client.app.serverId,
                util.inspect(ctx.result));

    client.sendCommandResult(util.inspect(ctx.result));
  } catch (e) {
    logger.error('run %s in server %s with err %s',
                 msg.param, client.app.serverId, e.toString());
    client.sendCommandResult(e.toString());
  }
}

function _exec(client, msg) {
  const context = {
    app: client.app,
    require: require,
    os: require('os'),
    fs: require('fs'),
    process: process,
    util: util
  };

  try {
    vm.runInNewContext(msg.script, context);
    logger.info('exec %s in server %s with result %s',
                msg.script, client.app.serverId,
                context.result);
    const result = context.result;
    if (!result) {
      client.sendCommandResult('script result should be assigned to result' +
                               'value to script module context');
    } else {
      client.sendCommandResult(result.toString());
    }
  } catch (e) {
    logger.error('exec %s in server %s with err %s',
                 msg.script, client.app.serverId, e.toString());
    client.sendCommandResult(e.toString());
  }
}

function _show(client) {
  const result = {};
  result.connectionInfo = _getConnectionInfo(client);
  result.proxyInfo = _getProxyInfo(client);
  result.handlerInfo = _getHandlerInfo(client);
  result.componentInfo = _getComponentInfo(client);
  result.settingInfo = _getSettingInfo(client);

  client.sendCommandResult(JSON.stringify(result), 'show');
}

function _getConnectionInfo(client) {
  const connectionInfo = {};
  const connection = client.app.components.__connection__;
  connectionInfo.serverId = client.app.serverId;

  if (connection) {
    connectionInfo.connectionInfo = connection.getStatisticsInfo();
  } else {
    connectionInfo.connectionInfo = 'no connection';
  }
  return connectionInfo;
}

function _getProxyInfo(client) {
  let proxyInfo = {};
  const __proxy__ = client.app.components.__proxy__;
  if (__proxy__ && __proxy__.client && __proxy__.client.proxies.user) {
    const proxies = __proxy__.client.proxies.user;
    const server = client.app.getServerById(client.app.serverId);
    if (!server) {
      logger.error('no server with this id ' + client.app.serverId);
    } else {
      const type = server['serverType'];
      const tmp = proxies[type];
      proxyInfo[type] = {};
      let _proxy;
      for (_proxy in tmp) {
        const r = tmp[_proxy];
        proxyInfo[type][_proxy] = {};
        let _rpc;
        for (_rpc in r) {
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
}

function _getHandlerInfo(client) {
  let handlerInfo = {};
  const __server__ = client.app.components.__server__;
  if (__server__ && __server__.server &&
      __server__.server.handlerService.handlerMap) {
    const handles = __server__.server.handlerService.handlerMap;
    const server = client.app.getServerById(client.app.serverId);
    if (!server) {
      logger.error('no server with this id ' + client.app.serverId);
    } else {
      const type = server['serverType'];
      const tmp = handles;
      handlerInfo[type] = {};
      let _p;
      for (_p in tmp) {
        const r = tmp[_p];
        handlerInfo[type][_p] = {};
        let _r;
        for (_r in r) {
          const g = r[_r];
          let _g;
          for (_g in g) {
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
}

function _getComponentInfo(client) {
  const _components = client.app.components;
  const res = {};

  let key;
  for (key in _components) {
    const name = _getComponentName(key);
    res[name] = _clone(name, client.app.get(name + 'Config'));
  }
  return res;
}

function _getSettingInfo(client) {
  const _settings = client.app.settings;
  const res = {};
  let key;

  for (key in _settings) {
    if (key.match(/^__\w+__$/) || key.match(/\w+Config$/)) {
      continue;
    }
    if (!_checkJSON(_settings[key])) {
      res[key] = 'Object';
      continue;
    }
    res[key] = _settings[key];
  }
  return res;
}

function _clone(param, obj) {
  const result = {};
  let flag = 1;
  let key;
  for (key in obj) {
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
}

function _getComponentName(c) {
  let t = c.match(/^__(\w+)__$/);
  if (t) {
    t = t[1];
  }
  return t;
}

function _checkJSON(obj) {
  if (!obj) {
    return true;
  }

  try {
    JSON.stringify(obj);
  } catch (e) {
    return false;
  }
  return true;
}
