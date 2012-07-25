var fs = require('fs');
var path = require('path');
var logger = require('../util/log/log').getLogger(__filename);
var mapping  = module.exports;
var syncUtil = module.exports;
var utils = require('../util/utils');
/**
 * Auto-load bundled components with getters.
 */


syncUtil.load = function(mappingPath) {
    mappingPath += '/';
    logger.info(' load mapping file ' + mappingPath);
    fs.readdirSync(mappingPath).forEach(function(filename){
        if (!/\.js$/.test(filename)) {return;}
        var name = path.basename(filename, '.js');
	      var pro = require(mappingPath + name); 
	      for (var key in pro){
		        if (!!mapping[key]){
			          logger.error('exist duplicated key map function ' + key + ' ignore it now ');
		        } else {
			          mapping[key] = pro[key];
		        }
	      }
    });
    logger.info(' load mapping file done ' );
    return mapping;
}

