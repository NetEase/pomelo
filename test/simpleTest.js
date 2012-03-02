var rpcPath = 'logic.serverHandler.kick';
var msgArr = rpcPath.split('.');
var serverType = msgArr[0];
var handler = msgArr[1];
var method = msgArr[2];
console.log(' serverType: '+ serverType+' handler '+handler + ' method: '+method);
