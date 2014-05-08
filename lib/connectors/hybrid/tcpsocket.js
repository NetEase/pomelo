var Stream = require('stream');
var util = require('util');
var protocol = require('pomelo-protocol');
var Package = protocol.Package;
var logger = require('pomelo-logger').getLogger('pomelo', __filename);

/**
 * Work states
 */
var ST_HEAD = 1;      // wait for head
var ST_BODY = 2;      // wait for body
var ST_CLOSED = 3;    // closed

/**
 * Tcp socket wrapper with package compositing.
 * Collect the package from socket and emit a completed package with 'data' event.
 * Uniform with ws.WebSocket interfaces.
 *
 * @param {Object} socket origin socket from node.js net module
 * @param {Object} opts   options parameter.
 *                        opts.headSize size of package head
 *                        opts.headHandler(headBuffer) handler for package head. caculate and return body size from head data.
 */
var Socket = function(socket, opts) {
  if(!(this instanceof Socket)) {
    return new Socket(socket, opts);
  }

  if(!socket || !opts) {
    throw new Error('invalid socket or opts');
  }

  if(!opts.headSize || typeof opts.headHandler !== 'function') {
    throw new Error('invalid opts.headSize or opts.headHandler');
  }

  // stream style interfaces.
  // TODO: need to port to stream2 after node 0.9
  Stream.call(this);
  this.readable = true;
  this.writeable = true;

  this._socket = socket;
  this.headSize = opts.headSize;
  this.closeMethod = opts.closeMethod;
  this.headBuffer = new Buffer(opts.headSize);
  this.headHandler = opts.headHandler;

  this.headOffset = 0;
  this.packageOffset = 0;
  this.packageSize = 0;
  this.packageBuffer = null;

  // bind event form the origin socket
  this._socket.on('data', ondata.bind(null, this));
  this._socket.on('end', onend.bind(null, this));
  this._socket.on('error', this.emit.bind(this, 'error'));
  this._socket.on('close', this.emit.bind(this, 'close'));

  this.state = ST_HEAD;
};

util.inherits(Socket, Stream);

module.exports = Socket;

Socket.prototype.send = function(msg, encode, cb) {
  this._socket.write(msg, encode, cb);
};

Socket.prototype.close = function() {
  if(!!this.closeMethod && this.closeMethod === 'end') {
    this._socket.end();
  } else {
    try { 
      this._socket.destroy(); 
    } catch (e) {
      logger.error('socket close with destroy error: %j', e.stack);
    }
  }
};

var ondata = function(socket, chunk) {
  if(socket.state === ST_CLOSED) {
    throw new Error('socket has closed');
  }

  if(typeof chunk !== 'string' && !Buffer.isBuffer(chunk)) {
    throw new Error('invalid data');
  }

  if(typeof chunk === 'string') {
    chunk = new Buffer(chunk, 'utf8');
  }

  var offset = 0, end = chunk.length;

  if(socket.state === ST_HEAD && socket.packageBuffer === null && !checkTypeData(chunk[0])) {
    logger.error('close the connection with invalid head message, the remote ip is %s && port is %s && message is %j', socket._socket.remoteAddress, socket._socket.remotePort, chunk);
    socket.close();
  }

  while(offset < end) {
    if(socket.state === ST_HEAD) {
      offset = readHead(socket, chunk, offset);
    }

    if(socket.state === ST_BODY) {
      offset = readBody(socket, chunk, offset);
    }
  }

  return true;
};

var onend = function(socket, chunk) {
  if(chunk) {
    socket._socket.write(chunk);
  }

  socket.state = ST_CLOSED;
  reset(socket);
  socket.emit('end');
};

/**
 * Read head segment from data to socket.headBuffer.
 *
 * @param  {Object} socket Socket instance
 * @param  {Object} data   Buffer instance
 * @param  {Number} offset offset read star from data
 * @return {Number}        new offset of data after read
 */
var readHead = function(socket, data, offset) {
  var hlen = socket.headSize - socket.headOffset;
  var dlen = data.length - offset;
  var len = Math.min(hlen, dlen);
  var dend = offset + len;

  data.copy(socket.headBuffer, socket.headOffset, offset, dend);
  socket.headOffset += len;

  if(socket.headOffset === socket.headSize) {
    // if head segment finished
    var size = socket.headHandler(socket.headBuffer);
    if(size < 0) {
      throw new Error('invalid body size: ' + size);
    }
    socket.packageSize = size + socket.headSize;
    socket.packageBuffer = new Buffer(socket.packageSize);
    socket.headBuffer.copy(socket.packageBuffer, 0, 0, socket.headSize);
    socket.packageOffset = socket.headSize;
    socket.state = ST_BODY;
  }

  return dend;
};

/**
 * Read body segment from data buffer to socket.packageBuffer;
 *
 * @param  {Object} socket Socket instance
 * @param  {Object} data   Buffer instance
 * @param  {Number} offset offset read star from data
 * @return {Number}        new offset of data after read
 */
var readBody = function(socket, data, offset) {
  var blen = socket.packageSize - socket.packageOffset;
  var dlen = data.length - offset;
  var len = Math.min(blen, dlen);
  var dend = offset + len;

  data.copy(socket.packageBuffer, socket.packageOffset, offset, dend);

  socket.packageOffset += len;

  if(socket.packageOffset === socket.packageSize) {
    // if all the package finished
    var buffer = socket.packageBuffer;
    socket.emit('message', buffer);
    reset(socket);
  }

  return dend;
};

var reset = function(socket) {
  socket.headOffset = 0;
  socket.packageOffset = 0;
  socket.packageSize = 0;
  socket.packageBuffer = null;
  socket.state = ST_HEAD;
};

var checkTypeData = function(data) {
  return data === Package.TYPE_HANDSHAKE || data === Package.TYPE_HANDSHAKE_ACK || data === Package.TYPE_HEARTBEAT || data === Package.TYPE_DATA || data === Package.TYPE_KICK;
};
