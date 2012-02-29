var Queue = require('../lib/utils/queue');

var test = new Queue();

console.log(test.__proto__);

test.push(1);
test.push(2);
test.push(4);

test.forEach(function(vx){
	console.log(vx);
});

console.log(test);


test.shiftEach(function(vx){
	console.log('delete ' + vx);
});



console.log(test);