var fs = require('fs');
var path = require('path');
var Constants = require('./constants');
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
  var p = path.join(appBase, '/app/servers/', serverType, Constants.DIR.REMOTE);
  return fs.existsSync(p) ? p : null;
};

/**
 * Get user remote cron path
 * 
 * @param  {String} appBase    application base path
 * @param  {String} serverType server type
 * @return {String}            path string if the path exist else null
 */
exp.getCronPath = function(appBase, serverType) {
  var p = path.join(appBase, '/app/servers/', serverType, Constants.DIR.CRON);
  return fs.existsSync(p) ? p : null;
};

/**
 * List all the subdirectory names of user remote directory
 * which hold the codes for all the server types.
 *
 * @param  {String} appBase application base path
 * @return {Array}         all the subdiretory name under servers/
 */
exp.listUserRemoteDir = function(appBase) {
  var base = path.join(appBase, '/app/servers/');
  var files = fs.readdirSync(base);
  return files.filter(function(fn) {
    if(fn.charAt(0) === '.') {
      return false;
    }

    return fs.statSync(path.join(base, fn)).isDirectory();
  });
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
  var p = path.join(appBase, '/app/servers/', serverType, Constants.DIR.HANDLER);
  return fs.existsSync(p) ? p : null;
};

/**
 * Get admin script root path.
 *
 * @param  {String} appBase application base path
 * @return {String}         script path string
 */
exp.getScriptPath = function(appBase) {
  return path.join(appBase, Constants.DIR.SCRIPT);
};

/**
 * Get logs path.
 *
 * @param  {String} appBase application base path
 * @return {String}         logs path string
 */
exp.getLogPath = function(appBase) {
  return path.join(appBase, Constants.DIR.LOG);
};