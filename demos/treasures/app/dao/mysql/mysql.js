var client = require('./sql');
client.init('db.js');

 
var sqlclient = module.exports;

sqlclient.insert = client.query;
sqlclient.update = client.query;
sqlclient.delete = client.query;
sqlclient.query = client.query;
 