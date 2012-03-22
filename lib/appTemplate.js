var pomelo = require('./pomelo');
var handlerManager = require('./handlerManager');
var logger = require('./util/log/log').getLogger(__filename);
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
    
    if ((args.length >= 3) && (env == 'production')){
      serverType = args[3]==undefined?'master':args[3];
      serverId = args[4]==undefined?'master-server-1':args[4];
    }
    
    app.set('main', args[1]);
    app.set('env', env);
    app.set('serverType', serverType);
    app.set('serverId', serverId);
    
    logger.warn('before app.configure with ' + '[serverType]:' + serverType + ' [serverId]:'  + serverId);
    
    return app;
};


exports.defaultConfig=function(app){
    app.configure(function(){
    	  console.log("after config");
    	  app.set('scheduler', app.get('dirname')+'/config/scheduler.json');
    	  app.enable('scheduler');
    	  
    	  app.set('servers', app.getServers(app.get('dirname')+'/config/servers.json'));
    	  app.set('master', app.getServers(app.get('dirname')+'/config/master.json'));
    	  app.set('redis', app.getServers(app.get('dirname')+'/config/redis.json'));
    	  app.set('mysql', app.getServers(app.get('dirname')+'/config/mysql.json'));
    	  
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
      app.listenAll(app.get('servers'));  // listenAll servers on certain port
    });
    
    app.configure('production',function(){
      logger.warn('begin to listen with ' + '[serverType]:' + app.serverType + ' [serverId]:'  + app.serverId);
      app.listen(app.serverType, app.serverId);  
    });
    
    
    //master run other servers 
    app.configure('production', 'master', function(){
     app.runAll(app.get('servers')); // run other servers except master
    });

} 

exports.done = function(app){
   app.use(handlerManager); //the last handler
}
   