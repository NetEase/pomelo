const seQueue = require('seq-queue');

const queues = {};

let _timeout = 3000;

class TaskManager
{
	static set timeout(value)
	{
		_timeout = value;
	}

	static get timeout()
	{
		return _timeout;
	}

	/**
	 * Add tasks into task group. Create the task group if it dose not exist.
	 *
	 * @param {String}   key       task key
	 * @param {Function} fn        task callback
	 * @param {Function} onTimeout task timeout callback
	 * @param {Number}   timeout   timeout for task
	 */
	static addTask(key, fn, onTimeout, timeout)
	{
		let queue = queues[key];
		if (!queue)
		{
			queue = seQueue.createQueue(TaskManager.timeout);
			queues[key] = queue;
		}
		return queue.push(fn, onTimeout, timeout);
	}

	/**
	 * Destroy task group
	 *
	 * @param  {String} key   task key
	 * @param  {Boolean} force whether close task group directly
	 */
	static closeQueue(key, force)
	{
		if (!queues[key])
		{
			// ignore illeagle key
			return;
		}

		queues[key].close(force);
		delete queues[key];
	}
}

module.exports = TaskManager;