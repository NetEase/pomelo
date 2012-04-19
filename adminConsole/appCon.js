var express=require('express');
//var socket=require('./Socket')

//var server=require('../master/server');

var app=express.createServer();

//--------------------配置app----------------------
app.configure(function(){

	app.use(express.methodOverride());
	app.use(express.bodyParser());
	app.use(app.router);
	app.set('view engine','jade');
	app.set('views',__dirname);
	app.use('view options',{layout:false});
	app.set('basepath',__dirname);
});

app.configure('development', function(){
    //console.log('static file location: '+__dirname + '/public');
    app.use(express.static(__dirname));
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  var oneYear = 31557600000;
  app.use(express.static(__dirname, { maxAge: oneYear }));
  app.use(express.errorHandler());
});
//------------------------------app listen开始
app.on('error', function(err) {
	console.log('=================errr:' + err);
});
app.listen(7001);
console.log('[AdminConsoleStart] visit http://0.0.0.0:7001');


