var SchedulerService = function(app, opts) {
  opts = opts || {};
  this.app = app;
  this.sessions = {};   // sid -> msg queue

};

module.exports = SchedulerService;

SchedulerService.prototype.schedule = function(route, msg, recvs, opts, cb) {
  opts = opts || {};
  if(opts.isBroadcast) {
    doBroadcast(this, msg, opts);
  } else {
    doBatchPush(this, msg, recvs);
  }

  if(cb) {
    process.process.nextTick(function() {
      cb();
    });
  }
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

      sessionService.sendMessageByUid(session.uid, msg);
    });
  } else {
    sessionService.forEachSession(function(session) {
      if(channelService.broadcastFilter &&
         !channelService.broadcastFilter(session, msg, opts.filterParam)) {
        return;
      }

      sessionService.sendMessage(session.id, msg);
    });
  }
};

var doBatchPush = function(self, msg, recvs) {
  var sessionService = self.app.get('sessionService');
  for(var i=0, l=recvs.length; i<l; i++) {
    sessionService.sendMessageByUid(recvs[i], msg);
  }
};