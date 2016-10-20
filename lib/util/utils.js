const os = require('os');
const util = require('util');
const exec = require('child_process').exec;
const logger = require('pomelo-logger').getLogger('pomelo', __filename);
const Constants = require('./constants');
const pomelo = require('../pomelo'),
	_ = require('lodash');

class Utils
{
  /**
   * Invoke callback with check
   * @param cb
   * @param args
     */
	static invokeCallback(cb, ...args)
    {
		if (Boolean(cb) && _.isFunction(cb))
        {
			const arg = Array.from ? Array.from(args) : [].slice.call(args);
			cb(...arg);
		}
	}

  /**
   * Get the count of elements of object
   * @param obj
   * @returns {number}
     */
	static size(obj)
    {
	    let count = 0;
	    for (const i in obj)
	    {
		    if (obj.hasOwnProperty(i) && typeof obj[i] !== 'function')
		    {
			    count++;
		    }
	    }
	    return count;
	}

  /**
   * Check a string whether ends with another string
   * @param str
   * @param suffix
   * @returns {boolean}
   */
	static endsWith(str, suffix)
    {
		return _.endsWith(str, suffix);
	}
    
    /**
     *   Check a string whether starts with another string
     * @param str
     * @param prefix
     * @returns {boolean}
     */
	static startsWith(str, prefix)
    {
		return _.startsWith(str, prefix);
	}

    /**
     * Compare the two arrays and return the difference.
     * @param array1
     * @param array2
     * @returns {Array}
     */
	static arrayDiff(array1, array2)
    {
		const o = {};
		let i = 0, len = 0;
		for (i = 0, len = array2.length; i < len; i++)
        {
			o[array2[i]] = true;
		}

		const result = [];
		for (i = 0, len = array1.length; i < len; i++)
        {
			const v = array1[i];
			if (o[v]) continue;
			result.push(v);
		}
		return result;
	}

    /*
     * Date format
     */
	static format(date, format)
    {
		format = format || 'MMddhhmm';
		const month = 3;
		const o = {
			'M+' : date.getMonth() + 1, // month
			'd+' : date.getDate(), // day
			'h+' : date.getHours(), // hour
			'm+' : date.getMinutes(), // minute
			's+' : date.getSeconds(), // second
			'q+' : Math.floor((date.getMonth() + month) / month), // quarter
			'S'  : date.getMilliseconds() // millisecond
		};

		if (/(y+)/.test(format))
        {
			format = format.replace(RegExp.$1, (`${date.getFullYear()}`).substr(4 - RegExp.$1.length));
		}

		for (const k in o)
        {
			if (new RegExp(`(${k})`).test(format))
            {
				format = format.replace(RegExp.$1, RegExp.$1.length === 1 ? o[k] :
                    (`00${o[k]}`).substr((`${o[k]}`).length));
			}
		}
		return format;
	}

    /**
     * check if has Chinese characters.
     */
	static hasChineseChar(str)
    {
		if (/.*[\u4e00-\u9fa5]+.*$/.test(str))
        {
			return true;
		}
		return false;
	}

    /**
     * transform unicode to utf8
     */
	static unicodeToUtf8(str)
    {
		let i, ch;
		let utf8Str = '';
		const len = str.length;
		for (i = 0; i < len; i++)
        {
			ch = str.charCodeAt(i);

			if ((ch >= 0x0) && (ch <= 0x7F))
            {
				utf8Str += str.charAt(i);

			}
			else if ((ch >= 0x80) && (ch <= 0x7FF))
            {
				utf8Str += String.fromCharCode(0xc0 | ((ch >> 6) & 0x1F));
				utf8Str += String.fromCharCode(0x80 | (ch & 0x3F));

			}
			else if ((ch >= 0x800) && (ch <= 0xFFFF))
            {
				utf8Str += String.fromCharCode(0xe0 | ((ch >> 12) & 0xF));
				utf8Str += String.fromCharCode(0x80 | ((ch >> 6) & 0x3F));
				utf8Str += String.fromCharCode(0x80 | (ch & 0x3F));

			}
			else if ((ch >= 0x10000) && (ch <= 0x1FFFFF))
            {
				utf8Str += String.fromCharCode(0xF0 | ((ch >> 18) & 0x7));
				utf8Str += String.fromCharCode(0x80 | ((ch >> 12) & 0x3F));
				utf8Str += String.fromCharCode(0x80 | ((ch >> 6) & 0x3F));
				utf8Str += String.fromCharCode(0x80 | (ch & 0x3F));

			}
			else if ((ch >= 0x200000) && (ch <= 0x3FFFFFF))
            {
				utf8Str += String.fromCharCode(0xF8 | ((ch >> 24) & 0x3));
				utf8Str += String.fromCharCode(0x80 | ((ch >> 18) & 0x3F));
				utf8Str += String.fromCharCode(0x80 | ((ch >> 12) & 0x3F));
				utf8Str += String.fromCharCode(0x80 | ((ch >> 6) & 0x3F));
				utf8Str += String.fromCharCode(0x80 | (ch & 0x3F));

			}
			else if ((ch >= 0x4000000) && (ch <= 0x7FFFFFFF))
            {
				utf8Str += String.fromCharCode(0xFC | ((ch >> 30) & 0x1));
				utf8Str += String.fromCharCode(0x80 | ((ch >> 24) & 0x3F));
				utf8Str += String.fromCharCode(0x80 | ((ch >> 18) & 0x3F));
				utf8Str += String.fromCharCode(0x80 | ((ch >> 12) & 0x3F));
				utf8Str += String.fromCharCode(0x80 | ((ch >> 6) & 0x3F));
				utf8Str += String.fromCharCode(0x80 | (ch & 0x3F));
			}
		}
		return utf8Str;
	}

