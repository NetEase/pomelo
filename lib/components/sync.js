var fs = require('fs');
var path = require('path');
var logger = require('../util/log/log').getLogger(__filename);
var utils = require('../util/utils');
var exp = module.exports;
var instance = null;
var DataSync = require('data-sync');

exp.init = function(app, opts, cb) {
    var dbclient = opts.dbclient,sync; 
    logger.info('begin to init sync component.');
    if (!dbclient){
        logger.error(' dbclient is undefined, loading sync failed, exit...');
        utils.invokeCallback(cb);
        process.exit(-1);
        return ;
    }
    if (!opts.path) {
        logger.error(' error config path ');
        utils.invokeCallback(cb);
        return ;
    }
    sync = init(opts);
    app.set('sync',sync);
    app.set('dbclient', dbclient);
    logger.info('sync inited.');
    utils.invokeCallback(cb);
};

exp.stop = function(cb) {
    if (!instance) {
        utils.invokeCallback(cb,null,true);
    } else {
        instance.flushAll();
        setInterval(function(){
            var isDone = instance.isDone();
            if (!!isDone) {
                utils.invokeCallback(cb,null,true);
            }
        },200);
    } 
};


exp.name = 'sync';


/**
 * Auto-load bundled components with getters.
 */
load = function(mappingPath) {
    var mapping = {};
    mappingPath += '/';
    logger.info(' load mapping file ' + mappingPath);
    fs.readdirSync(mappingPath).forEach(function(filename){
        if (!/\.js$/.test(filename)) {return;}
        var name = path.basename(filename, '.js'),key,pro;
	      pro = require(mappingPath + name); 
	      for (key in pro){
		        if (!!mapping[key]){
			          logger.error('exist duplicated key map function ' + key + ' ignore it now ');
		        } else {
			          mapping[key] = pro[key];
		        }
	      }
    });
    logger.info(' load mapping file done ' );
    return mapping;
};


/**
 * init sync
 */
var init = function(opts){
	  if (!!instance) {
		    return instance; 
	  } else {
		    var opt = opts || {};
		    opt.write = load(opts.path);
		    opt.client = opts.dbclient;
        opt.interval = opts.interval || 60*1000;
		    instance = new DataSync(this,opt);
		    return instance;
	  }
};


