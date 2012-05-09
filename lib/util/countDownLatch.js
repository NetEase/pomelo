var exp = module.exports;

/**
 * 当调用count次done函数后，触发cb
 * cb无参，主要用于异步测试用例的最终结束检查
 */
var CountDownLatch = function(count, cb) {
	this.count = count;
	this.cb = cb;
};

var bpro = CountDownLatch.prototype;

bpro.done = function() {
	if(this.count <= 0) {
		throw new Error('illegal state.');
	}

	this.count--;
	if (this.count === 0) {
		this.cb();
	}
};

/**
 * 生成一个count down latch
 */
exp.createCountDownLatch = function(count, cb) {
	if(!count) {
		throw new Error('count should be positive.');
	}
	if(typeof cb !== 'function') {
		throw new Error('cb should be a function.');
	}

	return new CountDownLatch(count, cb);
};
