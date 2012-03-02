
/**
 * server server
 */
var server = module.exports;


/**
 * 服务器启动前回调(可选)
 */
server.beforeStart = function() {

};

/**
 * 启动服务器
 */
server.start = function() {
    console.log(' [areaServer] mock start!!! ');
};

/**
 * 服务器启动后回调(可选)
 */
server.afterStart = function() {
    console.log(' [areaServer] after start!!! ');
};

/**
 * 服务器关闭前回调(可选)
 */
server.beforeClose = function() {
};

/**
 * 关闭服务器
 */
server.close = function() {
};


