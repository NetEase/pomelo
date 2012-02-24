// This is a simple module used by the examples and tests to simulate an asynchronous API.

var sys = require('sys');

var db = {
	'userId:paul': 1,
	'userId:jim': 2,
	
	'user:1:password': 'foo',
	'user:2:password': 'bar'
};

exports.clear = function() {
	db = {};
}

// keystore.set(key, value, callback)
// callback signature: (error)
exports.set = function(key, value, callback) {
	setTimeout(function() {
		db[key] = value;
		if (callback) callback(undefined);
	}, 100);
}

// keystore.get(key, callback)
// callback signature: (error, value)
exports.get = function(key, callback) {
	setTimeout(function() {
		if (callback) callback(undefined, db[key]);
	}, 100);
}

// keystore.increment(key, incrementBy, callback)
// callback signature: (error, newValue)
exports.increment = function(key, incrementBy, callback) {
	setTimeout(function() {
		if (db[key] === undefined) db[key] = 0;
		db[key] += incrementBy;
		if (callback) callback(undefined, db[key]);
	}, 100);
}

// prints the contents of the db
exports.dump = function() {
	sys.puts(JSON.stringify(db));
}

// prints the contents of one key
exports.dumpKey = function(key) {
	sys.puts(key + ": " + JSON.stringify(db[key]));
}

// allows direct access to the db for unit test
exports.getDb = function() {
	return db;
}
