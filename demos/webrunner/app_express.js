var express = require('express');
var app = express.createServer();

app.configure(function(){
    app.use(express.methodOverride());
    app.use(express.bodyParser());
    app.use(app.router);
    app.set('view engine', 'jade');
    app.set('views', __dirname + '/public');
    app.set('view options', {layout: false});
    app.set('basepath',__dirname + '/public');
});

app.configure('development', function(){
    //console.log('static file location: '+__dirname + '/public');
    app.use(express.static(__dirname + '/public'));
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  var oneYear = 31557600000;
  app.use(express.static(__dirname + '/public', { maxAge: oneYear }));
  app.use(express.errorHandler());
});

app.get('/', function(req, res){
  res.render('index',{userName: 'xcc'});
});

app.get('/m', function(req, res){
  res.render('index',{userName: 'monitor'});
});

app.listen(3002);
console.log('express server listening on 3002');