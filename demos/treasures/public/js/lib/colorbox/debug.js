
__resources__["/__builtin__/debug.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
var util = require("util");

var openDebug = true;

var debug = {
  log: function(s)
  {
    console.log(s);
  },      
  
  warning: function(s)
  {
    console.log('!!!WARNING!!!-->' + s + '<-- ');
  },
  
  error: function(s){
    console.log('!!!ERROR!!!-->' + s + '<-- ');
  },
  
  debugOpen:function(){
    return openDebug;
  },
  
  assert : function(exp,msg)
  {
    if (exp)
    {
      return true;
    }
    else
    {
      debugger;
      throw (msg === undefined ? "an exception throwed by assert!" : msg);
    }
  }
};

module.exports = debug;
}};