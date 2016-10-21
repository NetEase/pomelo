const countDownLatch = require('../../util/countDownLatch');
const utils = require('../../util/utils');
const ChannelRemote = require('../remote/frontend/channelRemote');
const logger = require('pomelo-logger').getLogger('pomelo', __filename);

/**
 * constant
 */
const ST_INITED = 0;
const ST_DESTROYED = 1;

/**
 * Create and maintain channels for server local.
 *
 * ChannelService is created by channel component which is a default loaded
 * component of pomelo and channel service would be accessed by `app.get('channelService')`.
 *
 * @class
 * @constructor
 */
class ChannelService
{
	constructor(app, opts)
    {
		opts = opts || {};
		this.app = app;
		this.channels = {};
		this.prefix = opts.prefix;
		this.store = opts.store;
		this.broadcastFilter = opts.broadcastFilter;
		this.channelRemote = new ChannelRemote(app);
	}

	start(cb)
    {
		ChannelUtility.restoreChannel(this, cb);
	}

    /**
     * Create channel with name.
     *
     * @param {String} name channel's name
     * @memberOf ChannelService
     */
	createChannel(name)
    {
		if (this.channels[name])
        {
			return this.channels[name];
		}

		const c = new Channel(name, this);
		ChannelUtility.addToStore(this, ChannelUtility.genKey(this), ChannelUtility.genKey(this, name));
		this.channels[name] = c;
		return c;
	}

    /**
     * Get channel by name.
     *
     * @param {String} name channel's name
     * @param {Boolean} create if true, create channel
     * @return {Channel}
     * @memberOf ChannelService
     */
	getChannel(name, create)
    {
		let channel = this.channels[name];
		if (!channel && Boolean(create))
        {
			channel = this.channels[name] = new Channel(name, this);
			ChannelUtility.addToStore(this, ChannelUtility.genKey(this), ChannelUtility.genKey(this, name));
		}
		return channel;
	}

    /**
     * Destroy channel by name.
     *
     * @param {String} name channel name
     * @memberOf ChannelService
     */
	destroyChannel(name)
    {
		delete this.channels[name];
		ChannelUtility.removeFromStore(this, ChannelUtility.genKey(this), ChannelUtility.genKey(this, name));
		ChannelUtility.removeAllFromStore(this, ChannelUtility.genKey(this, name));
	}

    /**
     * Push message by uids.
     * Group the uids by group. ignore any uid if sid not specified.
     *
     * @param {String} route message route
     * @param {Object} msg message that would be sent to client
     * @param {Array} uids the receiver info list, [{uid: userId, sid: frontendServerId}]
     * @param {Object} opts user-defined push options, optional
     * @param {Function} cb cb(err)
     * @memberOf ChannelService
     */
	pushMessageByUids(route, msg, uids, opts, cb)
    {
		if (typeof route !== 'string')
        {
			cb = opts;
			opts = uids;
			uids = msg;
			msg = route;
			route = msg.route;
		}

		if (!cb && typeof opts === 'function')
        {
			cb = opts;
			opts = {};
		}

		if (!uids || uids.length === 0)
        {
			utils.invokeCallback(cb, new Error('uids should not be empty'));
			return;
		}
		const groups = {};
		let record;
		for (let i = 0, l = uids.length; i < l; i++)
        {
			record = uids[i];
			ChannelUtility.add(record.uid, record.sid, groups);
		}

		ChannelUtility.sendMessageByGroup(this, route, msg, groups, opts, cb);
	}

