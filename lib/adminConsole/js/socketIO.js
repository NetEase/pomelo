

/**
 * webSocket连接
 */
var socket=io.connect('http://192.168.144.127:3005');

socket.on('connect',function(){
	socket.emit('announce_web_client');
    socket.on('gkMessage',function(msg){//获取“概述gkPanel”信息
//    console.log(JSON.stringify(msg));
    var nodeSize=msg.nodeSize||0;
    var requestSize=msg.requestSize||0;
    var messageSize=msg.messageSize||0;
    var startTime=msg.startTime||0;
    contentUpdate(nodeSize,requestSize,messageSize,startTime);
});
});
/*
 * 当服务端推送新数据时，更新“概况信息”gkPanel的内容
 */
var contentUpdate=function(nodeSize,requestSize,messageSize,startTime){
    document.getElementById("nodeSize").innerHTML=nodeSize;
    document.getElementById("requestSize").innerHTML=requestSize;
    document.getElementById("messageSize").innerHTML=messageSize;
    document.getElementById("startTime").innerHTML=startTime;
}