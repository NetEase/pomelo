
__resources__["/__builtin__/helper.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
//arguments.length == 1, only parent
//arguments.length == 2, width, height
//arguments.length == 3, width, height, parent

function createSketchpad(width, height, parent)
{
  if (arguments.length == 1)
  {
    parent = width;
    width = undefined;
  }

  var cv = document.createElement("canvas");
  if (parent === undefined)
  {
    document.body.appendChild(cv);
  }
  else
  {
    parent.appendChild(cv);
  }
  
  if (width != undefined)
    cv.width = width;
  if (height != undefined)
    cv.height = height;

  return cv;
}

function createHiddenSketchpad(width, height)
{
  var cv = document.createElement("canvas");
  // var pjs = new ps.Processing(cv);
  // pjs.size(width, height);
  // pjs.noLoop();

  // //document.body.appendChild(cv);
  // return pjs;

  if (width != undefined)
    cv.width = width;
  if (height != undefined)
    cv.height = height;

  return cv;
} 

function loadImage (src, type, callback)
{
  var img = new Image();
  img.src = src;
  
  //FIXME: type?

  img.loaded = false;

  img.onload = function()
  {
    img.loaded = true;
    
    if (callback)
      callback();
  }

  return img;
}

function createAudio ()
{
  return document.createElement("audio");
}

exports.createSketchpad = createSketchpad;
exports.loadImage = loadImage;
exports.createAudio = createAudio;
exports.createHiddenSketchpad = createHiddenSketchpad;

}};