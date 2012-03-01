var app = require('express').createServer();

app.get('/', function(req, res){
  res.send('hello world');
});

app.listen(3000);