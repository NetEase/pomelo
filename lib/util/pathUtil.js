const fs = require('fs');
const path = require('path');
const Constants = require('./constants');

class PathUtil
{
    /**
     * Get system remote service path
     *
     * @param  {String} role server role: frontend, backend
     * @return {String}      path string if the path exist else null
     */
	static getSysRemotePath(role)
    {
		const p = path.join(__dirname, '/../common/remote/', role);
		return fs.existsSync(p) ? p : null;
	}

    /**
     * Get user remote service path
     *
     * @param  {String} appBase    application base path
     * @param  {String} serverType server type
     * @return {String}            path string if the path exist else null
     */
	static getUserRemotePath(appBase, serverType)
    {
		const p = path.join(appBase, '/app/servers/', serverType, Constants.DIR.REMOTE);
		return fs.existsSync(p) ? p : null;
	}

    /**
     * Get user remote cron path
     *
     * @param  {String} appBase    application base path
     * @param  {String} serverType server type
     * @return {String}            path string if the path exist else null
     */
	static getCronPath(appBase, serverType)
    {
		const p = path.join(appBase, '/app/servers/', serverType, Constants.DIR.CRON);
		return fs.existsSync(p) ? p : null;
	}

    /**
     * List all the subdirectory names of user remote directory
     * which hold the codes for all the server types.
     *
     * @param  {String} appBase application base path
     * @return {Array}         all the subdiretory name under servers/
     */
	static listUserRemoteDir(appBase)
    {
		const base = path.join(appBase, '/app/servers/');
		const files = fs.readdirSync(base);
		return files.filter(function(fn)
        {
			if (fn.charAt(0) === '.')
            {
				return false;
			}

			return fs.statSync(path.join(base, fn)).isDirectory();
		});
	}

    /**
     * Get handler path
     *
     * @param  {String} appBase    application base path
     * @param  {String} serverType server type
     * @return {String}            path string if the path exist else null
     */
	static getHandlerPath(appBase, serverType)
    {
		const p = path.join(appBase, '/app/servers/', serverType, Constants.DIR.HANDLER);
		return fs.existsSync(p) ? p : null;
	}

    /**
     * Compose remote path record
     *
     * @param  {String} namespace  remote path namespace, such as: 'sys', 'user'
     * @param  {String} serverType
     * @param  {String} path       remote service source path
     * @return {Object}            remote path record
     */
	static remotePathRecord(namespace, serverType, path)
    {
		return {namespace  : namespace,
            serverType : serverType,
            path       : path};
	}

    /**
     * Get admin script root path.
     *
     * @param  {String} appBase application base path
     * @return {String}         script path string
     */
	static getScriptPath(appBase)
    {
		return path.join(appBase, Constants.DIR.SCRIPT);
	}

    /**
     * Get logs path.
     *
     * @param  {String} appBase application base path
     * @return {String}         logs path string
     */
	static getLogPath(appBase)
    {
		return path.join(appBase, Constants.DIR.LOG);
	}
}

module.exports = PathUtil;