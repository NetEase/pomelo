var starter;
var cp = require('child_process');
var coffee = require('coffee-script');
var fs = require('fs');
var vm = require('vm');
var path = require('path');
var util = require('util');
var p = require('procstreams');

var starter = module.exports= new Starter();

function Starter() {
}

var log = function () {
    util.puts([].join.call(arguments, ' '));
};
 
Starter.prototype.sshrun = function (cmd,host,callback) {
	  var hosts = [host];
    log('Executing ' + $(cmd).yellow + ' on ' + $(hosts.join(', ')).blue);
    var wait = 0;
    data = [];

    if (hosts.length > 1) {
        parallelRunning = true;
    }

    hosts.forEach(function (host) {
        wait += 1;
        spawnProcess('ssh', [host, cmd], function (err, out) {
            if (!err) {
                data.push({
                    host: host,
                    out: out
                });
            }
            done(err);
        });
    });

    var error;
    function done(err) {
        error = error || err;
        if (--wait === 0) {
            starter.parallelRunning = false;
            if (error) {
                starter.abort('FAILED TO RUN, return code: ' + error);
            } else if (callback) {
                callback(data);
            }
        }
    }

};

Starter.prototype.run = function (cmd, callback) {
    log('Executing local cmd ' + $(cmd).green);
    p(cmd).data(function (stdout, stderr){
    	if (stderr) {
	        starter.abort('FAILED TO RUN, return code: ' + stderr);
	    } else {
	        if (callback) callback(stdout);
	    }
    	log(addBeauty('local',stdout));
    });
};


function addBeauty(prefix,buf) {
  var out =  prefix + ' ' + buf
      .toString()
      .replace(/\s+$/, '')
      .replace(/\n/g, '\n' + prefix);
  return $(out).green;
}

function spawnProcess(command, options, callback) {
    var child = cp.spawn(command, options);
    var prefix = starter.parallelRunning && command === 'ssh' ? '[' + options[0] + '] ' : '';
    prefix = $(prefix).grey;
    
    child.stderr.on('data', function (chunk) {
        log(addBeauty(chunk));
    });
    var res = [];
    child.stdout.on('data', function (chunk) {
        res.push(chunk.toString());
        log(addBeauty(chunk));
    });

    function addBeauty(buf) {
        return prefix + buf
            .toString()
            .replace(/\s+$/, '')
            .replace(/\n/g, '\n' + prefix);
    }

    child.on('exit', function (code) {
        if (callback) {
            callback(code === 0 ? null : code, res && res.join('\n'));
        }
    });
}

Starter.prototype.ensure = function (key, def) {
    if (starter.hasOwnProperty(key)) return;
    starter.set(key, def);
};

Starter.prototype.set = function (key, def) {
    if (typeof def === 'function') {
        starter.__defineGetter__(key, def);
    } else {
        starter.__defineGetter__(key, function () {
            return def;
        });
    }
};

Starter.prototype.load = function (file) {
    if (!file) throw new Error('File not specified');
    log('Executing compile ' + file);
    var code = coffee.compile(fs.readFileSync(file).toString());
    var script = vm.createScript(code, file);
    script.runInNewContext(this);
};

Starter.prototype.abort = function (msg) {
    log($(msg).red);
    //process.exit(1);
};


Starter.prototype.sequence = function () {
    var args = arguments;
    starter.asyncLoop([].slice.call(args), function (arg, next) {
        if (typeof arg === 'function') {
            arg.call(starter, next);
        } else {
        		//console.log(next+ ' fdsfds ' + (typeof arg === 'function'));
            starter[arg].call(starter, next);
        }
    });
};

Starter.prototype.asyncLoop = function asyncLoop(collection, iteration, complete) {
    var self = this;
    var item = collection.shift();
    if (item) {
        iteration.call(self, item, function next() {
            asyncLoop.call(self, collection, iteration, complete);
        });
    } else if (typeof complete === 'function') {
        complete.call(self);
    }
};


var Gservers = [];

Starter.prototype.startAll = function(groups){
  try {
		for(var gindex in groups) {
			var name = groups[gindex].name;
			var servers = groups[gindex].list;
 			for (var sindex in servers){
 				var serverConfig = servers[sindex]
  				var server = name + ' mock ' ;//require('./lib/' + serverName + '/' + serverName + 'Server');
				if (typeof server.beforeStart == 'function') {
 					server.beforeStart();
 				}
				Gservers.push(server);
			}
		}
		for(var index in Gservers) {
			var server = Gservers[index];
			if (typeof server.start == 'function') {server.start();}
		}
	} catch (err) {
		console.log('meet error during starting: ' + err.stack);
		return 1;
	}
	console.log('all servers started ');
}

Starter.prototype.connectAll = function(){
	console.log('connect begin...')
  try {
  	for(var index in Gservers) {
			var server = Gservers[index];
			if (typeof server.afterStart == 'function') {server.afterStart();}
		}
	} catch (err) {
		console.log('meet error during connected: ' + err.stack);
		return 1;
	}
	console.log('all servers connected ');
}

Starter.prototype.desc = function (text) {
};

Starter.prototype.task = function (name, action) {
    starter[name] = function task(done) {
        var displayName = name;
        log('Executing', displayName);
        var time = Date.now();
        action(function () {	
            if (done) done();
        });
    };
    action.task = name;
};

// Stylize a string
function stylize(str, style) {
    var styles = {
        'bold'      : [1,  22],
        'italic'    : [3,  23],
        'underline' : [4,  24],
        'cyan'      : [96, 39],
        'blue'      : [34, 39],
        'yellow'    : [33, 39],
        'green'     : [32, 39],
        'red'       : [31, 39],
        'grey'      : [90, 39],
        'green-hi'  : [92, 32],
    };
    return '\033[' + styles[style][0] + 'm' + str +
           '\033[' + styles[style][1] + 'm';
};

function $(str) {
    str = new(String)(str);

    ['bold', 'grey', 'yellow', 'red', 'green', 'cyan', 'blue', 'italic', 'underline'].forEach(function (style) {
        Object.defineProperty(str, style, {
            get: function () {
                return $(stylize(this, style));
            }
        });
    });
    return str;
};
stylize.$ = $;
