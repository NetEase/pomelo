/* ProtocolBuffer client 0.1.0*/

/**
 * pomelo-protobuf
 * @author <zhang0935@gmail.com>
 */

/**
 * Protocol buffer root
 * In browser, it will be window.protbuf
 */
(function (exports, global){
  var Protobuf = exports;

  Protobuf.init = function(opts){
    //On the serverside, use serverProtos to encode messages send to client
    Protobuf.encoder.init(opts.encoderProtos);

    //On the serverside, user clientProtos to decode messages receive from clients
    Protobuf.decoder.init(opts.decoderProtos);
  };

  Protobuf.encode = function(key, msg){
    return Protobuf.encoder.encode(key, msg);
  };

  Protobuf.decode = function(key, msg){
    return Protobuf.decoder.decode(key, msg);
  };

  // exports to support for components
  module.exports = Protobuf;
})('object' === typeof module ? module.exports : (this.protobuf = {}), this);

/**
 * constants
 */
(function (exports, global){
  var constants = exports.constants = {};

  constants.TYPES = {
    uInt32 : 0,
    sInt32 : 0,
    int32 : 0,
    double : 1,
    string : 2,
    message : 2,
    float : 5
  };

})('undefined' !== typeof protobuf ? protobuf : module.exports, this);

/**
 * util module
 */
(function (exports, global){

  var Util = exports.util = {};

  Util.isSimpleType = function(type){
    return ( type === 'uInt32' ||
             type === 'sInt32' ||
             type === 'int32'  ||
             type === 'uInt64' ||
             type === 'sInt64' ||
             type === 'float'  ||
             type === 'double' );
  };

})('undefined' !== typeof protobuf ? protobuf : module.exports, this);

/**
 * codec module
 */
(function (exports, global){

  var Codec = exports.codec = {};

  var buffer = new ArrayBuffer(8);
  var float32Array = new Float32Array(buffer);
  var float64Array = new Float64Array(buffer);
  var uInt8Array = new Uint8Array(buffer);

  Codec.encodeUInt32 = function(n){
    var n = parseInt(n);
    if(isNaN(n) || n < 0){
      return null;
    }

    var result = [];
    while(n !== 0){
      var tmp = n % 128;
      var next = Math.floor(n/128);

      if(next !== 0){
        tmp = tmp + 128;
      }
      result.push(tmp);
      n = next;
    }

    return result;
  };

  Codec.encodeSInt32 = function(n){
    var n = parseInt(n);
    if(isNaN(n)){
      return null;
    }
    n = n<0?(Math.abs(n)*2-1):n*2;

    return Codec.encodeUInt32(n);
  };

  Codec.decodeUInt32 = function(bytes){
    var n = 0;

    for(var i = 0; i < bytes.length; i++){
      var m = parseInt(bytes[i]);
      n = n + ((m & 0x7f) * Math.pow(2,(7*i)));
      if(m < 128){
        return n;
      }
    }

    return n;
  };


  Codec.decodeSInt32 = function(bytes){
    var n = this.decodeUInt32(bytes);
    var flag = ((n%2) === 1)?-1:1;

    n = ((n%2 + n)/2)*flag;

    return n;
  };

  Codec.encodeFloat = function(float){
    float32Array[0] = float;
    return uInt8Array;
  };

  Codec.decodeFloat = function(bytes, offset){
    if(!bytes || bytes.length < (offset +4)){
      return null;
    }

    for(var i = 0; i < 4; i++){
      uInt8Array[i] = bytes[offset + i];
    }

    return float32Array[0];
  };

  Codec.encodeDouble = function(double){
    float64Array[0] = double;
    return uInt8Array.subarray(0, 8);
  };

  Codec.decodeDouble = function(bytes, offset){
    if(!bytes || bytes.length < (8 + offset)){
      return null;
    }

    for(var i = 0; i < 8; i++){
      uInt8Array[i] = bytes[offset + i];
    }

    return float64Array[0];
  };

  Codec.encodeStr = function(bytes, offset, str){
    for(var i = 0; i < str.length; i++){
      var code = str.charCodeAt(i);
      var codes = encode2UTF8(code);

      for(var j = 0; j < codes.length; j++){
        bytes[offset] = codes[j];
        offset++;
      }
    }

    return offset;
  };

  /**
   * Decode string from utf8 bytes
   */
  Codec.decodeStr = function(bytes, offset, length){
    var array = [];
    var end = offset + length;

    while(offset < end){
      var code = 0;

      if(bytes[offset] < 128){
        code = bytes[offset];

        offset += 1;
      }else if(bytes[offset] < 224){
        code = ((bytes[offset] & 0x3f)<<6) + (bytes[offset+1] & 0x3f);
        offset += 2;
      }else{
        code = ((bytes[offset] & 0x0f)<<12) + ((bytes[offset+1] & 0x3f)<<6) + (bytes[offset+2] & 0x3f);
        offset += 3;
      }

      array.push(code);

    }

    var str = '';
    for(var i = 0; i < array.length;){
      str += String.fromCharCode.apply(null, array.slice(i, i + 10000));
      i += 10000;
    }

    return str;
  };

  /**
   * Return the byte length of the str use utf8
   */
  Codec.byteLength = function(str){
    if(typeof(str) !== 'string'){
      return -1;
    }

    var length = 0;

    for(var i = 0; i < str.length; i++){
      var code = str.charCodeAt(i);
      length += codeLength(code);
    }

    return length;
  };

  /**
   * Encode a unicode16 char code to utf8 bytes
   */
  function encode2UTF8(charCode){
    if(charCode <= 0x7f){
      return [charCode];
    }else if(charCode <= 0x7ff){
      return [0xc0|(charCode>>6), 0x80|(charCode & 0x3f)];
    }else{
      return [0xe0|(charCode>>12), 0x80|((charCode & 0xfc0)>>6), 0x80|(charCode & 0x3f)];
    }
  }

  function codeLength(code){
    if(code <= 0x7f){
      return 1;
    }else if(code <= 0x7ff){
      return 2;
    }else{
      return 3;
    }
  }
})('undefined' !== typeof protobuf ? protobuf : module.exports, this);

