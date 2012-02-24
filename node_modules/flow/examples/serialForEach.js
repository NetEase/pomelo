var sys = require('sys');
var flow = require ('../flow');
var keystore = require('./keystore');

flow.serialForEach([1, 2, 3, 4], function(val) {
	keystore.increment("counter", val, this);
},function(error, newVal) {
	if (error) throw error;
	sys.puts('newVal: ' + newVal);
});