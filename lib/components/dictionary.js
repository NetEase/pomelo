'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const Loader = require('pomelo-loader');

const utils = require('../util/utils');
const pathUtil = require('../util/pathUtil');

module.exports = Component;

function Component(app, opts) {
  if (!(this instanceof Component)) {
    return new Component(app, opts);
  }

  this.app = app;
  this.dict = {};
  this.abbrs = {};
  this.userDicPath = null;
  this.version = '';

  //Set user dictionary
  let p = path.join(app.getBase(), '/config/dictionary.json');
  if (opts && opts.dict) {
    p = opts.dict;
  }

  if (fs.existsSync(p)) {
    this.userDicPath = p;
  }
}

Component.prototype.name = '__dictionary__';

Component.prototype.start = function(cb) {
  const servers = this.app.get('servers');
  const routes = [];

  //Load all the handler files
  let serverType;
  let name;
  let key;

  for (serverType in servers) {
    const p = pathUtil.getHandlerPath(this.app.getBase(), serverType);
    if (!p) {
      continue;
    }

    const handlers = Loader.load(p, this.app);

    for (name in handlers) {
      const handler = handlers[name];
      for (key in handler) {
        if (typeof handler[key] === 'function') {
          routes.push(serverType + '.' + name + '.' + key);
        }
      }
    }
  }

  // Sort the route to make sure all the routers abbr
  // are the same in all the servers
  routes.sort();
  let abbr;
  let i;
  for (i = 0; i < routes.length; i++) {
    abbr = i + 1;
    this.abbrs[abbr] = routes[i];
    this.dict[routes[i]] = abbr;
  }

  //Load user dictionary
  if (this.userDicPath) {
    const userDic = require(this.userDicPath);

    abbr = routes.length + 1;
    for (i = 0; i < userDic.length; i++) {
      const route = userDic[i];

      this.abbrs[abbr] = route;
      this.dict[route] = abbr;
      abbr++;
    }
  }

  this.version = crypto.createHash('md5')
                       .update(JSON.stringify(this.dict))
                       .digest('base64');

  utils.invokeCallback(cb);
};

Component.prototype.getDict = function() {
  return this.dict;
};

Component.prototype.getAbbrs = function() {
  return this.abbrs;
};

Component.prototype.getVersion = function() {
  return this.version;
};
