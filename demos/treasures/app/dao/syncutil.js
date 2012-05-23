var fs = require('fs');
var path = require('path');

var write = module.exports;
var mappingPath = __dirname + '/mapping/';
/**
 * Auto-load bundled components with getters.
 */
fs.readdirSync(mappingPath).forEach(function(filename){
  if (!/\.js$/.test(filename)) return;
  var name = path.basename(filename, '.js');
	var pro = require(mappingPath + name); 
	for (var key in pro){
		if (!!write[key]){
			console.error('exist duplicated key map function ' + key + ' ignore it now ');
		} else {
			write[key] = pro[key];
		}
	}
});
