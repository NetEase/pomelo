var client = require('./sql');
client.init();
sqlclient.insert = client.query;
sqlclient.update = client.query;
sqlclient.delete = client.query;
sqlclient.query = client.query;

var sqlclient = module.exports;




 