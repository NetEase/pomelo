define(function(require, exports, module) {
    
var socket;
//收到消息的处理方法，在初始化时由外部注入
var msgHandlerMap;

//暴露的接口
exports.init = init;
exports.pushMessage = pushMessage;


function pushMessage(msg){
  if(!!msg)
    socket.emit('message', msg);
  else
    console.log('Error message type!');
}

function init(params){
  //使用参数值进行初始化
  //msgHandlerMap = params.msgHandlerMap;
  //线上的配置
  socket = io.connect('http://localhost:3050');
  
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
    document.getElementById('result').value += JSON.stringify(data);
//    msgHandler = msgHandlerMap[type];
//    if(!!msgHandler && typeof(msgHandler)=='function')
//      msgHandler(data);
  });
}


});