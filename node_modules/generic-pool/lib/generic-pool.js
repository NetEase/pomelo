var PriorityQueue = function(size) {
  var me = {}, slots, i, total = null;

  // initialize arrays to hold queue elements
  size = Math.max(+size | 0, 1);
  slots = [];
  for (i = 0; i < size; i += 1) {
    slots.push([]);
  }

  //  Public methods
  me.size = function () {
    var i;
    if (total === null) {
      total = 0;
      for (i = 0; i < size; i += 1) {
        total += slots[i].length;
      }
    }
    return total;
  };

  me.enqueue = function (obj, priority) {
    var priorityOrig;

    // Convert to integer with a default value of 0.
    priority = priority && + priority | 0 || 0;

    // Clear cache for total.
    total = null;
    if (priority) {
      priorityOrig = priority;
      if (priority < 0 || priority >= size) {
        priority = (size - 1);
        // put obj at the end of the line
        console.error("invalid priority: " + priorityOrig + " must be between 0 and " + priority);
      }
    }

    slots[priority].push(obj);
  };

  me.dequeue = function (callback) {
    var obj = null, i, sl = slots.length;

    // Clear cache for total.
    total = null;
    for (i = 0; i < sl; i += 1) {
      if (slots[i].length) {
        obj = slots[i].shift();
        break;
      }
    }
    return obj;
  };

  return me;
};

/**
 * Generate an Object pool with a specified `factory`.
 *
 * @param {Object} factory
 *   Factory to be used for generating and destorying the items.
 * @param {String} factory.name
 *   Name of the factory. Serves only logging purposes.
 * @param {Function} factory.create
 *   Should create the item to be acquired,
 *   and call it's first callback argument with the generated item as it's argument.
 * @param {Function} factory.destroy
 *   Should gently close any resources that the item is using.
 *   Called before the items is destroyed.
 * @param {Number} factory.max
 *   Maximum numnber of items that can exist at the same time.
 *   Any further acquire requests will be pushed to the waiting list.
 * @param {Number} factory.idleTimeoutMillis
 *   Delay in milliseconds after the idle items in the pool will be destroyed.
 *   And idle item is that is not acquired yet. Waiting items doesn't count here.
 * @param {Number} factory.reapIntervalMillis
 *   Cleanup is scheduled in every `factory.reapIntervalMillis` milliseconds.
 * @param {Boolean|Function} factory.log
 *   Whether the pool should log activity. If function is specified,
 *   that will be used instead. The function expects the arguments msg, loglevel
 * @param {Number} factory.priorityRange
 *   The range from 1 to be treated as a valid priority
 *
 * @returns {Object} An Object pool that works with the supplied `factory`.
 */
