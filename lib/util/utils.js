var util = require('util');
var logger = require('pomelo-logger').getLogger(__filename);

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
	if (typeof(str) === 'string') {
		return str.indexOf(suffix, str.length - suffix.length) !== -1;
	}
	return false;
};

/**
 * Chech a string whether starts with another string
 */
utils.startWith = function (str, prefix) {
	if (!prefix || !str || prefix.length > str.length) {
		return false;
	}

	if (str.substr(0, prefix.length) === prefix) {
		return true;
	} else {
		return false;
	}
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
 * Process command line arguments.
 *
 * @param args command line arguments
 *
 * @return Object args_map map of arguments
 */
utils.argsInfo = function (args) {
	var args_map = {};
	var main_pos = 1;

	while(args[main_pos].indexOf('--')>0){
		main_pos++;
	}
	args_map.main = args[main_pos];		

	for (var i = (main_pos+1); i < args.length; i++) {
		var str = args[i].split('=');
		args_map[str[0]] = str[1];
	}
	return args_map; 
};
