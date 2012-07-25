var utils = require('../util/utils');
var logger = require('../util/log/log').getLogger(__filename);
var exp = module.exports;

exp.init = function(app, opts, cb) {
    var dbclient = opts.dbclient,sync,mapping = opts.mapping; 
    logger.info('begin to init sync component.');
    if (!dbclient) {
        dbclient = require('../sync/mysql/mysql').init(app);
    }
    if (!dbclient){
        logger.error(' error load dbclient ');
        utils.invokeCallback(cb);
        return ;
    }
    if (!opts.path) {
        logger.error(' error config path ');
        utils.invokeCallback(cb);
        return ;
    }
    sync = require('../sync/sync').init(dbclient,opts.path);
    app.set('sync',sync);
    app.set('dbclient', dbclient);
    logger.info('sync inited.');
    utils.invokeCallback(cb);
};

exp.name = 'sync';
