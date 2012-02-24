var EventEmitter = require('events').EventEmitter;
var util = require('util');

var DEFAULT_TIMEOUT = 3000;
var INIT_ID = 0;
var EVENT_CLOSED = 'closed';
var EVENT_DRAINED = 'drained';

/**
 * instance a new queue
 * 
 * @param name queue name
 * @param timeout a global timeout for new queue
 */
var SeqQueue = function(name ,timeout) {
	EventEmitter.call(this);
	
	this.name = name;
	if(!!timeout && timeout > 0) {
		this.timeout = timeout;
	} else {
		this.timeout = DEFAULT_TIMEOUT;
	}
	
	this.status = exp.STATUS_IDLE;
	this.curId = INIT_ID;
	this.queue = [];
};
util.inherits(SeqQueue, EventEmitter);

var pro = SeqQueue.prototype;

/**
 * add a task into queue.
 * 
 * @param fn new request
 * @param timeout timeout for current request. take the global timeout if this is invalid
 * @returns true or false
 */
pro.push = function(fn, timeout) {
	if(this.status !== exp.STATUS_IDLE && this.status !== exp.STATUS_BUSY) {
		//ignore invalid status
		return false;
	}
	
	if(typeof fn !== 'function') {
		throw new Error('fn should be a function.');
	}
	this.queue.push({fn: fn, timeout: timeout});

	if(this.status === exp.STATUS_IDLE) {
		this.status = exp.STATUS_BUSY;
		var self = this;
		process.nextTick(function() {
			self._next(self.curId);
		});
	}
	return true;
};

/**
 * close queue
 * 
 * @param force if true will close the queue immediately else will execute the rest task in queue
 */
pro.close = function(force) {
	if(this.status !== exp.STATUS_IDLE && this.status !== exp.STATUS_BUSY) {
		//ignore invalid status
		return;
	}
	
	if(!!force) {
		this.status = exp.STATUS_DRAINED;
		if(!!this.timerId) {
			clearTimeout(this.timerId);
			this.timerId = undefined;
		}
		this.emit(EVENT_DRAINED);
	} else {
		this.status = exp.STATUS_CLOSED;
		this.emit(EVENT_CLOSED);
	}
};

/**
 * invoke next task
 * 
 * @param tid last executed task id
 */
pro._next = function(tid) {
	if(tid !== this.curId || this.status !== exp.STATUS_BUSY && this.status !== exp.STATUS_CLOSED) {
		//ignore invalid next call
		return;
	}
	
	if(!!this.timerId) {
		clearTimeout(this.timerId);
		this.timerId = undefined;
	}
	
	var task = this.queue.shift();
	if(!task) {
		if(this.status === exp.STATUS_BUSY) {
			this.status = exp.STATUS_IDLE;
		} else {
			this.status = exp.STATUS_DRAINED;
			this.emit(EVENT_DRAINED);
		}
		return;
	}
	
	var self = this;
	task.id = ++this.curId;
	task.fn({
		done: function() {
			self._next(task.id);
		}
	});
	var timeout = task.timeout > 0 ? task.timeout : this.timeout;
	timeout = timeout > 0 ? timeout : DEFAULT_TIMEOUT;
	this.timerId = setTimeout(function() {
		process.nextTick(function() {
			self._next(task.id);
		});
		self.emit('timeout', task);
	}, timeout);
};

var exp = module.exports;
exp.STATUS_IDLE 		= 0;	//status: idle	
exp.STATUS_BUSY 		= 1;	//status: busy
exp.STATUS_CLOSED 	= 2;	//status: closed, no new request but will process the rest task in queue 
exp.STATUS_DRAINED 	= 3;	//status: drained, no new request and no task to execute

exp.createQueue = function(name, timeout) {
	return new SeqQueue(name, timeout);
};