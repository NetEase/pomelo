const _ = require('lodash'),
	CreateCountDownLatch = require('../../util/countDownLatch'),
	utils = require('../../util/utils'),
	ChannelRemote = require('../remote/frontend/channelRemote'),
	logger = require('pomelo-logger').getLogger('pomelo', __filename);

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

	start(callBack)
	{
		ChannelUtility.RestoreChannel(this, callBack);
	}

	/**
	 * Create channel with name.
	 *
	 * @param {String} channelName channel's name
	 * @memberOf ChannelService
	 */
	createChannel(channelName)
	{
		return this.getChannel(channelName, true);
	}

	/**
	 * Get channel by name.
	 *
	 * @param {String} channelName channel's name
	 * @param {Boolean} create if true, create channel
	 * @return {Channel}
	 * @memberOf ChannelService
	 */
	getChannel(channelName, create = false)
	{
		let channel = this.channels[channelName];
		if (!channel && create)
		{
			channel = this.channels[channelName] = new Channel(channelName, this);
			ChannelUtility.AddToStore(this, ChannelUtility.GenKey(this), ChannelUtility.GenKey(this, channelName));
		}
		return channel;
	}

	/**
	 * Destroy channel by name.
	 *
	 * @param {String} channelName channel name
	 * @memberOf ChannelService
	 */
	destroyChannel(channelName)
	{
		delete this.channels[channelName];
		ChannelUtility.RemoveFromStore(this, ChannelUtility.GenKey(this), ChannelUtility.GenKey(this, channelName));
		ChannelUtility.RemoveAllFromStore(this, ChannelUtility.GenKey(this, channelName));
	}

	/**
	 * Push message by uids.
	 * Group the uids by group. ignore any uid if sid not specified.
	 *
	 * @param {String} route message route
	 * @param {Object} msg message that would be sent to client
	 * @param {Array} userIds the receiver info list, [{uid: userId, sid: frontendServerId}]
	 * @param {Object} opts user-defined push options, optional
	 * @param {Function} callback cb(err)
	 * @memberOf ChannelService
	 */
	pushMessageByUids(route, msg, userIds, opts, callback)
	{
		if (!_.isString(route))
		{
			callback = opts;
			opts = userIds;
			userIds = msg;
			msg = route;
			route = msg.route;
		}

		if (!callback && _.isFunction(opts))
		{
			callback = opts;
			opts = {};
		}

		if (!userIds || userIds.length === 0)
		{
			utils.invokeCallback(callback, new Error('uids should not be empty'));
			return;
		}
		const groups = {};
		_.forEach(userIds, record =>
		{
			ChannelUtility.Add(record.uid, record.sid, groups);
		});

		ChannelUtility.SendMessageByGroup(this, route, msg, groups, opts, callback);
	}

	/**
	 * Broadcast message to all the connected clients.
	 *
	 * @param  {String}   serverType      frontend server type string
	 * @param  {String}   route      route string
	 * @param  {Object}   msg        message
	 * @param  {Object}   opts       user-defined broadcast options, optional
	 *                               opts.binded: push to binded sessions or all the sessions
	 *                               opts.filterParam: parameters for broadcast filter.
	 * @param  {Function} callback         callback
	 * @memberOf ChannelService
	 */
	broadcast(serverType, route, msg, opts, callback)
	{
		const app = this.app;
		const namespace = 'sys';
		const service = 'channelRemote';
		const method = 'broadcast';
		const servers = app.getServersByType(serverType);

		if (!servers || servers.length === 0)
		{
			// server list is empty
			utils.invokeCallback(callback);
			return;
		}

		let successFlag = false;
		const count = servers.length;
		const latch = CreateCountDownLatch.createCountDownLatch(count, () =>
		{
			if (!successFlag)
			{
				utils.invokeCallback(callback, new Error('broadcast fails'));
				return;
			}
			utils.invokeCallback(callback, null);
		});

		const genCB = serverId =>
		{
			return err =>
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

		_.forEach(servers, server =>
		{
			(serverId =>
			{
				if (serverId === app.serverId)
				{
					this.channelRemote[method](route, msg, opts, genCB(serverId));
				}
				else
				{
					app.rpcInvoke(serverId, {
						namespace : namespace,
						service   : service,
						method    : method,
						args      : [route, msg, opts]}, genCB(serverId));
				}
			})(server.id);
		});
	}
}

/**
 * Channel maintains the receiver collection for a subject. You can
 * add users into a channel and then broadcast message to them by channel.
 *
 * @class channel
 * @constructor
 */
class Channel
{
	constructor(channelName, service)
	{
		this.name = channelName;
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
		const res = ChannelUtility.Add(uid, sid, this.groups);
		if (res)
		{
			this.records[uid] = {
				sid : sid,
				uid : uid};
			this.userAmount = this.userAmount + 1;
		}
		const service = this.__channelService__;
		ChannelUtility.AddToStore(
			service,
			ChannelUtility.GenKey(service, this.name),
			ChannelUtility.GenValue(sid, uid));
		return res;
	}

