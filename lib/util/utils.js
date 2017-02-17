'use strict';

const os = require('os');
const exec = require('child_process').exec;

const Constants = require('./constants');

/**
 * Invoke callback with check
 */
exports.invokeCallback = function invokeCallback(cb) {
  if (typeof cb === 'function') {
    const len = arguments.length;
    const args = new Array(len - 1);
    let i;
    for (i = 1; i < len; i++) {
      args[i - 1] = arguments[i];
    }

    cb.apply(null, args);
  }
};

/**
 * Get the count of elements of object
 */
exports.size = function size(obj) {
  let count = 0;
  let i;
  for (i in obj) {
    if (obj.hasOwnProperty(i) && typeof obj[i] !== 'function') {
      count++;
    }
  }
  return count;
};

/**
 * Check a string whether ends with another string
 */
exports.endsWith = function endsWith(str, suffix) {
  if (typeof str !== 'string' || typeof suffix !== 'string' ||
      suffix.length > str.length) {
    return false;
  }
  return str.indexOf(suffix, str.length - suffix.length) !== -1;
};

/**
 * Check a string whether starts with another string
 */
exports.startsWith = function startsWith(str, prefix) {
  if (typeof str !== 'string' || typeof prefix !== 'string' ||
      prefix.length > str.length) {
    return false;
  }

  return str.indexOf(prefix) === 0;
};

/**
 * Compare the two arrays and return the difference.
 */
// FIXME: convert array element to string implicitly
exports.arrayDiff = function arrayDiff(array1, array2) {
  const o = {};
  let i;
  for (i = 0; i < array2.length; i++) {
    o[array2[i]] = true;
  }

  const result = [];
  for (i = 0; i < array1.length; i++) {
    const v = array1[i];
    if (o[v]) {
      continue;
    }
    result.push(v);
  }
  return result;
};

/*
 * Date format
 */
exports.format = function format(date, format) {
  format = format || 'MMddhhmm';
  const o = {
    'M+': date.getMonth() + 1, // month
    'd+': date.getDate(), // day
    'h+': date.getHours(), // hour
    'm+': date.getMinutes(), // minute
    's+': date.getSeconds(), // second
    'q+': Math.floor((date.getMonth() + 3) / 3), // quarter
    'S': date.getMilliseconds() // millisecond
  };

  if (/(y+)/.test(format)) {
    format = format.replace(RegExp.$1,
                            (date.getFullYear() + '')
                            .substr(4 - RegExp.$1.length));
  }

  let k;
  for (k in o) {
    if (new RegExp(`(${k})`).test(format)) {
      let dest;
      if (RegExp.$1.length === 1) {
        dest = o[k];
      } else {
        dest = ('00' + o[k]).substr(('' + o[k]).length);
      }

      format = format.replace(RegExp.$1, dest);
    }
  }
  return format;
};

/**
 * check if has Chinese characters.
 */
exports.hasChineseChar = function hasChineseChar(str) {
  if (/.*[\u4e00-\u9fa5]+.*$/.test(str)) {
    return true;
  } else {
    return false;
  }
};

/**
 * transform unicode to utf8
 */
