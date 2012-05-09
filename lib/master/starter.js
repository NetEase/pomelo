var starter;
var cp = require('child_process');
var fs = require('fs');
var vm = require('vm');
var path = require('path');
var util = require('util');
var color = require ('../util/color');


var starter = module.exports= new Starter();

function Starter() {
}

var log = function () {
    util.puts([].join.call(arguments, ' '));
};

Starter.prototype.sshrun = function (cmd,host,callback) {
	var hosts = [host];
    log('Executing ' + color.$(cmd).yellow + ' on ' + color.$(hosts.join(', ')).blue);
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
    log('Executing ' + color.$(cmd).green + ' locally');
    spawnProcess(cmd, ['',''], function (err, data) {
        if (err) {
            starter.abort('FAILED TO RUN, return code: ' + err);
        } else {
            if (callback) callback(data);
        }
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
	var child = null;
	if (!!options[0]) {
		child = cp.spawn(command, options);

	} else {
		child = cp.exec(command, options);
	}

	var prefix = command === 'ssh' ? '[' + options[0] + '] ' : '';
	prefix = color.$(prefix).grey;

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

Starter.prototype.abort = function (msg) {
    log(color.$(msg).red);
    //process.exit(1);
};


Starter.prototype.sequence = function () {
    var args = arguments;
    starter.asyncLoop([].slice.call(args), function (arg, next) {
        if (typeof arg === 'function') {
            arg.call(starter, next);
        } else {
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