/**
 * encoder module
 */
(function (exports, global){

  var protobuf = exports;
  var MsgEncoder = exports.encoder = {};

  var codec = protobuf.codec;
  var constant = protobuf.constants;
  var util = protobuf.util;

  MsgEncoder.init = function(protos){
    this.protos = protos || {};
  };

  MsgEncoder.encode = function(route, msg){
    //Get protos from protos map use the route as key
    var protos = this.protos[route];

    //Check msg
    if(!checkMsg(msg, protos)){
      console.warn('check msg failed! msg : %j, proto : %j', msg, protos);
      return null;
    }

    //Set the length of the buffer 2 times bigger to prevent overflow
    var length = codec.byteLength(JSON.stringify(msg));

    //Init buffer and offset
    var buffer = new ArrayBuffer(length);
    var uInt8Array = new Uint8Array(buffer);
    var offset = 0;

    if(!!protos){
      offset = encodeMsg(uInt8Array, offset, protos, msg);
      if(offset > 0){
        return uInt8Array.subarray(0, offset);
      }
    }

    return null;
  };

  /**
   * Check if the msg follow the defination in the protos
   */
  function checkMsg(msg, protos){
    if(!protos){
      return false;
    }

    for(var name in protos){
      var proto = protos[name];

      //All required element must exist
      switch(proto.option){
        case 'required' :
          if(typeof(msg[name]) === 'undefined'){
            return false;
          }
        case 'optional' :
          if(!!protos.__messages[proto.type]){
            if(!!protos.__messages[proto.type]){
              checkMsg(msg[name], protos.__messages[proto.type]);
            }
          }
        break;
        case 'repeated' :
          //Check nest message in repeated elements
          if(!!msg[name] && !!protos.__messages[proto.type]){
            for(var i = 0; i < msg[name].length; i++){
              if(!checkMsg(msg[name][i], protos.__messages[proto.type])){
                return false;
              }
            }
          }
        break;
      }
    }

    return true;
  }

  function encodeMsg(buffer, offset, protos, msg){
    for(var name in msg){
      if(!!protos[name]){
        var proto = protos[name];

        switch(proto.option){
          case 'required' :
          case 'optional' :
            offset = writeBytes(buffer, offset, encodeTag(proto.type, proto.tag));
            offset = encodeProp(msg[name], proto.type, offset, buffer, protos);
          break;
          case 'repeated' :
            if(msg[name].length > 0){
              offset = encodeArray(msg[name], proto, offset, buffer, protos);
            }
          break;
        }
      }
    }

    return offset;
  }

  function encodeProp(value, type, offset, buffer, protos){
    switch(type){
      case 'uInt32':
        offset = writeBytes(buffer, offset, codec.encodeUInt32(value));
      break;
      case 'int32' :
      case 'sInt32':
        offset = writeBytes(buffer, offset, codec.encodeSInt32(value));
      break;
      case 'float':
        writeBytes(buffer, offset, codec.encodeFloat(value));
        offset += 4;
      break;
      case 'double':
        writeBytes(buffer, offset, codec.encodeDouble(value));
        offset += 8;
      break;
      case 'string':
        var length = codec.byteLength(value);

        //Encode length
        offset = writeBytes(buffer, offset, codec.encodeUInt32(length));
        //write string
        codec.encodeStr(buffer, offset, value);
        offset += length;
      break;
      default :
        if(!!protos.__messages[type]){
          //Use a tmp buffer to build an internal msg
          var tmpBuffer = new ArrayBuffer(codec.byteLength(JSON.stringify(value)));
          var length = 0;

          length = encodeMsg(tmpBuffer, length, protos.__messages[type], value);
          //Encode length
          offset = writeBytes(buffer, offset, codec.encodeUInt32(length));
          //contact the object
          for(var i = 0; i < length; i++){
            buffer[offset] = tmpBuffer[i];
            offset++;
          }
        }
      break;
    }

    return offset;
  }

  /**
   * Encode reapeated properties, simple msg and object are decode differented
   */
  function encodeArray(array, proto, offset, buffer, protos){
    var i = 0;

    if(util.isSimpleType(proto.type)){
      offset = writeBytes(buffer, offset, encodeTag(proto.type, proto.tag));
      offset = writeBytes(buffer, offset, codec.encodeUInt32(array.length));
      for(i = 0; i < array.length; i++){
        offset = encodeProp(array[i], proto.type, offset, buffer);
      }
    }else{
      for(i = 0; i < array.length; i++){
        offset = writeBytes(buffer, offset, encodeTag(proto.type, proto.tag));
        offset = encodeProp(array[i], proto.type, offset, buffer, protos);
      }
    }

    return offset;
  }

  function writeBytes(buffer, offset, bytes){
    for(var i = 0; i < bytes.length; i++, offset++){
      buffer[offset] = bytes[i];
    }

    return offset;
  }

  function encodeTag(type, tag){
    var value = constant.TYPES[type]||2;
    return codec.encodeUInt32((tag<<3)|value);
  }
})('undefined' !== typeof protobuf ? protobuf : module.exports, this);

