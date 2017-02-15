'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const protobuf = require('pomelo-protobuf');

const Constants = require('../util/constants');
const logger = require('pomelo-logger').getLogger('pomelo', __filename);

module.exports = Component;

const SERVER_PROTOS = '/config/serverProtos.json';
const CLIENT_PROTOS = '/config/clientProtos.json';

function Component(app, opts) {
  if (!(this instanceof Component)) {
    return new Component(app, opts);
  }

  this.app = app;
  opts = opts || {};
  this.watchers = {};
  this.serverProtos = {};
  this.clientProtos = {};
  this.version = '';

  const env = app.get(Constants.RESERVED.ENV);
  const originServerPath = path.join(app.getBase(), SERVER_PROTOS);
  const presentServerPath = path.join(Constants.FILEPATH.CONFIG_DIR,
                                      env,
                                      path.basename(SERVER_PROTOS));

  const originClientPath = path.join(app.getBase(), CLIENT_PROTOS);
  const presentClientPath = path.join(Constants.FILEPATH.CONFIG_DIR,
                                      env,
                                      path.basename(CLIENT_PROTOS));

  if (opts.serverProtos || fs.existsSync(originServerPath)) {
    this.serverProtosPath = SERVER_PROTOS;
  } else {
    this.serverProtosPath = presentServerPath;
  }

  if (opts.clientProtos || fs.existsSync(originClientPath)) {
    this.clientProtosPath = CLIENT_PROTOS;
  } else {
    this.clientProtosPath = presentClientPath;
  }

  this.setProtos(Constants.RESERVED.SERVER,
                 path.join(app.getBase(), this.serverProtosPath));

  this.setProtos(Constants.RESERVED.CLIENT,
                 path.join(app.getBase(), this.clientProtosPath));

  protobuf.init({
    encoderProtos: this.serverProtos,
    decoderProtos: this.clientProtos
  });
}

Component.prototype.name = '__protobuf__';

Component.prototype.encode = function(key, msg) {
  return protobuf.encode(key, msg);
};

Component.prototype.encode2Bytes = function(key, msg) {
  return protobuf.encode2Bytes(key, msg);
};

Component.prototype.decode = function(key, msg) {
  return protobuf.decode(key, msg);
};

Component.prototype.getProtos = function() {
  return {
    server: this.serverProtos,
    client: this.clientProtos,
    version: this.version
  };
};

Component.prototype.getVersion = function() {
  return this.version;
};

Component.prototype.setProtos = function(type, path) {
  if (!fs.existsSync(path)) {
    return;
  }

  if (type === Constants.RESERVED.SERVER) {
    this.serverProtos = protobuf.parse(require(path));
  }

  if (type === Constants.RESERVED.CLIENT) {
    this.clientProtos = protobuf.parse(require(path));
  }

  this.version = _calcVersion(this.clientProtos, this.serverProtos);

  //Watch file
  const watcher = fs.watch(path, this.onUpdate.bind(this, type, path));
  if (this.watchers[type]) {
    this.watchers[type].close();
  }
  this.watchers[type] = watcher;
};

function _calcVersion(cp, sp) {
  const protoStr = JSON.stringify(cp) +
                   JSON.stringify(sp);

  return crypto.createHash('md5')
    .update(protoStr)
    .digest('base64');
}

Component.prototype.onUpdate = function(type, path, event) {
  if (event !== 'change') {
    return;
  }

  fs.readFile(path, 'utf8', (err, data) => {
    try {
      const protos = protobuf.parse(JSON.parse(data));
      if (type === Constants.RESERVED.SERVER) {
        protobuf.setEncoderProtos(protos);
        this.serverProtos = protos;
      } else {
        protobuf.setDecoderProtos(protos);
        this.clientProtos = protos;
      }
      this.version = _calcVersion(this.clientProtos, this.serverProtos);

      logger.info('change proto file, type: %j, path: %j, version: %j',
                  type, path, this.version);
    } catch (e) {
      logger.warn('change proto file error! path: %j', path);
      logger.warn(e);
    }
  });
};

Component.prototype.stop = function(force, cb) {
  let type;
  for (type in this.watchers) {
    this.watchers[type].close();
  }
  this.watchers = {};
  process.nextTick(cb);
};
