
var WebClient=function(socket,server){
	this.logServer=server;
	this.socket=socket;
	this.id=socket.id;
	this.watchingLogs=[];
    
	function logFileHelper(message,func){
	  var logFile=this.getLogFile(message.node,message.logFile);
	  if(logFile==null){
	    return;
	  }else{
	    return func(logFile);
	  }
	};
//	socket.on('enableLog',function(message){
//	
//		logFileHelper(message,function(logFile){
//		  logFile.
//		})
//	});
	socket.join('webClients');
};
var wc=WebClient.prototype;
wc.getLogFile=function(node,logfile){
	if(this.logServer.nodes[node]){
	    return this.logServer.nodes[node].logFiles[logFile];
	}else{
	    return null;
	}
};
wc.addNode=function(node){
    this.socket.emit('addNode',{
        nodeId:node.nodeId,
        nodeType:node.nodeType,
        logs:node.logFiles.keys()
    });
};

