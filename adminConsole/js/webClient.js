
var webClient=function(io){
  this.node={};
  this.ids={};
  this.status={
  	messages:0,
  	nodes:0,
  	log_nodes:0,
  	log_files:0,
  	start:new Date()
  };
  this.connected=false;
  this.isInited=false;
//  var wc=this;
  this.socket=io.connect('http://app47v4.photo.163.org:3005');
  this.socket.on('connect',function(){
    this.connected=true;
  });
  this.socket.on('getNode',function(servers){
    if(this.isInited) return;
    this.isInited=true;
    for(var serverType in servers){
    	var typeServers=servers[serverType];
    	var ids=[];
    	for(var i=0;i<typeServers.length;i++){
    	  ids.push(typeServers[i].id);
    	}
    	this.addNode(serverType,ids);
    }  
  });
};
webClient.prototype.addNode=function(nodeType,ids,logs){
	var 
}