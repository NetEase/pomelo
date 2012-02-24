var assert = require('assert');
var flow = require('./flow');
var keystore = require('./examples/keystore');

var flowsComplete = 0;
setTimeout(function() {
	var expected = 3;
	assert.strictEqual(flowsComplete, expected, flowsComplete + "/" + expected +" flows finished");
}, 1000);

// very simple test
flow.exec(
	function() {
		keystore.increment("counter", 1, this);
	
	},function(err, newValue) {
		assert.strictEqual(newValue, 1, "increment test didn't work");
		flowsComplete += 1;
	}
);

// MULTI test
flow.exec(
	function() {
		keystore.set("firstName", "Bob", this.MULTI());
		keystore.set("lastName", "Vance", this.MULTI());
	
	},function() {
		var db = keystore.getDb();
		assert.strictEqual(db.firstName, "Bob", "multi test didn't work");
		assert.strictEqual(db.lastName, "Vance", "multi test didn't work");
		flowsComplete += 1;
	
	}
);

// serialForEach test
var valueSequence = [];
flow.serialForEach([1, 2, 3, 4], function(val) {
	keystore.increment("forEachCounter", val, this);
},function(error, newVal) {
	if (error) throw error;
	valueSequence.push(newVal);
},function() {
	assert.deepEqual(valueSequence, [1, 3, 6, 10], "sequence of values is incorrect: " + JSON.stringify(valueSequence));
	flowsComplete += 1;
});
