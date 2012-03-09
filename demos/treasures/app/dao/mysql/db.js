var config = require('./config')
/**
 * db configs
 */ 
module.exports = {
    host : config.host,
    port : config.dbport, 
    database : config.db, 
    username : config.dbusername, 
    password : config.dbpassword
};