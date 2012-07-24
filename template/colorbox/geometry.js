
__resources__["/__builtin__/geometry.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*globals module exports resource require BObject BArray*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var util = require('util');

var RE_PAIR = /\{\s*([\d.\-]+)\s*,\s*([\d.\-]+)\s*\}/,
RE_DOUBLE_PAIR = /\{\s*(\{[\s\d,.\-]+\})\s*,\s*(\{[\s\d,.\-]+\})\s*\}/;

/** @namespace */
var geometry = 
  {
    /**
     * @class
     * A 2D point in space
     *
     * @param {Float} x X value
     * @param {Float} y Y value
     */
    Point: function (x, y) 
    {
      /**
       * X coordinate
       * @type Float
       */
      this.x = x;

      /**
       * Y coordinate
       * @type Float
       */
      this.y = y;
    },

    /**
     * @class
     * A 2D size
     *
     * @param {Float} w Width
     * @param {Float} h Height
     */
    Size: function (w, h) 
    {
      /**
       * Width
       * @type Float
       */
      this.width = w;

      /**
       * Height
       * @type Float
       */
      this.height = h;
    },

    /**
     * @class
     * A rectangle
     *
     * @param {Float} x X value
     * @param {Float} y Y value
     * @param {Float} w Width
     * @param {Float} h Height
     */
    Rect: function (x, y, w, h) 
    {
      /**
       * Coordinate in 2D space
       * @type {geometry.Point}
       */
      this.origin = new geometry.Point(x, y);

      /**
       * Size in 2D space
       * @type {geometry.Size}
       */
      this.size   = new geometry.Size(w, h);
    },

    /**
     * @class
     * Transform matrix
     *
     * @param {Float} a
     * @param {Float} b
     * @param {Float} c
     * @param {Float} d
     * @param {Float} tx
     * @param {Float} ty
     */
    TransformMatrix: function (a, b, c, d, tx, ty, tz) 
    {
      this.a = a;
      this.b = b;
      this.c = c;
      this.d = d;
      this.tx = tx;
      this.ty = ty;
      this.tz = tz;
    },

    /**
     * Creates a geometry.Point instance
     *
     * @param {Float} x X coordinate
     * @param {Float} y Y coordinate
     * @returns {geometry.Point} 
     */
    ccp: function (x, y) 
    {
      return module.exports.pointMake(x, y);
    },

    /**
     * Add the values of two points together
     *
     * @param {geometry.Point} p1 First point
     * @param {geometry.Point} p2 Second point
     * @returns {geometry.Point} New point
     */
    ccpAdd: function (p1, p2) 
    {
      return geometry.ccp(p1.x + p2.x, p1.y + p2.y);
    },

    /**
     * Subtract the values of two points
     *
     * @param {geometry.Point} p1 First point
     * @param {geometry.Point} p2 Second point
     * @returns {geometry.Point} New point
     */
    ccpSub: function (p1, p2) 
    {
      return geometry.ccp(p1.x - p2.x, p1.y - p2.y);
    },

    /**
     * Muliply the values of two points together
     *
     * @param {geometry.Point} p1 First point
     * @param {geometry.Point} p2 Second point
     * @returns {geometry.Point} New point
     */
    ccpMult: function (p1, p2) 
    {
      return geometry.ccp(p1.x * p2.x, p1.y * p2.y);
    },


    /**
     * Invert the values of a geometry.Point
     *
     * @param {geometry.Point} p Point to invert
     * @returns {geometry.Point} New point
     */
    ccpNeg: function (p) 
    {
      return geometry.ccp(-p.x, -p.y);
    },

    /**
     * Round values on a geometry.Point to whole numbers
     *
     * @param {geometry.Point} p Point to round
     * @returns {geometry.Point} New point
     */
    ccpRound: function (p) 
    {
      return geometry.ccp(Math.round(p.x), Math.round(p.y));
    },

    /**
     * Round up values on a geometry.Point to whole numbers
     *
     * @param {geometry.Point} p Point to round
     * @returns {geometry.Point} New point
     */
    ccpCeil: function (p) 
    {
      return geometry.ccp(Math.ceil(p.x), Math.ceil(p.y));
    },

    /**
     * Round down values on a geometry.Point to whole numbers
     *
     * @param {geometry.Point} p Point to round
     * @returns {geometry.Point} New point
     */
    ccpFloor: function (p) 
    {
      return geometry.ccp(Math.floor(p.x), Math.floor(p.y));
    },

    /**
     * A point at 0x0
     *
     * @returns {geometry.Point} New point at 0x0
     */
    PointZero: function () 
    {
      return geometry.ccp(0, 0);
    },

    /**
     * @returns {geometry.Rect}
     */
    rectMake: function (x, y, w, h) 
    {
      return new geometry.Rect(x, y, w, h);
    },

    /**
     * @returns {geometry.Rect}
     */
    rectFromString: function (str) 
    {
      var matches = str.match(RE_DOUBLE_PAIR),
      p = geometry.pointFromString(matches[1]),
      s = geometry.sizeFromString(matches[2]);

      return geometry.rectMake(p.x, p.y, s.width, s.height);
    },

    /**
     * @returns {geometry.Size}
     */
    sizeMake: function (w, h) 
    {
      return new geometry.Size(w, h);
    },

    /**
     * @returns {geometry.Size}
     */
    sizeFromString: function (str) 
    {
      var matches = str.match(RE_PAIR),
      w = parseFloat(matches[1]),
      h = parseFloat(matches[2]);

      return geometry.sizeMake(w, h);
    },

    /**
     * @returns {geometry.Point}
     */
    pointMake: function (x, y) 
    {
      return new geometry.Point(x, y);
    },

    /**
     * @returns {geometry.Point}
     */
    pointFromString: function (str) 
    {
      var matches = str.match(RE_PAIR),
      x = parseFloat(matches[1]),
      y = parseFloat(matches[2]);

      return geometry.pointMake(x, y);
    },

    /**
     * @returns {Boolean}
     */
    rectContainsPoint: function (r, p) 
    {
      return ((p.x >= r.origin.x && p.x <= r.origin.x + r.size.width) &&
              (p.y >= r.origin.y && p.y <= r.origin.y + r.size.height));
    },

    /**
     * Returns the smallest rectangle that contains the two source rectangles.
     *
     * @param {geometry.Rect} r1
     * @param {geometry.Rect} r2
     * @returns {geometry.Rect}
     */
    rectUnion: function (r1, r2) 
    {
      var rect = new geometry.Rect(0, 0, 0, 0);

      rect.origin.x = Math.min(r1.origin.x, r2.origin.x);
      rect.origin.y = Math.min(r1.origin.y, r2.origin.y);
      rect.size.width = Math.max(r1.origin.x + r1.size.width, r2.origin.x + r2.size.width) - rect.origin.x;
      rect.size.height = Math.max(r1.origin.y + r1.size.height, r2.origin.y + r2.size.height) - rect.origin.y;

      return rect;
    },

    /**
     * @returns {Boolean}
     */
    rectOverlapsRect: function (r1, r2) 
    {
      if (r1.origin.x + r1.size.width < r2.origin.x) 
      {
        return false;
      }
      if (r2.origin.x + r2.size.width < r1.origin.x) 
      {
        return false;
      }
      if (r1.origin.y + r1.size.height < r2.origin.y) 
      {
        return false;
      }
      if (r2.origin.y + r2.size.height < r1.origin.y) 
      {
        return false;
      }

      return true;
    },

    /**
     * Returns the overlapping portion of 2 rectangles
     *
     * @param {geometry.Rect} lhsRect First rectangle
     * @param {geometry.Rect} rhsRect Second rectangle
     * @returns {geometry.Rect} The overlapping portion of the 2 rectangles
     */
    rectIntersection: function (lhsRect, rhsRect) 
    {

      var intersection = new geometry.Rect(
        Math.max(geometry.rectGetMinX(lhsRect), geometry.rectGetMinX(rhsRect)),
        Math.max(geometry.rectGetMinY(lhsRect), geometry.rectGetMinY(rhsRect)),
        0,
        0
      );

      intersection.size.width = Math.min(geometry.rectGetMaxX(lhsRect), geometry.rectGetMaxX(rhsRect)) - geometry.rectGetMinX(intersection);
      intersection.size.height = Math.min(geometry.rectGetMaxY(lhsRect), geometry.rectGetMaxY(rhsRect)) - geometry.rectGetMinY(intersection);

      return intersection;
    },

    /**
     * @returns {Boolean}
     */
    pointEqualToPoint: function (point1, point2) 
    {
      return (point1.x == point2.x && point1.y == point2.y);
    },

    /**
     * @returns {Boolean}
     */
    sizeEqualToSize: function (size1, size2) 
    {
      return (size1.width == size2.width && size1.height == size2.height);
    },

    /**
     * @returns {Boolean}
     */
    rectEqualToRect: function (rect1, rect2) 
    {
      return (module.exports.sizeEqualToSize(rect1.size, rect2.size) && module.exports.pointEqualToPoint(rect1.origin, rect2.origin));
    },

    /**
     * @returns {Float}
     */
    rectGetMinX: function (rect) 
    {
      return rect.origin.x;
    },

    /**
     * @returns {Float}
     */
    rectGetMinY: function (rect) 
    {
      return rect.origin.y;
    },

    /**
     * @returns {Float}
     */
    rectGetMaxX: function (rect) 
    {
      return rect.origin.x + rect.size.width;
    },

    /**
     * @returns {Float}
     */
    rectGetMaxY: function (rect) 
    {
      return rect.origin.y + rect.size.height;
    },

    boundingRectMake: function (p1, p2, p3, p4) 
    {
      var minX = Math.min(p1.x, p2.x, p3.x, p4.x);
      var minY = Math.min(p1.y, p2.y, p3.y, p4.y);
      var maxX = Math.max(p1.x, p2.x, p3.x, p4.x);
      var maxY = Math.max(p1.y, p2.y, p3.y, p4.y);

      return new geometry.Rect(minX, minY, (maxX - minX), (maxY - minY));
    },

    /**
     * @returns {geometry.Point}
     */
    pointApplyAffineTransform: function (point, t) 
    {

      /*
        aPoint.x * aTransform.a + aPoint.y * aTransform.c + aTransform.tx,
        aPoint.x * aTransform.b + aPoint.y * aTransform.d + aTransform.ty
      */

      return new geometry.Point(t.a * point.x + t.c * point.y + t.tx, t.b * point.x + t.d * point.y + t.ty);

    },

    /**
     * Apply a transform matrix to a rectangle
     *
     * @param {geometry.Rect} rect Rectangle to transform
     * @param {geometry.TransformMatrix} trans TransformMatrix to apply to rectangle
     * @returns {geometry.Rect} A new transformed rectangle
     */
    rectApplyAffineTransform: function (rect, trans) 
    {

      var p1 = geometry.ccp(geometry.rectGetMinX(rect), geometry.rectGetMinY(rect));
      var p2 = geometry.ccp(geometry.rectGetMaxX(rect), geometry.rectGetMinY(rect));
      var p3 = geometry.ccp(geometry.rectGetMinX(rect), geometry.rectGetMaxY(rect));
      var p4 = geometry.ccp(geometry.rectGetMaxX(rect), geometry.rectGetMaxY(rect));

      p1 = geometry.pointApplyAffineTransform(p1, trans);
      p2 = geometry.pointApplyAffineTransform(p2, trans);
      p3 = geometry.pointApplyAffineTransform(p3, trans);
      p4 = geometry.pointApplyAffineTransform(p4, trans);

      return geometry.boundingRectMake(p1, p2, p3, p4);
    },

    /**
     * Inverts a transform matrix
     *
     * @param {geometry.TransformMatrix} trans TransformMatrix to invert
     * @returns {geometry.TransformMatrix} New transform matrix
     */
    
    affineTransformInvert: function (trans) 
    {
      var determinant = 1 / (trans.a * trans.d - trans.b * trans.c);

      return new geometry.TransformMatrix(
        determinant * trans.d,
          -determinant * trans.b,
          -determinant * trans.c,
        determinant * trans.a,
        determinant * (trans.c * trans.ty - trans.d * trans.tx),
        determinant * (trans.b * trans.tx - trans.a * trans.ty),
        /*now do not support z invert, just record z*/
        trans.tz
      );
    },

    /**
     * Multiply 2 transform matrices together
     * @param {geometry.TransformMatrix} lhs Left matrix
     * @param {geometry.TransformMatrix} rhs Right matrix
     * @returns {geometry.TransformMatrix} New transform matrix
     */
     
    affineTransformConcat: function (lhs, rhs) 
    {
      return new geometry.TransformMatrix(
        lhs.a * rhs.a + lhs.b * rhs.c,
        lhs.a * rhs.b + lhs.b * rhs.d,
        lhs.c * rhs.a + lhs.d * rhs.c,
        lhs.c * rhs.b + lhs.d * rhs.d,
        lhs.tx * rhs.a + lhs.ty * rhs.c + rhs.tx,
        lhs.tx * rhs.b + lhs.ty * rhs.d + rhs.ty
      );
    },
    
    /**
     * @returns {Float}
     */
    degreesToRadians: function (angle) 
    {
      return angle / 180.0 * Math.PI;
    },

    /**
     * @returns {Float}
     */
    radiansToDegrees: function (angle) 
    {
      return angle * (180.0 / Math.PI);
    },

    /**
     * Translate (move) a transform matrix
     *
     * @param {geometry.TransformMatrix} trans TransformMatrix to translate
     * @param {Float} tx Amount to translate along X axis
     * @param {Float} ty Amount to translate along Y axis
     * @returns {geometry.TransformMatrix} A new TransformMatrix
     */
    affineTransformTranslate: function (trans, tx, ty, tz) 
    {
      if (tz != undefined && trans.tz == undefined)
      {
        trans.tz = 0;
      }
      
      /*
      var newTrans = util.copy(trans);
      newTrans.tx = trans.tx + trans.a * tx + trans.c * ty;
      newTrans.ty = trans.ty + trans.b * tx + trans.d * ty;
      
      if (tz != undefined)
      {
        newTrans.tz = trans.tz + tz;
      }
    
      return newTrans;
      */

      trans.tx = trans.tx + trans.a * tx + trans.c * ty;
      trans.ty = trans.ty + trans.b * tx + trans.d * ty;
      if (tz != undefined)
        trans.tz = trans.tz + tz;

      return trans;
    },

    /**
     * Rotate a transform matrix
     *
     * @param {geometry.TransformMatrix} trans TransformMatrix to rotate
     * @param {Float} angle Angle in radians
     * @returns {geometry.TransformMatrix} A new TransformMatrix
     */
    affineTransformRotate: function (trans, angle) 
    {
      var sin = Math.sin(angle),
      cos = Math.cos(angle);

      var a, b, c, d;
      a = trans.a * cos + trans.c * sin;
      b = trans.b * cos + trans.d * sin;
      c = trans.c * cos - trans.a * sin;
      d = trans.d * cos - trans.b * sin;

      /*
      return new geometry.TransformMatrix(
        
        trans.a * cos + trans.c * sin,
        trans.b * cos + trans.d * sin,
        trans.c * cos - trans.a * sin,
        trans.d * cos - trans.b * sin,
        
        
          // trans.a * cos - trans.c * sin,
          // trans.b * cos - trans.d * sin, 
          // trans.c * cos + trans.a * sin,
          // trans.d * cos + trans.b * sin,
        
        trans.tx,
        trans.ty,
        trans.tz
      );
      */
      trans.a = a;
      trans.b = b;
      trans.c = c;
      trans.d = d;

      return trans;
    },

    /**
     * Scale a transform matrix
     *
     * @param {geometry.TransformMatrix} trans TransformMatrix to scale
     * @param {Float} sx X scale factor
     * @param {Float} [sy=sx] Y scale factor
     * @returns {geometry.TransformMatrix} A new TransformMatrix
     */
    affineTransformScale: function (trans, sx, sy) 
    {
      if (sy === undefined) 
      {
        sy = sx;
      }

      //return new geometry.TransformMatrix(trans.a * sx, trans.b * sx, trans.c * sy, trans.d * sy, trans.tx, trans.ty, trans.tz);
      trans.a *= sx;
      trans.b *= sx;
      trans.c *= sy;
      trans.d *= sy;

      return trans;
    },

    /**
     * @returns {geometry.TransformMatrix} identty matrix
     */
    affineTransformIdentity: function () 
    {
      return new geometry.TransformMatrix(1, 0, 0, 1, 0, 0);
    },
    
    //add by ZP.
    
    signed2DTriArea : function (a, b, c)
    {
      //return (b.x - a.x)*(c.y - b.y) - (c.x-b.x)*(b.y-a.y);
      return (a.x - c.x)*(b.y-c.y) - (a.y-c.y)*(b.x-c.x);
    },
    
    blineSegsCross :function (a, b, c, d)
    {
      var S1 = geometry.signed2DTriArea(a, b, d);
      var S2 = geometry.signed2DTriArea(a, b, c);
      
      if (S1 == 0)
      { //c a b collineation
        if (Math.abs(c.x - a.x) <= Math.abs(b.x - a.x))
          return true;
      }
      else if (S2 == 0)
      {//d a b collineation
        if (Math.abs(d.x - a.x) <= Math.abs(b.x - a.x))
          return true;
      }
      else if (S1 * S2 < 0)
      {
        var S3 = geometry.signed2DTriArea(c, d, a);
        var S4 = geometry.signed2DTriArea(c, d, b);
        S4 = S3+S2-S1;
        
        if (S3 * S4 < 0)
        {
          //var t = S3 / (S3 - S4);
          //P = a + t*(b-a);
          return true;
        }
      }
      return false;
    },
    
    blineSegsCrossRect : function (r, a, b)
    {
      if (geometry.blineSegsCross(a, b, r.origin, geometry.ccp(r.origin.x+r.size.width, r.origin.y)) ||
          geometry.blineSegsCross(a, b, r.origin, geometry.ccp(r.origin.x, r.origin.y+r.size.height)) ||
          geometry.blineSegsCross(a, b, geometry.ccp(r.origin.x, r.origin.y+r.size.height), geometry.ccp(r.origin.x+r.size.width, r.origin.y+r.size.height)) ||
          geometry.blineSegsCross(a, b, geometry.ccp(r.origin.x+r.size.width, r.origin.y), geometry.ccp(r.origin.x+r.size.width, r.origin.y+r.size.height))||
          geometry.rectContainsPoint(r, a) || 
          geometry.rectContainsPoint(r, b))
      {
        return true;
      }
    },
  };

module.exports = geometry;

}};