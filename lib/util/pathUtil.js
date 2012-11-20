var fs = require('fs');
var path = require('path');
var exp = module.exports;

/**
 * Get system remote service path
 * 
 * @param  {String} role server role: frontend, backend
 * @return {String}      path string if the path exist else null
 */
exp.getSysRemotePath = function(role) {
	var p = path.join(__dirname, '/../common/remote/', role);
	return fs.existsSync(p) ? p : null;
};

/**
 * Get user remote service path
 * 
 * @param  {String} appBase    application base path
 * @param  {String} serverType server type
 * @return {String}            path string if the path exist else null
 */
exp.getUserRemotePath = function(appBase, serverType) {
	var p = path.join(appBase, '/app/servers/', serverType, '/remote/');
	return fs.existsSync(p) ? p : null;
};

/**
 * Compose remote path record
 * 
 * @param  {String} namespace  remote path namespace, such as: 'sys', 'user'
 * @param  {String} serverType 
 * @param  {String} path       remote service source path
 * @return {Object}            remote path record
 */
exp.remotePathRecord = function(namespace, serverType, path) {
	return {namespace: namespace, serverType: serverType, path: path};
};

/**
 * Get handler path
 * 
 * @param  {String} appBase    application base path
 * @param  {String} serverType server type
 * @return {String}            path string if the path exist else null
 */
exp.getHandlerPath = function(appBase, serverType) {
	var p = path.join(appBase, '/app/servers/', serverType, '/handler/');
	return fs.existsSync(p) ? p : null;
};

exp.getScriptPath = function(appBase) {
	return path.join(appBase, 'scripts');
};

exp.getLogPath = function(appBase) {
	return path.join(appBase, 'logs');
};