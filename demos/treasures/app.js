
var pomelo = require('../../lib/pomelo');
var appTemplate = pomelo.appTemplate;
var authFilter = require('./app/connector/filter/authFilter');

var app = appTemplate.init();
app.set('name','抢宝');
app.set('dirname', __dirname);
appTemplate.defaultConfig(app);

app.configure(function(){
    app.use(pomelo.logFilter);
});

app.configure('production|localpro|development', 'connector', function(){
  app.use(pomelo.serialFilter);
  app.use(authFilter);
});

appTemplate.done(app);



//if (app.serverType==='master') {
	startWebServer();
	console.log("!!!********************************************!!!!");
//}
//var app_console = require('../../lib/adminConsole/appCon');

function startWebServer(){
    var app_express = require('./app_express');
//    var master_app=require('../../lib/master/app_express');
    var app_console = require('../../lib/adminConsole/appCon');
}

process.on('uncaughtException', function(err) {
	console.error(' Caught exception: ' + err.stack);
});
