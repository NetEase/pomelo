var io=require('socket.io');
var node=require('./node.js');
var wc=require('./webClient.js');
var app=require('../pomolo').getApp();
var logger=require('../util/log/log').getLogger(__filename);

var STATUS_INTERVAL = 60 * 1000; // 60 seconds
var HEARTBEAT_INTERVAL = 30 * 1000; // 20 seconds

var clients={};
var clientStatus={};
var STARTED=0;
var CONNECTED=1;

var LogServer=function(){
	this.log=logger;
	this.nodes={};
	this.webClients={};
	this.messageCount=0;
	
	setInterval(function(){
	  this.log.info("Nodes:"+this.node.size()+","+"WebClients:"+this.webClients.size()+
	  +","+"Message Sent:"+this.messageCount);
	},STATUS_INTERVAL)
};
var ls=LogServer.prototype;
ls.listen=function (port){
	this.io=io.listen(port);
	this.register();
};
ls.announceNode=function(socket,message){
    var nodeId=message.node.id;
    var nodeType=message.node.type;
    var logs=message.logs;
    
    if(this.nodes[nodeId]){
      this.log.warn("Warning: Node '" + nodeId + "' already exists, ignoring");
    }
    var node=node.Node(nodeType,nodeId,logs, socket, this);
    this.nodes[nodeId]=node;
    for(var webClient in this.webClients){
      webClient.addNode(node);
    }
    socket.on('disconnect',function(){
       delete this.nodes[nodeId];
    });
    socket.on('clientMessage',function(msg){
        this.io.socket.in('webClient').emit('webMessage',msg);
    });
    this.checkReady();
    
};
ls.register=function(){
    this.io.set('log level',1);
    this.io.socket.on('connection',function(socket){
    
    	socket.on('announceNode',function(message){
    	  this.log.info("Registering new node" + JSON.stringify(message));
    	  this.announceNode(socket,message);
    	});
    	socket.on('announceWebClient',function(message){
    	  this.announceWebClient(cocket);
    	});
    	socket.on('webMessage', function(msg) {
            //console.log('master server get webmessage: ' + JSON.stringify(msg));
    		if(!msg || !msg.method) {return;}
    	  	var serverId = msg.id;
    	  	var sysInfo = '';
    			if (!this.nodes[serverId]){
    	  		sysInfo = 'can not connect to client ' + serverId;
    	  		socket.emit('webMessage',{method:msg.method,data:sysInfo});
    	  	}	else {
    	  		var node = this.nodes[serverId];
    	  		node.socket.emit('clientMessage',msg);
    	  	}
     			return ;
    		});	//on message end
    		socket.on('quit', function() {
              app.quit();
     		  return ;
    		});	//on message end
    		
    });
    setInterval(function() {
      this.io.sockets.in('webClients').emit('stats', {
        message_count: log_server.message_count
      });
    }, 1000);

    // Broadcast heartbeat to all clients
    setInterval(function() {
      this.io.sockets.emit('heartbeat');
    }, HEARTBEAT_INTERVAL); 
};
ls.checkReady=function(){
	logger.info('master server begin check all server was connected to server...');
		var allStarted = true;
		var log_server = this;
		var servers = app.servers;
		for (serverType in servers){
			if (serverType==='master') continue;
			var typeServers = servers[serverType];
		  for (var i=0; i < typeServers.length; i++){
		    var server = typeServers[i];	
				if(!log_server.nodes[server.id]){
					allStarted = false;
					logger.warn(' server not ready.waiting from ' + server.id + ' connect.......');
					}
		   }
		}
		if (allStarted){
			logger.info('begin notify to connect each other');
			for (var id in log_server.nodes){
				log_server.nodes[id].socket.emit('afterstart');
			}
		}
};
ls.announceWebClient=function(socket){
    var webClient=new wc.WebClient(socket,this);
    this.webClients[webClient.id]=webClient;
    
    for(var node in this.nodes){
      webClient.addNode(node);
    }
    socket.on('disconnect',function(){
       delete this.webClients[webClient.id];
    })
};
 // Broadcast stats to all clients
    
 ls.getNode=function(msg){
  	msg.socket.emit(msg.method,app.servers);
  };

exports=module.exports=LogServer;




























