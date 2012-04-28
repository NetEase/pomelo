var exec = require('child_process').exec;
//monitor the logfile
  function MonitorLog(msg,callback){
       var time=new Date().getTime()-msg.time*60*1000;
       
       var logfile=msg.logfile;
       var filePath;
       // console.error('logfile'+logfile);
       if(logfile=="con-log"){
           filePath=process.cwd()+'/logs/con-log.log';//the logfile   
       }else if(logfile=="rpc-log"){
           filePath=process.cwd()+'/logs/rpc-log.log';//the logfile   
       }
       getIndexByTime(time,filePath,function(Index){
        console.error('monitorLog index='+Index);
        if(Index<=1){
            getLogs(0,50,filePath,function(msg){
            callback({isNew:'no',logfile:logfile,dataArray:msg});
          });
        }else{
            getLogs(0,Index,filePath,function(msg){
            callback({isNew:'yes',logfile:logfile,dataArray:msg});
          });
        }
          
          
       });
};
function getIndexByTime(time,filePath,callback){
  console.error('getIndexByTime invoke!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
  var number=0;
  var n=0;
  var duration=0
  getDuration(time,filePath);
  function getDuration(time,filePath){
  console.error('getDuration invoke!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
    n++;
    
    getLogs(0,n,filePath,function(msg){
      var length=msg.length;
      if(length<1){
        return;
      }
      console.error('n='+n);
      console.error('msg.length='+msg.length);
      for(var i=0;i<msg.length;i++){
        console.error('msg='+JSON.stringify(msg[i]));
      }

      // duration_length=msg[msg.length-1].duration;
      duration_0=msg[0].duration;
      // console.error('time='+time);
      // console.error('duration_length='+duration_length);
      // console.error('duration_0='+duration_0);
      
      if(time>duration_0){
        console.error('getIndexByTime n='+n);
        callback(n-1);
        // return;
      }else{
        getDuration(time,filePath);
      }
        
     
    });  
  }
  
  

  // do{
  //   n++;
  //   getLogs(0,n,filePath,function(msg){
  //   var length=msg.length;
  //   if(length<1){
  //     return n;
  //   }
  //   duration=msg[0].duration;
  //   });
  //   // console.error('monitorLog logs '+JSON.stringify(logs)) 
  // }while(time<duration);
  // return n;

}
//get the logs last start to end
function getLogs(startIndex,endIndex,filePath,callback){
  if(startIndex>endIndex){
    callback([]);
    return;
  }
  var startLogs=[];
  var endLogs=[];
  exec('tail -n '+startIndex+' '+filePath,function(error,output){
    var startOut=output.replace(/^\s+|\s+$/g,"").split(/\s+/);
    var startLength=startOut.length==1?0:startOut.length;
    // console.error('monitorLog startLength= '+startLength);
    // // if(length<=1){return ;}
    // for(var i=0;i<startLength;i++){
    //   console.error('startOut[i] '+startOut[i]);
    //    startLogs[i]=JSON.parse(startOut[i]);
    // }
    exec('tail -n '+endIndex+' '+filePath,function(error,output){
    var endOut=output.replace(/^\s+|\s+$/g,"").split(/\s+/);
    // console.error('monitorLog endOut='+endOut);
    var endLength=endOut.length;
    // console.error('monitorLog endIndex='+endIndex);
    // console.error('monitorLog endLength= '+endLength);
    
    for(var j=0;j<endLength;j++){
      var map={};
      var json=JSON.parse(endOut[j]);
      map.route=json.route;
      map.params=JSON.stringify(json.params);
      map.time=json.time;
      map.timeUsed=json.timeUsed;
      map.serverId=json.serverId;
      map.duration=json.duration;
      endLogs.push(map);
      // console.error('endLogs[j]'+j+':'+JSON.stringify(endLogs[j]));
      if(j==(endLength-startLength-1)){
        // console.error('monitorLog endLogs length'+endLogs.length);
        callback(endLogs); 
        return;
      }
    }
    
    });

  });



}

module.exports.MonitorLog=MonitorLog;