    /**
     * Broadcast message to all the connected clients.
     *
     * @param  {String}   stype      frontend server type string
     * @param  {String}   route      route string
     * @param  {Object}   msg        message
     * @param  {Object}   opts       user-defined broadcast options, optional
     *                               opts.binded: push to binded sessions or all the sessions
     *                               opts.filterParam: parameters for broadcast filter.
     * @param  {Function} cb         callback
     * @memberOf ChannelService
     */
	broadcast(stype, route, msg, opts, cb)
    {
		const app = this.app;
		const namespace = 'sys';
		const service = 'channelRemote';
		const method = 'broadcast';
		const servers = app.getServersByType(stype);

		if (!servers || servers.length === 0)
        {
            // server list is empty
			utils.invokeCallback(cb);
			return;
		}

		const count = servers.length;
		let successFlag = false;

		const latch = countDownLatch.createCountDownLatch(count, function()
        {
			if (!successFlag)
            {
				utils.invokeCallback(cb, new Error('broadcast fails'));
				return;
			}
			utils.invokeCallback(cb, null);
		});

		const genCB = (serverId) =>
        {
			return function(err)
            {
				if (err)
                {
					logger.error(`[broadcast] fail to push message to serverId: ${serverId}, err:${err.stack}`);
					latch.done();
					return;
				}
				successFlag = true;
				latch.done();
			};
		};

		const self = this;
		const sendMessage = (serverId) =>
        {
			return (function()
            {
				if (serverId === app.serverId)
                {
					self.channelRemote[method](route, msg, opts, genCB());
				}
				else
                {
					app.rpcInvoke(serverId, {
						namespace : namespace,
						service   : service,
						method    : method,
						args      : [route, msg, opts]}, genCB(serverId));
				}
			}());
		};

		opts = {
			type        : 'broadcast',
			userOptions : opts || {}
		};

        // for compatiblity
		opts.isBroadcast = true;
		if (opts.userOptions)
        {
			opts.binded = opts.userOptions.binded;
			opts.filterParam = opts.userOptions.filterParam;
		}

		for (let i = 0, l = count; i < l; i++)
        {
			sendMessage(servers[i].id);
		}
	}
}

module.exports = ChannelService;

/**
 * Channel maintains the receiver collection for a subject. You can
 * add users into a channel and then broadcast message to them by channel.
 *
 * @class channel
 * @constructor
 */
class Channel
{
	constructor(name, service)
    {
		this.name = name;
		this.groups = {};       // group map for uids. key: sid, value: [uid]
		this.records = {};      // member records. key: uid
		this.__channelService__ = service;
		this.state = ST_INITED;
		this.userAmount = 0;
	}

    /**
     * Add user to channel.
     *
     * @param {Number} uid user id
     * @param {String} sid frontend server id which user has connected to
     */
	add(uid, sid)
    {
		if (this.state > ST_INITED)
        {
			return false;
		}
		const res = ChannelUtility.add(uid, sid, this.groups);
		if (res)
        {
			this.records[uid] = {
				sid : sid,
				uid : uid};
			this.userAmount = this.userAmount + 1;
		}
		ChannelUtility.addToStore(this.__channelService__,
            ChannelUtility.genKey(this.__channelService__, this.name),
            ChannelUtility.genValue(sid, uid));
		return res;
	}

    /**
     * Remove user from channel.
     *
     * @param {Number} uid user id
     * @param {String} sid frontend server id which user has connected to.
     * @return [Boolean] true if success or false if fail
     */
	leave(uid, sid)
    {
		if (!uid || !sid)
        {
			return false;
		}
		const res = ChannelUtility.deleteFrom(uid, sid, this.groups[sid]);
		if (res)
        {
			delete this.records[uid];
			this.userAmount = this.userAmount - 1;
		}
		if (this.userAmount < 0) this.userAmount = 0;// robust
		ChannelUtility.removeFromStore(this.__channelService__,
            ChannelUtility.genKey(this.__channelService__, this.name),
            ChannelUtility.genValue(sid, uid));
		if (this.groups[sid] && this.groups[sid].length === 0)
        {
			delete this.groups[sid];
		}
		return res;
	}
    /**
     * Get channel UserAmount in a channel.

     *
     * @return {number } channel member amount
     */
	getUserAmount()
    {
		return this.userAmount;
	}

