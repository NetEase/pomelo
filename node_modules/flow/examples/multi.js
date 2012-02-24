var sys = require('sys');
var flow = require ('../flow');
var keystore = require('./keystore');

flow.exec(
	function() {
		keystore.get("userId:paul", this);
	
	},function(err, userId) {
		keystore.set("user:" + userId + ":firstName", "Bob", this.MULTI());
		keystore.set("user:" + userId + ":lastName", "Vance", this.MULTI());
		keystore.set("user:" + userId + ":email", "bobvance@bob.egg", this.MULTI());
	
	},function() {
		keystore.dump()
	}
)