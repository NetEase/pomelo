var util = require('util');
var logger = require('./log/log').getLogger(__filename);

var utils = module.exports;

/**
 * 调用回调函数
 * 
 * 如果cb非空，则将之后的参数作为cb的参数调用cb
 */
utils.invokeCallback = function(cb) {
	if(!!cb && typeof cb == 'function') {
		cb.apply(null, Array.prototype.slice.call(arguments, 1));
	}
};

/**
 * 给客户端返回错误结果
 * 
 * @param socket 与客户端连接的socket
 * @param type 客户端请求的type
 * @param code 处理错误码
 */
utils.responseError = function(socket, type, code) {
	if(!socket) {
		//忽略空socket
		return;
	}
	socket.emit('message', {type: type, code: code});
};

/**
 * 获取对象属性/元素个数
 */
utils.size = function(obj) {
	var count = 0;
	for(var i in obj) {
		if(typeof obj[i] !== 'function')
			count++;
	}
	return count;
};


/**
 * 在Array中查找属性为key值为value的对象
 */
utils.findInArray = function(objArray, key, value){
	if	(!objArray) return null;
	for (var i=0;i<objArray.length; i++) {
		var curObj=objArray[i];
		if (curObj[key]==value){
			return curObj;	
		}
	}
	return null;
}

/**
 * 从数组中删除某个元素
 * 
 * @return 返回被删除的元素，如果元素不存在则返回null
 */
utils.removeFromArray = function(obj, objArray, cmp) {
	if(!obj || !objArray)return null;
	for(var i=0; i<objArray.length; i++) {
		if(!!cmp && typeof(cmp) == 'function') {
			if(cmp(objArray[i], obj) === 0) {
				return Array.prototype.call(objArray, i, 1)[0];
			}
		} else {
			if(objArray[i] === obj) {
				return rray.prototype.call(objArray, i, 1)[0];
			}
		}
	}
	return null;
};

/**
 * 判断数组中是否包含某个元素
 */
utils.contains = function(obj, array) {
	if(!obj || !array)return false;
	for(var i=0, l=array.length; i<l; i++) {
		if(obj === array[i]) return true;
	}
	return false;
};

/**
 * 返回元素在数组中的索引号，如果元素不存在，则返回-1
 */
utils.getIndexInArray = function(obj, objArray, cmp) {
	if(!obj || !objArray)return;
	for(var i=0, l=objArray.length; i<l; i++) {
		if(!!cmp && typeof(cmp) == 'function') {
			if(cmp(objArray[i], obj) === 0) {
				return i
			}
		} else {
			if(objArray[i] === obj) {
				return i;
			}
		}
	}
	return -1;
};

/**
 * 获取分页的索引范围
 * @param page 页码
 * @param pageSize 一页大小
 * 
 * @return Object start: 分页开始索引， end：分页结束索引（不包含）
 */
utils.getPageRange = function(page, pageSize) {
	var res = {};
	res.start = page * pageSize;
	res.end = (page + 1) * pageSize;
	return res;
};

/**
 * 获取最后一页的索引范围
 * @param total 记录总数
 * @param pageSize 一页大小
 */
utils.getLastPageRange = function(total, pageSize) {
	if(total == 0) {
		//总数为0时做特殊处理
		return {start:0, end:0};
	}
	
	var res = {};
	res.start = total - total % pageSize;
	res.end = total;
	return res;
};

/**
 * 计算总页数
 * 
 * @param total 记录总数
 * @param pageSize 一页大小
 */
utils.getPageCount = function(total, pageSize) {
	return Math.ceil(total / pageSize);
};

/**
 * 获取索引index所在的页码
 * 
 * @param index 索引号
 * @param pageSize 一页大小
 */
utils.getPage = function(index, pageSize) {
	if(index < 0)return 0;
	return Math.floor(index / pageSize);
};

/**
 * 获取服务器类型.
 * 无法识别的类型统一返回-1
 * 
 * @param 消息类型
 */
utils.getServerType = function(msgType) {
	if(!msgType) {
		//empty msg type
		logger.debug('empty msg type:' + msgType);
		return -1;
	}
	
	var ptn = /(\d)\d{3}/;
	var res = ptn.exec(msgType);
	if(res == null) {
		//invalid msg type
		logger.debug('invalid msg type:' + msgType);
		return -1;
	}
	
	return parseInt(res[1]);
};

/**
 * 从0 - (n-1)中取出m个不重复数，且m<n
 */ 
utils.genRandomNum = function (m, n){
	var arr = [];
	var res = [];
	var i = 0;
	for (; i < n; i++){
		arr.push(i);
	}
	for (i = 0; i < m; i++){
		var randint = Math.floor(Math.random() * (n - i));
		res.push(arr[randint]);
        var lastIdx = n - i - 1;
		if(randint != lastIdx){
			arr[randint] = arr[lastIdx];
		}
	}
	return res;
};


utils.endsWith = function(str, suffix) {
    if (typeof(str)=='string') {
        return str.indexOf(suffix, str.length - suffix.length) !== -1;
    }
    return false;
};

/**
 * get convention path for handler or remote
 */
utils.getConventionPath = function(root, serverType, role) {
  return root + '/app/' + serverType + '/' + role;
};

/**
 * merge b into a
 *
 * @param a {Object}
 * @param b {Object}
 * @param override {Boolean} whether override the properties that has existed in a
 */
utils.merge = function(a, b, override) {
  if(!b) return a;
  for(var f in b) {
    if(!!a[f] && !override) {
      continue;
    }
    a[f] = b[f];
  }
  return a;
};
