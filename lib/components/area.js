var utils = require('../util/utils');
var logger = require('../util/log/log').getLogger(__filename);
var exp = module.exports;

exp.init = function(app, opts, cb) {
  logger.info('begin to init area component.');
  
  app.set('areas', app.get('dirname')+'/config/areas.json');
  app.set('areasMap', app.get('dirname')+'/config/areasMap.json');

  var result = app.get('areas');
  var servers = app.get('areasMap');
  var map = {};
  for(var key in servers) {
    var areas = servers[key];
    for(var id in areas) {
      result[areas[id]].server = key;
    }
  }

  app.set('areas', result);
  logger.info('areas inited.');

  utils.invokeCallback(cb);
};

exp.name = 'area';