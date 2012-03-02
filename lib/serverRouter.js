var serverGateway = require('./serverGateway');

/**
 * server server
 */
var router = module.exports;

// need mailbox api
router.forwardMessage = function(msg, cb) {
    //console.log('[serverRouter] msg '+ JSON.stringify(msg));  
    
    mailbox(serverId, msg, cb);
};

// fake mailbox
function mailbox(serverId, msg, cb){
    console.log('[serverRouter] start mailbox invoke server: '+serverId + ' msg:' +  msg);
	serverGateway.forward(msg, cb);
}
