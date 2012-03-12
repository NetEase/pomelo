var TaskGroup = require('./task/TaskGroup');
var utils = require('../util/Utils');

var manager = module.exports;

var groups = {};

/**
 * 将任务加入到指定的任务组。如果任务组还不存在则新建一个。
 * 
 * @param key 任务组标识
 * @param type 任务类型
 * @param task 待执行的任务，task为function，执行时直接调用嗯task()
 * @param cb 创建完毕回调。cb(err, create, group).如果group之前不存在，则create为true，否则为false。group返回key关联的任务组。
 */
manager.addTask = function(key, type, task, cb) {
	var create = false;
	if(!groups[key]) {
		groups[key] = TaskGroup.createGroup();
		create = true;
	}
	
	groups[key].addTask(type, task);
	utils.invokeCallback(cb, null, create, groups[key]);
};

/**
 * 任务完成事件回调，将触发下一个任务的执行
 * 
 * @param key 任务组标识
 * @param type 任务类型
 */
manager.taskFinish = function(key, type) {
	if(!groups[key]) {
		//忽略掉不存在的key
		return;
	}
	
	groups[key].taskFinish(type);
};

/**
 * 任务组销毁事件回调
 * 
 * @param key 任务组标识
 */
manager.groupDestroy = function(key) {
	if(!groups[key]) {
		//忽略掉不存在的key
		return;
	}
	
	//何时删除任务组映射关系由group决定
	groups[key].destroy(function() {
		if(!!groups[key]) {
			delete groups[key];
		}
	});
};