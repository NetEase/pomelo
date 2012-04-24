(function() {
	if (typeof Object.create !== 'function') {
		Object.create = function (o) {
			function F() {}
			F.prototype = o;
			return new F();
		};
	}

	var root = window;

	var eventEmitter = new root.EventEmitter();
	var pomelo = Object.create(eventEmitter); // object extend from object

	root.pomelo = pomelo;


  pomelo.init = function(params){
		pomelo.params = params;

	  socket = io.connect(params.socketUrl);

	  socket.on('connect', function(data){
	    console.log('[pomeloclient.init] websocket connected!');
	  });

	  socket.on('message', function(data){
	  	if (params.debug){
				console.log('[pomeloclient.init]websocket onmessage:' + JSON.stringify(data));
			}
	    var route = data.route;
	    var code = data.code;
	    if(!route){
	      console.log('[pomeloclient.onmessage]Message type error! data: ' + JSON.stringify(data));
	    }
	    pomelo.emit(route, data);
		});
	}


	pomelo.pushMessage = function(msg){
		if (pomelo.params.debug){
      console.log('[pomeloclient.pushMessage], msg: '+msg.route+ ' params:'+JSON.stringify(msg.params));
    }
		if(!!msg){
			msg = filter(msg);
			socket.emit('message', msg);
		}else {
			console.log('[pomeloclient.pushMessage] Error message type!');
		}
	}

  function filter(msg){
    if(msg.route.indexOf('area.') == 0){
      msg.areaId = pomelo.areaId;
    }
    msg.params.timestamp = Date.now();
    return msg;
  }

})();
