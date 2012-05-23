var utils = require('../../util/utils');
var sequeue = require('seq-queue');

var manager = module.exports;

var queues = {};

/**
 * 将任务加入到指定的任务组。如果任务组还不存在则新建一个。
 * 
 * @param key 任务组标识
 * @param fn 待执行的任务，fn为function(task)，执行时直接调用fn()，fn执行完毕后需要在fn内调用task.done()
 * @return [boolean] 添加成功返回true否则返回false
 */
manager.addTask = function(key, fn, ontimeout) {
	var queue = queues[key];
	if(!queue) {
		queue = sequeue.createQueue();
		queues[key] = queue;
	}
	
	return queue.push(fn, ontimeout);
};

/**
 * 任务组销毁事件回调
 * 
 * @param key 任务组标识
 * @param force 是否强制关闭
 */
manager.closeQueue = function(key, force) {
	if(!queues[key]) {
		//忽略掉不存在的key
		return;
	}
	
	queues[key].close(force);
	delete queues[key];
};
