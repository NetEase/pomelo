var handler = module.exports;
var utils = require('../../../../../lib/util/utils');

handler.kick = function(msg, session){
    var params = msg.params;
    console.log('[handler.kick]  params: '+ params);
    console.log('[handle kick] with session: '+msg.route+ ' sUserId: '+params.sourceUserId+' tUserId: '+params.targetUserId);
    var blood = 30;
    
    msg.params.blood = 30;
    
    session.response(null, {route: msg.route, code: 200});
}


handler.kick2 = function(){
}
