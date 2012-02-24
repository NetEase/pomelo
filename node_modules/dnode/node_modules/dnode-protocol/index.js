var Traverse = require('traverse');
var EventEmitter = require('events').EventEmitter;
var stream = process.title === 'browser' ? {} : require('stream');
var json = typeof JSON === 'object' ? JSON : require('jsonify');

var exports = module.exports = function (wrapper) {
    var self = {};
    
    self.sessions = {};
    
    self.create = function () {
        var id = null;
        do {
            id = Math.floor(
                Math.random() * Math.pow(2,32)
            ).toString(16);
        } while (self.sessions[id]);
        
        var s = Session(id, wrapper);
        self.sessions[id] = s;
        return s;
    };
    
    self.destroy = function (id) {
        delete self.sessions[id];
    };
    
    return self;
};

var Session = exports.Session = function (id, wrapper) {
    var self = new EventEmitter;
    
    self.id = id;
    self.remote = {};
    
    var instance = self.instance =
        typeof(wrapper) == 'function'
            ? new wrapper(self.remote, self)
            : wrapper || {}
    ;
    
    self.localStore = new Store;
    self.remoteStore = new Store;
    
    self.localStore.on('cull', function (id) {
        self.emit('request', {
            method : 'cull',
            arguments : [id],
            callbacks : {}
        });
    });
    
    var scrubber = new Scrubber(self.localStore);
    
    self.start = function () {
        self.request('methods', [ instance ]);
    };
    
    self.request = function (method, args) {
        var scrub = scrubber.scrub(args);
        
        self.emit('request', {
            method : method,
            arguments : scrub.arguments,
            callbacks : scrub.callbacks,
            links : scrub.links
        });
    };
    
    self.parse = function (line) {
        var msg = null;
        try { msg = json.parse(line) }
        catch (err) {
            self.emit('error', new SyntaxError(
                'Error parsing JSON message: ' + json.stringify(line))
            );
            return;
        }
        
        try { self.handle(msg) }
        catch (err) { self.emit('error', err) }
    };
    
    self.handle = function (req) {
        var args = scrubber.unscrub(req, function (id) {
            if (!self.remoteStore.has(id)) {
                // create a new function only if one hasn't already been created
                // for a particular id
                self.remoteStore.add(function () {
                    self.request(id, [].slice.apply(arguments));
                }, id);
            }
            return self.remoteStore.get(id);
        });
        
        if (req.method === 'methods') {
            handleMethods(args[0]);
        }
        else if (req.method === 'error') {
            var methods = args[0];
            self.emit('remoteError', methods);
        }
        else if (req.method === 'cull') {
            args.forEach(function (id) {
                self.remoteStore.cull(args);
            });
        }
        else if (typeof req.method === 'string') {
            if (self.instance.propertyIsEnumerable(req.method)) {
                apply(self.instance[req.method], self.instance, args);
            }
            else {
                self.emit('error', new Error(
                    'Request for non-enumerable method: ' + req.method
                ));
            }
        }
        else if (typeof req.method == 'number') {
            apply(self.localStore.get(req.method), self.instance, args);
        }
    }
    
    function handleMethods (methods) {
        if (typeof methods != 'object') {
            methods = {};
        }
        
        // copy since assignment discards the previous refs
        Object.keys(self.remote).forEach(function (key) {
            delete self.remote[key];
        });
        
        Object.keys(methods).forEach(function (key) {
            self.remote[key] = methods[key];
        });
        
        self.emit('remote', self.remote);
        self.emit('ready');
    }
    
    function apply(f, obj, args) {
        try { f.apply(obj, args) }
        catch (err) { self.emit('error', err) }
    }
    
    return self;
};

