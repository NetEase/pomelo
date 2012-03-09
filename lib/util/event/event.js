var exports = module.exports;


var Event = function(params){
	this.type = params.type;
	this.period = params.period;
	this.delay = params.delay;
	this.loop = params.loop;
    this.method = params.method;
    this.params = params.params;
    this.host = params.host;
    this.hash = params.hash;
}

/**
 * 创建事件
 * 
 * param属性：
 * 
 */
exports.create = function(param) {
	if(!param || !param.period || !param.method || !param.hash) {
		throw new Error('period and method should not be empty. ' + JSON.stringify(param));
	}
	
	if(!param.type)
	param.type = 5001;
	return new Event(param);
};
