var exports = module.exports;

var Area = function(param) {
	this.id = param.id;
	this.name = param.name;
	this.userList = param.userList;
	this.next = param.next;
	this.pre = param.pre;
	this.mid = param.mid;
	this.status = param.status;
	this.proxy = param.proxy;
}


/**
 * 场景用户
 * 
 * param属性：
 * 
 */

exports.create = function(param) {
	if(!param || !param.id  || !param.name) {
		throw new Error('scene id and name should not be empty. ' + JSON.stringify(param));
	}
	return new Area(param);
};