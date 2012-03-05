var handler = module.exports;

var utils = require('../../../../../lib/util/utils');


handler.kick = function(session, fn){
    var params = session.params;
    console.log('[handler.kick]  params: '+ params);
    console.log('[handle kick] with session: '+session.route+ ' sUserId: '+params.sourceUserId+' tUserId: '+params.targetUserId);
    var blood = 30;
    
    session.params.blood = 30;
    // use mail box to send back to connector
    //proxy.connector.sessionManager.send(session, {"blood": blood});
    
    utils.invokeCallback(fn,session);
}


