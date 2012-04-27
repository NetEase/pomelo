var exec = require('child_process').exec;
//monitor the logfile
  function MonitorLog(msg,callback){
       var number=msg.number;//the monitoring number
       var logfile=msg.logfile;
       var filePath;
       // console.error('logfile'+logfile);
       if(logfile=="con-log"){
           filePath=process.cwd()+'/logs/con-log.log';//the logfile   
       }else if(logfile=="rpc-log"){
           filePath=process.cwd()+'/logs/rpc-log.log';//the logfile   
       }
	
    // console.error('filePath'+filePath);
   
    exec('tail -n '+number+' '+filePath,function(error,output){
      

       var ar=output.replace(/^\s+|\s+$/g,"").split(/\s+/);
       // console.error('ar length'+ar.length);
       var outputArray=[];
       var length=ar.length;
       
       if(length<=1){
       	return;
       }
       for(var i=0;i<length;i++){
           // console.error('monitorLog  ar[i]'+ar[i]);
       	   var json=JSON.parse(ar[i]);
       	   var map={};
       	   map.route=json.route;
       	   map.params=JSON.stringify(json.params);
       	   map.time=json.time;
           map.timeUsed=json.timeUsed;
           map.serverId=json.serverId;
           outputArray.push(map);


       }
       var re={dataArray:outputArray,logfile:logfile};
       
       callback(re);

   });



};

module.exports.MonitorLog=MonitorLog;