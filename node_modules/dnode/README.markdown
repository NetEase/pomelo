dnode
=====

![dnode: freestyle rpc](http://substack.net/images/dnode.png)

DNode is an asynchronous object-oriented RPC system for node.js that lets you
call remote functions.

It works over network sockets and even in the browser with
[socket.io](https://github.com/LearnBoost/Socket.IO).

Plus, there are dnode implementations for
[perl](http://github.com/substack/dnode-perl),
[ruby](http://github.com/substack/dnode-ruby),
[php](https://github.com/bergie/dnode-php),
and
[java](https://github.com/aslakhellesoy/dnode-java),
so you can glue
together all your backend processes swimmingly.

dnode between two node.js processes
-----------------------------------

Just write a server.js:

```javascript
var dnode = require('dnode');

var server = dnode({
    zing : function (n, cb) { cb(n * 100) }
});
server.listen(5050);
````

Run it...

    $ node server.js

Then you can whip up a client.js that calls the server's `zing` function!

```javascript
var dnode = require('dnode');

dnode.connect(5050, function (remote) {
    remote.zing(66, function (n) {
        console.log('n = ' + n);
    });
});
````

*** 

    $ node client.js
    n = 6600
    ^C

dnode on the browser
--------------------

We can retrofit the previous example to run in the browser.

Just write a server.js:

````javascript
var express = require('express');
var app = express.createServer();
app.use(express.static(__dirname));

app.listen(8080);
console.log('http://localhost:8080/');

// then just pass the server app handle to .listen()!

var dnode = require('dnode');
var server = dnode({
    zing : function (n, cb) { cb(n * 100) }
});
server.listen(app);
````

and whip up an index.html:

````html
<html>
<head>
<script src="/dnode.js" type="text/javascript"></script>
<script type="text/javascript">
    window.onload = function () {
        
        DNode.connect(function (remote) {
            remote.zing(66, function (n) {
                document.getElementById('result').innerHTML = n;
            });
        });
        
    };
</script>
</head>
<body>

n = <span id="result">?</span>

</body>
</html>
````

then just run the server.js:

    $ node server.js
    http://localhost:8080/

and navigate to http://localhost:8080:

![dnode in the browser](http://substack.net/images/dnode-slides/browser.png)

Awesome it works!

The dnode browser source automatically gets hosted at `/dnode.js` and it also
works with
[browserify](https://github.com/substack/node-browserify)
[out of the box](https://github.com/substack/dnode/tree/master/examples/web-browserify).

how it works
------------

When you throw an object at dnode, a recursive traversal scrubs out all of the
`function` objects nested in your data structure and a secondary data structure
is sent along with remote requests that creates shim functions that create RPC
calls back to the side where the functions were originally defined.

When you call a remote function, the same recursive traversal trick happens to
the arguments you pass along, so you can pass callbacks to your remote functions
that actually call you back over the wire when the remote side calls the shim
function on the other end.

Basically, dnode lets you call remote functions as if they were defined locally
without using `eval()` or `Function.prototype.toString()`. Awesome!

The only catch is that because the function calls are traveling down the
high-latency network, the return values of your functions are ignored. Use
[continuation-passing
style](http://en.wikipedia.org/wiki/Continuation-passing_style) instead!

More features:

* symmetric design: both sides of the connection can host up methods for the
    other side to call

* use TCP streams, UNIX domain sockets, or websockets courtesy of socket.io!
    (see below, just throw a webserver at `listen()`)

methods
=======

dnode(wrapper)
--------------

If `wrapper` is an object, serve this object up to the other side every time.

If `wrapper` is a function, use it to build a new object for each new client.
The result of `new wrapper(remote, conn)` will be used, where `remote` is an
empty object that will be filled with the other side's methods once the initial
protocol phase finishes and where `conn` is the connection object.

Both client and server can call `dnode()` with a wrapper.
`dnode.connect()` and `dnode.listen()` are shortcut that set `wrapper` to `{}`.

.connect(...)
-------------

Connect to a remote dnode service. Pass in a port, host, UNIX domain socket
path, block, or options object in any order. The block function if present will
be executed with the remote object and the connection object once the remote
object is ready.

You can reconnect when the connection is refused or drops by passing in a
`reconnect` option as the number of milliseconds to wait between reconnection
attempts.

Returns `this` so you can chain multiple connections.

.listen(...)
------------

Listen for incoming dnode clients. Pass in a port, host, UNIX domain socket
path, block, or options object in any order. The block function if present will
be executed with the remote object and the connection object once the remote
object is ready for each client.

If you pass a webserver (http.Server, https.Server, connect, express) to
listen(), socket.io will be bound to the webserver and the dnode browser source
will be hosted at `options.mount || "/dnode.js"`.

You can pass options through to socket.io with the `io` parameter:

````javascript
dnode(...).listen(webserver, { io : { flashPolicyServer : false } });
````

Returns `this` so you can chain multiple listeners.

.use(middleware)
----------------

You can write your own dnode middleware with `.use()`. The `middleware` function
you pass will be called just like the constructor function that `dnode()` takes.
You can modify `this`, `remote`, and `conn` objects after the instance computed
with the `dnode()` constructor executes but before the methods are sent over the
wire.

Returns `this` so you can chain middlewares.

the connection object
=====================

When you pass a constructor function to `dnode()` you'll get a connection
object as the second argument to your constructor.

The connection object (`conn`) is an EventEmitter.

* conn.id is a random hex string that uniquely identifies clients

* conn.end() closes the connection and won't reconnect

* conn emits 'ready' when the remote object has been fully populated from
    the methods exchange

* conn emits 'remote' at the same time as 'ready', except with the remote object
    as an argument

* conn emits 'end' when the connection drops

* conn emits 'connect' when the connection is established

* conn re-emits error events from the stream object

* conn emits 'refused', 'drop', and 'reconnect' when reconnect is enabled

more examples
-------------

Check out 
[the examples directory](https://github.com/substack/dnode/tree/master/examples/)
of this distribution.

You'll find examples for using dnode with
[connect](https://github.com/SenchaLabs/connect),
[express](http://expressjs.com/),
[https](https://github.com/substack/dnode/tree/master/examples/https),
and authentication.

There's a chat server too!

installation
============

Using [npm](http://npmjs.org):

    npm install dnode

Or check out the repository and fetch the deps with npm, then build the bundle:

    git clone https://github.com/substack/dnode.git
    cd dnode
    npm install --dev
    node bin/bundle.js

The dnode dependencies are listed in the
[package.json](https://github.com/substack/dnode/tree/master/package.json).
If you install with npm they will be fetched automatically.

read more
=========

* [slides from my dnode talk at parisoma](http://substack.net/posts/9aabb1)

* [Roll your own PubSub with DNode](http://substack.net/posts/9bac3e/Roll-your-own-PubSub-with-DNode)
    (Note: EventEmitters are no longer exported directly, use
    [browserify](https://github.com/substack/node-browserify) to get them back)

* [DNode: Asynchronous Remote Method Invocation for Node.js and the Browser](http://substack.net/posts/85e1bd/DNode-Asynchronous-Remote-Method-Invocation-for-Node-js-and-the-Browser)

* [Simon Willison's Weblog](http://simonwillison.net/2010/Jul/11/dnode/)

protocol
========

DNode uses a newline-terminated JSON protocol
[documented in the dnode-protocol
readme](https://github.com/substack/dnode-protocol).

dnode in other languages
========================

These libraries implement the dnode protocol too so you can make RPC calls
between scripts written in different languages.

* [dnode-perl](http://github.com/substack/dnode-perl)
* [dnode-ruby](http://github.com/substack/dnode-ruby)
* [dnode-php](https://github.com/bergie/dnode-php)
* [dnode-java](https://github.com/aslakhellesoy/dnode-java)

There's a 
[dnode-python](https://github.com/jesusabdullah/dnode-python)
in the works too but it's not finished yet.

shameless plug
==============

Want to make sure your crazy javascript-heavy app still works in other
browsers?
Give [browserling](http://browserling.com) a spin!
Browsers in your browser. Powered by dnode.
