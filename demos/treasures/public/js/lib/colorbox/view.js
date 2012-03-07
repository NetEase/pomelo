
__resources__["/__builtin__/view.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
var debug = require("debug");
var BObject = require("base").BObject;
var ps = require("processing");
var assert = require("debug").assert;
var abs = Math.abs;
var pow = Math.pow;

var hvBboxTbl = {
  model: function (m, vr)
  {
    var cache = m.get("cache");
    if (cache.bbox !== undefined)
    {
      return cache.bbox;
    }
    
    var res = {left:0, top:0, width:0, height:0};
    cahce.bbox = res;
    return res;
  },

  circle : function (m, vr)
  {
    var r = m.get("radius");
    return {left:0, top:0, width: 2 * r, height: 2 * r};
  },

  convex : function (m, vr)
  {
    var cache = m.get("cache");
    if (cache.bbox !== undefined)
    {
      return cache.bbox;
    }

    var left = Infinity, top = Infinity, right = -Infinity, bottom = -Infinity;
    var vs = m.get("vertexes");
    
    for (var i in vs)
    {
      var p = vs[i];
      left = (p.x < left) ? p.x : left;
      top = (p.y < top) ? p.y : top;
      right = (p.x > right) ? p.x : right;
      bottom = (p.y > bottom) ? p.y : bottom;
    }
    
    var res = {left: left, top:top, width: right - left + 1, height: bottom - top + 1};
    cache.bbox= res;
    return res;
  },

  text: function (m, vr)
  {
    var pjs = vr._pjs;
    var str = m.get("text");
    var h = m.get("height");
    var fontN = m.get("font");
    fontN = (fontN === undefined) ? "Arial" : fontN;
    var font = pjs.loadFont(fontN); 
    pjs.textFont(font);
    pjs.textSize(h);
    //var asc = pjs.textAscent();
    var des = pjs.textDescent();
    var asc = h - des;
    var w = pjs.textWidth(str);
    return {left: 0, top:0, width:w, height:h};
  },

  image : function (m, vr)
  {
    return {left:0, top:0, width: m.width, height: m.height};
  },

  map: function (m, vr)
  {
    var mp = m.get("map");
    return {left:0, top:0, width: mp.widthPx, height:mp.heightPx};
  }
};

var hvInsideTbl = {
  model: function (m, x, y, vr)
  {
    return false;
  },

  circle : function (m, x, y, vr)
  {
    var r = m.get("radius");
    var d2 = pow(x - r, 2) + pow(y - r, 2);
    return d2 <= r * r;
  },

  convex : function (m, x, y, vr)
  {
    var vs = m.get("vertexes");
    var len = vs.length;
    var accum = 0;
    var diffSign = false;
    var onSide = false;
    for (var i = 0; i < len; ++i)
    {
      var p1 = vs[i];
      var p2 = vs[(i + 1) % len];
      var s = x - p1.x, t = y - p1.y;
      var u = x - p2.x, v = y - p2.y;
      var cross = s * v - t * u;
      var lastaccum = accum;
      if (cross > 0)
      {
        accum += 1;
      }
      else if(cross === 0)
      {
        // test whether just on the side segment
        if ((s * u <= 0))
        {
          onSide = true;
        }
      }
      else
      {
        accum -= 1;
      }

      if (abs(accum) < abs(lastaccum))
      {
        diffSign = true;
        break;
      }
    }

    if (diffSign)
    {
      return false;
    }

    if (accum === 0)
    {
      return onSide;
    }

    return true;
  },

  text: function (m, x, y, vr)
  {
    return true;
  },

  image : function (m, x, y, vr)
  {
    // todo: consider when alpha is 0
    //var i = m.get("image");

    return true;
  },

  map: function (m, x, y, vr)
  {
    return true;
  }
};

function sortByZ(dl)
{
  function comp(n1,n2)
  {
    var m1 = n1.exec("matrix");
    var m2 = n2.exec("matrix");
    return m1.tz - m2.tz;
  }

  dl.sort(comp);
  return dl;
}

var beginDrawMode = function (m, pjs)
{
  pjs.pushStyle();
  var fillc = m.get("fill");
  if (fillc === undefined)
  {
    pjs.noFill();
  }
  else
  {
    fillc.a = (fillc.a === undefined) ? 255 : fillc.a;
    pjs.fill(fillc.r, fillc.g, fillc.b, fillc.a);
  }
  
  var sc = m.get("stroke");
  
  if (sc === undefined)
  {
    pjs.noStroke();
  }
  else
  {
    sc.a = (sc.a === undefined) ? 255.0 : sc.a;
    pjs.stroke(sc.r, sc.g, sc.b, sc.a);
  }
}

var endDrawMode = function (m, pjs)
{
  pjs.popStyle();
}

var hvDraw = {
  model: function (m,vr)
  {
    
  },

  circle : function (m,vr, spad)
  {
    var pjs = spad || vr._pjs;
    var r = m.get("radius");
    beginDrawMode(m, pjs);
    pjs.ellipse(r,r, 2 * r, 2 * r);
    endDrawMode(m, pjs);
  },

  convex : function (m, vr, spad)
  {
    var pjs = spad || vr._pjs;
    var vs = m.get("vertexes");
    beginDrawMode(m, pjs);
    pjs.beginShape();
    var v = pjs.vertex;
    for (var i in vs)
    {
      var p = vs[i];
      pjs.vertex(p.x, p.y);
    }
    pjs.endShape();
    endDrawMode(m, pjs);
  },

  text: function (m, vr, spad)
  {
    var pjs = spad || vr._pjs;
    var str = m.get("text");
    beginDrawMode(m, pjs);
    var h = m.get("height");
    var fontN = m.get("font");
    fontN = (fontN === undefined) ? "Arial" : fontN;
    var font = pjs.loadFont(fontN); 
    pjs.textFont(font);
    pjs.textSize(h);
    //var asc = pjs.textAscent();
    var des = pjs.textDescent();
    var asc = h - des;
    pjs.text(str,0,asc);
    endDrawMode(m,pjs);
  },

  image : function (m, vr, spad)
  {
    var pjs = spad || vr._pjs;
    beginDrawMode(m, pjs);
    var i = m.get("image");
    if (i.loaded)
    {
      pjs.image(i,0,0);
    }
    else
    {
      if (vr.showUnloadedImage())
      {
        pjs.rect(0, 0, m.width, m.height);
        pjs.line(0, 0, m.width - 1, m.height - 1);
        pjs.line(m.width - 1, 0, 0, m.height - 1);
        var font = pjs.loadFont("Arial"); 
        pjs.textFont(font);
        var h = 32;
        pjs.textSize(h);
        var des = pjs.textDescent();
        var asc = h - des;
        pjs.fill(0,0,255,255);
        pjs.text("未加载\n的图片",0,asc);
      }
    }
    endDrawMode(m, pjs);
  },

  map: function (m, vr, spad)
  {
    var pjs = spad || vr._pjs;
    var map = m.get("map");
    map.paint(pjs, 
              0, 0, pjs.width, pjs.height,
              0, 0, pjs.width, pjs.height);
  }
};

var HonestView = BObject.extend({
  init: function (param)
  {
    HonestView.superClass.init.call(this, param);
    this._pjs = param;
    this._showUnloadedImage = true;
  },

  sketchpad: function()
  {
    return this._pjs;
  },

  bbox: function (m)
  {
    var cache = m.get("cache");
    if (cache.bbox !== undefined)
    {
      return cache.bbox;
    }

    var f = hvBboxTbl[m.get("type")];
    assert(f, "no bounding box calculator for the `" + m.get("type") + "' type of model");
    var res = f(m, this);
    if (!res.nocache)
    {
      cache.bbox = res;
    }
    else
    {
      cache.bbox = undefined;
    }
    return res;
  },

  anchorPoint: function (m)
  {
    var cache = m.get("cache");
    if (cache.anchorPoint !== undefined)
    {
      return cache.anchorPoint;
    }

    var ap = m.get("anchorPoint");
    var res;
    if (!ap.ratio)
    {
      res = {x:ap.point.x, y:ap.point.y};
    }
    else
    {
      var bbox = this.bbox(m);
      var x = bbox.left + bbox.width * ap.point.x;
      var y = bbox.top  + bbox.height * ap.point.y;
      res = {x:x, y:y};
    }

    cache.anchorPoint = res;
    return res;
  },

  inside: function (m, p)
  {
    var ap = this.anchorPoint(m);
    var bbox = this.bbox(m);
    var x = p.x + ap.x, y = p.y + ap.y;
    if (bbox.left <= x && x < (bbox.left + bbox.width) 
        && bbox.top <= y && y < (bbox.top + bbox.height))
    {
      var f = hvInsideTbl[m.get("type")];
      assert(f, "no inside function for the `" + m.get("type") + "' of model");
      return f(m, x, y, this);
    }
    else
    {
      return false;
    }
  },

  showUnloadedImage: function(flag)
  {
    if (flag === undefined)
    {
      return this._showUnloadedImage;
    }
    else
    {
      this._showUnloadedImage = flag;
      return flag;
    }
  },

  draw : function (m, spad)
  {
    var pjs = spad || this._pjs;
    var t = m.get("type");
    var f = hvDraw[t];      
    assert(f, "no draw function for type `" + t + "'");
    pjs.pushMatrix();
    var ap = this.anchorPoint(m);
    pjs.translate(-ap.x, -ap.y);
    f(m, this, pjs);
    pjs.popMatrix();
  },

  redraw : function (content)
  {
    var pjs = this._pjs;
    pjs.background(0,0,0);
    sortByZ(content);
    var it = content.iterator();
    while(!it.end())
    {
      var node = it.get();
      var m = node.model();
      var t = m.get("type");
      var f = hvDraw[t];      
      assert(f, "no draw function for type `" + t + "'");
      var mat = node.exec('matrix');
      pjs.pushMatrix();
      pjs.applyMatrix(mat.a, mat.c, mat.tx,
                      mat.b, mat.d, mat.ty);

      var ap = this.anchorPoint(m);
      pjs.translate(-ap.x, -ap.y);
      f(m, this);
      //pjs.printMatrix();
      //console.log(mat.a + ", ", mat.c + "," + mat.b + ", " + mat.d);
      pjs.popMatrix();

      it.next();
    }
  },
})

HonestView.register = function (type, fs)
{
  assert(!hvDraw[type],type + " has already exist in draw functions table");
  assert(!hvBboxTbl[type],type + " has already exist in bbox functions table");
  assert(!hvInsideTbl[type],type + " has already exist in inside functions table");

  hvDraw[type] = fs.draw;
  hvBboxTbl[type] = fs.bbox;
  hvInsideTbl[type] = fs.inside;
  return fs;
}

exports.HonestView = HonestView;

}};