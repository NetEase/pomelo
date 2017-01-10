const EventEmitter = require('events').EventEmitter,
	mqtt = require('mqtt'),
	constants = require('../util/constants'),
	MQTTSocket = require('./mqtt/mqttSocket'),
	Adaptor = require('./mqtt/mqttadaptor'),
	generate = require('./mqtt/generate'),
	logger = require('pomelo-logger').getLogger('pomelo', __filename);

let curId = 1;
/**
 * Connector that manager low level connection and protocol bewteen server and client.
 * Develper can provide their own connector to switch the low level prototol, such as tcp or probuf.
 */
class MQTTConnector extends EventEmitter
{
	constructor(port, host, opts)
    {
		super();
		this.port = port;
		this.host = host;
		this.opts = opts || {};
		this.adaptor = new Adaptor(this.opts);
	}

    /**
     * Start connector to listen the specified port
     */
	start(callBack)
    {
		this.mqttServer = mqtt.createServer();
		this.mqttServer.on('client', client =>
        {
			client.on('error', err =>
            {
				logger.error(`mqttConnector 连接失败, errorInfo:${err}`);
				client.stream.destroy();
			});

			client.on('close', () =>
            {
				client.stream.destroy();
			});

			client.on('disconnect', packet =>
            {
				client.stream.destroy();
			});

			if (this.opts.disconnectOnTimeout)
            {
				const timeout = this.opts.timeout * 1000 || constants.TIME.DEFAULT_MQTT_HEARTBEAT_TIMEOUT;
				client.stream.setTimeout(timeout, () =>
                {
					client.emit('close');
				});
			}

			client.on('connect', packet =>
            {
				client.connack({returnCode: 0});
				const mQTTSocket = new MQTTSocket(curId++, client, this.adaptor);
				this.emit('connection', mQTTSocket);
			});
		});

		this.mqttServer.listen(this.port);

		process.nextTick(callBack);
	}

	stop()
    {
		this.mqttServer.close();
		process.exit(0);
	}

	encode(reqId, route, msgBody)
    {
		if (reqId)
        {
			return MQTTConnectorUtility.ComposeResponse(reqId, route, msgBody);
		}

		return MQTTConnectorUtility.ComposePush(route, msgBody);
	}

	close()
    {
		this.mqttServer.close();
	}
}

class MQTTConnectorUtility
{
	static ComposeResponse(msgId, route, msgBody)
    {
		return {
			id   : msgId,
			body : msgBody
		};
	}

	static ComposePush(route, msgBody)
    {
		const msg = generate.publish(msgBody);
		if (!msg)
        {
			logger.error(`invalid mqtt publish message: ${msgBody}`);
		}
		return msg;
	}
}

module.exports = function(port, host, opts)
{
	if (!(this instanceof MQTTConnector))
    {
		return new MQTTConnector(port, host, opts);
	}
};