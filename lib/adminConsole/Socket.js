//var app=require('./appCon');
var sio=require('socket.io');
//var logServer=require('../master/log_server');
var __= require('underscore');

var io=sio.listen(3008);
//io.sockets.on('connection',function(socket){
// setInterval(function(){
//  console.log('socket setTimeout!');
//  var msg={nodeSize:__(logServer.nodes).size(),requestSize:__(logServer.web_clients).size(),messageSize:logServer.message_count,startTime:100};
//  socket.emit('gkMessage',msg);
//  },1000);
//});
