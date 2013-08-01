var DefaultStatusManager = require('../manager/statusManager');
var utils = require('../../util/utils');
var countDownLatch = require('../../util/countDownLatch');
var logger = require('pomelo-logger').getLogger(__filename);

var ST_INITED = 0;
var ST_STARTED = 1;
var ST_CLOSED = 2;

var StatusService = function(app, opts) {
  this.app = app;
  this.opts = opts || {};
  this.manager = getStatusManager(app, opts);
  this.state = ST_INITED
};

module.exports = StatusService;

StatusService.prototype.start = function(cb) {
  if(this.state !== ST_INITED) {
    utils.invokeCallback(cb, new Error('invalid state'));
    return;
  }

  if(typeof this.manager.start === 'function') {
    var self = this;
    this.manager.start(function(err) {
      if(!err) {
        self.state = ST_STARTED;
      }
      utils.invokeCallback(cb, err);
    });
  } else {
    process.nextTick(function() {
      utils.invokeCallback(cb);
    });
  }
};

StatusService.prototype.stop = function(cb) {
  this.state = ST_CLOSED;

  if(typeof this.manager.stop === 'function') {
    this.manager.stop(force, cb);
  } else {
    process.nextTick(function() {
      utils.invokeCallback(cb);
    });
  }
};


StatusService.prototype.add = function(uid, sid, cb) {
  if(this.state !== ST_STARTED) {
    utils.invokeCallback(cb, new Error('invalid state'));
    return;
  }

  this.manager.add(uid, sid, cb);
};


StatusService.prototype.leave = function(uid, sid, cb) {
  if(this.state !== ST_STARTED) {
    utils.invokeCallback(cb, new Error('invalid state'));
    return;
  }

  this.manager.leave(uid, sid, cb);
};


StatusService.prototype.getSidsByUid = function(uid, cb) {
  if(this.state !== ST_STARTED) {
    utils.invokeCallback(cb, new Error('invalid state'));
    return;
  }

  this.manager.getSidsByUid(uid, cb);
};


StatusService.prototype.pushByUids = function(uids, route, msg, cb) {
  if(this.state !== ST_STARTED) {
    utils.invokeCallback(cb, new Error('invalid state'));
    return;
  }
  var channelService = this.app.get('channelService');
  var successFlag = false;
  var count = utils.size(uids);
  var records = [];

  var latch = countDownLatch.createCountDownLatch(count, function(){
    if(!successFlag) {
      utils.invokeCallback(cb, new Error('failed to get sids for uids: %j', uids));
      return;
    }
    else {
      channelService.pushMessageByUids(route, msg, records, cb);
    }
  });
  
  for(var i=0; i< uids.length; i++) {
    var tmp = uids[i];
    this.getSidsByUid(uids[i], function(err, list) {
      if(!!err) {
        logger.error('failed to get serverIds by uid: [%s], err: %j', uids[i], err);
        latch.done();
        return;
      }
      for(var j=0; j< list.length; j++) {
        records.push({uid: tmp, sid: list[j]});
      }
      successFlag = true;
      latch.done();
    });
  }
};


var getStatusManager = function(app, opts) {
  var manager;
  
  if(typeof opts.statusManager === 'function') {
    manager = opts.statusManager(app, opts);
  } else {
    manager = opts.statusManager;
  }

  if(!manager) {
    manager = new DefaultStatusManager(app, opts);
  }

  return manager;
};