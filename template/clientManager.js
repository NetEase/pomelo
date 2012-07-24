__resources__["/clientManager.js"] = {
	meta: {
		mimetype: "application/javascript"
	},
	data: function(exports, require, module, __filename, __dirname) {

		var pomelo = window.pomelo;
		var loginMsgHandler = require('loginMsgHandler');
	 	var clientManager = require('clientManager'); //切换管理

		var loginUsername = "";
		var loginName = "";

		//暴露的接口和对象
		exports.init = init;
		exports.login = login;

		var self = this;

		function init(){
		  loginMsgHandler.init();
		}
		
    function login(){
		  var username = document.getElementById('loginUser').value;
		  var pwd = document.getElementById('loginPwd').value;
		  if (!username) {
		      alert("请输入用户名");
		      return;
		  }
        pomelo.init({socketUrl: window.__front_address__, log: true}, function() {
        pomelo.request({
            route:"connector.loginHandler.login",
            username:
            username, password: pwd
          }, function(data) {
            var user = data.user;
            var player = data.player;
          });
      });
		}
}};
