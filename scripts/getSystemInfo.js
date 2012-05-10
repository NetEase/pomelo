var systemInfo={};
monitor.sysmonitor.getSysInfo(function(msg){
  systemInfo=msg;
 JSON.stringify(systemInfo);
})