/**
 * decoder module
 */
(function (exports, global){
  var protobuf = exports;
  var MsgDecoder = exports.decoder = {};

  var codec = protobuf.codec;
  var util = protobuf.util;

  var buffer;
  var offset = 0;

  MsgDecoder.init = function(protos){
    this.protos = protos || {};
  };

  MsgDecoder.setProtos = function(protos){
    if(!!protos){
      this.protos = protos;
    }
  };

  MsgDecoder.decode = function(route, buf){
    var protos = this.protos[route];

    buffer = buf;
    offset = 0;

    if(!!protos){
      return decodeMsg({}, protos, buffer.length);
    }

    return null;
  };

  function decodeMsg(msg, protos, length){
    while(offset<length){
      var head = getHead();
      var type = head.type;
      var tag = head.tag;
      var name = protos.__tags[tag];

      switch(protos[name].option){
        case 'optional' :
        case 'required' :
          msg[name] = decodeProp(protos[name].type, protos);
        break;
        case 'repeated' :
          if(!msg[name]){
            msg[name] = [];
          }
          decodeArray(msg[name], protos[name].type, protos);
        break;
      }
    }

    return msg;
  }

  /**
   * Test if the given msg is finished
   */
  function isFinish(msg, protos){
    return (!protos.__tags[peekHead().tag]);
  }
  /**
   * Get property head from protobuf
   */
  function getHead(){
    var tag = codec.decodeUInt32(getBytes());

    return {
      type : tag&0x7,
      tag : tag>>3
    };
  }

  /**
   * Get tag head without move the offset
   */
  function peekHead(){
    var tag = codec.decodeUInt32(peekBytes());

    return {
      type : tag&0x7,
      tag : tag>>3
    };
  }

  function decodeProp(type, protos){
    switch(type){
      case 'uInt32':
        return codec.decodeUInt32(getBytes());
      case 'int32' :
      case 'sInt32' :
        return codec.decodeSInt32(getBytes());
      case 'float' :
        var float = codec.decodeFloat(buffer, offset);
        offset += 4;
        return float;
      case 'double' :
        var double = codec.decodeDouble(buffer, offset);
        offset += 8;
        return double;
      case 'string' :
        var length = codec.decodeUInt32(getBytes());

        var str =  codec.decodeStr(buffer, offset, length);
        offset += length;

        return str;
      default :
        //console.log('object type : %j, protos: %j', type, protos);
        if(!!protos && !!protos.__messages[type]){
          var length = codec.decodeUInt32(getBytes());
          var msg = {};
          decodeMsg(msg, protos.__messages[type], offset+length);
          return msg;
        }
      break;
    }
  }

  function decodeArray(array, type, protos){
    if(util.isSimpleType(type)){
      var length = codec.decodeUInt32(getBytes());

      for(var i = 0; i < length; i++){
        array.push(decodeProp(type));
      }
    }else{
      array.push(decodeProp(type, protos));
    }
  }

  function getBytes(flag){
    var bytes = [];
    var pos = offset;
    flag = flag || false;

    var b;

    do{
      b = buffer[pos];
      bytes.push(b);
      pos++;
    }while(b >= 128);

    if(!flag){
      offset = pos;
    }
    return bytes;
  }

  function peekBytes(){
    return getBytes(true);
  }

})('undefined' !== typeof protobuf ? protobuf : module.exports, this);

