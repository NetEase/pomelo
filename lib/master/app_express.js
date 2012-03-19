var express = require('express');
var app = express.createServer();

app.configure(function(){
    app.use(express.methodOverride());
    app.use(express.bodyParser());
    app.use(app.router);
    app.set('view engine', 'jade');
    app.set('views', __dirname + '/console');
    app.set('view options', {layout: false});
    app.set('basepath',__dirname + '/console');
});

app.configure('development', function(){
    //console.log('static file location: '+__dirname + '/public');
    app.use(express.static(__dirname + '/console'));
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  var oneYear = 31557600000;
  app.use(express.static(__dirname + '/console', { maxAge: oneYear }));
  app.use(express.errorHandler());
});

app.listen(3000);
console.log('express server listening on 3000');