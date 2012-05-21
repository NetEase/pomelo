var os = require('os');
var util=require('../utils/util');

var systemMonitor = module.exports;

var info = { };

function getSysInfo(callback){
  var result = {};
  
  for(var key in info){
    result[key] = info[key]();
  }  
  //get the disk i/o data by command 'iostat'
  var exec = require('child_process').exec;
    exec('iostat ',function(error,output){
		if(error!==null){
			console.error('exec error:'+error);
		}else{
			var timestamp=new Date();
			var time=util.formatTime(timestamp);
			result.iostat=format(output,time);
		}
		callback(result);
		
    })

}
info.hostname = os.hostname;

info.type = os.type;

info.platform = os.platform;

info.arch = os.arch;

info.release = os.release;

info.uptime = os.uptime;

info.loadavg = os.loadavg;

//Total memory usage
info.totalmem = os.totalmem;

//Free memory usage 
info.freemem = os.freemem;

info.cpus = os.cpus;

info.networkInterfaces = os.networkInterfaces;


info.versions = function(){return process.versions};

info.arch = function(){return process.arch};

info.platform = function(){return process.platform};

info.memoryUsage = process.memoryUsage;

info.uptime = process.uptime;



/**
 * resolve the disk i/o data,return a map contains kb_read,kb_wrtn ect.
 */
function format (data, timestamp, interval) {
  var output_data = data.toString();
  var output_array = output_data.replace(/^\s+|\s+$/g,"").split(/\s+/);
//  console.error('outputArray:'+output_array.toString());
  if(typeof(interval) == "undefined")
    interval = 0;


  var counter = 0;
  var output_values = new Array();
  for (var i=0; i < output_array.length; i++) {
    if(!isNaN(output_array[i])){
      output_values[counter] = parseFloat(output_array[i]);
      counter++;
    }
  }

  var error = 0;
  for (var i=0; i< output_values.length; i++){
    if(typeof(output_values[i]) == 'undefined')
      error = 1;
  }
//console.error('output_values:'+output_values.toString());
  if((output_values.length > 0) && (error == 0)){
    output_hash = {
      date: timestamp,
      interval: interval,
      disk:{
        kb_read:output_values[9],
        kb_wrtn:output_values[10],
        kb_read_per:output_values[7],
        kb_wrtn_per:output_values[8],
        tps:output_values[6]
      },
      cpu:{
        cpu_user:output_values[0],
        cpu_nice:output_values[1],
        cpu_system:output_values[2],
        cpu_iowait:output_values[3],
        cpu_steal:output_values[4],
        cpu_idle:output_values[5]
      }
    }
    return output_hash;
  }
}


module.exports.getSysInfo = getSysInfo;