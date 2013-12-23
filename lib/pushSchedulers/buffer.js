var utils = require('../util/utils');
var DEFAULT_FLUSH_INTERVAL = 20;

var Service = function(app, opts) {
  if (!(this instanceof Service)) {
    return new Service(app, opts);
  }

  opts = opts || {};
  this.app = app;
  this.flushInterval = opts.flushInterval || DEFAULT_FLUSH_INTERVAL;
  this.sessions = {};   // sid -> msg queue
  this.tid = null;
};

module.exports = Service;

Service.prototype.start = function(cb) {
  this.tid = setInterval(flush.bind(null, this), this.flushInterval);
  process.nextTick(function() {
    utils.invokeCallback(cb);
  });
};

Service.prototype.stop = function(force, cb) {
  if(this.tid) {
    clearInterval(this.tid);
    this.tid = null;
  }
  process.nextTick(function() {
    utils.invokeCallback(cb);
  });
};

Service.prototype.schedule = function(reqId, route, msg, recvs, opts, cb) {
  opts = opts || {};
  if(opts.type === 'broadcast') {
    doBroadcast(this, msg, opts.userOptions);
  } else {
    doBatchPush(this, msg, recvs);
  }

  process.nextTick(function() {
    utils.invokeCallback(cb);
  });
};

var doBroadcast = function(self, msg, opts) {
  var channelService = self.app.get('channelService');
  var sessionService = self.app.get('sessionService');

  if(opts.binded) {
    sessionService.forEachBindedSession(function(session) {
      if(channelService.broadcastFilter &&
         !channelService.broadcastFilter(session, msg, opts.filterParam)) {
        return;
      }

      enqueue(self, session, msg);
    });
  } else {
    sessionService.forEachSession(function(session) {
      if(channelService.broadcastFilter &&
          !channelService.broadcastFilter(session, msg, opts.filterParam)) {
        return;
      }

      enqueue(self, session, msg);
    });
  }
};

var doBatchPush = function(self, msg, recvs) {
  var sessionService = self.app.get('sessionService');
  var session;
  for(var i=0, l=recvs.length; i<l; i++) {
    session = sessionService.get(recvs[i]);
    if(session) {
      enqueue(self, session, msg);
    }
  }
};

var enqueue = function(self, session, msg) {
  var queue = self.sessions[session.id];
  if(!queue) {
    queue = self.sessions[session.id] = [];
    session.once('closed', onClose.bind(null, self));
  }

  queue.push(msg);
};

var onClose = function(self, session) {
  delete self.sessions[session.id];
};

var flush = function(self) {
  var sessionService = self.app.get('sessionService');
  var queue, session;
  for(var sid in self.sessions) {
    session = sessionService.get(sid);
    if(!session) {
      continue;
    }

    queue = self.sessions[sid];
    if(!queue || queue.length === 0) {
      continue;
    }

    session.sendBatch(queue);
    self.sessions[sid] = [];
  }
};
