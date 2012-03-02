var pomelo = require('../../lib/pomelo');
var logFilter = require('../../lib/filters/logFilter');
var handlerManager = require('../../lib/handlerManager');

var app = module.exports = pomelo.createApplication();


var args = process.argv;
// config
var env = 'development';

if (args.length > 2){
    env = args[2];
}

var serverType = 'all';  // if dev, means all server
var serverId = '';

if ((args.length >= 4) && (env == 'production')){
  serverType = args[3];  //  area, logic, login or other servers
  serverId = args[4]==undefined?null:args[4];
}


app.set('name', 'webrunner');
app.set('env', env);
app.set('serverType', serverType);
app.set('serverId', serverId);

console.log('before app.configure with ' + '[serverType]:' + serverType + ' [serverId]:'  + serverId);

app.configure(function(){
	  //app.use(app.router); //filter out requests
	  app.use(logFilter); //filter out requests
	  app.set('scheduler', '../config/scheduler.coffee');
	  app.enabled('scheduler');
	  
	   // 全部生成代理
	  app.genRemote('../lib/connector/remote');
	  
	  //user proxy
	  app.genHandler('./app/connector/handler');
	  app.genRemote('./app/connector/remote');
	  app.genHandler('./app/area/handler');
	  app.genRemote('./app/area/remote');
	  app.genHandler('./app/logic/handler');
	  app.genRemote('./app/logic/remote');
      
});

// use is filter
app.configure('development',function(){
  app.set('servers', __dirname+'/config/servers-development.json');
  app.set('database',__dirname+'/config/database.json');
  
  app.listenAll(app.get('servers'));  // listenAll servers on certain port
});

app.configure('production',function(){
  app.set('servers', __dirname + '/config/servers-production.json');
  app.set('database',__dirname + '/config/database.json');

  app.listen(app.serverType, app.serverId);  
});


//master run other servers 
app.configure('production', 'master', function(){
 app.runAll(app.get('servers'), 'master'); // run other servers except master
});


app.configure(function(){
  app.use(handlerManager); //the last handler
  startWebServer();
});



function startWebServer(){
    var app_express = require('./app_express');
    console.log(' express web server started');
}