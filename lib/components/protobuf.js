const fs = require('fs');
const path = require('path');
const protobuf = require('pomelo-protobuf');
const Constants = require('../util/constants');
const crypto = require('crypto');
const logger = require('pomelo-logger').getLogger('pomelo', __filename);

class ProtoBuff
{
	constructor(app, opts)
    {
		this.app = app;
		opts = opts || {};
		this.watchers = {};
		this.serverProtos = {};
		this.clientProtos = {};
		this.version = '';

		const env = app.get(Constants.RESERVED.ENV);
		const originServerPath = path.join(app.Base, Constants.FILEPATH.SERVER_PROTOS);
		const presentServerPath = path.join(Constants.FILEPATH.CONFIG_DIR, env, path.basename(Constants.FILEPATH.SERVER_PROTOS));
		const originClientPath = path.join(app.Base, Constants.FILEPATH.CLIENT_PROTOS);
		const presentClientPath = path.join(Constants.FILEPATH.CONFIG_DIR, env, path.basename(Constants.FILEPATH.CLIENT_PROTOS));

		this.serverProtosPath = opts.serverProtos || (fs.existsSync(originServerPath) ? Constants.FILEPATH.SERVER_PROTOS : presentServerPath);
		this.clientProtosPath = opts.clientProtos || (fs.existsSync(originClientPath) ? Constants.FILEPATH.CLIENT_PROTOS : presentClientPath);

		this.setProtos(Constants.RESERVED.SERVER, path.join(app.Base, this.serverProtosPath));
		this.setProtos(Constants.RESERVED.CLIENT, path.join(app.Base, this.clientProtosPath));

		protobuf.init({
			encoderProtos : this.serverProtos,
			decoderProtos : this.clientProtos});
		this.name = '__protobuf__';
	}

	encode(key, msg)
    {
		return protobuf.encode(key, msg);
	}

	encode2Bytes(key, msg)
    {
		return protobuf.encode2Bytes(key, msg);
	}

	decode(key, msg)
    {
		return protobuf.decode(key, msg);
	}

	getProtos()
    {
		return {
			server  : this.serverProtos,
			client  : this.clientProtos,
			version : this.version
		};
	}

	getVersion()
    {
		return this.version;
	}

	setProtos(type, path)
    {
		if (!fs.existsSync(path))
        {
			return;
		}

		if (type === Constants.RESERVED.SERVER)
        {
			this.serverProtos = protobuf.parse(require(path));
		}

		if (type === Constants.RESERVED.CLIENT)
        {
			this.clientProtos = protobuf.parse(require(path));
		}

		const protoStr = JSON.stringify(this.clientProtos) + JSON.stringify(this.serverProtos);
		this.version = crypto.createHash('md5')
            .update(protoStr)
            .digest('base64');

        // Watch file
		const watcher = fs.watch(path, this.onUpdate.bind(this, type, path));
		if (this.watchers[type])
        {
			this.watchers[type].close();
		}
		this.watchers[type] = watcher;
	}

	onUpdate(type, path, event)
    {
		if (event !== 'change')
        {
			return;
		}

		const self = this;
		fs.readFile(path, 'utf8', function(readErr, data)
        {
			try
            {
                const protos = protobuf.parse(JSON.parse(data));
                if (type === Constants.RESERVED.SERVER)
                {
                    protobuf.setEncoderProtos(protos);
                    self.serverProtos = protos;
                }
                else
                {
                    protobuf.setDecoderProtos(protos);
		            self.clientProtos = protos;
	            }

                const protoStr = JSON.stringify(self.clientProtos) + JSON.stringify(self.serverProtos);
                self.version = crypto.createHash('md5')
                                .update(protoStr)
                                .digest('base64');
                logger.info('change proto file , type : %j, path : %j, version : %j', type, path, self.version);
            }
            catch (e)
            {
                logger.warn('change proto file error! path : %j', path);
                logger.warn(e);
            }
		});
	}

	stop(force, cb)
    {
		for (const type in this.watchers)
        {
			this.watchers[type].close();
		}
		this.watchers = {};
		process.nextTick(cb);
	}
}

class ProtoBuffUtility
{
	static Create(app, opts)
    {
		return new ProtoBuff(app, opts);
	}
}

module.exports = ProtoBuffUtility.Create;