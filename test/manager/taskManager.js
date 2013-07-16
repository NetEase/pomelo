var lib = process.env.POMELO_COV ? 'lib-cov' : 'lib';
var should = require('should');
var taskManager = require('../../' + lib + '/common/manager/taskManager');

// set timeout for test
taskManager.timeout = 100;

var WAIT_TIME = 200;

describe("#taskManager",function(){
  it("should add task and execute it",function(done){
    var key = 'key-1';
    var fn = function(task) {
      taskCount++;
      task.done();
    };
    var onTimeout = function() {
      should.fail('should not timeout.');
    };
    var taskCount = 0;

    taskManager.addTask(key, fn, onTimeout);

    setTimeout(function() {
      taskCount.should.equal(1);
      done();
    }, WAIT_TIME);
  });

  it("should fire timeout callback if task timeout",function(done){
    var key = 'key-1';
    var fn = function(task) {
      taskCount++;
    };
    var onTimeout = function() {
      timeoutCount++;
    };
    var taskCount = 0;
    var timeoutCount = 0;

    taskManager.addTask(key, fn, onTimeout);

    setTimeout(function() {
      taskCount.should.equal(1);
      timeoutCount.should.equal(1);
      done();
    }, WAIT_TIME);
  });

  it("should not fire timeout after close the task",function(done){
    var key = 'key-1';
    var fn = function(task) {
      taskCount++;
    };
    var onTimeout = function() {
      timeoutCount++;
    };
    var taskCount = 0;
    var timeoutCount = 0;

    taskManager.addTask(key, fn, onTimeout);

    process.nextTick(function() {
      taskManager.closeQueue(key, true);

      setTimeout(function() {
        taskCount.should.equal(1);
        timeoutCount.should.equal(0);
        done();
      }, WAIT_TIME);
    });
  });

  it("should be ok to remove a queue not exist",function(){
    var key = 'key-n';
    taskManager.closeQueue(key, true);
  });
});
