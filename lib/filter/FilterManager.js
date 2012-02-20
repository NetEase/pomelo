var utils = require('../util/Utils');

/**
 * filter 管理类
 */
var innerFilters = [];

/**
 * 内部处理filter。遍历已注册的filter，进行filter操作。
 * 
 * @param fIndex
 * @param socket
 * @param msg
 * @param context
 * @returns
 */
var doFilterInternal = function(fIndex,  context, cb) {

};

exports.doFilter = function(context, cb) {
};

/**
 * 添加新的filter
 */
exports.addFilters = function(filters) {
	for(var i in filters) {
		innerFilters.push(filters[i]);
	}
};