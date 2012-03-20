var client = require('./sql');
var sqlclient = module.exports;

getMysqlClient = function(app) {
	client.init(app);
	sqlclient.insert = client.query;
	sqlclient.update = client.query;
	sqlclient.delete = client.query;
	sqlclient.query = client.query;
}


sqlclient.client = getMysqlClient




 