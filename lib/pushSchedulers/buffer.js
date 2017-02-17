'use strict';

const utils = require('../util/utils');
const DEFAULT_FLUSH_INTERVAL = 20;

module.exports = Service;

function Service(app, opts) {
  if (!(this instanceof Service)) {
    return new Service(app, opts);
  }

  opts = opts || {};
  this.app = app;
  this.flushInterval = opts.flushInterval || DEFAULT_FLUSH_INTERVAL;
  this.sessions = {};   // sid -> msg queue
  this.tid = null;
}

Service.prototype.start = function(cb) {
  this.tid = setInterval(_flush.bind(null, this), this.flushInterval);
  process.nextTick(() => {
    utils.invokeCallback(cb);
  });
};

Service.prototype.stop = function(force, cb) {
  if (this.tid) {
    clearInterval(this.tid);
    this.tid = null;
  }
  process.nextTick(() => {
    utils.invokeCallback(cb);
  });
};

Service.prototype.schedule = function(reqId, route, msg, recvs, opts, cb) {
  opts = opts || {};

  if (opts.type === 'broadcast') {
    _doBroadcast(this, msg, opts.userOptions);
  } else {
    _doBatchPush(this, msg, recvs);
  }

  process.nextTick(() => {
    utils.invokeCallback(cb);
  });
};

function _doBroadcast(sched, msg, opts) {
  const channelService = sched.app.get('channelService');
  const sessionService = sched.app.get('sessionService');

  if (opts.binded) {
    sessionService.forEachBindedSession((session) => {
      if (channelService.broadcastFilter &&
          !channelService.broadcastFilter(session, msg,
                                          opts.filterParam)) {
        return;
      }

      _enqueue(sched, session, msg);
    });
  } else {
    sessionService.forEachSession((session) => {
      if (channelService.broadcastFilter &&
          !channelService.broadcastFilter(session, msg,
                                          opts.filterParam)) {
        return;
      }

      _enqueue(sched, session, msg);
    });
  }
}

function _doBatchPush(sched, msg, recvs) {
  const sessionService = sched.app.get('sessionService');
  let session;
  let i;
  for (i = 0; i < recvs.length; i++) {
    session = sessionService.get(recvs[i]);
    if (session) {
      _enqueue(sched, session, msg);
    }
  }
}

function _enqueue(sched, session, msg) {
  let queue = sched.sessions[session.id];
  if (!queue) {
    queue = sched.sessions[session.id] = [];

    session.once('closed', () => {
      delete sched.sessions[session.id];
    });
  }

  queue.push(msg);
}

function _flush(sched) {
  const sessionService = sched.app.get('sessionService');
  let session;
  let queue;
  let sid;

  for (sid in sched.sessions) {
    session = sessionService.get(sid);
    if (!session) {
      continue;
    }

    queue = sched.sessions[sid];
    if (!queue || queue.length === 0) {
      continue;
    }

    session.sendBatch(queue);
    sched.sessions[sid] = [];
  }
}
