var pomelo = require('./pomelo');
var handlerManager = require('./handlerManager');

var exports = module.exports;


exports.init = function(){
    var app = pomelo.createApp();
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
    
    app.set('env', env);
    app.set('serverType', serverType);
    app.set('serverId', serverId);
    return app;
}


exports.defaultConfig=function(app){
    app.configure(function(){
    	  console.log("after config");
    	  app.set('scheduler', app.get('dirname')+'/config/scheduler.json');
    	  app.enable('scheduler');
    	  
    	  app.genProxy('connector', app.get('dirname') + '/app/connector/remote');
    	  app.genProxy('area', app.get('dirname') + '/app/area/remote');
    	  app.genProxy('logic', app.get('dirname') + '/app/logic/remote');
    	  app.genProxy('login', app.get('dirname') + '/app/login/remote');
          
    });
    
    
    app.configure('production|development', 'area', function(){
    	app.genHandler('area', app.get('dirname') + '/app/area/handler');
    	app.genRemote('area', app.get('dirname') + '/app/area/remote');
    });
    
    app.configure('production|development', 'logic', function(){
    	app.genHandler('logic', app.get('dirname') + '/app/logic/handler');
    	app.genRemote('logic', app.get('dirname') + '/app/logic/remote');
    });
    
    app.configure('production|development', 'login', function(){
    	app.genHandler('login', app.get('dirname') + '/app/login/handler');
    	app.genRemote('login', app.get('dirname') + '/app/login/remote');
    });
    
    app.configure('production|development', 'connector', function(){
    	app.genHandler('connector', app.get('dirname') + '/app/connector/handler');
    	app.genRemote('connector', app.get('dirname') + '/app/connector/remote');
    });
    
    // use is filter
    app.configure('development',function(){
      app.set('servers', app.get('dirname')+'/config/servers-development.json');
      app.set('database',app.get('dirname')+'/config/database.json');
      
      app.listenAll(app.get('servers'));  // listenAll servers on certain port
    });
    
    app.configure('production',function(){
      app.set('servers', app.get('dirname') + '/config/servers-production.json');
      app.set('database',app.get('dirname') + '/config/database.json');
    
      app.listen(app.serverType, app.serverId);  
    });
    
    
    //master run other servers 
    app.configure('production', 'master', function(){
     app.runAll(app.get('servers'), 'master'); // run other servers except master
    });

} 

exports.done = function(app){
   app.use(handlerManager); //the last handler
}
   