var protocol = require('./protocol');
var crypto = require('crypto');

/* TODO: consider rewriting these functions using buffers instead
 * of arrays
 */

/* Publish */
module.exports.publish = function(opts) {
  opts = opts || {};
  var dup = opts.dup ? protocol.DUP_MASK : 0;
  var qos = opts.qos || 0;
  var retain = opts.retain ? protocol.RETAIN_MASK : 0;
  var topic = opts.topic;
  var payload = opts.payload || new Buffer(0);
  var id = (typeof opts.messageId === 'undefined') ? randint() : opts.messageId;
  var packet = {header: 0, payload: []};

  /* Check required fields */
  if (typeof topic !== 'string' || topic.length <= 0) return null;
  /* if payload is a string, we'll convert it into a buffer */
  if(typeof payload == 'string') {
    payload = new Buffer(payload);
  }
  /* accepting only a buffer for payload */
  if (!Buffer.isBuffer(payload)) return null;
  if (typeof qos !== 'number' || qos < 0 || qos > 2) return null;
  if (typeof id !== 'number' || id < 0 || id > 0xFFFF) return null;

  /* Generate header */
  packet.header = protocol.codes.publish << protocol.CMD_SHIFT | dup | qos << protocol.QOS_SHIFT | retain;

  /* Topic name */
  packet.payload = packet.payload.concat(gen_string(topic));

  /* Message ID */
  if (qos > 0) packet.payload = packet.payload.concat(gen_number(id));


  var buf = new Buffer([packet.header]
      .concat(gen_length(packet.payload.length + payload.length))
      .concat(packet.payload));

  return Buffer.concat([buf, payload]);
};

/* Requires length be a number > 0 */
var gen_length = function(length) {
  if(typeof length !== "number") return null;
  if(length < 0) return null;

  var len = [];
  var digit = 0;

  do {
    digit = length % 128 | 0;
    length = length / 128 | 0;
    if (length > 0) {
        digit = digit | 0x80;
    }
    len.push(digit);
  } while (length > 0);

  return len;
};

var gen_string = function(str, without_length) { /* based on code in (from http://farhadi.ir/downloads/utf8.js) */
  if(arguments.length < 2) without_length = false;
  if(typeof str !== "string") return null;
  if(typeof without_length !== "boolean") return null;

  var string = [];
  var length = 0;
  for(var i = 0; i < str.length; i++) {
    var code = str.charCodeAt(i);
    if (code < 128) {
      string.push(code);                      ++length;

    } else if (code < 2048) {
      string.push(192 + ((code >> 6 )   )); ++length;
      string.push(128 + ((code    ) & 63)); ++length;
    } else if (code < 65536) {
      string.push(224 + ((code >> 12)   )); ++length;
      string.push(128 + ((code >> 6 ) & 63)); ++length;
      string.push(128 + ((code    ) & 63)); ++length;
    } else if (code < 2097152) {
      string.push(240 + ((code >> 18)   )); ++length;
      string.push(128 + ((code >> 12) & 63)); ++length;
      string.push(128 + ((code >> 6 ) & 63)); ++length;
      string.push(128 + ((code    ) & 63)); ++length;
    } else {
      throw new Error("Can't encode character with code " + code);
    }
  }
  return without_length ? string : gen_number(length).concat(string);
};

var gen_number = function(num) {
  var number = [num >> 8, num & 0x00FF];
  return number;
};

var randint = function() { return Math.floor(Math.random() * 0xFFFF); };