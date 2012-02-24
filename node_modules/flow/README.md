Flow-JS
===============

Overview
---------------

Flow-JS provides a continuation-esque construct that makes it much easier to express
multi-step asynchronous logic in non-blocking callback-heavy environments like
Node.js or javascript in the web browser.

The concept is best explained with an example. The following code uses a simple
asynchronous key-store to look-up a user's ID from his username and then sets his
email address, first name, and last name.

In this example, the dbGet and dbSet functions are assumed to rely on asynchronous
I/O and both take a callback that is called upon completion.

	dbGet('userIdOf:bobvance', function(userId) {
		dbSet('user:' + userId + ':email', 'bobvance@potato.egg', function() {
			dbSet('user:' + userId + ':firstName', 'Bob', function() {
				dbSet('user:' + userId + ':lastName', 'Vance', function() {
					okWeAreDone();
				});
			});
		});
	});

Notice how every single step requires another nested function definition. A
four-step process like the one shown here is fairly awkward. Imagine how painful a
10-step process would be!

One might point out that there is no reason to wait for one dbSet to complete before
calling the next, but, assuming we don't want okWeAreDone to be called until all
three calls to dbSet are finished, we'd need some logic to manage that:

	dbGet('userIdOf:bobvance', function(userId) {
		var completeCount = 0;
		var complete = function() {
			completeCount += 1;
			if (completeCount == 3) {
				okWeAreDone();
			}
		}
		
		dbSet('user:' + userId + ':email', 'bobvance@potato.egg', complete);
		dbSet('user:' + userId + ':firstName', 'Bob', complete);
		dbSet('user:' + userId + ':lastName', 'Vance', complete);
	});

Now look at the same example using Flow-JS:

	flow.exec(
		function() {
			dbGet('userIdOf:bobvance', this);
			
		},function(userId) {
			dbSet('user:' + userId + ':email', 'bobvance@potato.egg', this.MULTI());
			dbSet('user:' + userId + ':firstName', 'Bob', this.MULTI());
			dbSet('user:' + userId + ':lastName', 'Vance', this.MULTI());
		
		},function() {
			okWeAreDone()
		}
	);

A flow consists of a series of functions, each of which is applied with a special
`this` object which serves as a callback to the next function in the series. In
cases like our second step, `this.MULTI()` can be used to generate a callback that
won't call the next function until all such callbacks have been called.


Installing
---------------

Flow-JS is a CommonJS compatible module. Place the "flow.js" file in any directory
listed in your `require.paths` array and require it like this:

	var flow = require('flow')

Or you can just put "flow.js" next to your script and do this:

	var flow = require('./flow')


Defining a Flow
---------------

`flow.define` defines a flow given any number of functions as parameters. It returns
a function that can be used to execute that flow more than once. Whatever parameters
are passed each time that flow is called are passed as the parameters to the first
function in the flow.

Each function in the flow is called with a special `this` object which maintains the
state of the flow's execution, acts as a container for saving values for use between
functions in the flow, and acts as a callback to the next function in the flow.

Here is an example to make this clear:

	// define a flow for renaming a file and then printing its stats
	var renameAndStat = flow.define(
	
		function(fromName, toName) {
			// arguments passed to renameAndStat() will pass through to this first function
			
			this.toName = toName; // save to be used in the next function
			fs.rename(fromName, toName, this);
		
		},function(err) {
			// when fs.rename calls the special "this" callback above, this function will be called
			// whatever arguments fs.rename chooses to pass to the callback will pass through to this function
		
			if (err) throw err;
			
			// the "this" here is the same as in the function above, so this.toName is available
			fs.stat(this.toName, this);
		
		},function(err, stats) {
			// when fs.stat calls the "this" callback above, this function will be called
			// whatever arguments fs.stat chooses to pass to the callback will pass through to this function
			
			if (err) throw err;
			
			sys.puts("stats: " + JSON.stringify(stats));
		}
	);
	
	// now renameAndStat can be used more than once
	renameAndStat("/tmp/hello1", "/tmp/world1");
	renameAndStat("/tmp/hello2", "/tmp/world2");


Executing a Flow Just Once
---------------

`flow.exec` is a convenience function that defines a flow and executes it immediately,
passing no arguments to the first function.

Here's a simple example very similar to the one above:

	flow.exec(
		function() {
			fs.rename("/tmp/hello", "/tmp/world", this);
		},function(err) {
			if (err) throw err;
			fs.stat("/tmp/world", this)
		},function(err, stats) {
			if (err) throw err;
			sys.puts("stats: " + JSON.stringify(stats));
		}
	);


Multiplexing
---------------

Sometimes, it makes sense for a step in a flow to initiate several asynchronous tasks and
then wait for all of those tasks to finish before continuing to the next step in the flow.
This can be accomplished by passing `this.MULTI()` as the callback rather than just `this`.

Here is an example of `this.MULTI()` in action (repeated from the overview):

	flow.exec(
		function() {
			dbGet('userIdOf:bobvance', this);
			
		},function(userId) {
			dbSet('user:' + userId + ':email', 'bobvance@potato.egg', this.MULTI());
			dbSet('user:' + userId + ':firstName', 'Bob', this.MULTI());
			dbSet('user:' + userId + ':lastName', 'Vance', this.MULTI());
		
		},function() {
			okWeAreDone()
		}
	);

In many cases, you may simply discard the arguments passed to each of the callbacks generated
by `this.MULTI()`, but if you need them, they are accessible as an array of `arguments`
objects passed as the first argument of the next function. Each `arguments` object will be
appended to the array as it is received, so the order will be unpredictable for most
asynchronous APIs.

Here's a quick example that checks for errors:

	flow.exec(
		function() {
			fs.rename("/tmp/a", "/tmp/1", this.MULTI());
			fs.rename("/tmp/b", "/tmp/2", this.MULTI());
			fs.rename("/tmp/c", "/tmp/3", this.MULTI());
		
		},function(argsArray) {
			argsArray.forEach(function(args){
				if (args[0]) then throw args[0];
			});
		}
	);


serialForEach
---------------

Flow-JS comes with a convience function called `flow.serialForEach` which can be used to
apply an asynchronous function to each element in an array of values serially:

	flow.serialForEach([1, 2, 3, 4], function(val) {
		keystore.increment("counter", val, this);
	},function(error, newVal) {
		if (error) throw error;
		sys.puts('newVal: ' + newVal);
	},function() {
		sys.puts('This is the end!');
	});

`flow.serialForEach` takes an array-like object, a function to be called for each item
in the array, a function that receives the callback values after each iteration, and a
function that is called after the entire process is finished. Both of the second two
functions are optional.

`flow.serialForEach` is actually implemented with `flow.define`.

Thanks to John Wright for suggesting the idea! (http://github.com/mrjjwright)