exports.unicodeToUtf8 = function unicodeToUtf8(str) {
  let i;
  let ch;
  let utf8Str = '';
  const len = str.length;

  for (i = 0; i < len; i++) {
    ch = str.charCodeAt(i);

    if ((ch >= 0x0) && (ch <= 0x7F)) {
      utf8Str += str.charAt(i);

    } else if ((ch >= 0x80) && (ch <= 0x7FF)) {
      utf8Str += String.fromCharCode(0xc0 | ((ch >> 6) & 0x1F));
      utf8Str += String.fromCharCode(0x80 | (ch & 0x3F));

    } else if ((ch >= 0x800) && (ch <= 0xFFFF)) {
      utf8Str += String.fromCharCode(0xe0 | ((ch >> 12) & 0xF));
      utf8Str += String.fromCharCode(0x80 | ((ch >> 6) & 0x3F));
      utf8Str += String.fromCharCode(0x80 | (ch & 0x3F));

    } else if ((ch >= 0x10000) && (ch <= 0x1FFFFF)) {
      utf8Str += String.fromCharCode(0xF0 | ((ch >> 18) & 0x7));
      utf8Str += String.fromCharCode(0x80 | ((ch >> 12) & 0x3F));
      utf8Str += String.fromCharCode(0x80 | ((ch >> 6) & 0x3F));
      utf8Str += String.fromCharCode(0x80 | (ch & 0x3F));

    } else if ((ch >= 0x200000) && (ch <= 0x3FFFFFF)) {
      utf8Str += String.fromCharCode(0xF8 | ((ch >> 24) & 0x3));
      utf8Str += String.fromCharCode(0x80 | ((ch >> 18) & 0x3F));
      utf8Str += String.fromCharCode(0x80 | ((ch >> 12) & 0x3F));
      utf8Str += String.fromCharCode(0x80 | ((ch >> 6) & 0x3F));
      utf8Str += String.fromCharCode(0x80 | (ch & 0x3F));

    } else if ((ch >= 0x4000000) && (ch <= 0x7FFFFFFF)) {
      utf8Str += String.fromCharCode(0xFC | ((ch >> 30) & 0x1));
      utf8Str += String.fromCharCode(0x80 | ((ch >> 24) & 0x3F));
      utf8Str += String.fromCharCode(0x80 | ((ch >> 18) & 0x3F));
      utf8Str += String.fromCharCode(0x80 | ((ch >> 12) & 0x3F));
      utf8Str += String.fromCharCode(0x80 | ((ch >> 6) & 0x3F));
      utf8Str += String.fromCharCode(0x80 | (ch & 0x3F));

    }
  }
  return utf8Str;
};

/**
 * Ping server to check if network is available
 *
 */
exports.ping = function ping(host, cb) {
  if (!exports.isLocal(host)) {
    const cmd = `ping -w 15 ${host}`;
    exec(cmd, (err, stdout, stderr) => {
      if (err) {
        cb(false);
        return;
      }
      cb(true);
    });
  } else {
    cb(true);
  }
};

exports.isLocal = function isLocal(host) {
  return host === '127.0.0.1' || host === 'localhost' ||
         host === '0.0.0.0' || _inLocal(host);
};

/**
 * Load cluster server.
 *
 */
exports.loadCluster = function loadCluster(app, server, serverMap) {
  const increaseFields = {};
  const count = parseInt(server[Constants.RESERVED.CLUSTER_COUNT]);
  let seq = app.clusterSeq[server.serverType];
  if (!seq) {
    seq = 0;
    app.clusterSeq[server.serverType] = count;
  } else {
    app.clusterSeq[server.serverType] = seq + count;
  }

  let key;
  for (key in server) {
    const value = server[key].toString();
    if (value.indexOf(Constants.RESERVED.CLUSTER_SIGNAL) > 0) {
      const base = server[key].slice(0, -2);
      increaseFields[key] = base;
    }
  }

  const clone = (src) => {
    const rs = {};
    for (key in src) {
      rs[key] = src[key];
    }
    return rs;
  };

  let i;
  let l;
  for (i = 0, l = seq; i < count; i++, l++) {
    const cserver = clone(server);
    cserver.id = Constants.RESERVED.CLUSTER_PREFIX +
      server.serverType + '-' + l;

    let k;
    for (k in increaseFields) {
      const v = parseInt(increaseFields[k]);
      cserver[k] = v + i;
    }
    serverMap[cserver.id] = cserver;
  }
};

exports.extends = function _extends(origin, add) {
  if (!add || !this.isObject(add)) {
    return origin;
  }

  const keys = Object.keys(add);
  let i = keys.length;

  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

exports.headHandler = function headHandler(headBuffer) {
  let len = 0;
  let i;
  for (i = 1; i < 4; i++) {
    if (i > 1) {
      len <<= 8;
    }
    len += headBuffer.readUInt8(i);
  }
  return len;
};

const _localIps = [];

(function() {
  const ifaces = os.networkInterfaces();

  let dev;
  for (dev in ifaces) {
    const ips = ifaces[dev];
    let i;
    for (i = 0; i < ips.length; i++) {
      // FIXME: ipv6 support
      if (ips[i].family === 'IPv4') {
        _localIps.push(ips[i].address);
      }
    }
  }
})();

function _inLocal(host) {
  let index;
  for (index in _localIps) {
    if (host === _localIps[index]) {
      return true;
    }
  }
  return false;
}

exports.isObject = function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
};
