var sys = require('sys');
var flow = require ('../flow');
var keystore = require('./keystore');

var auth = flow.define(
	function(username, password) {
		
		sys.puts("trying " + username + ", " + password);
		
		this.password = password;
		keystore.get('userId:' + username, this);
		
	},function(err, userId) {
	
		keystore.get('user:' + userId + ':password', this);
		
	},function(err, passwordInDb) {
	
		if (passwordInDb == this.password) {
			sys.puts("Authenticated!");
		}
		else {
			sys.puts("Failed Authentication!");
		}
	}
)

auth('paul', 'test');
auth('paul', 'foo');
