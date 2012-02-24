var RpcMessage = function(msg){
    console.log('[RpcMessage] get message '+ msg.reqPath);
    this.params = msg.params;
    var msgArr = msg.reqPath.split('.');
    this.serverType = msgArr[0];
    this.handler = msgArr[1];
    this.method = msgArr[2];
    console.log('[RpcMessage] message serverType: ' + this.serverType + ' handler '+this.handler+ ' method '+this.method);
}


var pro = RpcMessage.prototype;

pro.getServerType = function(){
	return 'xcc';
}

var exp = module.exports;

exp.create= function(msg){
    return new RpcMessage(msg);
}

