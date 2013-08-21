var os = require('os');
var util = require('util');
var logger = require('pomelo-logger').getLogger('pomelo', __filename);

var utils = module.exports;

/**
 * Invoke callback with check
 */
utils.invokeCallback = function (cb) {
  if (!!cb && typeof cb === 'function') {
    cb.apply(null, Array.prototype.slice.call(arguments, 1));
  }
};

/**
 * Get the count of elements of object
 */
utils.size = function (obj) {
  var count = 0;
  for (var i in obj) {
    if (obj.hasOwnProperty(i) && typeof obj[i] !== 'function') {
      count++;
    }
  }
  return count;
};

/**
 * Chech a string whether ends with another string
 */
utils.endsWith = function (str, suffix) {
  if(typeof str !== 'string' || typeof suffix !== 'string' ||
    suffix.length > str.length) {
    return false;
  }
  return str.indexOf(suffix, str.length - suffix.length) !== -1;
};

/**
 * Chech a string whether starts with another string
 */
utils.startsWith = function (str, prefix) {
  if(typeof str !== 'string' || typeof prefix !== 'string' ||
    prefix.length > str.length) {
    return false;
  }

  return str.indexOf(prefix) === 0;
};

/*
 * Date format
 */
utils.format = function (date, format) {
  format = format || 'MMddhhmm';
  var o = {
    "M+":date.getMonth() + 1, //month
    "d+":date.getDate(), //day
    "h+":date.getHours(), //hour
    "m+":date.getMinutes(), //minute
    "s+":date.getSeconds(), //second
    "q+":Math.floor((date.getMonth() + 3) / 3), //quarter
    "S":date.getMilliseconds() //millisecond
  };

  if (/(y+)/.test(format)) {
    format = format.replace(RegExp.$1,
      (date.getFullYear() + "").substr(4 - RegExp.$1.length));
  }

  for (var k in o) {
    if (new RegExp("(" + k + ")").test(format)) {
      format = format.replace(RegExp.$1, RegExp.$1.length === 1 ? o[k] :
        ("00" + o[k]).substr(("" + o[k]).length));
    }
  }
  return format;
};

/**
 * check if has Chinese characters.
 */
utils.hasChineseChar = function(str) { 
  if(/.*[\u4e00-\u9fa5]+.*$/.test(str)) 
  { 
    return true; 
  } else {
    return false; 
  } 
};

/**
 * transform unicode to utf8
 */
utils.unicodeToUtf8 = function(str) {
    var i, len, ch;
    var utf8Str = "";
    len = str.length;
    for (i = 0; i < len; i++) {
        ch = str.charCodeAt(i);
        
        if ((ch >= 0x0) && (ch <= 0x7F)) {
            utf8Str += str.charAt(i);
            
        } else if ((ch >= 0x80) && (ch <= 0x7FF)){
            utf8Str += String.fromCharCode(0xc0 | ((ch >> 6) & 0x1F));
            utf8Str += String.fromCharCode(0x80 | (ch & 0x3F));
            
        } else if ((ch >= 0x800) && (ch <= 0xFFFF)){
            utf8Str += String.fromCharCode(0xe0 | ((ch >> 12) & 0xF));
            utf8Str += String.fromCharCode(0x80 | ((ch >> 6) & 0x3F));
            utf8Str += String.fromCharCode(0x80 | (ch & 0x3F));
            
        } else if ((ch >= 0x10000) && (ch <= 0x1FFFFF)){
           utf8Str += String.fromCharCode(0xF0 | ((ch >> 18) & 0x7));
           utf8Str += String.fromCharCode(0x80 | ((ch >> 12) & 0x3F));
           utf8Str += String.fromCharCode(0x80 | ((ch >> 6) & 0x3F));
           utf8Str += String.fromCharCode(0x80 | (ch & 0x3F));
           
        } else if ((ch >= 0x200000) && (ch <= 0x3FFFFFF)){
           utf8Str += String.fromCharCode(0xF8 | ((ch >> 24) & 0x3));
           utf8Str += String.fromCharCode(0x80 | ((ch >> 18) & 0x3F));
           utf8Str += String.fromCharCode(0x80 | ((ch >> 12) & 0x3F));
           utf8Str += String.fromCharCode(0x80 | ((ch >> 6) & 0x3F));
           utf8Str += String.fromCharCode(0x80 | (ch & 0x3F));
           
        } else if ((ch >= 0x4000000) && (ch <= 0x7FFFFFFF)){
           utf8Str += String.fromCharCode(0xFC | ((ch >> 30) & 0x1));
           utf8Str += String.fromCharCode(0x80 | ((ch >> 24) & 0x3F));
           utf8Str += String.fromCharCode(0x80 | ((ch >> 18) & 0x3F));
           utf8Str += String.fromCharCode(0x80 | ((ch >> 12) & 0x3F));
           utf8Str += String.fromCharCode(0x80 | ((ch >> 6 ) & 0x3F));
           utf8Str += String.fromCharCode(0x80 | (ch & 0x3F));
           
        }
            
    }
    return utf8Str;
};

utils.isLocal = function(host) {
  return host === '127.0.0.1' || host === 'localhost' || inLocal(host);
};

var inLocal = function(host) {
  for (var index in localIps) {
    if (host === localIps[index]) {
      return true;
    }
  }
  return false;
};

var localIps = function() {
  var ifaces = os.networkInterfaces();
  var ips = [];
  var func = function(details) {
    if (details.family === 'IPv4') {
      ips.push(details.address);
    }
  };
  for (var dev in ifaces) {
    ifaces[dev].forEach(func);
  }
  return ips;
}();
