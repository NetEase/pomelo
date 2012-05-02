var exec = require('child_process').exec;
var util=require('../utils/util');
var async=require('async');
var processMonitor=module.exports;


/**
 * get the process data by command 'ps auxw |grep 'node'|grep -v 'grep'|grep -v 'cd''
 */
function getPsInfo(server,callback){
	var masterFlag=server.masterFlag;
	masterFlag=='yes'?serverId='node':serverId=server.serverId;

	exec("ps auxw |grep 'node'|grep -v 'grep'|grep -v 'cd'|grep "+serverId,function(error,output){
		if(error!=null){
			console.error('exec error:'+error);
			return;
		}
        format(server,output,callback);
	});
};
//test
function format(server,data,cb){
	var timestamp=new Date();
	var time=util.formatTime(timestamp);

	var outData=data.toString();
	var outArray=outData.replace(/^\s+|\s+$/g,"").split(/\s+/);
	var counter=0;
	var outValueArray=[];
	var outdata=[];
	var redata=[];
	var pids=[];
	for(var i=0;i<outArray.length;i++){
		if((!isNaN(outArray[i]))){
			outValueArray[counter]=outArray[i];
			counter++;
		}
	}
		var ps={};
		ps.time=time;
		ps.serverId=server.serverId;
		ps.serverType=serverId.split('-')[0];
		var pid=ps.pid=outValueArray[0];
		ps.cpuAvg=outValueArray[1];
		ps.memAvg=outValueArray[2];
		ps.vsz=outValueArray[3];
		ps.rss=outValueArray[4];
		exec('pidstat -p '+pid,function(error,output){
			 var outArray=output.toString().replace(/^\s+|\s+$/g,"").split(/\s+/);
			 for(var i=0;i<outArray.length;i++){
		     if((!isNaN(outArray[i]))){
			 outValueArray[counter]=outArray[i];
			 counter++;
		     }
		 }
		 ps.usr=outValueArray[1];
		 ps.sys=outValueArray[2];
		 ps.gue=outValueArray[3];
		 cb(ps);
		});

}
//it is unuseful
function format_delete(data,timestamp,cb,interval){
	var outData=data.toString();
	var outArray=outData.replace(/^\s+|\s+$/g,"").split(/\s+/);
//	console.error(outArray);
	if(typeof(interval)=='undefined'){
		interval=0;
	}
	var counter=0;
	var outValueArray=[];
	var outdata=[];
	var redata=[];
	var pids=[];
	for(var i=0;i<outArray.length;i++){
		if((!isNaN(outArray[i])||(outArray[i].indexOf('server')!=-1))){
			outValueArray[counter]=outArray[i];
			counter++;
		}
	}
//	console.log(outValueArray);
	for(var j=0;j<outValueArray.length;j++){
		if(isNaN(outValueArray[j])){
			var ps={};
			ps.time=timestamp;
			var serverId=ps.serverId=outValueArray[j];
			
			ps.serverType=serverId.split('-')[0];
			var pid=ps.pid=outValueArray[j-5];
			pids.push(pid);
			ps.cpuAvg=outValueArray[j-4];
			ps.memAvg=outValueArray[j-3];
			ps.vsz=outValueArray[j-2];
			ps.rss=outValueArray[j-1];
			
			outdata.push(ps);
		}
	}
	async.map(outdata,function(oneData){
		var pid=oneData.pid;
		var outValueArray=[];
    	var counter=0;
		exec('pidstat -p '+pid,function(error,output){
			 var outArray=output.toString().replace(/^\s+|\s+$/g,"").split(/\s+/);
			 for(var i=0;i<outArray.length;i++){
		     if((!isNaN(outArray[i]))){
			 outValueArray[counter]=outArray[i];
			 counter++;
		     }
		 }
		 oneData.usr=outValueArray[1];
		 oneData.sys=outValueArray[2];
		 oneData.gue=outValueArray[3];

		 redata.push(oneData);
		 cb(redata);
		});
		
	},function(error){
		

	});

}

module.exports.getPsInfo=getPsInfo;












