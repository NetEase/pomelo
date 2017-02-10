'use strict';

const fs = require('fs');
const path = require('path');

const application = require('./application');
const pkg = require('../package');

/**
 * Expose `createApplication()`.
 *
 * @module
 */
const Pomelo = {};
module.exports = Pomelo;

/**
 * Framework version.
 */
Pomelo.version = pkg.version;

/**
 * Event definitions that would be emitted by app.event
 */
Pomelo.events = require('./util/events');

/**
 * auto loaded components
 */
Pomelo.components = {};

/**
 * auto loaded filters
 */
Pomelo.filters = {};

/**
 * auto loaded rpc filters
 */
Pomelo.rpcFilters = {};

function _load(path, name) {
  return () => {
    if (name) {
      return require(path + name);
    }
    return require(path);
  };
}

/**
 * connectors
 */
Pomelo.connectors = {};
Object.defineProperties(Pomelo.connectors, {
  sioconnector: {
    get: _load('./connectors/sioconnector')
  },
  hybridconnector: {
    get: _load('./connectors/hybridconnector')
  },
  udpconnector: {
    get: _load('./connectors/udpconnector')
  },
  mqttconnector: {
    get: _load('./connectors/mqttconnector')
  }
});

/**
 * pushSchedulers
 */
Pomelo.pushSchedulers = {};
Object.defineProperties(Pomelo.pushSchedulers, {
  direct: {
    get: _load('./pushSchedulers/direct')
  },
  buffer: {
    get: _load('./pushSchedulers/buffer')
  }
});

/**
 * monitors
 */
Pomelo.monitors = {};
Object.defineProperties(Pomelo.monitors, {
  zookeepermonitor: {
    get: _load('./monitors/zookeepermonitor')
  },
  redismonitor: {
    get: _load('./monitors/redismonitor')
  },
  redismonitorlight: {
    get: _load('./monitors/redismonitorlight')
  }
});

/**
 * Create an pomelo application.
 *
 * @return {Application}
 * @memberOf Pomelo
 * @api public
 */
Pomelo.createApp = function(opts) {
  const app = application;
  app.init(opts);
  Pomelo.app = app;
  return app;
};

/**
 * Auto-load bundled components with getters.
 */
fs.readdirSync(`${__dirname}/components`).forEach((filename) => {
  if (!/\.js$/.test(filename)) {
    return;
  }

  const name = path.basename(filename, '.js');

  Object.defineProperty(Pomelo.components, name, {
    get: _load('./components/', name)
  });
  Object.defineProperty(Pomelo, name, {
    get: _load('./components', name)
  });
});

fs.readdirSync(`${__dirname}/filters/handler`).forEach((filename) => {
  if (!/\.js$/.test(filename)) {
    return;
  }
  const name = path.basename(filename, '.js');

  Object.defineProperty(Pomelo.filters, name, {
    get: _load('./filters/handler/', name)
  });
});

fs.readdirSync(`${__dirname}/filters/rpc`).forEach((filename) => {
  if (!/\.js$/.test(filename)) {
    return;
  }
  const name = path.basename(filename, '.js');

  Object.defineProperty(Pomelo.rpcFilters, name, {
    get: _load('./filters/rpc/', name)
  });
});
