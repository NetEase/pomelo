var exp = modules.exports;

var init = function(areas){
  if(app.get('serverType') != 'area')
    return;
  
  var serverId = app.get('serverId');
  area = areas[serverId];
  
  if(!!area){
    var map = areaMap;
  }
}
