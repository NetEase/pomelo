__resources__["/client.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {

    
	var socket;
	//收到消息的处理方法，在初始化时由外部注入
    
	var serverMsgHandler = require('serverMsgHandler');
	var clientManager = require('clientManager');

	//暴露的接口
	exports.init = init;
	exports.pushMessage = pushMessage;


	function pushMessage(msg){
      console.log('[client.pushMessage], msg: '+msg.route+ ' params:'+JSON.stringify(msg.params));
	    if(!!msg){
	      msg = filter(msg);
        socket.emit('message', msg);
      }else
        console.log('Error message type!');
	}

	function init(params){
	  //使用参数值进行初始化
	  //线上的配置
	  socket = io.connect('http://'+window.location.hostname+':3050');
	  
	  socket.on('connect', function(data){
	    console.log("On connect, yes we connected");
	  });


	  socket.on('message', function(data){
	  	console.log('on message:' + JSON.stringify(data));
	    var route = data.route;
	    var code = data.code;
	    if(!route){
	      console.log('Message type error! data: ' + JSON.stringify(data));
	    }
	    var msgHandler = serverMsgHandler.msgHandlerMap[route];
	    if(!!msgHandler && typeof(msgHandler)=='function')
	      msgHandler(data);
	  });
	}

  function filter(msg){
    if(msg.route.indexOf('area.') == 0){
      msg.areaId = clientManager.areaId;
    }
    return msg;
  }
}};