'use strict';

const fs = require('fs');
const path = require('path');

const async = require('async');
const uuid = require('node-uuid');

const log = require('./log');
const utils = require('./utils');
const Constants = require('./constants');
const logger = require('pomelo-logger').getLogger('pomelo', __filename);

/**
 * Initialize application configuration.
 */
exports.defaultConfiguration = function(app) {
  const args = _parseArgs(process.argv);
  _setupEnv(app, args);
  _loadServers(app);
  _processArgs(app, args);
  _configLogger(app);
  _loadLifecycle(app);
};

/**
 * Load default components for application.
 */
exports.loadDefaultComponents = function(app) {
  const pomelo = require('../pomelo');
  // load system default components
  if (app.getCurServer().port) {
    app.load(pomelo.remote, app.get('remoteConfig'));
  }
  if (app.isFrontend()) {
    app.load(pomelo.connection, app.get('connectionConfig'));
    app.load(pomelo.connector, app.get('connectorConfig'));
    app.load(pomelo.session, app.get('sessionConfig'));

    // compatible for schedulerConfig
    if (app.get('schedulerConfig')) {
      app.load(pomelo.pushScheduler, app.get('schedulerConfig'));
    } else {
      app.load(pomelo.pushScheduler, app.get('pushSchedulerConfig'));
    }
  }

  app.load(pomelo.proxy, app.get('proxyConfig'));
  app.load(pomelo.backendSession, app.get('backendSessionConfig'));
  app.load(pomelo.channel, app.get('channelConfig'));
  app.load(pomelo.server, app.get('serverConfig'));
  app.load(pomelo.monitor, app.get('monitorConfig'));
};

/**
 * Stop components.
 *
 * @param  {Array}  comps component list
 * @param  {Number}   index current component index
 * @param  {Boolean}  force whether stop component immediately
 * @param  {Function} cb
 */
exports.stopComps = function(comps, index, force, cb) {
  if (index >= comps.length) {
    utils.invokeCallback(cb);
    return;
  }

  const comp = comps[index];

  if (typeof comp.stop === 'function') {
    comp.stop(force, function() {
      // ignore any error
      module.exports.stopComps(comps, index + 1, force, cb);
    });
  } else {
    module.exports.stopComps(comps, index + 1, force, cb);
  }
};

/**
 * Apply command to loaded components.
 * This method would invoke the component {method} in series.
 * Any component {method} return err, it would return err directly.
 *
 * @param {Array} comps loaded component list
 * @param {String} method component lifecycle method name, such as: start, stop
 * @param {Function} cb
 */
exports.optComponents = function(comps, method, cb) {
  async.forEachSeries(comps, (comp, done) => {
    if (typeof comp[method] === 'function') {
      comp[method](done);
    } else {
      done();
    }
  }, (err) => {
    if (err) {
      if (typeof err === 'string') {
        logger.error('fail to operate component, method: %s, err: %j',
                     method, err);
      } else {
        logger.error('fail to operate component, method: %s, err: %j',
                     method, err.stack);
      }
    }
    utils.invokeCallback(cb, err);
  });
};

/**
 * Load server info from config/servers.json.
 */
function _loadServers(app) {
  app.loadConfigBaseApp(Constants.RESERVED.SERVERS,
                        Constants.FILEPATH.SERVER);

  const servers = app.get(Constants.RESERVED.SERVERS);
  const serverMap = {};
  let slist;
  let i;
  let server;
  let serverType;

  for (serverType in servers) {
    slist = servers[serverType];
    for (i = 0; i < slist.length; i++) {
      server = slist[i];
      server.serverType = serverType;
      if (server[Constants.RESERVED.CLUSTER_COUNT]) {
        utils.loadCluster(app, server, serverMap);
        continue;
      }
      serverMap[server.id] = server;
    }
  }
  app.set(Constants.KEYWORDS.SERVER_MAP, serverMap);
}

/**
 * Process server start command
 */
function _processArgs(app, args) {
  const server = args || {};
  const serverId = args.id || uuid.v1();
  const serverType = args.serverType || Constants.RESERVED.DEFAULT_SERVERTYPE;

  server.serverId = serverId;
  server.id = serverId;
  server.serverType = serverType;

  app.set(Constants.RESERVED.MAIN, args.main, true);
  app.set(Constants.RESERVED.SERVER_TYPE, serverType, true);
  app.set(Constants.RESERVED.SERVER_ID, serverId, true);
  app.set(Constants.RESERVED.CURRENT_SERVER, server, true);
}

/**
 * Setup enviroment.
 */
function _setupEnv(app, args) {
  app.set(Constants.RESERVED.ENV,
          args.env || process.env.NODE_ENV || Constants.RESERVED.ENV_DEV,
          true);
}

/**
 * Configure custom logger.
 */
function _configLogger(app) {
  if (process.env.POMELO_LOGGER !== 'off') {
    const env = app.get(Constants.RESERVED.ENV);
    const originPath = path.join(app.getBase(), Constants.FILEPATH.LOG);

    const presentPath = path.join(app.getBase(), Constants.FILEPATH.CONFIG_DIR,
                                  env,
                                  path.basename(Constants.FILEPATH.LOG));
    if (fs.existsSync(originPath)) {
      log.configure(app, originPath);
    } else if (fs.existsSync(presentPath)) {
      log.configure(app, presentPath);
    } else {
      logger.error('logger file path configuration is error.');
    }
  }
}

/**
 * Parse command line arguments.
 *
 * @param args command line arguments
 *
 * @return Object argsMap map of arguments
 */
function _parseArgs(args) {
  const argsMap = {};
  let mainPos = 1;

  while (args[mainPos].indexOf('--') > 0) {
    mainPos++;
  }

  argsMap.main = args[mainPos];

  let i = mainPos + 1;
  for (; i < args.length; i++) {
    const arg = args[i];
    const sep = arg.indexOf('=');

    if (sep === -1) {
      argsMap[arg] = true;
      continue;
    }

    const key = arg.slice(0, sep);
    let value = arg.slice(sep + 1);
    if (!isNaN(Number(value)) && (value.indexOf('.') < 0)) {
      value = Number(value);
    }
    argsMap[key] = value;
  }

  return argsMap;
}

/**
 * Load lifecycle file.
 *
 */
function _loadLifecycle(app) {
  const filePath = path.join(app.getBase(),
                             Constants.FILEPATH.SERVER_DIR,
                             app.serverType,
                             Constants.FILEPATH.LIFECYCLE);

  if (!fs.existsSync(filePath)) {
    return;
  }

  const lifecycle = require(filePath);
  let key;
  for (key in lifecycle) {
    if (typeof lifecycle[key] === 'function') {
      app.lifecycleCbs[key] = lifecycle[key];
    } else {
      logger.warn('lifecycle.js in %s is error format.', filePath);
    }
  }
}
