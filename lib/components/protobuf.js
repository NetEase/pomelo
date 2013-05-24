var protobuf = require('pomelo-protobuf');
var fs = require('fs');
var path = require('path');
var logger = require('pomelo-logger').getLogger(__filename);

var SERVER = 'server';
var CLIENT = 'client';

module.exports = function(app, opts){
  return new Protobuf(app, opts);
};

var Protobuf = function(app, opts){
  this.name = '__protobuf__';
  this.app = app;
  this.serverProtos = {};
  this.clientProtos = {};
  this.version = 0;

  this.setProtos(SERVER, path.join(app.getBase(), '/config/serverProtos.json'));
  this.setProtos(CLIENT, path.join(app.getBase(), '/config/clientProtos.json'));

  protobuf.init({encoderProtos:this.serverProtos, decoderProtos:this.clientProtos});
};

Protobuf.prototype.encode = function(key, msg){
  return protobuf.encode(key, msg);
};

Protobuf.prototype.encode2Bytes = function(key, msg){
  return protobuf.encode2Bytes(key, msg);
};

Protobuf.prototype.decode = function(key, msg){
  return protobuf.decode(key, msg);
};

Protobuf.prototype.getProtos = function(){
  return {
    server : this.serverProtos,
    client : this.clientProtos,
    version : this.version
  };
};

Protobuf.prototype.getVersion = function(){
  return this.version;
};

Protobuf.prototype.setProtos = function(type, path){
  if(!fs.existsSync(path)) return;

  if(type === SERVER){
    this.serverProtos = protobuf.parse(require(path));
  }

  //Set version to modify time
  var time = fs.statSync(path).mtime.getTime();
  if(this.version < time) this.version = time;

  //Watch file
  fs.watch(path, this.onUpdate.bind(this, type, path));
};

Protobuf.prototype.onUpdate = function(type, path, event){
  if(event !== 'change') return;

  fs.readFile(path, 'utf8' ,function(err, data){
    try{
      var protos = protobuf.parse(JSON.parse(data));
      if(type === SERVER){
        protobuf.setEncoderProtos(protos);
      }else{
        protobuf.setDecoderProtos(protos);
      }

      this.version = fs.statSync(path).mtime.getTime();
      logger.debug('change proto file , type : %j, path : %j, version : %j', type, path, this.version);
    }catch(e){
      logger.warn("change proto file error! path : %j", path);
      logger.warn(e);
    }
  });
};