var LocalSessionService = require('../common/service/localSessionService');

module.exports = function(app) {
	var service = new LocalSessionService(app);
	service.name = '__localSession__';

	return service;
};
