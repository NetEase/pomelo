var exec = require('child_process').exec;
//monitor the logfile
  function MonitorLog(msg,callback){

       var time=new Date().getTime()-msg.time*60*1000;
       var logfile=msg.logfile;
       var serverId=msg.serverId;
       var number=msg.number;
       var flag=msg.flag;
       var filePath;
       console.error('monitorLog msg'+JSON.stringify(msg));
       if(logfile=="con-log"){
           filePath=process.cwd()+'/logs/con-log-'+serverId+'.log';//the logfile
       }else if(logfile=="rpc-log"){
           filePath=process.cwd()+'/logs/rpc-log-'+serverId+'.log';//the logfile
       }

       console.error('monitorLog invoke!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!'+serverId);
       getIndexByTime(time,filePath,function(Index){
        console.error('monitorLog index='+serverId+'~~~~~~~~~~~~~~~~~~~'+Index);
          if(Index<=1){
            callback({serverId:serverId,logfile:logfile,dataArray:[]});
          }else{
            console.error('else Invoke!');
            getLogs(0,Index,filePath,function(msg){
            console.error('else msg'+msg.length);
            callback({logfile:logfile,dataArray:msg});
          });
          }
       });
};

function getIndexByTime(time,filePath,callback) {
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
      duration_0=msg[0].duration;
      if(time>duration_0){
        console.error('getIndexByTime n='+n);
        callback(n-1);
        // return;
      }else{
        getDuration(time,filePath);
      }


    });
  }
}
//get the logs last start to end
function getLogs(startIndex,endIndex,filePath,callback) {
  if(startIndex>endIndex){
    callback([]);
    return;
  }
  var startLogs=[];
  var endLogs=[];
  exec('tail -n '+startIndex+' '+filePath,function(error,output){
    var startOut=output.replace(/^\s+|\s+$/g,"").split(/\s+/);
    var startLength=startOut.length==1?0:startOut.length;
    exec('tail -n '+endIndex+' '+filePath,function(error,output){
    var endOut=[];
    output=output.replace(/^\s+|\s+$/g,"").split(/\s+/);
    for(var i=5;i<output.length;i+=6){
      endOut.push(output[i]);
    }

    var endLength=endOut.length;
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
      if(j==(endLength-startLength-1)){
        callback(endLogs);
        return;
      }
    }
    });
  });
}

module.exports.MonitorLog=MonitorLog;
