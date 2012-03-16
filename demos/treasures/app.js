var pomelo = require('../../lib/pomelo');
var appTemplate = pomelo.appTemplate;
var authFilter = require('./app/connector/filter/authFilter');
var serialFilter = require('../../lib/filters/serialFilter');

var app = appTemplate.init();
app.set('name','抢宝');
app.set('dirname', __dirname);
appTemplate.defaultConfig(app);

app.configure(function(){
    app.use(pomelo.logFilter);
});

app.configure('production|development', 'connector', function(){
	app.use(serialFilter);
  app.use(authFilter);
});

appTemplate.finish(app);

startWebServer();

function startWebServer(){
    var app_express = require('./app_express');
}