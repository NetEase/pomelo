# Running the unit tests #

Load the index.html file with you favorite browser.

# Adding a spec #

$ build/build.sh 

You need to have the SDKTools or at least hammerjs installed and available in your
PATH

# THE RULES 

* No dynamic spec generation, the unit tests are not designed to be dry,
 they must be easy to read and allow you to quickly find a bug.
* If a spec generates dom, don't forget to clean the document.body after 
 it is executed.
* Avoid testing dom rendering we are using the eye for that, you should only test code logic.
* Don't comment a spec or a suite to disable it, instead use xit and xdescribe.
* You should have only one expectation by spec.
* 99% of time you don't need to write specifics test for private functions and abstract classes.
* RTFM https://github.com/pivotal/jasmine/wiki

# Test Coverage #

The test reporter supports jscoverage which is available at http://siliconforks.com/jscoverage/
Here the jscoverage-server command for each project:

Ext
$ jscoverage-server --no-instrument=extjs/test --no-instrument=platform/test --no-instrument=platform/core/test --no-instrument=testreporter

Touch
$ jscoverage-server --no-instrument=touch/test --no-instrument=platform/test --no-instrument=platform/core/test --no-instrument=testreporter

Use jscoverage-server, it helps a lot.

# Mouse and Keyboard events simulation #

/**
 * @param {HTMLElement} el The target dom element
 * @param {String} type The event name 'mousedown', 'click' etc...
 * @param {Number} x The x position
 * @param {Number} y The y position
 */
jasmine.fireMouseEvent(el, type, x, y);

/**
 * @param {HTMLElement} el The target dom element
 * @param {String} type The event name 'keypress', 'keydown' etc...
 * @param {Number} key The keycode number
 */
jasmine.fireKeyEvent(el, type, key);

# Accessing sandbox iframe from your browser console #

The specs are run in an isolated scope from the the testreporter ui.
To execute command inside the isolated scope, you can use iScope() function.

// with a string as first argument
iScope("console.log(Ext)");
 
//with a function as first argument
iScope(function() { console.log(Ext); });


# White Listing global variable #

With Chrome and Firefox the Test Reporter is able to detect global variables. 
But sometimes you have to create one during spec execution, in this case you must use addGlobal() function inside the spec to whitelist your global.


// whitelist a global variable
addGlobal("foobar");


# Matchers List #

This is a list of available matchers
expect(x).toEqual(y);vcompares objects or primitives x and y and passes if they are equivalent
expect(x).toBe(y); compares objects or primitives x and y and passes if they are the same object
expect(x).toMatch(pattern); compares x to string or regular expression pattern and passes if they match
expect(x).toBeDefined(); passes if x is not undefined
expect(x).toBeNull(); passes if x is null
expect(x).toBeTruthy(); passes if x evaluates to true
expect(x).toBeFalsy(); passes if x evaluates to false
expect(x).toContain(y); passes if array or string x contains y
expect(x).toBeLessThan(y); passes if x is less than y
expect(x).toBeGreaterThan(y); passes if x is greater than y
expect(fn).toThrow(e); passes if function fn throws exception e when executed
expect(fn).toRaiseExtError(e); passes if function fn raise an Ext.Error e when executed
expect(dom).hasHTML(html); passes if dom.innerHTML and html are equivalent (it normalizes difference across browsers just use standard webkit/ff innerHTML)