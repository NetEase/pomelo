/**
 * Created by frank on 16-12-26.
 */
const _ = require('lodash'),
	os = require('os'),
	Constants = require('./constants'),
	util = require('util'),
	logger = require('pomelo-logger').getLogger('pomelo', __filename),
	exec = require('child_process').exec,
	pomelo = require('../pomelo');

class Utils
{
    /**
     *  Invoke callback with check
     * @param {Function} callBack
     * @param args
     */
	static invokeCallback(callBack, ...args)
    {
		if (_.isFunction(callBack))
        {
            // callBack.apply(null, Array.prototype.slice.call(arguments, 1));
			const arg = Array.from ? Array.from(args) : [].slice.call(args);
            // action.apply(null, args);
			callBack(...arg);
		}
	}

    /**
     *  Get the count of elements of object
     * @param obj
     */
	static size(obj)
    {
		let count = 0;
		_.forEach(obj, (objData, index) =>
        {
			if (obj.hasOwnProperty(index) && !_.isFunction(objData))
            {
				count ++;
			}
		});
		return count;
	}

    /**
     * Check a string whether ends with another string
     */
	static endsWith(str, suffix)
    {
		if (!_.isString(str) || !_.isString(suffix) || suffix.length > str.length)
        {
			return false;
		}
		return str.indexOf(suffix, str.length - suffix.length) !== -1;
	}

	static startsWith(str, prefix)
    {
		if (!_.isString(str) || !_.isString(prefix) || prefix.length > str.length)
        {
			return false;
		}
		return str.indexOf(prefix) === 0;
	}

    /**
     * Compare the two arrays and return the difference.
     * @param array1
     * @param array2
     * @returns {Array}
     */
	static arrayDiff(array1, array2)
    {
        // return _.difference(array1, array2);
		const o = {};
		const result = [];
		_.forEach(array2, value =>
        {
			o[value] = true;
		});

		_.forEach(array1, value =>
        {
			if (!o[value])
            {
				result.push(value);
			}
		});
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

		_.forEach(o, (time, sign) =>
        {
			if (new RegExp(`(${sign})`).test(format))
            {
				format = format.replace(RegExp.$1, RegExp.$1.length === 1 ? time :
                    (`00${time}`).substr((`${time}`).length));
			}
		});

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
     *  Ping server to check if network is available
     * @param {string} host
     * @param cb
     */
	static ping(host, cb)
    {
		if (!Utils.isLocal(host))
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
			Utils.invokeCallback(cb, 'leisure');
			return;
		}
		let port = server.port || server.clientPort;
		const host = server.host;
		const generateCommand = (self, host, port) =>
        {
			let cmd;
			let sshParams = pomelo.app.get(Constants.RESERVED.SSH_CONFIG_PARAMS);
			if (sshParams && Array.isArray(sshParams))
            {
				sshParams = sshParams.join(' ');
			}
			else
            {
				sshParams = '';
			}
			if (!Utils.isLocal(host))
            {
				cmd = util.format('ssh %s %s "netstat -an|awk \'{print $4}\'|grep %s|wc -l"', host, sshParams, port);
			}
			else
            {
				cmd = util.format('netstat -an|awk \'{print $4}\'|grep %s|wc -l', port);
			}
			return cmd;
		};
		const cmd1 = generateCommand(Utils, host, port);
		const child = exec(cmd1, (err, stdout, stderr) =>
        {
			if (err)
            {
				logger.error('command %s execute with error: %j', cmd1, err.stack);
				Utils.invokeCallback(cb, 'error');
			}
			else if (stdout.trim() !== '0')
            {
				Utils.invokeCallback(cb, 'busy');
			}
			else
            {
				port = server.clientPort;
				const cmd2 = generateCommand(Utils, host, port);
				exec(cmd2, function(err, stdout, stderr)
                {
					if (err)
                    {
						logger.error('command %s execute with error: %j', cmd2, err.stack);
						Utils.invokeCallback(cb, 'error');
					}
					else if (stdout.trim() !== '0')
                    {
						Utils.invokeCallback(cb, 'busy');
					}
					else
                    {
						Utils.invokeCallback(cb, 'leisure');
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
			return host === '127.0.0.1' || host === 'localhost' || host === '0.0.0.0' || Utility.InLocal(host);
		}
		return host === '127.0.0.1' || host === 'localhost' || host === '0.0.0.0' || Utility.InLocal(host) || host === app.master.host;
	}

    /**
     * Load cluster server.
     *
     */
	static loadCluster(app, server, serverMap)
    {
		const increaseFields = {};
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

		_.forEach(server, (value, key) =>
        {
			if (_.includes(value, Constants.RESERVED.CLUSTER_SIGNAL))
            {
				const base = value.slice(0, -2);
				increaseFields[key] = base;
			}
		});

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
		if (!add || !_.isObject(add)) return origin;

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

    /**
     *
     * @param {Object} obj
     * @param {String} prop
     * @param {Function} get
     * @returns {*}
     * @constructor
     */
	static DefineGetter(obj, prop, get)
    {
		if (Object.defineProperty)
			return Object.defineProperty(obj, prop, Utility.AccessorDescriptor('get', get));
		if (Object.prototype.__defineGetter__)
			return obj.__defineGetter__(prop, get);

		throw new Error('browser does not support getters');
	}
}

class Utility
{
	static InLocal(host)
    {
		const localIps = Utility.LocalIps();
		return _.includes(localIps, host);
	}

	static LocalIps()
    {
		const iFaces = os.networkInterfaces();
		const ips = [];
		_.forEach(iFaces, face =>
        {
			_.forEach(face, details =>
            {
				if (details.family === 'IPv4')
                {
					ips.push(details.address);
				}
			});
		});
		return ips;
	}

	static AccessorDescriptor(field, fun)
    {
		const desc = {enumerable: true, configurable: true};
		desc[field] = fun;
		return desc;
	}

}

module.exports = Utils;