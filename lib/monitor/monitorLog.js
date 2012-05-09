var exec = require('child_process').exec;
//monitor the logfile

function getIndexByTime(time,logfile,filePath,callback) {
  var number=0;
  var n=0;
  var duration=0;
  function getDuration(time,filePath) {
    n++;
    getLogs(0,n,logfile,filePath,function(msg){
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
  getDuration(time,filePath);
};

//get the logs last start to end
function getLogs(startIndex,endIndex,logfile,filePath,callback) {
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
				map.route=json.route||json.service;
				map.params='';
				if(!!json.params){
					map.params=JSON.stringify(json.params);
				}else{
					for(var i=0;i<json.args.length;i++){
						map.params+=JSON.stringify(json.args[i]);
					}
				}

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
};

function MonitorLog(msg,callback){

	var time=new Date().getTime()-msg.time*60*1000;
	var logfile=msg.logfile;
	var serverId=msg.serverId;
	var number=msg.number;
	var flag=msg.flag;
	var filePath;
	if(logfile=="con-log"){
		filePath=process.cwd()+'/logs/con-log-'+serverId+'.log';//the logfile
	}else if(logfile=="rpc-log"){
		filePath=process.cwd()+'/logs/rpc-log-'+serverId+'.log';//the logfile
	}else if(logfile=="for-log"){
		filePath=process.cwd()+'/logs/forward-log-'+serverId+'.log';//the logfile
	}

	getIndexByTime(time,logfile,filePath,function(Index){
		if (Index<=1) {
			callback({serverId:serverId,logfile:logfile,dataArray:[]});
		}else{
			getLogs(0,Index,logfile,filePath,function(msg){
				callback({logfile:logfile,dataArray:msg});
			});
		}
	});
};

module.exports.MonitorLog=MonitorLog;
