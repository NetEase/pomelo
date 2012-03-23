
var pomelo = require('../../lib/pomelo');
var appTemplate = pomelo.appTemplate;
var authFilter = require('./app/connector/filter/authFilter');

 var Mysqlrewriter = require('./app/dao/mysqlrewriter');

var app = appTemplate.init();
app.set('name','抢宝');
app.set('dirname', __dirname);
appTemplate.defaultConfig(app);

app.configure(function(){
    app.use(pomelo.logFilter);
});

app.configure('production|development', 'connector', function(){
  app.use(pomelo.serialFilter);
  app.use(authFilter);
});

appTemplate.done(app);

if (app.env === 'development' || app.serverType==='master') {
  	startWebServer();
 };

function startWebServer(){
    var app_express = require('./app_express');
}

process.on('uncaughtException', function(err) {
	console.error(' Caught exception: ' + err.stack);
});

process.on('SIGINT', function() {
	app.quit();
});
