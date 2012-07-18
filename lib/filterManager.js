var utils = require('./util/utils');
var logger = require('./util/log/log').getLogger(__filename);

// prototype
var manager = module.exports = {};

//before filters
var befores = [];
//after filters
var afters = [];

/**
 * Add before filter into the filter chain.
 *
 * @param filter {Object|Function} filter instance or filter function.
 * @return manager instance for chain invoke
 */
manager.before = function(filter){
  befores.push(filter);
  return this;
};

/**
 * Add after filter into the filter chain.
 *
 * @param filter {Object|Function} filter instance or filter function.
 * @return manager instance for chain invoke
 */
manager.after = function(filter){
  afters.push(filter);
  return this;
};

/**
 * Do the before filter.
 * Fail over if any filter pass err parameter to the next function.
 * 
 * @param msg {Object} clienet request msg
 * @param session {Object} a session object for current request
 * @param cb {Function} cb(err) callback function to invoke next chain node
 */
manager.beforeFilter = function(msg, session, cb) {
  var index = 0;
  function next(err) {
    //if error or done
    if(!!err || index >= befores.length) {
      utils.invokeCallback(cb, err);
      return;
    }

    var handler = befores[index++];
    if(typeof handler === 'function') {
      handler(msg, session, next);
    } else if(typeof handler.filter === 'function') {
      handler.filter(msg, session, next);
    } else if(typeof handler.before === 'function') {
      handler.before(msg, session, next);
    } else {
      logger.warn('meet invalid filter, ignore it.');
      next(err);
    }
  } //end of next

  next();
};

/**
 * Do after filter chain.
 * Give server a chance to do clean up jobs after request responsed.
 * After filter can not change the request flow before.
 * After filter should call the next callback to let the request pass to next after filter.
 *
 * @param err {Object} error object
 * @param session {Object} session object for current request
 * @param cb {Function} cb(err) callback function to invoke next chain node
 */
manager.afterFilter = function(err, msg, session, cb) {
  var index = 0;
  function next(err) {
    //if done
    if(index >= afters.length) {
      utils.invokeCallback(cb, err);
      return;
    }

    var handler = afters[index++];
    if(typeof handler === 'function') {
      handler(err, msg, session, next);
    } else if(typeof handler.filter === 'function') {
      handler.filter(err, msg, session, next);
    } else if(typeof handler.after === 'function') {
      handler.after(err, msg, session, next);
    } else {
      logger.error('meet invalid filter, ignore it.');
      next(err);
    }
  } //end of next

  next();
};

