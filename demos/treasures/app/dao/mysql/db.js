var app = require('../../../../lib/application');
/**
 * db configs
 */ 
module.exports = {
    host : app.mysql.host,
    port : app.mysql.dbport, 
    database : app.mysql.db, 
    username : app.mysql.dbusername, 
    password : app.mysql.dbpassword
};