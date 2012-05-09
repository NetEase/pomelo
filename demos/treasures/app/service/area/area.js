var pomelo = require('../../../../../lib/pomelo');
var utils = require('../../../../../lib/util/utils');
var dataService = require('../syncService.js');
var aoiService = require('aoi-service');

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
	
	this.users = dataService.getDataSet(areaUsersKey(this.id));
	
	this.aoi = aoiService.getService(param);
	
	this.init();
}

var pro = Area.prototype;

pro.getChannelId = function(areaId){
  return "area_" + areaId;
}

pro.init = function(){
  if(!this.mapConfig || !this.cellConfig){
    logger.error('area init failed! areaid: ' + this.id);   
    return;
  }
 
  this.channelManager = pomelo.getApp().get('channelManager');
     
  //每个area建立一个监听channel
  this.channel = this.channelManager.createChannel(this.getChannelId(this.id));
}

pro.pushMessage = function(msg, cb){
  this.channel.pushMessage(msg,cb);  
}

pro.pushMessageByUids = function(uids, msg, cb){
  this.channelManager.pushMessageByUids(msg, uids, cb);
}

pro.pushMessageByPath = function(path, msg, cb){
  var uids = this.aoi.getIdsByPath(path[0], path[1]);
  this.channelManager.pushMessageByUids(msg, uids, cb);
}

pro.pushMessageByPos = function(x, y, msg, cb){
  var uids = this.aoi.getIdsByPos({x : x, y : y});
  
  this.channelManager.pushMessageByUids(msg, uids, cb);
}

pro.addUser = function(userInfo){
  var uid = userInfo.uid;
  
  this.users[uid] = userInfo;
  
  this.channel.add(uid);
  this.aoi.addObject(uid, {x: userInfo.x, y: userInfo.y});
  
  return true;
}

pro.setUser = function(user){
  this.addUser(user);
  // var oldUser = this.users[uid];
  // if(!oldUser){
    // return this.addUser(user);
  // } 
}

pro.updateUser = function(uid, start, end){
  if(!this.users[uid])
    return true;
  this.users[uid].x = end.x;
  this.users[uid].y = end.y;
  this.aoi.updateObject(uid, start, end);
}

pro.removeUser = function(uid){
  var user = this.users[uid];
  
  if(!user)
    return true;
    
  delete this.users[uid];
  this.channel.leave(uid);  
  this.aoi.removeObject(uid, {x:user.x, y:user.y});
  
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