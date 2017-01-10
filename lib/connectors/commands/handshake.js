
const pomelo = require('../../pomelo'),
	_ = require('lodash'),
	Package = require('pomelo-protocol').Package;

const CODE_OK = 200;
const CODE_USE_ERROR = 500;
const CODE_OLD_CLIENT = 501;

class Handshake
{
	/**
	 * Process the handshake request.
	 *
	 * @param {Object} opts option parameters
	 *                      opts.handshake(msg, cb(err, resp)) handshake callback. msg is the handshake message from client.
	 *                      opts.hearbeat heartbeat interval (level?)
	 *                      opts.version required client level
	 */
	constructor(opts)
	{
		opts = opts || {};
		this.userHandshake = opts.handshake;

		if (opts.heartbeat)
		{
			this.heartbeatSec = opts.heartbeat;
			this.heartbeat = opts.heartbeat * 1000;
		}

		this.checkClient = opts.checkClient;

		this.useDict = opts.useDict;
		this.useProtobuf = opts.useProtobuf;
		this.useCrypto = opts.useCrypto;
	}

	handle(socket, msg)
	{
		if (!msg.sys)
		{
			HandshakeUtility.ProcessError(socket, CODE_USE_ERROR);
			return;
		}
		// 验证客户端 版本 类型......
		if (_.isFunction(this.checkClient))
		{
			if (!msg || !msg.sys || !this.checkClient(msg.sys.type, msg.sys.version))
			{
				HandshakeUtility.ProcessError(socket, CODE_OLD_CLIENT);
				return;
			}
		}

		const opts = {
			heartbeat : HandshakeUtility.SetupHeartbeat(this)
		};

		const components = pomelo.app.components;
		// 采用 dic压缩
		if (this.useDict)
		{
			const dictionary = _.get(components, '__dictionary__', {});
			const dictVersion = dictionary.getVersion();
			if (!msg.sys.dictVersion || !_.isEqual(msg.sys.dictVersion, dictVersion))
			{
				// may be deprecated in future
				opts.routeToCode = opts.dict = dictionary.getDict();
				opts.codeToRoute = dictionary.getAbbrs();
				opts.dictVersion = dictVersion;
			}
			opts.useDict = true;
		}

		if (this.useProtobuf)
		{
			const protoBuff = _.get(components, '__protobuf__', {});
			const protoVersion = protoBuff.getVersion();
			if (!msg.sys.protoVersion || !_.isEqual(msg.sys.protoVersion, protoVersion))
			{
				opts.protos = protoBuff.getProtos();
			}
			opts.useProto = true;
		}

		const decodeIOProtoBuff = _.get(components, '__decodeIO__protobuf__', null);
		if (!_.isNil(decodeIOProtoBuff))
		{
			if (this.useProtobuf)
			{
				throw new Error('protobuf can not be both used in the same project.');
			}
			const version = decodeIOProtoBuff.getVersion();
			if (!msg.sys.protoVersion || msg.sys.protoVersion < version)
			{
				opts.protos = decodeIOProtoBuff.getProtos();
			}
			opts.useProto = true;
		}

		if (this.useCrypto)
		{
			components.__connector__.setPubKey(socket.id, msg.sys.rsa);
		}

		if (_.isFunction(this.userHandshake))
		{
			this.userHandshake(msg, (err, resp) =>
			{
				if (err)
				{
					process.nextTick(() =>
					{
						HandshakeUtility.ProcessError(socket, CODE_USE_ERROR);
					});
					return;
				}
				process.nextTick(() =>
				{
					HandshakeUtility.Response(socket, opts, resp);
				});
			}, socket);
			return;
		}

		process.nextTick(() =>
		{
			HandshakeUtility.Response(socket, opts);
		});
	}
}

class HandshakeUtility
{
	static SetupHeartbeat(handshake)
	{
		return handshake.heartbeatSec;
	}

	static Response(socket, sys, resp)
	{
		const res = {
			code : CODE_OK,
			sys  : sys
		};
		if (resp)
		{
			res.user = resp;
		}
		socket.handshakeResponse(Package.encode(Package.TYPE_HANDSHAKE, new Buffer(JSON.stringify(res))));
	}

	static ProcessError(socket, code)
	{
		const res = {
			code : code
		};
		socket.sendForce(Package.encode(Package.TYPE_HANDSHAKE, new Buffer(JSON.stringify(res))));
		process.nextTick(function()
		{
			socket.disconnect();
		});
	}
}

module.exports = function(opts)
{
	return new Handshake(opts);
};