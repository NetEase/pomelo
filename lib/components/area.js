module.exports = function(app) {
  app.set('areas', app.get('dirname')+'/config/areas.json');
  app.set('areasMap', app.get('dirname')+'/config/areasMap.json');

  var result = app.get('areas');
  var servers = app.get('areasMap');
  var map = {};
  for(var key in servers){
    var areas = servers[key];
    for(var id in areas){
      result[areas[id]].server = key;
    }
  }

  app.set('areas', result);
};

module.exports.name = 'area';
