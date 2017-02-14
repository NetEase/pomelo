'use strict';

const protocol = require('./protocol');

/* TODO: consider rewriting these functions using buffers instead
 * of arrays
 */

/* Publish */
module.exports.publish = function(opts) {
  opts = opts || {};
  const dup = opts.dup ? protocol.DUP_MASK : 0;
  const qos = opts.qos || 0;
  const retain = opts.retain ? protocol.RETAIN_MASK : 0;
  const topic = opts.topic;
  const id = (opts.messageId === undefined) ? _randint() : opts.messageId;
  const packet = {header: 0, payload: []};

  // FIXME: deprecated Buffer(0) since node v6.0.0
  let payload = opts.payload || new Buffer(0);

  /* Check required fields */
  if (typeof topic !== 'string' || topic.length <= 0) {
    return null;
  }

  /* if payload is a string, we'll convert it into a buffer */
  if (typeof payload === 'string') {
    // FIXME: deprecated Buffer(string) since node v6.0.0
    payload = new Buffer(payload);
  }

  /* accepting only a buffer for payload */
  if (!Buffer.isBuffer(payload)) {
    return null;
  }

  if (typeof qos !== 'number' || qos < 0 || qos > 2) {
    return null;
  }

  if (typeof id !== 'number' || id < 0 || id > 0xffff) {
    return null;
  }

  /* Generate header */
  packet.header = (protocol.codes.publish << protocol.CMD_SHIFT);
  packet.header |= dup | qos << protocol.QOS_SHIFT | retain;

  /* Topic name */
  packet.payload = packet.payload.concat(_genString(topic));

  /* Message ID */
  if (qos > 0) {
    packet.payload = packet.payload.concat(_genNumber(id));
  }

  return Buffer.concat([packet.header,
                        _genLength(packet.payload.length + payload.length),
                        packet.payload, payload]);
};

/* Requires length be a number > 0 */
function _genLength(length) {
  if (typeof length !== 'number') {
    return null;
  }

  if (length < 0) {
    return null;
  }

  const len = [];
  let digit = 0;

  do {
    digit = length % 128 | 0;
    length = length / 128 | 0;
    if (length > 0) {
      digit = digit | 0x80;
    }
    len.push(digit);
  } while (length > 0);

  return len;
}

// FIXME: maybe bug here, for utf-16 surrogate pair
// based on code in (from http://farhadi.ir/downloads/utf8.js) */
function _genString(str, withoutLength) {
  if (arguments.length < 2) {
    withoutLength = false;
  }

  if (typeof str !== 'string') {
    return null;
  }

  if (typeof withoutLength !== 'boolean') {
    return null;
  }

  const resStr = [];
  let len = 0;
  let i;
  let code;
  for (i = 0; i < str.length; i++) {
    code = str.charCodeAt(i);
    if (code < 128) {
      resStr.push(code);
      ++len;

    } else if (code < 2048) {
      resStr.push(192 + ((code >> 6)));
      ++len;

      resStr.push(128 + ((code) & 63));
      ++len;

    } else if (code < 65536) {
      resStr.push(224 + ((code >> 12)));
      ++len;

      resStr.push(128 + ((code >> 6) & 63));
      ++len;

      resStr.push(128 + ((code) & 63));
      ++len;

    } else if (code < 2097152) {

      resStr.push(240 + ((code >> 18)));
      ++len;

      resStr.push(128 + ((code >> 12) & 63));
      ++len;

      resStr.push(128 + ((code >> 6) & 63));
      ++len;

      resStr.push(128 + ((code) & 63));
      ++len;

    } else {
      throw new Error("Can't encode character with code " + code);
    }
  }
  return withoutLength ? resStr : Buffer.concat([_genNumber(len), resStr]);
}

function _genNumber(num) {
  return [num >> 8, num & 0x00ff];
}

function _randint() {
  return Math.floor(Math.random() * 0xffff);
}