exports.Pool = function (factory) {
  var me = {},

      idleTimeoutMillis = factory.idleTimeoutMillis || 30000,
      reapInterval = factory.reapIntervalMillis || 1000,

      availableObjects = [],
      waitingClients = new PriorityQueue(factory.priorityRange || 1),
      count = 0,
      removeIdleScheduled = false,
      draining = false,

      // Prepare a logger function.
      log = factory.log ?
        (function (str, level) {
           typeof factory.log === 'function' ?
               factory.log(str, level) :
               console.log(level.toUpperCase() + " pool " + factory.name + " - " + str);
         }
        ) :
        function () {};


  factory.max = Math.max(factory.max, 1);

  /**
   * Request the client to be destroyed. The factory's destroy handler
   * will also be called.
   *
   * @param {Object} obj
   *   The acquired item to be destoyed.
   */
  me.destroy = function(obj) {
    count -= 1;
    factory.destroy(obj);
  };

  /**
   * Checks and removes the available (idle) clients that have timed out.
   */
  function removeIdle() {
    var toKeep = [],
        now = new Date().getTime(),
        i,
        al,
        timeout;

    removeIdleScheduled = false;

    // Go through the available (idle) items,
    // check if they have timed out
    for (i = 0, al = availableObjects.length; i < al; i += 1) {
      timeout = availableObjects[i].timeout;
      if (now < timeout) {
        // Client hasn't timed out, so keep it.
        toKeep.push(availableObjects[i]);
      } else {
        // The client timed out, call its destroyer.
        log("removeIdle() destroying obj - now:" + now + " timeout:" + timeout, 'verbose');
        me.destroy(availableObjects[i].obj);
      }
    }

    // Replace the available items with the ones to keep.
    availableObjects = toKeep;
    al = availableObjects.length;

    if (al > 0) {
      log("availableObjects.length=" + al, 'verbose');
      scheduleRemoveIdle();
    } else {
      log("removeIdle() all objects removed", 'verbose');
    }
  }


  /**
   * Schedule removal of idle items in the pool.
   *
   * More schedules cannot run concurrently.
   */
  function scheduleRemoveIdle() {
    if (!removeIdleScheduled) {
      removeIdleScheduled = true;
      setTimeout(removeIdle, reapInterval);
    }
  }

  /**
   * Handle callbacks with either the [obj] or [err, obj] arguments in an
   * adaptive manner. Uses the `cb.length` property to determine the number
   * of arguments expected by `cb`.
   */
  function adjustCallback(cb, err, obj) {
    if (!cb) return;
    if (cb.length <= 1) {
      cb(obj);
    } else {
      cb(err, obj);
    }
  }

  /**
   * Try to get a new client to work, and clean up pool unused (idle) items.
   *
   *  - If there are available clients waiting, shift the first one out (LIFO),
   *    and call its callback.
   *  - If there are no waiting clients, try to create one if it won't exceed
   *    the maximum number of clients.
   *  - If creating a new client would exceed the maximum, add the client to
   *    the wait list.
   */
  function dispense() {
    var obj = null,
        objWithTimeout = null,
        err = null,
        waitingCount = waitingClients.size();
    log("dispense() clients=" + waitingCount + " available=" + availableObjects.length, 'info');
    if (waitingCount > 0) {
      if (availableObjects.length > 0) {
        log("dispense() - reusing obj", 'verbose');
        objWithTimeout = availableObjects.shift();
        adjustCallback(waitingClients.dequeue(), err, objWithTimeout.obj);
      }
      else if (count < factory.max) {
        count += 1;
        log("dispense() - creating obj - count=" + count, 'verbose');
        factory.create(function () {
          var cb = waitingClients.dequeue();
          if (arguments.length > 1) {
            err = arguments[0];
            obj = arguments[1];
          } else {
            err = (arguments[0] instanceof Error) ? arguments[0] : null;
            obj = (arguments[0] instanceof Error) ? null : arguments[0];
          }
          if (err) {
            count -= 1;
            adjustCallback(cb, err, obj);
          } else {
            if (cb) {
              adjustCallback(cb, err, obj);
            } else {
              me.release(obj);
            }
          }
        });
      }
    }
  }

  /**
   * Request a new client. The callback will be called,
   * when a new client will be availabe, passing the client to it.
   *
   * @param {Function} callback
   *   Callback function to be called after the acquire is successful.
   *   The function will receive the acquired item as the first parameter.
   *
   * @param {Number} priority
   *   Optional.  Integer between 0 and (priorityRange - 1).  Specifies the priority
   *   of the caller if there are no available resources.  Lower numbers mean higher
   *   priority.
   *
   * @returns {Object} `true` if the pool is not fully utilized, `false` otherwise.
   */
  me.acquire = function (callback, priority) {
    if (draining) {
      throw new Error("pool is draining and cannot accept work");
    }
    waitingClients.enqueue(callback, priority);
    dispense();
    return (count < factory.max);
  };

  me.borrow = function (callback, priority) {
    log("borrow() is deprecated. use acquire() instead", 'warn');
    me.acquire(callback, priority);
  };

  /**
   * Return the client to the pool, in case it is no longer required.
   *
   * @param {Object} obj
   *   The acquired object to be put back to the pool.
   */
  me.release = function (obj) {
	// check to see if this object has already been released (i.e., is back in the pool of availableObjects)
    if (availableObjects.some(function(objWithTimeout) { return (objWithTimeout.obj === obj); })) {
      log("release called twice for the same resource: " + (new Error().stack), 'error');
      return;
    }
    //log("return to pool");
    var objWithTimeout = { obj: obj, timeout: (new Date().getTime() + idleTimeoutMillis) };
    availableObjects.push(objWithTimeout);
    log("timeout: " + objWithTimeout.timeout, 'verbose');
    dispense();
    scheduleRemoveIdle();
  };

  me.returnToPool = function (obj) {
    log("returnToPool() is deprecated. use release() instead", 'warn');
    me.release(obj);
  };

  /**
   * Disallow any new requests and let the request backlog dissapate.
   *
   * @param {Function} callback
   *   Optional. Callback invoked when all work is done and all clients have been
   *   released.
   */
  me.drain = function(callback) {
    log("draining", 'info');

    // disable the ability to put more work on the queue.
    draining = true;

    var check = function() {
      if (waitingClients.size() > 0) {
        // wait until all client requests have been satisfied.
        setTimeout(check, 100);
      } else if (availableObjects.length != count) {
        // wait until all objects have been released.
        setTimeout(check, 100);
      } else {
        if (callback) {
          callback();
        }
      }
    };
    check();
  };

  /**
   * Forcibly destroys all clients regardless of timeout.  Intended to be
   * invoked as part of a drain.  Does not prevent the creation of new
   * clients as a result of subsequent calls to acquire.
   *
   * @param {Function} callback
   *   Optional. Callback invoked after all existing clients are destroyed.
   */
  me.destroyAllNow = function(callback) {
    log("force destroying all objects", 'info');
    var willDie = availableObjects;
    availableObjects = [];
    var obj = willDie.shift();
    while (obj !== null && obj !== undefined) {
      me.destroy(obj.obj);
      obj = willDie.shift();
    }
    if (callback) {
      callback();
    }
  };

  me.getPoolSize = function() {
    return count;
  };

  me.getName = function() {
    return factory.name;
  };

  me.availableObjectsCount = function() {
    return availableObjects.length;
  };

  me.waitingClientsCount = function() {
    return waitingClients.size();
  };

  return me;
};
