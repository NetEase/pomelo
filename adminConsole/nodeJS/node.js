
var logFile=require('./LogFile.js');
/**
 * 
 * @param {} nodeType
 * @param {} nodeId
 * @param {} logs
 * @param {} socket
 * @param {} sever: LogServer
 */
var Node=function(nodeType,nodeId,logs,socket,sever){
	this.nodeId=nodeId;
	this.nodeType=nodeType;
	this.socket=socket;
	this.id=socket.id;
	this.logServer=sever;
	this.logFiles={};
	/**
	 * logFiles初始化------------------------?????????????--------------------
	 */
	_.each(logs,function(i,num){
		var logFile=new logFile.LogFile(this);
		this.logFiles[i]=logFile;
	});
	socket.on('log',function(message){
		var logFile=this.logFiles[message.logFile];
		logFile.bcLog(message);
	});
	socket.on('ping',function(message){
		var logFile=this.logFiles[message.logFile];
		logFile.bcPing(message);
	});
	socket.on('hisResponse',function(message){
		var wc=this.logServer.webClient[message.clientId];
		wc.socket.emit('hisResponse',message);
	});
	socket.join('nodes');
	//Notify all WebClients upon disconnect--------------?????????????????----------------
	socket.on('disconnect',function(){
		var webClients=this.logServer.webClients;
		for(var i in webClients){
		  webClients[i].removeNode(this);
		}
		socket.leave('nodes');
	});
}
exports=module.exports=Node;