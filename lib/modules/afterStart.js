var logger = require('pomelo-logger').getLogger(__filename);

module.exports = function(opts) {
	return new Module(opts);
};

module.exports.moduleId = '__afterStart__';

var Module = function(app) {
	this.app = app;
};

 Module.prototype.monitorHandler = function(msg, cb) {
	logger.debug('after start: %j', this.app.get('serverId'));
	var self = this;
	this.app.afterStart(function(err) {
		if(err) {
			logger.error('fail to call afterStart lifecycle, now try to stop server. ' + err.stack);
			self.app.stop(true);
		} else {
			logger.info('server %j started.', self.app.get('serverId'));
		}
	});
};
