var pathUtil = require('../util/pathUtil');
var path = require('path');
var fs = require('fs');
var Loader = require('pomelo-loader');
var logger = require('pomelo-logger').getLogger(__filename);

module.exports = function(app, opts) {
  return new Dictionary(app, opts);
};

var Dictionary = function(app, opts){
  this.app = app;
  this.name = '__dictionary__';
  this.dict = {};
  this.abbrs = {};
  this.userDicPath = null;

  //Set user dictionary
  var p = path.join(app.getBase(), '/config/dictionary.json');
  if(!!opts && !!opts.dict){
    p = opts.dict;
  }
  if(fs.existsSync(p)){
    this.userDicPath = p;
  }
};

Dictionary.prototype.start = function(cb){
  var servers = this.app.get('servers');
  var routes = [];

  //Load all the handler files
  for(var serverType in servers){
    var p = pathUtil.getHandlerPath(this.app.getBase(), serverType);
    if(!p){
      continue;
    }

    var handlers = Loader.load(p, this.app);

    for(var name in handlers){
      var handler = handlers[name];
      for(var key in handler){
        if(typeof(handler[key]) === 'function'){
          routes.push(serverType + '.' + name + '.' + key);
        }
      }
    }
  }

  //Sort the route to make sure all the routers abbr are the same in all the servers
  routes.sort();
  var abbr;
  var i;
  for(i = 0; i < routes.length; i++){
    abbr = i + 1;
    this.abbrs[abbr] = routes[i];
    this.dict[routes[i]] = abbr;
  }

  //Load user dictionary
  if(!!this.userDicPath){
    var userDic = require(this.userDicPath);

    abbr = routes.length + 1;
    for(i = 0; i < userDic.length; i++){
      var route = userDic[i];

      this.abbrs[abbr] = route;
      this.dict[route] = abbr;
      abbr++;
    }
  }

  cb();
};

Dictionary.prototype.getDict = function(){
  return this.dict;
};

Dictionary.prototype.getAbbrs = function(){
  return this.abbrs;
};
