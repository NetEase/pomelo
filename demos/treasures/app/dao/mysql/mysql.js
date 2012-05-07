var client = require('./sql');
//client.init();
setTimeout(client.init, 1000);
var sqlclient = module.exports;

sqlclient.insert = client.query;
sqlclient.update = client.query;
sqlclient.delete = client.query;
sqlclient.query = client.query;





 