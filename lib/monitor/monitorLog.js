var exec = require('child_process').exec;

var MonitorLog=module.exports;
//monitor the logfile,it is no-userful
 MonitorLog.init=function (msg,callback){
      
       var time=new Date().getTime()-msg.time*60*1000;
       var logfile=msg.logfile;
       var serverId=msg.serverId;
       var number=msg.number;
       getIndexByTime(time,logfile,filePath,function(Index){
          if(Index<=1){
            callback({serverId:serverId,logfile:logfile,dataArray:[]});
          }else{
            getLogs(Index,logfile,filePath,function(msg){
            callback({logfile:logfile,dataArray:msg});
          });
          }
       });
};
//Recursive get the index by time,it is no-userful
MonitorLog.getIndexByTime= function (time,logfile,filePath,callback){
  var number=0;
  var n=0;
  var duration=0
  getDuration(time,filePath);
  function getDuration(time,filePath){
    n++; 
    getLogs(n,logfile,function(msg){
      var length=msg.length;
      if(length<1){
        return;
      }
      duration_0=msg[0].duration;
      if(time>duration_0){
        callback(n-1);
      }else{
        getDuration(time,filePath);
      }
    });  
  }
}
//get the latest logs 
MonitorLog.getLogs=function(msg,callback){
  var number=msg.number;
  var logfile=msg.logfile;
  var serverId=msg.serverId;
  var filePath;
   if(logfile=="con-log"){
         filePath=process.cwd()+'/logs/con-log-'+serverId+'.log';//the logfile   
     }else if(logfile=="rpc-log"){
         filePath=process.cwd()+'/logs/rpc-log-'+serverId+'.log';//the logfile   
     }else if(logfile=="for-log"){
         filePath=process.cwd()+'/logs/forward-log-'+serverId+'.log';//the logfile  
     }
  var endLogs=[];
    exec('tail -n '+number+' '+filePath,function(error,output){
    var endOut=[];
    output=output.replace(/^\s+|\s+$/g,"").split(/\s+/);
      for(var i=5;i<output.length;i+=6){
      endOut.push(output[i]);
      }
    var endLength=endOut.length;
    for(var j=0;j<endLength;j++){
      var map={};
      var json=JSON.parse(endOut[j]);
      map.time=json.time;
      map.route=json.route||json.service;
      map.serverId=serverId;
      // map.duration=json.duration;
      map.timeUsed=json.timeUsed;
      map.params=endOut[j];
      endLogs.push(map);
    }
    callback({logfile:logfile,dataArray:endLogs}); 
    });
  
}

  
