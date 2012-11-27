/**
 * Component for data sync.
 */
var logger = require('pomelo-logger').getLogger(__filename);
var DataSync = require('pomelo-sync');
var instance = null;

/**
 * Sync states
 */
var STATE_STARTED = 1;    // sync has started
var STATE_STOPED  = 2;    // sync has stoped

/**
 * Component factory function
 *
 * @param {Object} app  current application context
 * @param {Object} opts construct parameters
 * @return {Object}     component instances
 */
module.exports = function(app, opts) {
  if(instance) {
    // this should be singleton
    return instance;
  }

  if(!opts || !opts.dbclient) {
    throw new Error('opts.dbclient should not be empty.');
  }

  if(!opts.path) {
    throw new Error('opts.path should not be empty.');
  }

  instance = new Component(app, opts);
  app.set('sync', instance.sync);
  return instance;
};

/**
 * Sync component class
 *
 * @param {Object} app  current application context
 * @param {Object} opts construct parameters
 */
var Component = function(app, opts) {
  this.app = app;
  this.sync = createSync(opts);
  this.dbclient = opts.dbclient;
  this.state = STATE_STARTED;
};

/**
 *stop the component
 *
 * @param {boolean} force,true or false
 * @param {Function} cb, callback
 *
 */
Component.prototype.stop = function(force, cb) {
  if(this.state > STATE_STARTED) {
    cb();
    return;
  }
  this.state = STATE_STOPED;
  this.sync.sync();
  var self = this;
  var interval = setInterval(function(){
    if (self.sync.isDone()) {
      clearInterval(interval);
      cb();
    }
  }, 200);
};

/**
 * Init sync
 *
 * @param {Object} opts contructor parameters for DataSync
 * @return {Object} DataSync Object
 */
var createSync = function(opts){
  var opt = opts || {};
  opt.mappingPath = opts.path;
  opt.client = opts.dbclient;
  opt.interval = opts.interval || 60 * 1000;
  return new DataSync(opt);
};
