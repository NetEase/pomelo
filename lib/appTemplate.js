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
    var serverId = 'all';
    
    if ((args.length >= 3) && (env.indexOf('production')>=0 || env.indexOf('localpro')>=0)){
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
    	  app.set('schedulerService', app.get('dirname')+'/config/scheduler.json');
    	  app.enable('schedulerService');
    	  
    	  app.set('servers', app.getServers(app.get('dirname')+'/config/servers.json'));
    	  app.set('master', app.getServers(app.get('dirname')+'/config/master.json'));
    	  app.set('redis', app.getServers(app.get('dirname')+'/config/redis.json'));
    	  app.set('mysql', app.getServers(app.get('dirname')+'/config/mysql.json'));
    	  
    	  genProxies(app);
          
    });
    
    initServers(app);
    
    // use is filter
    app.configure('development',function(){
      app.listenAll(app.get('servers'));  // listenAll servers on certain port
    });
    
    app.configure('production|localpro',function(){
      logger.warn('begin to listen with ' + '[serverType]:' + app.serverType + ' [serverId]:'  + app.serverId);
      if (app.serverType==='master') {
      	app.masterlisten();
      } else {
      	app.listen(app.serverType, app.serverId);  
      }
    });
    
    
    //master run other servers 
    app.configure('production|localpro', 'master', function(){
     app.runAll(app.get('servers')); // run other servers except master
    });

};

exports.done = function(app){
   app.use(handlerManager); //the last handler
};

var genProxies = function(app) {
	var servers = app.get('servers');
	if(!servers) return;
	
	for(var type in servers) {
		app.genProxy(type, app.get('dirname') + '/app/' + type + '/remote');
	}
};

var initServers = function(app) {
	var servers = app.get('servers');
	if(!servers) return;
	
	for(var type in servers) {
		app.configure('production|localpro|development', type, function(){
	  	app.genHandler(type, app.get('dirname') + '/app/' + type + '/handler');
	  	app.genRemote(type, app.get('dirname') + '/app/' + type + '/remote');
	  });
	}
};
   