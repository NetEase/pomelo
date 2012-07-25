var UserService = module.exports;
var logger = require('../../../../lib/util/log/log').getLogger(__filename);
var comConst = require('../config/constant');
var ServerConstant = require('../config/serverConstant');
var WGError = require('../meta/WGError');
var pomelo = require('../../../../lib/pomelo');

var User = require('../meta/user');
var utils = require('../../../../lib/util/utils');

var ServerConstant = require('../config/serverConstant');
/**
 * 用户登录信息
 * @param username
 * @param passwd
 * @param cb
 */
UserService.getUserInfo = function (username, passwd, cb){
	  var sql = 'select * from  Hero where username = ?';
	  var args = [username];
	  pomelo.getApp().dbclient.query(sql,args,function(err, res){
		    if(err !== null){
			      utils.invokeCallback(cb, new WGError(comConst.RES_CODE.ERR_FAIL, err.message), null);
		    } else {
			      var userId = 0;
			      if (!!res && res.length==1) {
				        var rs = res[0];
				        userId = rs.id;
				        var roleId = rs.roleId;
				        var name = rs.name;
				        //var user = User.create();
				        //logger.debug("roleId :" + roleId + " name: " + name);
				        utils.invokeCallback(cb,null,{uid:userId, username: username, roleId:roleId, name:name, level:rs.level, sceneId:rs.sceneId, x:rs.x, y:rs.y});
			      } else {
				        utils.invokeCallback(cb,null,{uid:0, username:username});
			      }
		    }
	  });
};
/**
 * 根据用户名得到用户信息
 * @param username
 * @param passwd
 * @param cb
 */
UserService.getUserByName = function (username, passwd, cb){
	  var sql = 'select * from  Hero where username = ?';
	  var args = [username];
	  pomelo.getApp().dbclient.query(sql,args,function(err, res){
		    if(err !== null){
			      utils.invokeCallback(cb,new WGError(comConst.RES_CODE.ERR_FAIL, err.message), null);
		    } else {
			      var userId = 0;
			      if (!!res && res.length==1) {
				        var rs = res[0];
				        userId = rs.id;
				        var roleId = rs.roleId;
				        var name = rs.name;
				        var user = User.create({uid:userId, username: username, roleId:roleId, name:name, level:rs.level, sceneId:rs.sceneId, x:rs.x, y:rs.y});
				        utils.invokeCallback(cb,null,user);
			      } else {
				        utils.invokeCallback(cb,new WGError(comConst.RES_CODE.ERR_FAIL, ' user not exist '),{username:username});
			      }
		    }
	  });
};
/**
 * 根据用户ID得到用户信息
 * @param userId
 * @param cb
 */
UserService.getUserById = function (uid, cb){
	  var sql = 'select * from  Hero where id = ?';
	  var args = [uid];
	  pomelo.getApp().dbclient.query(sql,args,function(err, res){
		    if(err !== null){
			      utils.invokeCallback(cb,new WGError(comConst.RES_CODE.ERR_FAIL, err.message), null);
		    } else {
			      if (!!res && res.length==1) {
				        var rs = res[0];
				        var userId = rs.id;
				        var roleId = rs.roleId;
				        var name = rs.name;
				        var username = rs.username;
				        var user = User.create({uid:userId, username: username, roleId:roleId, name:name, level:rs.level, sceneId:rs.sceneId, x:rs.x, y:rs.y});
				        utils.invokeCallback(cb,null,user);
			      } else {
				        utils.invokeCallback(cb,new WGError(comConst.RES_CODE.ERR_FAIL, ' user not exist '),null);
			      }
		    }
	  });
};
/**
 * 根据用户删除用户
 * @param username
 * @param cb
 */
UserService.deleteByName = function (username, cb){
	  var sql = 'delete from  Hero where username = ?';
	  var args = [username];app.pomelo.getApp().bclient.query(sql,args,function(err, res){
		    if(err !== null){
			      utils.invokeCallback(cb,new WGError(comConst.RES_CODE.ERR_FAIL, err.message), null);
		    } else {
			      if (!!res && res.affectedRows>0) {
				        utils.invokeCallback(cb,null,true);
			      } else {
				        utils.invokeCallback(cb,null,false);
			      }
		    }
	  });
};
/**
 * 注册用户
 * @param username 用户名
 * @param name 	 游戏名
 * @param roleId 角色ID
 */
UserService.register = function (username,name,roleId,cb){
	  var sceneId = ServerConstant.sceneId,level = ServerConstant.level , x = ServerConstant.x,y = ServerConstant.y;
	  var sql = 'insert into Hero (username,name,roleId,sceneId,level,x,y) values(?,?,?,?,?,?,?)';
	  var args = [username,name,roleId,sceneId,level,x,y];
	  pomelo.getApp().dbclient.insert(sql, args, function(err,res){
		    if(err !== null){
			      utils.invokeCallback(cb,new WGError(comConst.RES_CODE.ERR_FAIL, err.message), null);
		    } else {
			      var userId = res.insertId;
			      var user = User.create({uid:userId,username:username,roleId:roleId,name:name,level:level,sceneId:sceneId,x:x,y:y});
			      utils.invokeCallback(cb,null,user);
		    }
	  });
};
