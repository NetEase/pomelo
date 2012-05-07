/**
 * 客户端与服务端的统一逻辑模块，负责调用客户端其他接口，完成逻辑实现
 * 以及与socketClient的交互工作
 * 负责客户端的初始化工作
 */

__resources__["/clientManager.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {

//var clientManager = require('Manager');
var heroSelectView = require('heroSelectView');//选角色管理

var pomelo = window.pomelo;
var serverMsgHandler = require('serverMsgHandler');

var loginUsername = "";
var loginName = "";

//暴露的接口和对象
exports.init = init;
exports.login = login;
exports.register = register;
exports.pickTreasure = pickTreasure;
exports.move = move;
exports.getCurrentScene = getCurrentScene;
exports.transferUser = transferUser;
exports.getOnlineUsers = getOnlineUsers;
exports.getTreasures = getTreasures;

var self = this;


function init(){
  //初始化socketClient
  // pomelo.init({socketUrl:'ws://localhost:3050', log:true});
  serverMsgHandler.init();
}

// pomelo.on('connector.loginHandler.login', function(data){
//  	console.log('clientManager.onLogin data '+ data);
// });
// //
/**
 * 登录逻辑，对应的推送消息格式:
 *     msg = {
 *      type: 1001            //消息类型
 *      body: {
 *        sid: ,              //用户的session id，登录时获得
 *        treasureId:         //宝物Id
 *      }
 *    }
 */
function login(){
  var username = document.getElementById('loginUser').value;
  var pwd = document.getElementById('loginPwd').value;

  if (!username) {
      alert("请输入用户名");
      return;
  }
  // 登陆处理
  loginUsername = username;
  if(localStorage){
    localStorage.setItem('username', username);
  }
  pomelo.init({socketUrl: window.__front_address__, log: true}, function() {
    pomelo.pushMessage({route:"connector.loginHandler.login", params:{username: username, password: pwd}});
  });
}

/**
 * 注册逻辑,对应的消息格式：
 *  msg = {
 *    type: 1002,
 *    body: {
 *      username:   //用户名
 *      password:   //密码
 *      roleType:   //角色类型
 *    }
 *  }
 */
function register(){
  var roleId = heroSelectView.roleId();
  var name = document.getElementById('gameUserName').value;
  var pwd = "pwd";

  if (!loginUsername || !name) {
    alert("角色名不能为空");
  }
  else if(name.length > 9){
    alert('干嘛蛋疼取这么长的名字。。。');
  }
  else {
    pomelo.pushMessage({route:"connector.loginHandler.register", params:{username: loginUsername, name: name, password: pwd, roleId: roleId}});
  }
}

/**
 * 注册用户并获取当前场景信息
 */
function getCurrentScene(){
  addUser();
  getOnlineUsers();
  getTreasures();
}

/**
 * 获取所有宝物信息
 */
function getTreasures(){
  pomelo.pushMessage({route:"area.treasureHandler.getTreasures", params:{uid: pomelo.uid, areaId: pomelo.areaId}});
}

/**
 * 获取所有人物信息
 */
function addUser(){
  pomelo.pushMessage({route:"area.userHandler.addUser"});
}

function getOnlineUsers(){
  pomelo.pushMessage({route:"area.userHandler.getOnlineUsers", params:{uid: pomelo.uid, areaId: pomelo.areaId}});
}

/**
 * 用户移动的处理逻辑
 * msg{
 *  type: 3501,
 *  body: {
 *    sid:                    //用户的session id，登录时获得
 *    path:[{x:,y:}]     //移动的坐标列表，坐标格式为{x: x轴坐标, y: y轴坐标 },第一个坐标为起点，最后一点为终点
 *    speed:
 *  }
 * }
 */
function move(startX, startY, endX, endY, time){
  path = [{x:startX, y:startY},{x:endX, y:endY}];
  pomelo.pushMessage({route:"area.userHandler.move", params:{path: path, time: time,uid: pomelo.uid, areaId: pomelo.areaId}});
}

/**
 * 当前用户捡起宝物
 * msg{
 *  type: 3502
 *  body: {
 *    sid:                  //用户的session id，登录时获得
 *    treasureId:           //宝物Id
 *  }
 * }
 */
function pickTreasure(treasureId){
  pomelo.pushMessage({route:"area.treasureHandler.pickItem", params:{treasureId: treasureId, areaId: pomelo.areaId}});
}

function transferUser(target){
  pomelo.pushMessage({route:"area.userHandler.transferUser", target:target});
}
}};
