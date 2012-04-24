/**
 * 客户端与服务端的统一逻辑模块，负责调用客户端其他接口，完成逻辑实现
 * 以及与socketClient的交互工作
 * 负责客户端的初始化工作
 */

__resources__["/serverMsgHandler.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {


	var pomelo = window.pomelo;
	var switchManager = require('switchManager'); //切换管理
	var sceneManager = require('sceneManager');
	var heroSelectView = require('heroSelectView');//选角色管理
	var rankManager = require('rankManager');//积分（排名）管理
	var tickViewManager = require('tickViewManager');
	var clientManager = require('clientManager'); //切换管理

	exports.init = init;

	function init(){
		/**
		 * 捡宝物回调
		 * @param {Object} data
		 */

		pomelo.on('area.treasureHandler.pickItem', function (result){
			if(result.success){
				//捡宝成功，删除宝物
				sceneManager.getTreasureManager().removeTreasure(result.treasureId);
			}
		});

		pomelo.on('connector.loginHandler.login', function(data){
			var userData = data.userData;
			console.log('onLogin userData: '+JSON.stringify(userData));
			if (userData.uid <= 0) {
				switchManager.selectView("heroSelectPanel");
			}else{
				pomelo.uid = userData.uid;
				pomelo.areaId = userData.sceneId;
				sceneManager.enterScene({}, userData);
				clientManager.getCurrentScene();
			}
		});

		pomelo.on('connector.loginHandler.register', function(data){
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

				pomelo.uid = userData.uid;
				pomelo.areaId = userData.sceneId;
				sceneManager.enterScene({}, userData);


				clientManager.getCurrentScene();
			}
		});

		pomelo.on('onGenerateTreasures', function(data){
			console.log('on generateTreasures invoked data  type: '+data.type+'  code: '+data.code);
			var treasures = data.body.treasures;
			sceneManager.getTreasureManager().showTreasures(treasures);
			tickViewManager.refresh(data.body.leftTime);
		});

		pomelo.on('area.onRankListChange', function(rankList){
			rankManager.refreshView(rankList);
		});
		/**
		 * 初始化场景
		 * @param data{
		 *  type:7002,
		 *  treasures:[],  //宝物信息列表
		 *  users:[],
		 * }
		 */
		pomelo.on('onGetSceneInfo', function(data){
			var treasures = data.body.treasures;
			var users = data.body.users;
			sceneManager.getRolesManager().showRoles(users);
			sceneManager.getTreasureManager().showTreasures(treasures);
		});

		pomelo.on('area.treasureHandler.getTreasures', function(data){
			//console.log('onGetTreasures: '+ JSON.stringify(data));
			var treasures = data.result;
			sceneManager.getTreasureManager().showTreasures(treasures);
		});

		pomelo.on('area.userHandler.getOnlineUsers', function(data){
			var users = data.result;
			for(var key in users){
				if(users[key].uid == pomelo.uid){
					delete users[key];
					break;
				}
			}
			sceneManager.getRolesManager().showRoles(users);
		});

		pomelo.on('onGenTimeRefresh', function(data){
			tickViewManager.refresh(data.body.leftTime);
		});

		/**
		 * 处理用户移动请求
		 */
		pomelo.on('onMove', function(data){
			console.log("User move :" + JSON.stringify(data));
			if(data.uid == pomelo.uid)
				return;
			sceneManager.getRolesManager().moveRole(data);
		});

		pomelo.on('onUserJoin',  function(data){
			console.log("新用户加入: " + JSON.stringify(data.user));
			sceneManager.getRolesManager().addRole(data.user);
		});

		pomelo.on('onUserLeave', function(data){
			console.log("用户离开: " + JSON.stringify(data.uid));
			sceneManager.getRolesManager().deleteRole(data.uid);
		});

	}
}};
