var should = require('should');
var SeqQueue = require('../lib/seq-queue');

var queueName = 'test-queue';
var timeout = 1000;

describe('seq-queue', function() {
	
	describe('#createQueue', function() {
		it('should return a seq-queue instance with init properties', function() {
			var queue = SeqQueue.createQueue(queueName, timeout);
			should.exist(queue);
			queue.should.have.property('name', queueName);
			queue.should.have.property('timeout', timeout);
			queue.should.have.property('status', SeqQueue.IDLE);
		});
	});
	
	describe('#push' , function() {
		it('should change the queue status from idle to busy and invoke the task at once when task finish when queue idle', function(done) {
			var queue = SeqQueue.createQueue(queueName, timeout);
			queue.should.have.property('status', SeqQueue.IDLE);
			queue.push(function(task) {
				should.exist(task);
				task.done();
				queue.should.have.property('status', SeqQueue.IDLE);
				done();
			});
			queue.should.have.property('status', SeqQueue.BUSY);
		});
		
		it('should keep the status busy and keep the new task wait until the former tasks finish when queue busy', function(done) {
			var queue = SeqQueue.createQueue(queueName, timeout);
			var formerTaskFinished = false;
			//add first task
			queue.push(function(task) {
				formerTaskFinished = true;
				task.done();
			});
			queue.should.have.property('status', SeqQueue.BUSY);
			//add second task
			queue.push(function(task) {
				formerTaskFinished.should.be.true;
				queue.should.have.property('status', SeqQueue.BUSY);
				task.done();
				queue.should.have.property('status', SeqQueue.IDLE);
				done();
			});
			queue.should.have.property('status', SeqQueue.BUSY);
		});
	});
	
	describe('#close', function() {
		it('should not accept new request but should execute the rest task in queue when close gracefully', function(done) {
			var queue = SeqQueue.createQueue(queueName, timeout);
			var closedEventCount = 0;
			var drainedEventCount = 0;
			queue.on('closed', function() {
				closedEventCount++;
			});
			queue.on('drained', function() {
				drainedEventCount++;
			});
			var executedTaskCount = 0;
			queue.push(function(task) {
				executedTaskCount++;
				task.done();
			}).should.be.true;
			queue.close(false);
			queue.should.have.property('status', SeqQueue.CLOSED);
			
			queue.push(function(task) {
				// never should be executed
				executedTaskCount++;
				task.done();
			}).should.be.false;
			
			// wait all task finished
			setTimeout(function() {
				executedTaskCount.should.equal(1);
				closedEventCount.should.equal(1);
				drainedEventCount.should.equal(1);
				done();
			}, 1000);
		});
		
		it('should not execute any task and emit a drained event when close forcefully', function(done) {
			var queue = SeqQueue.createQueue(queueName, timeout);
			var drainedEventCount = 0;
			queue.on('drained', function() {
				drainedEventCount++;
			});
			var executedTaskCount = 0;
			queue.push(function(task) {
				//never should be executed
				executedTaskCount++;
				task.done();
			}).should.be.true;
			queue.close(true);
			queue.should.have.property('status', SeqQueue.DRAINED);
			
			// wait all task finished
			setTimeout(function() {
				executedTaskCount.should.equal(0);
				drainedEventCount.should.equal(1);
				done();
			}, 1000);
		});
	});
	
	describe('#timeout', function() {
		it('should emit timeout event and execute the next task when a task timeout by default', function(done) {
			var queue = SeqQueue.createQueue(queueName);
			var executedTaskCount = 0;
			var timeoutCount = 0;
			//add timeout listener
			queue.on('timeout', function(task) {
				task.should.be.a('object');
				task.fn.should.be.a('function');
				timeoutCount++;
			});
			
			queue.push(function(task) {
				executedTaskCount++;
				//no task.done() invoke to cause a timeout
			}).should.be.true;
			
			queue.push(function(task) {
				executedTaskCount++;
				task.done();
			}).should.be.true;
			
			setTimeout(function() {
				//wait all task finish
				executedTaskCount.should.be.equal(2);
				timeoutCount.should.be.equal(1);
				done();
			}, 4000);	//default timeout is 3s
		});
		
		it('should never timeout after close forcefully', function(done) {
			var queue = SeqQueue.createQueue(queueName, timeout);
			var timeoutCount = 0;
			//add timeout listener
			queue.on('timeout', function(task) {
				//should never enter here
				timeoutCount++;
			});
			
			queue.push(function(task) {
				//no task.done() invoke to cause a timeout
			}).should.be.true;
			
			queue.close(true);
			
			setTimeout(function() {
				//wait all task finish
				timeoutCount.should.be.equal(0);
				done();
			}, timeout * 2);
		});
		
		it('should use the global timeout value by default', function(done) {
			var globalTimeout = timeout + 100;
			var queue = SeqQueue.createQueue(queueName, globalTimeout);
			//add timeout listener
			queue.on('timeout', function(task) {
				(Date.now() - start).should.not.be.below(globalTimeout);
				done();
			});
			
			queue.push(function(task) {
				//no task.done() invoke to cause a timeout
			}).should.be.true;
			var start = Date.now();
		});
		
		it('should use the timeout value in #push if it was assigned', function(done) {
			var localTimeout = timeout / 2;
			var queue = SeqQueue.createQueue(queueName, timeout);
			//add timeout listener
			queue.on('timeout', function(task) {
				var diff = Date.now() - start;
				diff.should.not.be.below(localTimeout);
				diff.should.not.be.above(timeout);
				done();
			});
			
			queue.push(function(task) {
				//no task.done() invoke to cause a timeout
			}, localTimeout).should.be.true;
			var start = Date.now();
		});
	});
});