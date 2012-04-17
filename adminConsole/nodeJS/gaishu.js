var sio=require('socket.io');

var Gaishu={};

Gaishu.prototype.getGaishu=function(socket){
  setInterval(function(){
  console.log('socket setTimeout!');
  var msg={nodeSize:8,requestSize:120,messageSize:120,startTime:100};
  socket.emit('gkMessage',msg);
  },1000);
};


module.exports=Gaishu;
