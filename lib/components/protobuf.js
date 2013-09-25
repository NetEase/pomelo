var fs = require('fs');
var path = require('path');
var protobuf = require('pomelo-protobuf');
var logger = require('pomelo-logger').getLogger('pomelo', __filename);

var SERVER = 'server';
var CLIENT = 'client';

module.exports = function(app, opts) {
  return new Component(app, opts);
};

var Component = function(app, opts) {
  this.app = app;
  opts = opts || {};
  this.serverProtos = {};
  this.clientProtos = {};
  this.version = 0;
  this.serverProtosPath = opts.serverProtos || '/config/serverProtos.json';
  this.clientProtosPath = opts.clientProtos || '/config/clientProtos.json';

  this.setProtos(SERVER, path.join(app.getBase(), this.serverProtosPath));
  this.setProtos(CLIENT, path.join(app.getBase(), this.clientProtosPath));

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
  if(!fs.existsSync(path)) return;

  if(type === SERVER) {
    this.serverProtos = protobuf.parse(require(path));
  }

  if(type === CLIENT) {
    this.clientProtos = protobuf.parse(require(path));
  }

  //Set version to modify time
  var time = fs.statSync(path).mtime.getTime();
  if(this.version < time) this.version = time;

  //Watch file
  fs.watch(path, this.onUpdate.bind(this, type, path));
};

pro.onUpdate = function(type, path, event) {
  if(event !== 'change') return;

  fs.readFile(path, 'utf8' ,function(err, data) {
    try {
      var protos = protobuf.parse(JSON.parse(data));
      if(type === SERVER) {
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