// scrub callbacks out of requests in order to call them again later
var Scrubber = exports.Scrubber = function (store) {
    var self = {};
    store = store || new Store;
    self.callbacks = store.items;
    
    // Take the functions out and note them for future use
    self.scrub = function (obj) {
        var paths = {};
        var links = [];
        
        var args = Traverse(obj).map(function (node) {
            if (typeof(node) == 'function') {
                var i = store.indexOf(node);
                if (i >= 0 && !(i in paths)) {
                    // Keep previous function IDs only for the first function
                    // found. This is somewhat suboptimal but the alternatives
                    // are worse.
                    paths[i] = this.path;
                }
                else {
                    var id = store.add(node);
                    paths[id] = this.path;
                }
                
                this.update('[Function]');
            }
            else if (this.circular) {
                links.push({ from : this.circular.path, to : this.path });
                this.update('[Circular]');
            }
        });
        
        return {
            arguments : args,
            callbacks : paths,
            links : links
        };
    };
    
    // Replace callbacks. The supplied function should take a callback id and
    // return a callback of its own.
    self.unscrub = function (msg, f) {
        var args = msg.arguments || [];
        Object.keys(msg.callbacks || {}).forEach(function (strId) {
            var id = parseInt(strId,10);
            var path = msg.callbacks[id];
            args = setAt(args, path, f(id));
        });
        
        (msg.links || []).forEach(function (link) {
            var value = getAt(args, link.from);
            args = setAt(args, link.to, value);
        });
        
        return args;
    };
    
    function setAt (ref, path, value) {
        var node = ref;
        for (var i = 0; i < path.length - 1; i++) {
            var key = path[i];
            if (Object.propertyIsEnumerable.call(node, key)) {
                node = node[key];
            }
            else return undefined;
        };
        var last = path.slice(-1)[0];
        if (last === undefined) {
            return value;
        }
        else {
            node[last] = value;
            return ref;
        }
    }
    
    function getAt (node, path) {
        for (var i = 0; i < path.length; i++) {
            var key = path[i];
            if (Object.propertyIsEnumerable.call(node, key)) {
                node = node[key];
            }
            else return undefined;
        }
        return node;
    }
    
    return self;
}

var Store = exports.Store = function() {
    var self = new EventEmitter;
    var items = self.items = [];
    
    self.has = function (id) {
        return items[id] != undefined;
    };
    
    self.get = function (id) {
        if (!self.has(id)) return null;
        return wrap(items[id]);
    };
    
    self.add = function (fn, id) {
        if (id == undefined) id = items.length;
        items[id] = fn;
        return id;
    };
    
    self.cull = function (arg) {
        if (typeof arg == 'function') {
            arg = items.indexOf(arg);
        }
        delete items[arg];
        return arg;
    };
    
    self.indexOf = function (fn) {
        return items.indexOf(fn);
    };
    
    function wrap (fn) {
        return function() {
            fn.apply(this, arguments);
            autoCull(fn);
        };
    }
    
    function autoCull (fn) {
        if (typeof fn.times == 'number') {
            fn.times--;
            if (fn.times == 0) {
                var id = self.cull(fn);
                self.emit('cull', id);
            }
        }
    }
    
    return self;
};

var parseArgs = exports.parseArgs = function (argv) {
    var params = {};
    
    [].slice.call(argv).forEach(function (arg) {
        if (typeof arg === 'string') {
            if (arg.match(/^\d+$/)) {
                params.port = parseInt(arg, 10);
            }
            else if (arg.match('^/')) {
                params.path = arg;
            }
            else {
                params.host = arg;
            }
        }
        else if (typeof arg === 'number') {
            params.port = arg;
        }
        else if (typeof arg === 'function') {
            params.block = arg;
        }
        else if (typeof arg === 'object') {
            if (arg.__proto__ === Object.prototype) {
                // merge vanilla objects into params
                Object.keys(arg).forEach(function (key) {
                    params[key] = arg[key];
                });
            }
            else if (stream.Stream && arg instanceof stream.Stream) {
                params.stream = arg;
            }
            else {
                // and non-Stream, non-vanilla objects are probably servers
                params.server = arg;
            }
        }
        else if (typeof arg === 'undefined') {
            // ignore
        }
        else {
            throw new Error('Not sure what to do about '
                + typeof arg + ' objects');
        }
    });
    
    return params;
};
