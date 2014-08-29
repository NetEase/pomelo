var fs = require('fs');
var path = require('path');
var protobuf = require('pomelo-protobuf');
var Constants = require('../util/constants');
var crypto = require('crypto');
var logger = require('pomelo-logger').getLogger('pomelo', __filename);

module.exports = function(app, opts) {
  return new Component(app, opts);
};

var Component = function(app, opts) {
  this.app = app;
  opts = opts || {};
  this.watchers = {};
  this.serverProtos = {};
  this.clientProtos = {};
  this.version = "";
  
  var env = app.get(Constants.RESERVED.ENV);
  var originServerPath = path.join(app.getBase(), Constants.FILEPATH.SERVER_PROTOS);
  var presentServerPath = path.join(Constants.FILEPATH.CONFIG_DIR, env, path.basename(Constants.FILEPATH.SERVER_PROTOS));
  var originClientPath = path.join(app.getBase(), Constants.FILEPATH.CLIENT_PROTOS);
  var presentClientPath = path.join(Constants.FILEPATH.CONFIG_DIR, env, path.basename(Constants.FILEPATH.CLIENT_PROTOS));

  this.serverProtosPath = opts.serverProtos || (fs.existsSync(originClientPath) ? Constants.FILEPATH.SERVER_PROTOS : presentServerPath);
  this.clientProtosPath = opts.clientProtos || (fs.existsSync(originServerPath) ? Constants.FILEPATH.CLIENT_PROTOS : presentClientPath);

  this.setProtos(Constants.RESERVED.SERVER, path.join(app.getBase(), this.serverProtosPath));
  this.setProtos(Constants.RESERVED.CLIENT, path.join(app.getBase(), this.clientProtosPath));

  protobuf.init({encoderProtos:this.serverProtos, decoderProtos:this.clientProtos});
};

var pro = Component.prototype;

pro.name = '__protobuf__';

pro.encode = function(key, msg) {
  return protobuf.encode(key, msg);
};

pro.encode2Bytes = function(key, msg) {
  return protobuf.encode2Bytes(key, msg);
};

pro.decode = function(key, msg) {
  return protobuf.decode(key, msg);
};

pro.getProtos = function() {
  return {
    server : this.serverProtos,
    client : this.clientProtos,
    version : this.version
  };
};

pro.getVersion = function() {
  return this.version;
};

pro.setProtos = function(type, path) {
  if(!fs.existsSync(path)) {
    return;
  }

  if(type === Constants.RESERVED.SERVER) {
    this.serverProtos = protobuf.parse(require(path));
  }

  if(type === Constants.RESERVED.CLIENT) {
    this.clientProtos = protobuf.parse(require(path));
  }

  var protoStr = JSON.stringify(this.clientProtos) + JSON.stringify(this.serverProtos);
  this.version = crypto.createHash('md5').update(protoStr).digest('base64');

  //Watch file
  var watcher = fs.watch(path, this.onUpdate.bind(this, type, path));
  if (this.watchers[type]) {
    this.watchers[type].close();
  }
  this.watchers[type] = watcher;
};

pro.onUpdate = function(type, path, event) {
  if(event !== 'change') {
    return;
  }

  fs.readFile(path, 'utf8' ,function(err, data) {
    try {
      var protos = protobuf.parse(JSON.parse(data));
      if(type === Constants.RESERVED.SERVER) {
        protobuf.setEncoderProtos(protos);
      } else {
        protobuf.setDecoderProtos(protos);
      }

      this.version = fs.statSync(path).mtime.getTime();
      logger.debug('change proto file , type : %j, path : %j, version : %j', type, path, this.version);
    } catch(e) {
      logger.warn("change proto file error! path : %j", path);
      logger.warn(e);
    }
  });
};

pro.stop = function(force, cb) {
  for (var type in this.watchers) {
    this.watchers[type].close();
  }
  this.watchers = {};
  process.nextTick(cb);
};
