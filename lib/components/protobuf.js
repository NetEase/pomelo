var protobuf = require('pomelo-protobuf');
var fs = require('fs');
var path = require('path');

module.exports = function(app, opts){
  return new Protobuf(app, opts);
};

var Protobuf = function(app, opts){
  this.name = '__protobuf__';
  this.serverProtos = {};
  this.clientProtos = {};

  var path1 = path.join(app.getBase(), '/config/serverProtos.json');
  var path2 = path.join(app.getBase(), '/config/clientProtos.json');

  if(fs.existsSync(path1)){
    this.serverProtos = protobuf.parse(require(path1));
  }

  if(fs.existsSync(path2)){
    this.clientProtos = protobuf.parse(require(path2));
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
    client : this.clientProtos
  };
};