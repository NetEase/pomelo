var exp = module.exports;

/**
 * Count down to zero or timeout and invoke cb finally.
 */
var CountDownLatch = function(count, opts, cb) {
  this.count = count;
  this.cb = cb;
  var self = this;
  if (opts.timeout) {
    this.timerId = setTimeout(function() {
      self.cb(true);
    }, opts.timeout);
  }
};

/**
 * Call when a task finish to count down.
 *
 * @api public
 */
CountDownLatch.prototype.done = function() {
  if(this.count <= 0) {
    throw new Error('illegal state.');
  }

  this.count--;
  if (this.count === 0) {
    if (this.timerId) {
      clearTimeout(this.timerId);
    }
    this.cb();
  }
};

/**
 * Create a count down latch
 *
 * @param {Integer} count
 * @param {Object} opts, opts.timeout indicates timeout, optional param
 * @param {Function} cb, cb(isTimeout)
 *
 * @api public
 */
exp.createCountDownLatch = function(count, opts, cb) {
  if(!count || count <= 0) {
    throw new Error('count should be positive.');
  }

  if (!cb && typeof opts === 'function') {
    cb = opts;
    opts = {};
  }

  if(typeof cb !== 'function') {
    throw new Error('cb should be a function.');
  }

  return new CountDownLatch(count, opts, cb);
};
