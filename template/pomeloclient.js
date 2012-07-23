(function() {
	if (typeof Object.create !== 'function') {
		Object.create = function (o) {
			function F() {}
			F.prototype = o;
			return new F();
		};
	}


	var root = window;
	//var eventEmitter = new root.EventEmitter();
	var pomelo = Object.create(EventEmitter.prototype); // object extend from object
	root.pomelo = pomelo;
	var socket = null;
  var id = 1;
  var callbacks = {};

  pomelo.init = function(params, cb){
    pomelo.params = params;
		params.debug = true;

    // socket = io.connect(params.socketUrl, {'force new connection': true, reconnect: true});

    var url=window.location.hostname;

    //var url = '192.168.145.33';
    socket = io.connect('http://'+url+':3050', {'force new connection': true, reconnect: true});
	  socket.on('connect', function(){
	    console.log('[pomeloclient.init] websocket connected!');
	    cb(socket);
	  });

	  socket.on('reconnect', function() {
      console.log('reconnect');
	  });

    socket.on('message', function(data){
      if (params.debug){
				//console.log('[pomeloclient.init]websocket onmessage:');
        //console.log(data);
			}
      if(data instanceof Array) {
        processMessageBatch(pomelo, data);
      } else {
        processMessage(pomelo, data);
      }
	  });

	  socket.on('disconnect', function(reason) {
			console.log('disconnect reason:');
      console.log(reason);
			pomelo.emit('disconnect', reason);
	  });
	};


	pomelo.pushMessage = function(msg){
		if (pomelo.debug){
      console.log('[pomeloclient.pushMessage], msg: '+JSON.stringify(msg));
    }
		if(!!msg){
			msg = filter(msg);
			socket.emit('message', msg);
		}else {
			console.log('[pomeloclient.pushMessage] Error message type!');
		}
	};

  pomelo.request = function(msg, cb) {
    if(!msg) {
      return;
    }

    msg = filter(msg);
    var req = {
      id: id++,
      __new_format__: true,
      body: msg
    };
    callbacks[req.id] = cb;
    socket.emit('message', req);
  };

  pomelo.notify = function(msg) {
    if(!msg) {
      return;
    }
    msg = filter(msg);
    socket.emit('message', msg);
  };

  var processMessage = function(pomelo, msg) {
    var route;
    if(msg.__new_format__) {
      console.log('process new message');
      //new format message
      if(msg.id) {
        //if have a id then find the callback function with the request
        var cb = callbacks[msg.id];
        if(!cb) {
          console.log('[pomeloclient.processMessage] cb is null for request ' + msg.id);
          return;
        }
        delete callbacks[msg.id];
        if(typeof cb !== 'function') {
          console.log('[pomeloclient.processMessage] cb is not a function for request ' + msg.id);
          return;
        }

        cb(msg.body);
        return;
      }

      //if no id then it should be a server push message
      route = msg.route;
      if(route) {
        pomelo.emit(route, msg.body);
      }
    } else {
      route = msg.route;
      var code = msg.code;
      if(!route){
        console.log('[pomeloclient.onmessage]Message type error! data: ' + JSON.stringify(msg));
      }
      pomelo.emit(route, msg);
    }
  };

  var processMessageBatch = function(pomelo, msgs) {
    for(var i=0, l=msgs.length; i<l; i++) {
      processMessage(pomelo, msgs[i]);
    }
  };

  function filter(msg){
    if(msg.route.indexOf('area.') === 0){
      msg.areaId = pomelo.areaId;
    }

    msg.timestamp = Date.now();
    return msg;
  }

})();
