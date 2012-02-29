var Queue = function(){
    this.tail = [];
    this.head = [];
    this.offset = 0;
};

Queue.prototype.shift = function () {
    if (this.offset === this.head.length) {
        var tmp = this.head;
        tmp.length = 0;
        this.head = this.tail;
        this.tail = tmp;
        this.offset = 0;
        if (this.head.length === 0) {
            return;
        }
    }
    return this.head[this.offset++]; 
};

Queue.prototype.push = function (item) {
    return this.tail.push(item);
};

Queue.prototype.forEach = function (fn) {
    var array = this.head.slice(this.offset), i, il;
    for (i = 0, il = array.length; i < il; i += 1) {
        fn(array[i]);
    }
    return array;
};

Queue.prototype.shiftEach = function (fn) {
 	while (this.tail.length>0) {
		var element = this.tail.shift();{
			fn(element);
		}
  }
};

Queue.prototype.getLength = function () {
    return this.head.length - this.offset + this.tail.length;
};
    
Object.defineProperty(Queue.prototype, 'length', {
    get: function () {
        return this.getLength();
    }
});

module.exports = Queue;
