var pomelo = require('../../lib/pomelo');
var appTemplate = pomelo.appTemplate;
var authFilter = require('./app/connector/filter/authFilter');
var routeService = require('./app/service/routeService');
var areaService = require('./app/components/areaService');

var app = appTemplate.init();
app.set('name','抢宝');
app.set('dirname', __dirname);
app.set('calculator', routeService.calculator);


var dbclient = require('./app/dao/mysql/mysql').init(app);
app.set('dbclient',dbclient);

appTemplate.defaultConfig(app);

app.configure(function(){
  app.before(pomelo.logFilter);
  app.filter(pomelo.timeFilter);
  app.load(pomelo.channel, {serverType: 'channel'});
});

app.configure('production|development', 'area', function(){
  app.load(areaService);
});

app.configure('production|development', 'connector', function(){
  //app.use(pomelo.timeAdjustFilter);
  app.filter(pomelo.serialFilter);
  app.before(authFilter);
});

appTemplate.done(app);

app.start();

if (app.serverType==='master' || app.serverType==='all') {
	startWebServer();
}

function startWebServer(){
    var app_express = require('./app_express');
    console.log('[AppWebServerStart] listen, visit http://0.0.0.0:3001/index.html');
    app.startConsole();
}

process.on('uncaughtException', function(err) {
	console.error(' Caught exception: ' + err.stack);
});
