var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var errorHandler = require('errorHandler');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var app = express();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.set('view engine', 'jade');
app.set('views', path.join(__dirname, 'public'));
// 只用于开发环境
if ('development' == app.get('env')) {
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(errorHandler({ dumpExceptions: true, showStack: true }));
}
// 只用于生产环境
if ('production' == app.get('env')) {
  var oneYear = 31557600000;
  app.use(express.static(path.join(__dirname, 'public'), { maxAge: oneYear }));
  app.use(errorHandler());
}
console.log("Web server has started.\nPlease log on http://127.0.0.1:3001/index.html");

app.listen(3001);