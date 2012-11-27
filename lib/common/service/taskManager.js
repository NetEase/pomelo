var utils = require('../../util/utils');
var sequeue = require('seq-queue');

var manager = module.exports;

var queues = {};

/**
 * Add tasks into task group. Create the task group if it dose not exist.
 *
 * @param {String}   key       task key
 * @param {Function} fn        task callback
 * @param {Function} ontimeout task timeout callback
 */
manager.addTask = function(key, fn, ontimeout) {
  var queue = queues[key];
  if(!queue) {
    queue = sequeue.createQueue();
    queues[key] = queue;
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
  if(!queues[key]) {
    // ignore illeagle key
    return;
  }

  queues[key].close(force);
  delete queues[key];
};
