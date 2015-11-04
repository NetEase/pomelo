var app = require('express')();
var serveStatic = require('serve-static');

var env = process.env.NODE_ENV || 'development';
if ('development' === env) {
  app.use(serveStatic(__dirname + '/public'));
} else {
  var oneYear = 31557600000;
  app.use(serveStatic(__dirname + '/public', { maxAge: oneYear }));
}

app.listen(3001, function() {
  console.log("Web server has started.\nPlease log on http://127.0.0.1:3001");
});