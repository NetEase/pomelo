define(function(require, exports, module) {

var socket;
//收到消息的处理方法，在初始化时由外部注入
var msgHandlerMap;

//暴露的接口
exports.init = init;


function init(params){
  //使用参数值进行初始化
  //msgHandlerMap = params.msgHandlerMap;
  //线上的配置
	pomelo.init({socketUrl: window.__front_address__, log: true});


  pomelo.on('message', function(data){
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
