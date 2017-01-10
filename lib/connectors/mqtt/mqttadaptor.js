
class Adaptor
{
	constructor(opts)
	{
		opts = opts || {};
		this.subReqs = {};
		this.publishRoute = opts.publishRoute;
		this.subscribeRoute = opts.subscribeRoute;
	}

	onPublish(client, packet)
	{
		if (!this.publishRoute)
		{
			throw new Error('unspecified publish route.');
		}

		const req = {
			id    : packet.messageId,
			route : this.publishRoute,
			body  : packet
		};

		client.emit('message', req);

		if (packet.qos === 1)
		{
			client.socket.puback({messageId: packet.messageId});
		}
	}

	onSubscribe(client, packet)
	{
		if (!this.subscribeRoute)
		{
			throw new Error('unspecified subscribe route.');
		}

		const req = {
			id    : packet.messageId,
			route : this.subscribeRoute,
			body  : {
				subscriptions : packet.subscriptions
			}
		};

		this.subReqs[packet.messageId] = packet;

		client.emit('message', req);
	}

	onPubAck(client, packet)
	{
		const req = {
			id    : packet.messageId,
			route : 'connector.mqttHandler.pubAck',
			body  : {
				mid : packet.messageId
			}
		};

		this.subReqs[packet.messageId] = packet;

		client.emit('message', req);
	}

	/**
	 * Publish message or subscription ack.
	 *
	 * if packet.id exist and this.subReqs[packet.id] exist then packet is a suback.
	 * Subscription is request/response mode.
	 * packet.id is pass from client in packet.messageId and record in Pomelo context and attached to the subscribe response packet.
	 * packet.body is the context that returned by subscribe next callback.
	 *
	 * if packet.id not exist then packet is a publish message.
	 *
	 * otherwise packet is a illegal packet.
	 */
	publish(client, packet)
	{
		const mid = packet.id;
		const subReq = this.subReqs[mid];
		if (subReq)
		{
			// is suBack
			client.socket.suback({
				messageId : mid,
				granted   : packet.body});
			delete this.subReqs[mid];
		}
		else
		{
			client.socket.publish(packet.body);
		}
	}
}

module.exports = function(opts)
{
	if (!(this instanceof Adaptor))
	{
		return new Adaptor(opts);
	}
};