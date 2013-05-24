var protobuf = require('pomelo-protobuf');
var fs = require('fs');
var path = require('path');
var logger = require('pomelo-logger').getLogger(__filename);

module.exports = function(app, opts){
  return new Protobuf(app, opts);
};

var Protobuf = function(app, opts){
  this.name = '__protobuf__';
  this.app = app;
  this.serverProtos = {};
  this.clientProtos = {};
  this.version = 0;

  var path1 = path.join(app.getBase(), '/config/serverProtos.json');
  var path2 = path.join(app.getBase(), '/config/clientProtos.json');

  if(fs.existsSync(path1)){
    this.serverProtos = protobuf.parse(require(path1));

    //Set version to modify time
    var time1 = fs.statSync(path1).mtime.getTime();
    if(this.version < time1) this.version = time1;

    //Watch file
    fs.watch(path1, this.onUpdate.bind(this, 'server', path1));
  }

  if(fs.existsSync(path2)){
    this.clientProtos = protobuf.parse(require(path2));

    var time2 = fs.statSync(path2).mtime.getTime();
    if(this.version < time2) this.version = time2;

    //Watch file
    fs.watch(path2, this.onUpdate.bind(this, 'client', path2));
  }

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

Protobuf.prototype.onUpdate = function(type, path, event){
  try{
    if(event !== 'change') return;

    var protos = protobuf.parse(require(path));
    if(type === 'server'){
      protobuf.setEncoderProtos(protos);
    }else{
      protobuf.setDecoderProtos(protos);
    }

    this.version = fs.statSync(path).mtime.getTime();
  }catch(e){
    logger.error("change proto file error! path : %j, err : %j", path, e.msg);
  }
};