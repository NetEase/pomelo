#What's new

##Loader
To init the Loader, assuming PATH points to the root folder

	load(PATH + 'src/Loader.js');
	Loader.setBasePath(PATH + 'src');
	
After that, simply include other classes at will. The behaviour should be similar to require_once in PHP. It is specially useful when you need to include dynamic components during run-time without having to specify all of them at the beginning. For example:

	// Single class
	Loader.require('Filesystem');
	Fiesystem.readFile('some/file/here.js');
	
	// Multiple
	Loader.require(['Filesystem', 'Logger', 'Parser']);
	
	// Class name syntax
	Loader.require('Some.Thing.Here'); // Will load Some/Thing/Here.js within the basePath set above

This is beautifully utilized by the Parser below to dynamically load Statement classes on demand.

##Parser

###Introduction
The new Parser allows fully customizable build, to be consumed by all of our products. It combines the syntax of inline JavaScript comments & HTML for high readablity. As a quick example, let say we have this chunk of code:

	alert('Some code here');
	
	//<if browser="ie" browserVersion="6">
	
	alert("Some ugly hacks just to target IE 6 only");
	
	//<else>
	
	alert("Others");
	
	//</if>
	
During build time, if we supply the following params:

	browser: 'ie'
	browserVersion: 7
	
The result will be:

	alert('Some code here');
	
	alert("Others");
	
###Nested conditions
Nested conditions / tags are fully supported without sacrificing much build performance. We can mix and match complex conditions when necessary:
	//<if condition="here">
		//<debug>
			//<if blah>
				...
			//</if>
			...
		//</debug>
		...
		//<if other="cond">
			...
		//<else>
			//<deprecated since="1.0">
				...
			//</deprecated>
			...
		//</if>
	//</if>
		
	
###Attribute Syntax
Currently all these are supported:
	browser="ie"
	browser='ie'
	browser=ie

Comparisons:	
	browser="6"
	browser="!6"
	browser=">6"
	browser="<6"
	browser=">=6"
	browser="<=6"
	
Auto casting during evaluation
	Boolean: "true" => true, "false" => false
	Numeric: "3.2" => 3.2
	
###Tag Name:
Parser package is designed to be highly extensible. All custom tag names have their own corresponding class, extending from Parser.Statement (Parser/Statement.js). Currently we have the following:

	If
	Elseif
	Else
	Debug
	Deprecated
	
Debug and Deprecated extends from If, and they make typing more convenient:
	
	//<debug>
	alert("Stuff in here are strictly for debugging, shouldn't appear during production");
	//</debug>
	
Which is equivalent to:

	//<if debug="true">
	...
	//</if>
	
	// OR
	
	//<if debug>
	...
	//</if>
	
Deprecated has a required "since" attribute:

	//<deprecated since="2.0">
	alert("Old stuff for backwards compatibility");
	//</deprecated>
	
If the param name "minVersion" (minimum supported version) is set to 3.0 (>2.0) during build, the above will disappear for good.

Unknown tags (no equivalent classes that the Loader can find) will be ignored
	//<notSupportedYet>
	alert("Nothing special")
	//</notSupportedYet>

Furture tags can be added with ease based on our needs. This is how Parser.Statement.Debug looks like:
	Loader.require('Parser.Statement.If');

	Parser.Statement.Debug = Ext.extend(Parser.Statement.If, {
	    constructor: function() {
	        Parser.Statement.Debug.superclass.constructor.apply(this, arguments);

	        this.setProperty('debug', true);
	    }
	});

###Inversion
For convenience, conditional inversion can be done like this:
	//<!if browser="ie">
	
	//</!if>
	
	//<!debug>
	
	//<else>
	
	//</!debug>

###Standalone
Parser is a singleton and does not depend on anything else other than Loader.js and Ext.js. It's unittest-able too. Usage is straight-forward:

	Parser.setParams({
		debug: false,
		minVersion: 2.2,
		ie6Compatible: false
		// More params...
	});
	
	// Returns the parsed content of the given file, based on the params supplied above
	var parsed = Parser.parse("path/to/file.js");
	
###Integration with building process
Parser will automatically process final target files right before compression. It takes the "options" property inside jsb3 file as the params, merged with the old "debug" property. For example, currently in ext-touch.jsb3:
	...
	"builds": [
    {
        "name": "Sencha Touch",
        "target": "ext-touch.js",
        "debug": true,
        "packages": [
        	...
        ]
    }

To supply more params for Parser:
	...
	"builds": [
    {
        "name": "Sencha Touch",
        "target": "ext-touch.js",
        "debug": true,
		"options": {
			"minVersion": 2.0,
			"experimental": true
		}
        "packages": [
        	...
        ]
    }

From which the Parser will process with the following params:
	{
		debug: true,
		minVersion: 2.0,
		experimental: true
	}
	
###Unit testing
	/path/to/jsdb tests/run.js --name parser