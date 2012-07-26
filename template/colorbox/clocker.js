
__resources__["/__builtin__/clocker.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
var util = require("util")
  , debug = require("debug")

var g_clocker = {
  now:function()
  {
    if (this.original)
      return this.original();
    else
      return 0;
  },
  
  original:null,
};

var globalClocker = function(original)
{
  if (original)
  {
    debug.assert(!g_clocker.original, "set global clocker's original clocker again");
    if (!g_clocker.original)
      g_clocker.original = original;
  }

  return g_clocker;
};

exports.globalClocker = globalClocker;

}};