    /**
     * Get channel members.
     *
     * <b>Notice:</b> Heavy operation.
     *
     * @return {Array} channel member uid list
     */
	getMembers()
    {
		const res = [];
		const groups = this.groups;
		let group, i, l;
		for (const sid in groups)
        {
			group = groups[sid];
			for (i = 0, l = group.length; i < l; i++)
            {
				res.push(group[i]);
			}
		}
		return res;
	}

    /**
     * Get Member info.
     *
     * @param  {String} uid user id
     * @return {Object} member info
     */
	getMember(uid)
    {
		return this.records[uid];
	}

    /**
     * Destroy channel.
     */
	destroy()
    {
		this.state = ST_DESTROYED;
		this.__channelService__.destroyChannel(this.name);
	}

    /**
     * Push message to all the members in the channel
     *
     * @param {String} route message route
     * @param {Object} msg message that would be sent to client
     * @param {Object} opts user-defined push options, optional
     * @param {Function} cb callback function
     */
	pushMessage(route, msg, opts, cb)
    {
		if (this.state !== ST_INITED)
        {
			utils.invokeCallback(new Error('channel is not running now'));
			return;
		}

		if (typeof route !== 'string')
        {
			cb = opts;
			opts = msg;
			msg = route;
			route = msg.route;
		}

		if (!cb && typeof opts === 'function')
        {
			cb = opts;
			opts = {};
		}

		ChannelUtility.sendMessageByGroup(this.__channelService__, route, msg, this.groups, opts, cb);
	}
}

class ChannelUtility
{
    /**
     * add uid and sid into group. ignore any uid that uid not specified.
     *
     * @param uid user id
     * @param sid server id
     * @param groups {Object} grouped uids, , key: sid, value: [uid]
     */
	static add(uid, sid, groups)
    {
		if (!sid)
        {
			logger.warn('ignore uid %j for sid not specified.', uid);
			return false;
		}

		let group = groups[sid];
		if (!group)
        {
			group = [];
			groups[sid] = group;
		}

		group.push(uid);
		return true;
	}

    /**
     * delete element from array
     */
	static deleteFrom(uid, sid, group)
    {
		if (!uid || !sid || !group)
        {
			return false;
		}

		for (let i = 0, l = group.length; i < l; i++)
        {
			if (group[i] === uid)
            {
				group.splice(i, 1);
				return true;
			}
		}
		return false;
	}

    /**
     * push message by group
     *
     * @param channelService {ChannelService} route route message
     * @param route {String} route route message
     * @param msg {Object} message that would be sent to client
     * @param groups {Object} grouped uids, , key: sid, value: [uid]
     * @param opts {Object} push options
     * @param cb {Function} cb(err)
     *
     * @api private
     */
	static sendMessageByGroup(channelService, route, msg, groups, opts, cb)
    {
		const app = channelService.app;
		const namespace = 'sys';
		const service = 'channelRemote';
		const method = 'pushMessage';
		const count = utils.size(groups);
		let successFlag = false;
		let failIds = [];
    
		logger.debug('[%s] channelService sendMessageByGroup route: %s, msg: %j, groups: %j, opts: %j', app.serverId, route, msg, groups, opts);
		if (count === 0)
        {
            // group is empty
			utils.invokeCallback(cb);
			return;
		}
    
		const latch = countDownLatch.createCountDownLatch(count, () =>
        {
			if (!successFlag)
            {
				utils.invokeCallback(cb, new Error('all uids push message fail'));
				return;
			}
			utils.invokeCallback(cb, null, failIds);
		});
    
		const rpcCB = serverId =>
        {
			return function(err, fails)
            {
				if (err)
                {
					logger.error(`[pushMessage] fail to dispatch msg to serverId: ${serverId}, err:${err.stack}`);
					latch.done();
					return;
				}
				if (fails)
                {
					failIds = failIds.concat(fails);
				}
				successFlag = true;
				latch.done();
			};
		};
    
		opts = {
			type        : 'push',
			userOptions : opts || {}
		};
        // for compatiblity
		opts.isPush = true;
    
		const sendMessage = sid =>
        {
			return (function()
            {
				if (sid === app.serverId)
                {
					channelService.channelRemote[method](route, msg, groups[sid], opts, rpcCB(sid));
				}
				else
                {
					app.rpcInvoke(sid, {
						namespace : namespace,
						service   : service,
						method    : method,
						args      : [route, msg, groups[sid], opts]}, rpcCB(sid));
				}
			})();
		};
    
		let group;
		for (const sid in groups)
        {
			group = groups[sid];
			if (group && group.length > 0)
            {
				sendMessage(sid);
			}
			else
            {
                // empty group
				process.nextTick(rpcCB(sid));
			}
		}
	}
    
