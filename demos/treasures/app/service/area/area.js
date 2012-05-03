var Tower = require('./tower');
var pomelo = require('../../../../../lib/pomelo');
var utils = require('../../../../../lib/util/utils');
var dataService = require('../syncService.js');

// /var sceneDao = require('../dao/sceneDao');
var exports = module.exports;
var logger = require('../../../../../lib/pomelo').log.getLogger(__filename);

function areaUsersKey(areaId){
  return areaId+"_users";
}

var Area = function(param) {
	this.id = param.id;
	this.name = param.name;
	this.mapConfig = param.map;
	
	this.cellConfig = param.cell;
	
	this.towerConfig = param.tower;
	
	this.towers = {}
	
	this.init();
	
	this.users = dataService.getDataSet(areaUsersKey(this.id));
}

var pro = Area.prototype;

pro.getChannelId = function(areaId){
  return "area_" + areaId;
}

pro.init = function(){
  if(!this.mapConfig || !this.cellConfig || !this.towerConfig)
    return;
 
 //Init towers
 var channelManager = pomelo.getApp().get('channelManager');
 var map = this.mapConfig;
 var tower = this.towerConfig;
 var cell = this.cellConfig;
 
 //每个area建立一个监听channel
 this.channel = channelManager.createChannel(this.getChannelId(this.id));
 
 //创建监听tower 
 for(var i = 0; i<Math.ceil(map.width/tower.width); i++){
   this.towers[i] = {};
   for(var j = 0; j < Math.ceil(map.height/tower.height); j++)
    this.towers[i][j] = Tower.create(); 
 }   
}

pro.pushMessage = function(msg, cb){
  this.channel.pushMessage(msg,cb);  
}

pro.pushMessageByUids = function(uids, msg, cb){
  this.channel.pushMessageByUids(msg, uids, cb);
}

pro.pushMessageByPath = function(path, msg, cb){
  this.pushMessageByTowers(this.getTowersByPath(path), msg, cb);
}

pro.pushMessageByPos = function(x, y, msg, cb){
  this.pushMessageByTowers(this.getTowersByPos(x, y), msg, cb);
}

pro.pushMessageByTowers = function(towers, msg, cb){
  if(!towers)
    utils.invokeCallback(cb, 'There are no tower exist!');
    
  for(var key in towers){
    var count = 0;
    var errCount = 0;
    towers[key].pushMessage(msg, function(err){
      count++;
      if(!!err){
        errCount++;
      }
      
      if(count == towers.length){
        if(errCount > 0){
          utils.invokeCallback(cb, count +' towers ' + errCount + ' failed!');
        }else{
          logger.info('All messae have been send!');
          utils.invokeCallback(cb, null);
        }
      }
    });
  } 
}

/**
 * 获取指定坐标及附近8个格子对应的tower
 */
pro.getTowersByPos = function(x, y){
  var result = [];
  var towers = this.towers;
  
  var posX = Math.floor(x/this.towerConfig.width);
  var posY = Math.floor(y/this.towerConfig.height);
  
  for(var i = posX-1; i <= posX+1; i++)
    for(var j = posY-1; j <= posY+1; j++){
      if(!!towers[i][j])
        result.add(towers[i][j]);  
    }
    
  return result;
}

/**
 * 获取路径相关的格子，现在的算法是判断该路径不会移动超过一个格子的距离
 */
pro.getTowersByPath = function(path){
  var result = [];
  
  var start = path[0];
  var end = path[1];
  
  var x0 = Math.floor((start.x<end.x?start.x:end.x - 1)/this.towerConfig.width);
  var x1 = Math.floor((start.x>end.x?start.x:end.x + 1)/this.towerConfig.width);
  
  var y0 = Math.floor((start.y<end.y?start.y:end.y - 1)/this.towerConfig.height);
  var y1 = Math.floor((start.y>end.y?start.y:end.y + 1)/this.towerConfig.height);
  
  for(var i = x0; i <= x1; i++)
    for(var j = y0; j <= y1; j++){
      if(!!this.towers[i][j])
        result.push(this.towers[i][j]);  
    }
    
  return result;
}

pro.addUser = function(userInfo){
  var uid = userInfo.uid;
  
  this.users[uid] = userInfo;
  this.channel.add(uid);
  
  var tower = this.towers[Math.floor(userInfo.x/this.towerConfig.width)][Math.floor(userInfo.y/this.towerConfig.height)];
  
  if(!tower){
    logger.error("!!!!!!!!!!!!!!!!!!!!!!!!!!!! get tower error");
    return false;
  }
  tower.addUser(uid, userInfo.sceneId);
  
  return true;
}

pro.setUser = function(user){
  this.addUser(user);
  // var oldUser = this.users[uid];
  // if(!oldUser){
    // return this.addUser(user);
  // }
//   
  // var tower = this.towers[Math.floor(user.x/this.towerConfig.width)][Math.floor(user.y/this.towerConfig.height)];
  
}

pro.removeUser = function(uid){
  var user = this.users[uid];
  
  if(!user)
    return true;
    
  delete this.users[uid];
  this.channel.leave(uid);  
  
  var tower = this.towers[Math.floor(user.x/this.towerConfig.width)][Math.floor(user.y/this.towerConfig.height)];
  
  tower.removeUser(user.uid, user.areaId);  
  
  return true;
}

pro.getUsers = function(){
  return this.users;  
}

pro.getUser = function(uid){
  return !!this.users[uid]?this.users[uid]:null;  
}

/**
 * 场景用户
 * 
 * param属性：
 * 
 */

exports.create = function(param) {
	if(!param || !param.id  || !param.name) {
		throw new Error('scene id and name should not be empty. ' + JSON.stringify(param));
	}
	return new Area(param);
};