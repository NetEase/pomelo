var pomelo = require('../../lib/pomelo');
var appTemplate = pomelo.appTemplate;
var authFilter = require('./app/connector/filter/authFilter');
var routeService = require('./app/service/routeService');
var areaManager = require('./app/area/remote/areaManager');

var app = appTemplate.init();
app.set('name','抢宝');
app.set('dirname', __dirname);
app.set('calculator', routeService.calculator);

if(app.get('serverType')=='area'){
  areaManager.init(require('./config/areas.json'));
}

appTemplate.defaultConfig(app);

app.configure(function(){
    app.use(pomelo.logFilter);
});

app.configure('production|localpro|development', 'connector', function(){
  app.use(pomelo.serialFilter);
  app.use(authFilter);
});

appTemplate.done(app);

if (app.serverType==='master' || app.serverType==='all') {
	startWebServer();
}

function startWebServer(){
    var app_express = require('./app_express');
    var master_app=require('../../lib/master/app_express');
    var app_console = require('../../adminConsole/appCon');
    console.log('[AppWebServerStart] listen, visit http://0.0.0.0:3001/index.html');
}

process.on('uncaughtException', function(err) {
	console.log(' Caught exception: ' + err.stack);
});