	static restoreChannel(channelService, cb)
    {
		if (!channelService.store)
        {
			utils.invokeCallback(cb);
		}
		else
        {
			ChannelUtility.loadAllFromStore(channelService, ChannelUtility.genKey(channelService), (err, list) =>
            {
				if (err)
                {
					utils.invokeCallback(cb, err);
				}
				else
                {
					if (!list.length || !Array.isArray(list))
                    {
						utils.invokeCallback(cb);
						return;
					}
					const load = (key) =>
                    {
						return (() =>
                        {
							ChannelUtility.loadAllFromStore(channelService, key, (err, items) =>
                            {
								if (err)
                                {
									logger.error(`loadAllFromStore ${err}`);
								}
								for (let j = 0; j < items.length; j++)
                                {
									const array = items[j].split(':');
									const sid = array[0];
									const uid = array[1];
									const channel = channelService.channels[name];
									const res = ChannelUtility.add(uid, sid, channel.groups);
									if (res)
                                    {
										channel.records[uid] = {
											sid : sid,
											uid : uid};
									}
								}
							});
						})();
					};
    
					for (let i = 0; i < list.length; i++)
                    {
						const name = list[i].slice(ChannelUtility.genKey(channelService).length + 1);
						channelService.channels[name] = new Channel(name, channelService);
						load(list[i]);
					}
					utils.invokeCallback(cb);
				}
			});
		}
	}
    
	static addToStore(channelService, key, value)
    {
		if (channelService.store)
        {
			channelService.store.add(key, value, function(err)
            {
				if (err)
                {
					logger.error('add key: %s value: %s to store, with err: %j', key, value, err.stack);
				}
			});
		}
	}
    
	static removeFromStore(channelService, key, value)
    {
		if (channelService.store)
        {
			channelService.store.remove(key, value, function(err)
            {
				if (err)
                {
					logger.error('remove key: %s value: %s from store, with err: %j', key, value, err.stack);
				}
			});
		}
	}
    
	static loadAllFromStore(channelService, key, cb)
    {
		if (channelService.store)
        {
			channelService.store.load(key, function(err, list)
            {
				if (err)
                {
					logger.error('load key: %s from store, with err: %j', key, err.stack);
					utils.invokeCallback(cb, err);
				}
				else
                {
					utils.invokeCallback(cb, null, list);
				}
			});
		}
	}
    
	static removeAllFromStore(channelService, key)
    {
		if (channelService.store)
        {
			channelService.store.removeAll(key, function(err)
            {
				if (err)
                {
					logger.error('remove key: %s all members from store, with err: %j', key, err.stack);
				}
			});
		}
	}
    
	static genKey(channelService, name)
    {
		if (name)
        {
			return `${channelService.prefix}:${channelService.app.serverId}:${name}`;
		}
		return `${channelService.prefix}:${channelService.app.serverId}`;
	}
    
	static genValue(sid, uid)
    {
		return `${sid}:${uid}`;
	}
    
}