var should = require('should');

var taskManager = require('../../lib/common/service/taskManager');

fn_num = 0;
ontimeout_num = 0;

var WAIT_TIME = 100;

var mockTask = {
	key : "123",
	fn : function(){
		fn_num++;
		should.equal(fn_num,1);
	},
	ontimeout : function(){
	}
}

describe("#taskManager",function(){
	it("should add task ok",function(done){
		taskManager.addTask(mockTask.key,mockTask.fn,mockTask.ontimeout);
		setTimeout(done,WAIT_TIME);
	});
});
