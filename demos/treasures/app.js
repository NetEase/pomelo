var pomelo = require('../../lib/pomelo');
var appTemplate = pomelo.appTemplate;
var authFilter = require('./app/connector/filter/authFilter');
var routeService = require('./app/service/routeService');

var app = appTemplate.init();
app.set('name','抢宝');
app.set('dirname', __dirname);
//app.set('calculator', routeService.calculator);
appTemplate.defaultConfig(app);

app.configure(function(){
    app.use(pomelo.logFilter);
});

app.configure('production|localpro|development', 'connector', function(){
  app.use(pomelo.serialFilter);
  app.use(authFilter);
});

appTemplate.done(app);

startWebServer();

function startWebServer(){
    var app_express = require('./app_express');
}

process.on('uncaughtException', function(err) {
	console.error(' Caught exception: ' + err.stack);
});