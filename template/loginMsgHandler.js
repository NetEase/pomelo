__resources__["/loginMsgHandler.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {

	var pomelo = window.pomelo;
	var clientManager = require('clientManager');

	exports.init = init;

	function init(){
		pomelo.on('connector.loginHandler.login', function(data){
           alert("welcome to pomelo:"+data.user);
		});

	}
}};
