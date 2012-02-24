
# About

  Generic resource pool.  Can be used to reuse or throttle expensive resources such as
  database connections.

## Installation

    $ npm install generic-pool
    
## History

    1.0.9 - Dec 18 2011
       - Merged #25 (add getName() - contributed by BryanDonovan)
       - Merged #27 (remove sys import - contributed by botker)
       - Merged #26 (log levels - contributed by JoeZ99)

    1.0.8 - Nov 16 2011
       - Merged #21 (add getter methods to see pool size, etc. - contributed by BryanDonovan)
       
    1.0.7 - Oct 17 2011
       - Merged #19 (prevent release on the same obj twice - contributed by tkrynski)
       - Merged #20 (acquire() returns boolean indicating whether pool is full - contributed by tilgovi)

    1.0.6 - May 23 2011
       - Merged #13 (support error variable in acquire callback - contributed by tmcw) 
          - Note: This change is backwards compatible.  But new code should use the two
                  parameter callback format in pool.create() functions from now on.
       - Merged #15 (variable scope issue in dispense() - contributed by eevans)
       
    1.0.5 - Apr 20 2011
       - Merged #12 (ability to drain pool - contributed by gdusbabek)
       
    1.0.4 - Jan 25 2011
       - Fixed #6 (objects reaped with undefined timeouts)
       - Fixed #7 (objectTimeout issue)

    1.0.3 - Dec 9 2010
       - Added priority queueing (thanks to sylvinus)
       - Contributions from Poetro
         - Name changes to match conventions described here: http://en.wikipedia.org/wiki/Object_pool_pattern
            - borrow() renamed to acquire()
            - returnToPool() renamed to release()
         - destroy() removed from public interface
         - added JsDoc comments
         - Priority queueing enhancements
       
    1.0.2 - Nov 9 2010 
       - First NPM release

## Example

    // Create a MySQL connection pool with
    // a max of 10 connections and a 30 second max idle time
    var poolModule = require('generic-pool');
    var pool = poolModule.Pool({
        name     : 'mysql',
        create   : function(callback) {
            var Client = require('mysql').Client;
            var c = new Client();
            c.user     = 'scott';
            c.password = 'tiger';
            c.database = 'mydb';
            c.connect();
            
            // parameter order: err, resource
            // new in 1.0.6
            callback(null, c);
        },
        destroy  : function(client) { client.end(); },
        max      : 10,
        idleTimeoutMillis : 30000,
        log : true
    });

    // acquire connection - callback function is called
    // once a resource becomes available
    pool.acquire(function(err, client) {
        client.query("select * from foo", [], function() {
            // return object back to pool
            pool.release(client);
        });
    });
    
## Documentation

    Pool() accepts an object with these slots:

                  name : name of pool (string, optional)
                create : function that returns a new resource
                           should call callback() with the created resource
               destroy : function that accepts a resource and destroys it
                   max : maximum number of resources to create at any given time
     idleTimeoutMillis : max milliseconds a resource can go unused before it should be destroyed
                         (default 30000)
    reapIntervalMillis : frequency to check for idle resources (default 1000),
         priorityRange : int between 1 and x - if set, borrowers can specify their
                         relative priority in the queue if no resources are available.
                         see example.  (default 1)
                   log : true/false or function -
                           If a log is a function, it will be called with two parameters:
                                                    - log string
                                                    - log level ('verbose', 'info', 'warn', 'error')
                           Else if log is true, verbose log info will be sent to console.log()
                           Else internal log messages be ignored (this is the default)

## Priority Queueing

The pool now supports optional priority queueing.  This becomes relevant when no resources 
are available and the caller has to wait. acquire() accepts an optional priority int which 
specifies the caller's relative position in the queue.

     // create pool with priorityRange of 3
     // borrowers can specify a priority 0 to 2
     var pool = poolModule.Pool({
         name     : 'mysql',
         create   : function(callback) {
             // do something
         },
         destroy  : function(client) { 
             // cleanup.  omitted for this example
         },
         max      : 10,
         idleTimeoutMillis : 30000,
         priorityRange : 3
     });

     // acquire connection - no priority - will go at end of line
     pool.acquire(function(err, client) {
         pool.release(client);
     });

     // acquire connection - high priority - will go into front slot
     pool.acquire(function(err, client) {
         pool.release(client);
     }, 0);

     // acquire connection - medium priority - will go into middle slot
     pool.acquire(function(err, client) {
         pool.release(client);
     }, 1);

     // etc..

## Draining

If you know would like to terminate all the resources in your queue before
their timeouts have been reached, you can use `shutdownNow()` in conjunction
with `drain()`:

    pool.drain(function() {
	    pool.destroyAllNow();
    });

One side-effect of calling `drain()` is that subsequent calls to `acquire()`
will throw an Error.

## Pool info

The following functions will let you get information about the pool:

    // returns factory.name for this pool
    pool.getName()

    // returns number of resources in the pool regardless of
    // whether they are free or in use
    pool.getPoolSize()

    // returns number of unused resources in the pool
    pool.availableObjectsCount()

    // returns number of callers waiting to acquire a resource
    pool.waitingClientsCount()


## Run Tests

    $ npm install expresso
    $ expresso -I lib test/*.js

## License 

(The MIT License)

Copyright (c) 2010-2011 James Cooper &lt;james@bitmechanic.com&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
