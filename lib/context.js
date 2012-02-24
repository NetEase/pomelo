var context = module.exports;


var contextMap = {};

context.init = function(configPath) {
    //先方假数据测试
    contextMap['serverMap'] = 
           {
    		  "agent": [
    		  	{"id": "agent-server-1", "host": "127.0.0.1", "port": 5050}
    		  ], 
    		  "logic": [
    		  	{"id": "logic-server-1", "host": "127.0.0.1", "port": 6050}
    		  ], 
    		  "manager": [
    		  	{"id": "scene-manager-1", "host": "127.0.0.1", "port": 7050}
    		  ],
    		  "area": [
    		  	{"id": "area-server-1", "host": "127.0.0.1", "port": 8050}
    		  ], 
    		  "login": [
    		  	{"id": "login-server-1", "host": "127.0.0.1", "port": 9050}
    		  ]
    		};
    
};

context.getValue = function(key) {
	return contextMap[key];
}

//app.js boot时设, 每个instance都有
context.setValue = function(key, value) {
	contextMap[key] = value;
}

context.getServerId = function(serverType) {
    console.log(' getServerId serverType: '+ serverType);
	var servers = contextMap['serverMap'][serverType];
    for (var i=0; i<servers.length; i++) {
        var curServer =servers[i];
        return curServer.id;  // return first server temperary
    }
}

context.getAppPath = function(){
	return '../test/app';
}

context.getFrontendPort = function(){
	return 8081;
}

