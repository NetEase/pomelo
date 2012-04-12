/**
 * 节点日志信息
 * @param {} node
 */
var LogFile=function(node){
   this.node=node;
   this.enabled=false;
}

LogFile.prototype.broadcast=function(event,message){
    this.node.logServer.io.sockets.in('webClient').emit(event,message);
}
LogFile.prototype.bcLog=function(message){
	this.broadcast('log',message);
}
LogFile.prototype.bcPing=function(message){
	var logServer=this.node.logServer;
	logServer.messageCount++;
	logServer.io.socket.in('webClient').emit('ping',message);
}