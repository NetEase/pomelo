/**
 * 客户端与服务端的统一逻辑模块，负责调用客户端其他接口，完成逻辑实现
 * 以及与socketClient的交互工作
 * 负责客户端的初始化工作
 */

__resources__["/serverMsgHandler.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {

    
	var clientManager = require('clientManager');
	var switchManager = require('switchManager'); //切换管理
	var sceneManager = require('sceneManager');
	var heroSelectView = require('heroSelectView');//选角色管理

	var rankViewManager = require('rankManager');

	var tickViewManager = require('tickViewManager');




/**
 * 处理服务端返回的消息
 * 具体的处理函数可以由页面逻辑注册
 
 */
var msgHandlerMap = {
  /**
   * 接受登录消息返回结果
   * @param data{
   *  body: {
   *    userInfo: {  用户信息
   *     userId,
   *      level,
   *      username,
   *      roleType
   *   }
   *  }
   *  code:        结果代码
   * }
   */
  'connector.loginHandler.login': onLogin,     
  
  /**
   * 接受注册消息返回结果
   * @param data{
   *  body: {
   *    userInfo: {  用户信息
   *     userId,
   *      level,
   *      username,
   *      roleType
   *   }
   *  }
   *  code：     结果代码
   * }
   */     
  'connector.loginHandler.register': onRegister,       
  
  /**
   * 接受角色选择消息返回结果
   * @param data{
   *  body: {
   *    userInfo: {  用户信息
   *     userId,
   *      level,
   *      username,
   *      roleType
   *   }
   *  }
   *  code：     结果代码
   * }
   */     
//  1003: onSelectRole,  

  /**
   * 捡宝之后的回调
   * @param data{
   *  type: 3502
   *  body: {
   *    sid:                  //用户的session id，登录时获得
   *    treasureId:           //宝物Id
   *    success:true      //捡宝是否成功
   *  }
   * }
   */
   'area.treasureHandler.pickItem':onPickTreasure,
  

  
  /**
   * 创建宝物回调
   *  @param data{
   *    type:7001
   *    body{
   *      treasureId,     //宝物Id
   *      x,              //宝物x坐标
   *      y               //宝物y坐标    
   *    }
   *    code
   *  }
   * 
   */
  'onGenerateTreasures': onGenerateTreasures, //创建宝物
  
  /**
   * 初始化场景
   * @param data{
   *  type:7002,
   *  treasures:[],  //宝物信息列表
   *  users:[],
   * }
   */
  'onGetSceneInfo': onGetSceneInfo,
  
  /**
   * 获取宝物信息
   */
  'area.treasureHandler.getTreasures': onGetTreasures,
  
  /**
   * 获取所有在线用户信息
   */
  'area.userHandler.getOnlineUsers': onGetOnlineUsers,
  
  /**
   * 新用户加入
   * @param data{
   *  
   * }
   */
  'onUserJoin': onUserJoin,
  
  /**
   * 角色移动推送消息
   * @param data{
   *    body{
   *      sid:       用户的session id
   *      userId,
   *      x,
   *      y,
   *    }
   *    code：     结果代码
   * }
   */
  //'area.userHandler.move': onUserMove,           //接受用户移动请求返回结果  
  
  'onMove': onUserMove,           //接受用户移动请求返回结果
  
  /**
   * 用户退出
   */
  'onUserLeave': onUserLeave,
  
  'onRankListChange': onRankListChange,
  
  'onGenTimeRefresh': onGenTimeRefresh
  
};



/**
 * 捡宝物回调
 * @param {Object} data
 */
function onPickTreasure(result){
	if(result.success){
		//捡宝成功，删除宝物
		sceneManager.getTreasureManager().removeTreasure(result.treasureId);
	}
}

function onLogin(data){
   var userData = data.userData;
   console.log('onLogin userData: '+JSON.stringify(userData));
   if (userData.uid <= 0) { 
//    alert("登录调用成功！用户不存在\n sessionId:" + sid + " code:" + data.code);
    //登陆成功，根据数据来判断是否需要选择角色:默认直接跳转
    switchManager.selectView("heroSelectPanel");
  }else{
//    alert("登录调用成功！用户已经存在\n sessionId:" + sid + " code:" + data.code);
//    loginUsername = "";
    clientManager.uid = userData.uid;
    sceneManager.enterScene({}, userData);

    clientManager.getCurrentScene();
  }
}

function onRegister(data){
  if(data.code == 500){
    alert("注册失败，请更换用户名重试!");
    return;
  }
    
	var userData = data.userData;
   var username = userData.username;
   var uid = userData.uid;
   if (uid <= 0) { 
//    alert("注册失败！用户不存在\n sessionId:" + data.sid + " code:" + data.code);
    //登陆成功，根据数据来判断是否需要选择角色:默认直接跳转
      switchManager.selectView("loginPanel");
  }else{
//    alert("登录调用成功！用户已经存在\n sessionId:" + data.sid + " code:" + data.code);
//    loginUsername = "";
      
      clientManager.uid = userData.uid;
      sceneManager.enterScene({}, userData);
      
      clientManager.getCurrentScene();
  }  
}

function onGenerateTreasures(data){
  console.log('on generateTreasures invoked data  type: '+data.type+'  code: '+data.code);
  var treasures = data.body.treasures;
  sceneManager.getTreasureManager().showTreasures(treasures);
  tickViewManager.refresh(data.body.leftTime);
}

function onRankListChange(data){
  rankViewManager.refreshView(data.body);
}
  /**
   * 初始化场景
   * @param data{
   *  type:7002,
   *  treasures:[],  //宝物信息列表
   *  users:[],
   * }
   */
function onGetSceneInfo(data){
  var treasures = data.body.treasures;
  var users = data.body.users;
  sceneManager.getRolesManager().showRoles(users);
  sceneManager.getTreasureManager().showTreasures(treasures);
};

function onGetTreasures(data){
  var treasures = data.result;
  sceneManager.getTreasureManager().showTreasures(treasures);
}

function onGetOnlineUsers(data){
  var users = data.result;
  for(var key in users){
    if(users[key].uid == clientManager.uid){
      delete users[key];
      break;
    }
  }
  sceneManager.getRolesManager().showRoles(users);
}

function onGenTimeRefresh(data){
	tickViewManager.refresh(data.body.leftTime);
}

/**
 * 处理用户移动请求
 */
function onUserMove(data){
  console.log("User move :" + JSON.stringify(data));
  sceneManager.getRolesManager().moveRole(data);
}

function onUserJoin(data){
  console.log("新用户加入: " + JSON.stringify(data.user));
  sceneManager.getRolesManager().addRole(data.user);
}

function onUserLeave(data){
  console.log("用户离开: " + JSON.stringify(data.uid));
  sceneManager.getRolesManager().deleteRole(data.uid);
}

//暴露的接口和对象
exports.msgHandlerMap = msgHandlerMap;

}};
