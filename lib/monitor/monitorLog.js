var exec = require('child_process').exec;
//monitor the logfile
  function MonitorLog(callback){
	this.number=200;//the monitoring number
	this.filePath=process.cwd()+'/logs/monitor-log.log';//the logfile

   
    exec('tail -n '+this.number+' '+this.filePath,function(error,output){
       // var ar=JSON.stringify(output).toString().split('\\');
       // var st;
       // for(var i=0;i<ar.length;i++){
       //    st+=ar[i];
       // }

       var ar=output.replace(/^\s+|\s+$/g,"").split(/\s+/);
       var outputArray=[];
       var length=ar.length;
       for(var i=0;i<length;i++){
       	   var json=JSON.parse(ar[i]);
       	   var map={};
       	   map.route=json.route;
       	   map.params=JSON.stringify(json.params);
           outputArray.push(map);


       }
       
       // console.error('json'+JSON.stringify(json));
       // console.error('array length:'+output.length);
       // for(var i=0;i<output.length;i++){
       // 	console.error('array length:'+output.charAt(i));
       // }
       // // console.error('array length:'+output.charAt(0));
       


       callback(outputArray);

   });



};

module.exports.MonitorLog=MonitorLog;