    /**
     * Ping server to check if network is available
     *
     */
	static ping(host, cb)
    {
		if (!module.exports.isLocal(host))
        {
			const cmd = `ping -w 15 ${host}`;
			exec(cmd, (err, stdout, stderr) =>
            {
				if (err)
                {
					cb(false);
					return;
				}
				cb(true);
			});
		}
		else
        {
			cb(true);
		}
	}

    /**
     * Check if server is exsit.
     *
     */
	static checkPort(server, cb)
    {
		if (!server.port && !server.clientPort)
        {
			this.invokeCallback(cb, 'leisure');
			return;
		}
		const self = this;
		let port = server.port || server.clientPort;
		const host = server.host;
		const generateCommand = (self, host, port) =>
        {
			let cmd;
			let sshParams = pomelo.app.get(Constants.RESERVED.SSH_CONFIG_PARAMS);
			if (Boolean(sshParams) && Array.isArray(sshParams))
            {
				sshParams = sshParams.join(' ');
			}
			else
            {
				sshParams = '';
			}
			if (!self.isLocal(host))
            {
				cmd = util.format('ssh %s %s "netstat -an|awk \'{print $4}\'|grep %s|wc -l"', host, sshParams, port);
			}
			else
            {
				cmd = util.format('netstat -an|awk \'{print $4}\'|grep %s|wc -l', port);
			}
			return cmd;
		};
		const cmd1 = generateCommand(self, host, port);
		const child = exec(cmd1, (err, stdout, stderr) =>
        {
			if (err)
            {
				logger.error('command %s execute with error: %j', cmd1, err.stack);
				self.invokeCallback(cb, 'error');
			}
			else if (stdout.trim() !== '0')
            {
				self.invokeCallback(cb, 'busy');
			}
			else
            {
				port = server.clientPort;
				const cmd2 = generateCommand(self, host, port);
				exec(cmd2, function(err, stdout, stderr)
                {
					if (err)
                    {
						logger.error('command %s execute with error: %j', cmd2, err.stack);
						self.invokeCallback(cb, 'error');
					}
					else if (stdout.trim() !== '0')
                    {
						self.invokeCallback(cb, 'busy');
					}
					else
                    {
						self.invokeCallback(cb, 'leisure');
					}
				});
			}
		});
	}

	static isLocal(host)
    {
		const app = require('../pomelo').app;
		if (!app)
        {
			return host === '127.0.0.1' || host === 'localhost' || host === '0.0.0.0' || inLocal(host);
		}
		return host === '127.0.0.1' || host === 'localhost' || host === '0.0.0.0' || inLocal(host) || host === app.master.host;
	}

    /**
     * Load cluster server.
     *
     */
	static loadCluster(app, server, serverMap)
    {
		const increaseFields = {};
		const host = server.host;
		const count = parseInt(server[Constants.RESERVED.CLUSTER_COUNT]);
		let seq = app.clusterSeq[server.serverType];
		if (!seq)
        {
			seq = 0;
			app.clusterSeq[server.serverType] = count;
		}
		else
        {
			app.clusterSeq[server.serverType] = seq + count;
		}

		for (const key in server)
        {
			const value = server[key].toString();
			if (value.indexOf(Constants.RESERVED.CLUSTER_SIGNAL) > 0)
            {
				const base = server[key].slice(0, -2);
				increaseFields[key] = base;
			}
		}

		const clone = (src) =>
        {
			const rs = {};
			for (const key in src)
            {
				rs[key] = src[key];
			}
			return rs;
		};
		for (let i = 0, l = seq; i < count; i++, l++)
        {
			const cserver = _.clone(server); // old clone(server)
			cserver.id = `${Constants.RESERVED.CLUSTER_PREFIX + server.serverType}-${l}`;
			for (const k in increaseFields)
            {
				const v = parseInt(increaseFields[k]);
				cserver[k] = v + i;
			}
			serverMap[cserver.id] = cserver;
		}
	}

	static extends(origin, add)
    {
		if (!add || !this.isObject(add)) return origin;

		const keys = Object.keys(add);
		let i = keys.length;
		while (i--)
        {
			origin[keys[i]] = add[keys[i]];
		}
		return origin;
	}

	static headHandler(headBuffer)
    {
		let len = 0;
		for (let i = 1; i < 4; i++)
        {
			if (i > 1)
				len <<= 8;
			len += headBuffer.readUInt8(i);
		}
		return len;
	}

	static isObject(arg)
    {
		return _.isObject(arg);
	}
}

module.exports = Utils;

const inLocal = host =>
{
	for (const index in localIps)
    {
		if (host === localIps[index])
        {
			return true;
		}
	}
	return false;
};

const localIps = function()
{
	const ifaces = os.networkInterfaces();
	const ips = [];
	const func = details =>
    {
		if (details.family === 'IPv4')
        {
			ips.push(details.address);
		}
	};
	for (const dev in ifaces)
    {
		ifaces[dev].forEach(func);
	}
	return ips;
}();