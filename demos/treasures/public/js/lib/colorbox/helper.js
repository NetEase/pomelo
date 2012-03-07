
__resources__["/__builtin__/helper.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
var ps = require("processing");

function createSketchpad(width, height, parent)
{
  var cv = document.createElement("canvas");
  if (parent === undefined)
  {
    document.body.appendChild(cv);
  }
  else
  {
    parent.appendChild(cv);
  }
  var pjs = new ps.Processing(cv);
  pjs.size(width, height);
  pjs.noLoop();

  return pjs;
}

var hidden_ps = new ps.Processing();

function loadImage (src)
{
  return hidden_ps.loadImage(src);
}

function createAudio ()
{
  return document.createElement("audio");
}

exports.createSketchpad = createSketchpad;
exports.loadImage = loadImage;
exports.createAudio = createAudio;

}};