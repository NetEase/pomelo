__resources__["/client.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {

    
	var socket;
	//收到消息的处理方法，在初始化时由外部注入
    
	var serverMsgHandler = require('serverMsgHandler');

	//暴露的接口
	exports.init = init;
	exports.pushMessage = pushMessage;


	function pushMessage(msg){
	  if(!!msg){
        msg.timeStamp = new Date().getTime();
	    socket.emit('message', msg);
	  }
	  else {
	    console.log('Error message type!');
	  }
	}

	function init(params){
	  //使用参数值进行初始化
	  //线上的配置
	  socket = io.connect('http://localhost:5050');
	  
	  socket.on('connect', function(data){
	    console.log("On connect, yes we connected" + data);
	  });


	  socket.on('message', function(data){
	    var type = data.type;
	    var code = data.code;
	    if(!type){
	      console.log('Message type error!');
	      if (data.code == -1) alert(data.msg);
	    }
	    console.log('received message type: '+data.type+' code:'+data.code+' body:'+ JSON.stringify(data));
	    
	    var msgHandler = serverMsgHandler.msgHandlerMap[type];
        
//	    msgHandler = msgHandlerMap[type];
	    if(!!msgHandler && typeof(msgHandler)=='function')
	      msgHandler(data);
	  });
	}


}};