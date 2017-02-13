'use strict';

/**
 * connection statistics service
 * record connection, login count and list
 */

module.exports = Service;

function Service(app) {
  this.serverId = app.getServerId();
  this.connCount = 0;
  this.loginedCount = 0;
  this.logined = {};
}

/**
 * Add logined user.
 *
 * @param uid {String} user id
 * @param info {Object} record for logined user
 */
Service.prototype.addLoginedUser = function(uid, info) {
  if (!this.logined[uid]) {
    this.loginedCount++;
  }
  info.uid = uid;
  this.logined[uid] = info;
};

/**
 * Update user info.
 * @param uid {String} user id
 * @param info {Object} info for update.
 */
Service.prototype.updateUserInfo = function(uid, info) {
  const user = this.logined[uid];
  if (!user) {
    return;
  }

  let p;
  for (p in info) {
    if (info.hasOwnProperty(p) && typeof info[p] !== 'function') {
      user[p] = info[p];
    }
  }
};

/**
 * Increase connection count
 */
Service.prototype.increaseConnectionCount = function() {
  this.connCount++;
};

/**
 * Remote logined user
 *
 * @param uid {String} user id
 */
Service.prototype.removeLoginedUser = function(uid) {
  if (this.logined[uid]) {
    this.loginedCount--;
  }
  delete this.logined[uid];
};

/**
 * Decrease connection count
 *
 * @param uid {String} uid
 */
Service.prototype.decreaseConnectionCount = function(uid) {
  if (this.connCount) {
    this.connCount--;
  }

  if (uid) {
    this.removeLoginedUser(uid);
  }
};

/**
 * Get statistics info
 *
 * @return {Object} statistics info
 */
Service.prototype.getStatisticsInfo = function() {
  const list = [];

  let uid;
  for (uid in this.logined) {
    list.push(this.logined[uid]);
  }

  return {
    serverId: this.serverId,
    totalConnCount: this.connCount,
    loginedCount: this.loginedCount,
    loginedList: list
  };
};
