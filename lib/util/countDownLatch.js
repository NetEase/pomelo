var exp = module.exports;

/**
 * Count down to zero and invoke cb finally.
 */
var CountDownLatch = function(count, cb) {
  this.count = count;
  this.cb = cb;
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
    this.cb();
  }
};

/**
 * create a count down latch
 *
 * @api public
 */
exp.createCountDownLatch = function(count, cb) {
  if(!count || count <= 0) {
    throw new Error('count should be positive.');
  }
  if(typeof cb !== 'function') {
    throw new Error('cb should be a function.');
  }

  return new CountDownLatch(count, cb);
};

/**
 * Count down to zero or timeout expirating and invoke cb finally.
 * cb  cb(isTimeout) if timeout, then isTimeout is true
 */
var CountDownLatchWithTimeout = function(count, timeout, cb) {
  this.count = count;
  this.timeout = timeout;
  this.cb = cb;
  var self = this;
  this.timerId = setTimeout(function() {
    self.cb(true);
  }, this.timeout);
}

/**
 * Call when a task finish to count down.
 *
 * @api public
 */
CountDownLatchWithTimeout.prototype.done = function() {
  if(this.count <= 0) {
    throw new Error('illegal state.');
  }

  this.count--;
  if (this.count === 0) {
    clearTimeout(this.timerId);
    this.cb();
  }
}

/**
 * create a count down latch with timeout
 *
 * @api public
 */
exp.createCountDownLatchWithTimeout = function(count, timeout,  cb) {
  if(!count || count <= 0) {
    throw new Error('count should be positive.');
  }
  if(typeof cb !== 'function') {
    throw new Error('cb should be a function.');
  }

  return new CountDownLatchWithTimeout(count, timeout, cb);
};

