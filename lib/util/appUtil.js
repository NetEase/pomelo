var async = require('async');
var log = require('./log');
var utils = require('./utils');
var logger = require('pomelo-logger').getLogger('pomelo', __filename);

/**
 * Initialize application configuration.
 */
module.exports.defaultConfiguration = function (app) {
  var args = parseArgs(process.argv);
  setupEnv(app, args);
  loadMaster(app);
  loadServers(app);
  processArgs(app, args);
  configLogger(app);
};

/**
 * Load default components for application.
 */
module.exports.loadDefaultComponents = function(app) {
  var pomelo = require('../pomelo');
  // load system default components
  if (app.serverType === 'master') {
    app.load(pomelo.master, app.get('masterConfig'));
  } else {
    app.load(pomelo.proxy, app.get('proxyConfig'));
    if(app.getCurServer().port) {
      app.load(pomelo.remote, app.get('remoteConfig'));
    }
    if(app.isFrontend()) {
      app.load(pomelo.connection, app.get('connectionConfig'));
      app.load(pomelo.connector, app.get('connectorConfig'));
      app.load(pomelo.session, app.get('sessionConfig'));
      app.load(pomelo.scheduler, app.get('schedulerConfig'));
    }
    app.load(pomelo.localSession, app.get('localSessionConfig'));
    app.load(pomelo.channel, app.get('channelConfig'));
    app.load(pomelo.server, app.get('serverConfig'));
  }
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
module.exports.stopComps = function(comps, index, force, cb) {
  if(index >= comps.length) {
    utils.invokeCallback(cb);
    return;
  }
  var comp = comps[index];
  if(typeof comp.stop === 'function') {
    comp.stop(force, function() {
      // ignore any error
      module.exports.stopComps(comps, index +1, force, cb);
    });
  } else {
    module.exports.stopComps(comps, index +1, force, cb);
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
module.exports.optComponents = function(comps, method, cb) {
  var i = 0;
  async.forEachSeries(comps, function(comp, done) {
    i++;
    if(typeof comp[method] === 'function') {
      comp[method](done);
    } else {
      done();
    }
  }, function(err) {
    if(err) {
      logger.error('fail to operate component, method:%s, err:' + err.stack, method);
    }
    utils.invokeCallback(cb, err);
  });
};

/**
 * Load server info from config/servers.json.
 */
var loadServers = function(app) {
  app.loadConfig('servers', app.getBase() + '/config/servers.json');
  var servers = app.get('servers');
  var serverMap = {}, slist, i, l, server;
  for(var serverType in servers) {
    slist = servers[serverType];
    for(i=0, l=slist.length; i<l; i++) {
      server = slist[i];
      server.serverType = serverType;
      serverMap[server.id] = server;

      if(server.wsPort) {
        logger.warn('wsPort is deprecated, ' +
                    'use clientPort and frontend instead.');
      }
    }
  }

  app.set('__serverMap__', serverMap);
};

/**
 * Load master info from config/master.json.
 */
var loadMaster = function(app) {
  app.loadConfig('master', app.getBase() + '/config/master.json');
  app.master = app.get('master');
};

/**
 * Process server start command
 */
var processArgs = function(app, args){
  var serverType = args.serverType || 'master';
  var serverId = args.id || app.getMaster().id;
  var mode = args.mode || 'clusters';

  app.set('main', args.main, true);
  app.set('serverType', serverType, true);
  app.set('serverId', serverId, true);
  app.set('mode', mode, true);

 if(serverType !== 'master') {
    app.set('curServer', args, true);
  } else {
    app.set('curServer', app.getMaster(), true);
  }
};

/**
 * Setup enviroment.
 */
var setupEnv = function(app, args) {
  app.set('env', args.env || process.env.NODE_ENV || 'development', true);
};

var configLogger = function(app) {
  if(process.env.POMELO_LOGGER !== 'off') {
    log.configure(app, app.getBase() + '/config/log4js.json');
  }
};

/**
 * Parse command line arguments.
 *
 * @param args command line arguments
 *
 * @return Object args_map map of arguments
 */
var parseArgs = function (args) {
  var args_map = {};
  var main_pos = 1;

  while(args[main_pos].indexOf('--')>0){
    main_pos++;
  }
  args_map.main = args[main_pos];

  for (var i = (main_pos+1); i < args.length; i++) {
    var str = args[i].split('=');
    var value = str[1];
    if(!isNaN(parseInt(str[1],10)) && (str[1].indexOf('.')<0))
      value = parseInt(str[1],10);
    args_map[str[0]] = value;
  }
  return args_map;
};
