
__resources__["/__builtin__/debug.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
var util = require("util");

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
  
  assert : function(exp,msg)
  {
    if (exp)
    {
      return true;
    }
    else
    {
      var theMsg = msg === undefined ? "assert !!!" : msg;
      console.log("exception throwed:  " + theMsg);
      debugger;
      throw (theMsg);
    }
  }
};

module.exports = debug;
}};