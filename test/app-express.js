
var pomelo = require('pomelo');
var app = module.exports = pomelo();

// config

var env = args[0];
var serverType = 'all';  // if dev, means all server
var serverId = '';

if ((args.length == 3) && (env == 'production')){
    serverType = args[1];  //  area, logic, login or other servers
    servereId = args[2];
}

app.set('name', '捡宝游戏');
app.set('env', env);
app.set('serverType', serverType);
app.set('serverId', serverId);

// use is filter
app.configure('development',function(){
  app.set('servers', './config/servers-develop.json');
  //app.set('startup', './config/develop.coffee');
})

app.configure('production',function(){
  app.set('servers', './config/servers-product.json');
});

app.configure(function(){
  app.use(pomelo.errorHandler({ dumpExceptions: true, showStack: true }));
  app.use(app.router);
  app.set('database','./config/database.json');
  app.set('scheduler', './config/scheduler.coffee');
  app.enabled('scheduler');
});

app.configure('production', 'master', function(){
 // app.set('startup', './config/product.coffee');
})


app.configure('production|development', 'connector', function(){
    app.use(pomelo.serialFilter);
    app.use('auth.*',app.authFilter);
    app.genHandler('./app/connector/handler');
    app.genRemote('./app/connector/remote');
})

app.configure('production|development', 'area', function(){
    app.use(app.validateAreaFilter);
    app.genHandler('./app/area/handler');
    app.genRemote('./app/area/remote');
})

app.configure('production|development', 'logic', function(){
    app.use('keyword.*',app.keywordFilter);
    app.genHandler('./app/logic/handler');
    app.genRemote('./app/logic/remote');
})

app.configure(function(){
  app.use(app.handlerManager); //the last handler
});

app.startup('development', 'all', function(){
    for (server in app.servers){
        app.listen(server);    	
    }
})

app.startup('production', 'master', function(){
    app.listen(app.serverType);
    for (typeServers in app.servers){
        for (server in typeServers) {
            app.run(server);    	
        }
    }
})

app.startup('production', '^master', function(){
    app.listen(app.serverType);
})







