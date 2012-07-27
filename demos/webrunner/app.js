var pomelo = require('../../lib/pomelo');
var appTemplate = pomelo.appTemplate;

var app = appTemplate.init();
app.set('name','pomelo web runner');
app.set('dirname', __dirname);
appTemplate.defaultConfig(app);


app.configure('production|development', 'chat', function(){
    app.load(pomelo.channel, {serverType: 'chat'});
});


app.start();

function startWebServer(){
    var app_express = require('./app_express');
    console.log('[AppWebServerStart] listen, visit http://0.0.0.0:3001/index.html');
}

if (app.serverType==='master') {
	startWebServer();
	app.startConsole();
}


process.on('uncaughtException', function(err) {
	console.error(' Caught exception: ' + err.stack);
});


