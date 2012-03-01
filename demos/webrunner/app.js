var app = module.exports = pomelo();

var pomelo = require('../../lib/pomelo');
var logFilter = require('../../lib/filters/logFilter');

var args = process.argv;
// config

var env = 'development';

if (args.length > 0){
    env = args[0];
}

var serverType = 'all';  // if dev, means all server
var serverId = '';

if ((args.length == 3) && (env == 'production')){
    serverType = args[1];  //  area, logic, login or other servers
    servereId = args[2];
}

app.set('name', 'webrunner');
app.set('env', env);
app.set('serverType', serverType);
app.set('serverId', serverId);

// use is filter
app.configure('development',function(){
  app.set('servers', '../config/servers-development.json');
  app.set('database','../config/database.json');
})

app.configure('production',function(){
  app.set('servers', '../config/servers-production.json');
  app.set('database','../config/database.json');
});

app.configure(function(){
  app.use(app.router); //filter out requests
  app.use(logFilter); //filter out requests
  app.set('scheduler', '../config/scheduler.coffee');
  app.enabled('scheduler');
  
   // 全部生成代理
  app.genHandler('./app/connector/handler');
  app.genRemote('./app/connector/remote');
  app.genHandler('./app/area/handler');
  app.genRemote('./app/area/remote');
  app.genHandler('./app/logic/handler');
  app.genRemote('./app/logic/remote');
});


app.configure(function(){
  app.use(app.handlerManager); //the last handler
  startWebServer();
});

// all listening
app.configure('development', 'all', function(){
    app.listenAll(app.servers);  // listenAll servers on certain port
})

// master run other servers 
app.configure('production', 'master', function(){
    app.listen(app.serverType, app.serverId);
    app.runAll(app.servers, 'master'); // run other servers except master
})

//  node master, listen on port
app.configure('production', '^master', function(){
    app.listen(app.serverType, app.serverId);  
})

function startWebServer(){
    var app-express = require('app-express');
    console.log(' web server started');
}








