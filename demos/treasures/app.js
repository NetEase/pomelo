var pomelo = require('../../lib/pomelo');
var appTemplate = pomelo.appTemplate;
var authFilter = require('./app/connector/filter/authFilter');
var routeService = require('./app/service/routeService');
var areaManager = require('./app/service/area/areaManager');

var app = appTemplate.init();
app.set('name','抢宝');
app.set('dirname', __dirname);
app.set('calculator', routeService.calculator);

appTemplate.defaultConfig(app);

app.configure(function(){
    app.use(pomelo.logFilter);
});

app.configure('production|development', 'area', function(){
  areaManager.init();
});

app.configure('production|development', 'connector', function(){
  //app.use(pomelo.timeAdjustFilter);
  app.use(pomelo.serialFilter);
  app.use(authFilter);
});

appTemplate.done(app);

if (app.serverType==='master' || app.serverType==='all') {
	startWebServer();
}

function startWebServer(){
    var app_express = require('./app_express');
    var app_console = require('../../adminConsole/appCon');
    console.log('[AppWebServerStart] listen, visit http://0.0.0.0:3001/index.html');
}

process.on('uncaughtException', function(err) {
	console.error(' Caught exception: ' + err.stack);
});

