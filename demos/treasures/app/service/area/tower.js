var pomelo = require('../../../../../lib/pomelo');
var utils = require('../../../../../lib/util/utils');

var prefix = "tower_";
var id = 0;
var exp = module.exports;

var Tower = function(){
  var channelService = pomelo.channelService;
  this.channel = channelService.getLocalChannelSync({name: prefix+id++, create: true});
};

var pro = Tower.prototype;

pro.addUser = function(uid, serverId){
  return this.channel.add(uid);
};

pro.removeUser = function(uid, serverId){
  return this.channel.leave(uid);
};

pro.pushMessage = function(msg, cb){
  this.channel.pushMessage(msg, function(err){
    if(!!err)
      utils.invokeCallback(cb, err);
    else
      utils.invokeCallback(cb, null);
  });
};

exp.create = function(config){
  return new Tower(config);
};

