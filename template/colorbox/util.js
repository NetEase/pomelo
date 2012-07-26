
__resources__["/__builtin__/util.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
//enable distinguish object primitively
(function()
{
  var __idGenter = 0;

  function object_id_getter()
  {
    if (this.hasOwnProperty("__identifier"))
    {
      return this.__identifier;
    }
    else
    {
      var newId = __idGenter++;
      Object.defineProperty(this, '__identifier', {value:newId});
      return newId;
    }
  }

  Object.defineProperty(Object.prototype, 'identifier', {get:object_id_getter, configurable:true,});
  
  /*
  Object.prototype.toString = (function(){
    var oriToString = Object.prototype.toString;
    
    return function()
    {
      return '[' + oriToString.call(this) + ' id:' + this.identifier  + ']';
    };
  })();
  */
})();

var util = {
  extend: function(target, ext){
    if (arguments.length < 2)
      throw "at least 2 params provide to extend"

    var i, obj;
    for (i=1; i<arguments.length; i++){
      obj = arguments[i]
      if (!obj)
        continue;

      var key, val;
      for (key in obj){
        if (!obj.hasOwnProperty(key))
          continue;

        val = obj[key]
        if (val === undefined || val === target)
          continue;

        target[key] = val
      }
    }

    return target;
  },

  beget: function(o){
    var F = function(){}
    F.prototype = o
    return new F();
  },
  
  each: function(obj, callback){
    if (typeof(obj) == 'array'){
      var i = 0,
        len = obj.length;
      
      for (; i<len; i++){
        callback(obj[i], i);
      }
    }
    else{
      var key;
      for (key in obj){
        if (obj.hasOwnProperty(key))
          callback(obj[key], key); 
      } 
    }
  },
  
  callback: function(target, method){
    if (typeof(method) == 'string'){
      method = target[method];
    }
    
    if (typeof(method) == 'function'){
      return function(){
        method.apply(target, arguments);
      }
    }
    else{
      debug.log("cannot create callback!!!"); 
    }
  },
  
  copy: function(obj) {
    if (obj === null) {
      return null;
    }
    else if(obj === undefined)
      return undefined;

    var copy;

    if (obj instanceof Array) {
      copy = [];
      for (var i = 0, len = obj.length; i < len; i++) {
        //copy[i] = arguments.callee(obj[i]);
        //Node: strict mode do not allow arguments.callee
        copy[i] = util.copy(obj[i]);
      }
    } 
    else if (typeof(obj) == 'object') {
      if (typeof(obj.copy) == 'function') {
        copy = obj.copy();
      }
      else{
        copy = {};
        var o, x;
        for (x in obj) {
          //Node: strict mode do not allow arguments.callee
          copy[x] = util.copy(obj[x]);
          //copy[x] = arguments.callee(obj[x]);
        }
      }
    } 
    else {
      // Primative type. Doesn't need copying
      copy = obj;
    }

    return copy;
  },
};

var ArrayIterator = function(array)
{
  this._array = array;
  this._curIdx = 0;
};

var IteratorEnd = {};

util.extend(ArrayIterator.prototype, {
  next:function()
  {
    if (this._curIdx != this._array.length)
      this._curIdx ++;
  },
  
  prev:function()
  {
    if (this._curIdx != 0)
      this._curIdx --;
  },
  
  get:function()
  {
    if (this._curIdx == this._array.length)
      return IteratorEnd;
    else
      return this._array[this._curIdx];
  },
  
  end:function()
  {
    return this._curIdx == this._array.length;
  },
});


var it = function()
{
  return new ArrayIterator(this);
};

//alert("CALL UTIL");
// avoid 'iterator' being enumerated
Object.defineProperty(Array.prototype,
                      "iterator",
                      {
                        get: function () { return it;},
                        set: function (v) { },
                        enumerable: false
                      });


if (!Object.freeze)
{
  Object.freeze = function(x){return x;};
}

module.exports = util;



}};