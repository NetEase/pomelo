/**
 * Remote session service for frontend server.
 * Set session info for backend servers.
 */
var logger = require('pomelo-logger').getLogger(__filename);


module.exports = function(app) {
	return new Remote(app);
};

var Remote = function(app) {
	this.app = app;
};

Remote.prototype.bind = function(sid, uid, cb) {
	this.app.get('sessionService').bind(sid, uid, cb);
};

Remote.prototype.push = function(sid, key, value, cb) {
	this.app.get('sessionService').import(sid, key, value, cb);
};

Remote.prototype.pushAll = function(sid, settings, cb) {
	this.app.get('sessionService').importAll(sid, settings, cb);
};
