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

app.configure('production|development', 'connector', function(){
  app.use(pomelo.serialFilter);
  app.use(authFilter);
});

appTemplate.done(app);

startWebServer();

function startWebServer(){
    var app_express = require('./app_express');
}

process.on('uncaughtException', function(err) {
	logger.error('Caught exception: ' + err.stack);
});
