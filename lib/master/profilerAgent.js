var WebSocketServer = require('ws').Server;
var agents = require('./profiler');
var wss;

var host = '0.0.0.0';

var server = module.exports;

server.start = function(port) {

	wss = new WebSocketServer({
		port : port,
		host : host
	});

	console.log('webkit-devtools-agent started on %s:%s', host, port);

	wss.on('connection', function(socket) {
		socket.on('message', function(message) {
			try {
				message = JSON.parse(message);
			} catch (e) {
				console.log(e);
				return;
			}

			var id = message.id;
			var command = message.method.split('.');
			var domain = agents;
			var method = command[1];
			var params = message.params;

			if (!domain || !domain[method]) {
				// console.error('%s is not implemented', message.method);
				return;
			}
			console.error(message);
			domain[method](params, function(result) {
				console.error('data' + socket);
				socket.send(JSON.stringify({
					id : id,
					result : result
				}));
			}, function(event) {
				console.error('event ' + socket);
				socket.send(JSON.stringify(event));
			});
		});
	});
};

server.stop = function() {
	if (wss) {
		wss.close();
		console.log('webkit-devtools-agent stopped');
	}
};

process.on('uncaughtException', function(err) {
	console.error('webkit-devtools-agent: uncaughtException: ');
	console.error(err.stack);
});