	/**
	 * Remove user from channel.
	 *
	 * @param {Number} uid user id
	 * @param {String} sid frontend server id which user has connected to.
	 * @return {Boolean} true if success or false if fail
	 */
	leave(uid, sid)
	{
		if (!uid || !sid)
		{
			return false;
		}
		const res = ChannelUtility.DeleteFrom(uid, sid, this.groups[sid]);
		if (res)
		{
			delete this.records[uid];
			this.userAmount = this.userAmount - 1;
		}
		// robust
		if (this.userAmount < 0)
		{
			this.userAmount = 0;
		}
		const service = this.__channelService__;
		ChannelUtility.RemoveFromStore(
			service,
			ChannelUtility.GenKey(service, this.name),
			ChannelUtility.GenValue(sid, uid));

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
		_.forEach(groups, group =>
		{
			_.forEach(group, value =>
			{
				res.push(value);
			});
		});

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
			utils.invokeCallback(cb, new Error('channel is not running now'));
			return;
		}

		if (!_.isString(route))
		{
			cb = opts;
			opts = msg;
			msg = route;
			route = msg.route;
		}

		if (!cb && _.isFunction(opts))
		{
			cb = opts;
			opts = {};
		}

		ChannelUtility.SendMessageByGroup(this.__channelService__, route, msg, this.groups, opts, cb);
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
	static Add(uid, sid, groups)
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
	static DeleteFrom(uid, sid, group)
	{
		if (!uid || !sid || !group)
		{
			return false;
		}

		const index = _.indexOf(group, uid);
		if (index > -1)
		{
			group.splice(index, 1);
			return true;
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
	static SendMessageByGroup(channelService, route, msg, groups, opts, cb)
	{
		const app = channelService.app;
		const namespace = 'sys';
		const service = 'channelRemote';
		const method = 'pushMessage';
		const count = utils.size(groups);
		let successFlag = false;
		let failIds = [];

		logger.debug(`[${app.serverId}] channelService sendMessageByGroup route: ${route}, msg: ${msg}, groups: %${groups}, opts: %${opts}`);
		if (count === 0)
		{
			// group is empty
			utils.invokeCallback(cb);
			return;
		}

		const latch = CreateCountDownLatch.createCountDownLatch(count, () =>
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

		_.forEach(groups, (group, serverId) =>
		{
			if (group && group.length > 0)
			{
				((serverId, group) =>
				{
					if (serverId === app.serverId)
					{
						channelService.channelRemote[method](route, msg, group, opts, rpcCB(serverId));
					}
					else
					{
						app.rpcInvoke(serverId, {
							namespace : namespace,
							service   : service,
							method    : method,
							args      : [route, msg, group, opts]}, rpcCB(serverId));
					}
				})(serverId, group);
			}
			else
			{
				// empty group
				process.nextTick(rpcCB(serverId));
			}
		});
	}

	static RestoreChannel(channelService, cb)
	{
		if (!channelService.store)
		{
			utils.invokeCallback(cb);
		}
		else
		{
			const genChannelService = ChannelUtility.GenKey(channelService);
			ChannelUtility.LoadAllFromStore(channelService, genChannelService, (err, list) =>
			{
				if (err)
				{
					utils.invokeCallback(cb, err);
				}
				else
				{
					if (!list.length || !_.isArray(list))
					{
						utils.invokeCallback(cb);
						return;
					}

					_.forEach(list, key =>
					{
						const channelName = key.slice(genChannelService.length + 1);
						channelService.channels[channelName] = new Channel(channelName, channelService);
						((key, channelName) =>
						{
							ChannelUtility.LoadAllFromStore(channelService, key, (err, items) =>
							{
								if (err)
								{
									logger.error(`LoadAllFromStore ${err}`);
								}
								_.forEach(items, item =>
								{
									const array = item.split(':');
									const sid = array[0];
									const uid = array[1];
									const channel = channelService.channels[channelName];
									const res = ChannelUtility.Add(uid, sid, channel.groups);
									if (res)
									{
										channel.records[uid] = {
											sid : sid,
											uid : uid
										};
									}
								});
							});
						})(key, channelName);
					});

					utils.invokeCallback(cb);
				}
			});
		}
	}

	static AddToStore(channelService, key, value)
	{
		if (channelService.store)
		{
			channelService.store.add(key, value, function(err)
			{
				if (err)
				{
					logger.error(`add key: ${key} value: ${value} to store, with err: ${err.stack}`);
				}
			});
		}
	}

	static RemoveFromStore(channelService, key, value)
	{
		if (channelService.store)
		{
			channelService.store.remove(key, value, function(err)
			{
				if (err)
				{
					logger.error(`remove key: ${key} value: ${value} from store, with err: ${err.stack}`);
				}
			});
		}
	}

	static LoadAllFromStore(channelService, key, cb)
	{
		if (channelService.store)
		{
			channelService.store.load(key, function(err, list)
			{
				if (err)
				{
					logger.error(`load key: ${key} from store, with err: ${err.stack}`);
					utils.invokeCallback(cb, err);
				}
				else
				{
					utils.invokeCallback(cb, null, list);
				}
			});
		}
	}

	static RemoveAllFromStore(channelService, key)
	{
		if (channelService.store)
		{
			channelService.store.removeAll(key, function(err)
			{
				if (err)
				{
					logger.error(`remove key: ${key} all members from store, with err: ${err.stack}`);
				}
			});
		}
	}

	static GenKey(channelService, name)
	{
		if (name)
		{
			return `${channelService.prefix}:${channelService.app.serverId}:${name}`;
		}
		return `${channelService.prefix}:${channelService.app.serverId}`;
	}

	static GenValue(sid, uid)
	{
		return `${sid}:${uid}`;
	}

}

module.exports = function(app, opts)
{
	if (!(this instanceof ChannelService))
	{
		return new ChannelService(app, opts);
	}
};