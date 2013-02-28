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

  var serverProtos = (!!opts?opts.serverProtos:null) || require(path.join(app.getBase(), '/config/serverProtos.json'));
  var clientProtos = (!!opts?opts.clientProtos:null) || require(path.join(app.getBase(), '/config/clientProtos.json'));

  if(serverProtos){
    this.serverProtos = protobuf.parse(serverProtos);
  }

  if(clientProtos){
    this.clientProtos = protobuf.parse(clientProtos);
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