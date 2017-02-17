'use strict';

const utils = require('../util/utils');

module.exports = Service;

function Service(app, opts) {
  if (!(this instanceof Service)) {
    return new Service(app, opts);
  }

  opts = opts || {};
  this.app = app;
}

Service.prototype.schedule = function(reqId, route, msg, recvs, opts, cb) {
  opts = opts || {};

  if (opts.type === 'broadcast') {
    _doBroadcast(this, msg, opts.userOptions);
  } else {
    _doBatchPush(this, msg, recvs);
  }

  if (cb) {
    process.nextTick(() => {
      utils.invokeCallback(cb);
    });
  }
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

      sessionService.sendMessageByUid(session.uid, msg);
    });
  } else {
    sessionService.forEachSession((session) => {
      if (channelService.broadcastFilter &&
          !channelService.broadcastFilter(session, msg,
                                          opts.filterParam)) {
        return;
      }

      sessionService.sendMessage(session.id, msg);
    });
  }
}

function _doBatchPush(sched, msg, recvs) {
  const sessionService = sched.app.get('sessionService');
  let i;
  for (i = 0; i < recvs.length; i++) {
    sessionService.sendMessage(recvs[i], msg);
  }
}
