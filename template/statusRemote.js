var pomelo = require('pomelo');

var statusService = pomelo.statusService;

var exp = module.exports;

/**
 * status service
 * keep all connection infos in memory.
 * only one connection at the same time for each account. latest login will kick the old one off.
 */
var uidMap = {};

/**
 * add uid and serverId pair into status records
 * kick the old login if any.
 *
 * @param uid user id
 * @param sid server id
 * @param cb(err)
 */
exp.addStatus = statusService.addStatus;

/**
 * remove status record by uid
 *
 * @param uid user id
 * @param cb(err)
 */
exp.removeStatus = statusService.removeStatus;

/**
 * query status by uid
 *
 * @param {String} uid user id
 * @param {Function} cb(err, sid) sid: server id corresponsed with the uid or null/undefined for none
 */
exp.queryStatus = statusService.queryStatus;

/**
 * query status by uids
 *
 * @param {Array} uids list of uid
 * @param {Function} cb(err, result, missing) result:{sid:[uid]}, missing:[missingUid]
 */
exp.queryStatusBatch = statusService.queryStatusBatch;
