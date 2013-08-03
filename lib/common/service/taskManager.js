var utils = require('../../util/utils');
//var sequeue = require('seq-queue');

//var manager = module.exports;

function TaskManager(){
	this._queues = {};
	this._sequeue = require('seq-queue');
}

//var queues = {};

var manager = TaskManager.prototype;

manager.timeout = 3000;

/**
 * Add tasks into task group. Create the task group if it dose not exist.
 *
 * @param {String}   key       task key
 * @param {Function} fn        task callback
 * @param {Function} ontimeout task timeout callback
 */
manager.addTask = function(key, fn, ontimeout) {
  var queue = this._queues[key];
  if(!queue) {
    queue = this._sequeue.createQueue(this.timeout);
    this._queues[key] = queue;
  }

  return queue.push(fn, ontimeout);
};

/**
 * Destroy task group
 *
 * @param  {String} key   task key
 * @param  {Boolean} force whether close task group directly
 */
manager.closeQueue = function(key, force) {
  if(!this._queues[key]) {
    // ignore illeagle key
    return;
  }

  this._queues[key].close(force);
  delete this._queues[key];
};

module.exports = new TaskManager();
module.exports.TaskManager = TaskManager;
