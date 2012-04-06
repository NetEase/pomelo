var io = require('./websocket/lib/socket.io-client');


var socket = io.connect('http://localhost:8081/');

socket.on('connect', function (data) {
    console.log(' start connect client.js');
});
 
socket.on('disconnect', function (data) {
	 console.log(data);

});

socket.on('message', function (data) {
	 console.log(data);
});
 
//setInterval(function(){
//	socket.emit("message",{path: 'logic.', params: {username: 'test@13221', password: '21'}});
//},5000);

console.log(' client.js');
socket.emit('message',{reqPath: 'area.fightHandler.kick', params: {sourceUsername: 'xcc', targetUsername: 'zy'}});
