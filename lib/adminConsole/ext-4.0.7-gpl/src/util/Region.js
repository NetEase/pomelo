/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * This class represents a rectangular region in X,Y space, and performs geometric
 * transformations or tests upon the region.
 *
 * This class may be used to compare the document regions occupied by elements.
 */
Ext.define('Ext.util.Region', {

    /* Begin Definitions */

    requires: ['Ext.util.Offset'],

    statics: {
        /**
         * @static
         * Retrieves an Ext.util.Region for a particular element.
         * @param {String/HTMLElement/Ext.Element} el An element ID, htmlElement or Ext.Element representing an element in the document.
         * @returns {Ext.util.Region} region
         */
        getRegion: function(el) {
            return Ext.fly(el).getPageBox(true);
        },

        /**
         * @static
         * Creates a Region from a "box" Object which contains four numeric properties `top`, `right`, `bottom` and `left`.
         * @param {Object} o An object with `top`, `right`, `bottom` and `left` properties.
         * @return {Ext.util.Region} region The Region constructed based on the passed object
         */
        from: function(o) {
            return new this(o.top, o.right, o.bottom, o.left);
        }
    },

    /* End Definitions */

    /**
     * Creates a region from the bounding sides.
     * @param {Number} top Top The topmost pixel of the Region.
     * @param {Number} right Right The rightmost pixel of the Region.
     * @param {Number} bottom Bottom The bottom pixel of the Region.
     * @param {Number} left Left The leftmost pixel of the Region.
     */
    constructor : function(t, r, b, l) {
        var me = this;
        me.y = me.top = me[1] = t;
        me.right = r;
        me.bottom = b;
        me.x = me.left = me[0] = l;
    },

    /**
     * Checks if this region completely contains the region that is passed in.
     * @param {Ext.util.Region} region
     * @return {Boolean}
     */
    contains : function(region) {
        var me = this;
        return (region.x >= me.x &&
                region.right <= me.right &&
                region.y >= me.y &&
                region.bottom <= me.bottom);

    },

    /**
     * Checks if this region intersects the region passed in.
     * @param {Ext.util.Region} region
     * @return {Ext.util.Region/Boolean} Returns the intersected region or false if there is no intersection.
     */
    intersect : function(region) {
        var me = this,
            t = Math.max(me.y, region.y),
            r = Math.min(me.right, region.right),
            b = Math.min(me.bottom, region.bottom),
            l = Math.max(me.x, region.x);

        if (b > t && r > l) {
            return new this.self(t, r, b, l);
        }
        else {
            return false;
        }
    },

    /**
     * Returns the smallest region that contains the current AND targetRegion.
     * @param {Ext.util.Region} region
     * @return {Ext.util.Region} a new region
     */
    union : function(region) {
        var me = this,
            t = Math.min(me.y, region.y),
            r = Math.max(me.right, region.right),
            b = Math.max(me.bottom, region.bottom),
            l = Math.min(me.x, region.x);

        return new this.self(t, r, b, l);
    },

    /**
     * Modifies the current region to be constrained to the targetRegion.
     * @param {Ext.util.Region} targetRegion
     * @return {Ext.util.Region} this
     */
    constrainTo : function(r) {
        var me = this,
            constrain = Ext.Number.constrain;
        me.top = me.y = constrain(me.top, r.y, r.bottom);
        me.bottom = constrain(me.bottom, r.y, r.bottom);
        me.left = me.x = constrain(me.left, r.x, r.right);
        me.right = constrain(me.right, r.x, r.right);
        return me;
    },

    /**
     * Modifies the current region to be adjusted by offsets.
     * @param {Number} top top offset
     * @param {Number} right right offset
     * @param {Number} bottom bottom offset
     * @param {Number} left left offset
     * @return {Ext.util.Region} this
     */
    adjust : function(t, r, b, l) {
        var me = this;
        me.top = me.y += t;
        me.left = me.x += l;
        me.right += r;
        me.bottom += b;
        return me;
    },

    /**
     * Get the offset amount of a point outside the region
     * @param {String} [axis]
     * @param {Ext.util.Point} [p] the point
     * @return {Ext.util.Offset}
     */
    getOutOfBoundOffset: function(axis, p) {
        if (!Ext.isObject(axis)) {
            if (axis == 'x') {
                return this.getOutOfBoundOffsetX(p);
            } else {
                return this.getOutOfBoundOffsetY(p);
            }
        } else {
            p = axis;
            var d = Ext.create('Ext.util.Offset');
            d.x = this.getOutOfBoundOffsetX(p.x);
            d.y = this.getOutOfBoundOffsetY(p.y);
            return d;
        }

    },

    /**
     * Get the offset amount on the x-axis
     * @param {Number} p the offset
     * @return {Number}
     */
    getOutOfBoundOffsetX: function(p) {
        if (p <= this.x) {
            return this.x - p;
        } else if (p >= this.right) {
            return this.right - p;
        }

        return 0;
    },

    /**
     * Get the offset amount on the y-axis
     * @param {Number} p the offset
     * @return {Number}
     */
    getOutOfBoundOffsetY: function(p) {
        if (p <= this.y) {
            return this.y - p;
        } else if (p >= this.bottom) {
            return this.bottom - p;
        }

        return 0;
    },

    /**
     * Check whether the point / offset is out of bound
     * @param {String} [axis]
     * @param {Ext.util.Point/Number} [p] the point / offset
     * @return {Boolean}
     */
    isOutOfBound: function(axis, p) {
        if (!Ext.isObject(axis)) {
            if (axis == 'x') {
                return this.isOutOfBoundX(p);
            } else {
                return this.isOutOfBoundY(p);
            }
        } else {
            p = axis;
            return (this.isOutOfBoundX(p.x) || this.isOutOfBoundY(p.y));
        }
    },

    /**
     * Check whether the offset is out of bound in the x-axis
     * @param {Number} p the offset
     * @return {Boolean}
     */
    isOutOfBoundX: function(p) {
        return (p < this.x || p > this.right);
    },

    /**
     * Check whether the offset is out of bound in the y-axis
     * @param {Number} p the offset
     * @return {Boolean}
     */
    isOutOfBoundY: function(p) {
        return (p < this.y || p > this.bottom);
    },

    /**
     * Restrict a point within the region by a certain factor.
     * @param {String} [axis]
     * @param {Ext.util.Point/Ext.util.Offset/Object} [p]
     * @param {Number} [factor]
     * @return {Ext.util.Point/Ext.util.Offset/Object/Number}
     * @private
     */
    restrict: function(axis, p, factor) {
        if (Ext.isObject(axis)) {
            var newP;

            factor = p;
            p = axis;

            if (p.copy) {
                newP = p.copy();
            }
            else {
                newP = {
                    x: p.x,
                    y: p.y
                };
            }

            newP.x = this.restrictX(p.x, factor);
            newP.y = this.restrictY(p.y, factor);
            return newP;
        } else {
            if (axis == 'x') {
                return this.restrictX(p, factor);
            } else {
                return this.restrictY(p, factor);
            }
        }
    },

    /**
     * Restrict an offset within the region by a certain factor, on the x-axis
     * @param {Number} p
     * @param {Number} [factor=1] The factor.
     * @return {Number}
     * @private
     */
    restrictX : function(p, factor) {
        if (!factor) {
            factor = 1;
        }

        if (p <= this.x) {
            p -= (p - this.x) * factor;
        }
        else if (p >= this.right) {
            p -= (p - this.right) * factor;
        }
        return p;
    },

    /**
     * Restrict an offset within the region by a certain factor, on the y-axis
     * @param {Number} p
     * @param {Number} [factor] The factor, defaults to 1
     * @return {Number}
     * @private
     */
    restrictY : function(p, factor) {
        if (!factor) {
            factor = 1;
        }

        if (p <= this.y) {
            p -= (p - this.y) * factor;
        }
        else if (p >= this.bottom) {
            p -= (p - this.bottom) * factor;
        }
        return p;
    },

    /**
     * Get the width / height of this region
     * @return {Object} an object with width and height properties
     * @private
     */
    getSize: function() {
        return {
            width: this.right - this.x,
            height: this.bottom - this.y
        };
    },

    /**
     * Create a copy of this Region.
     * @return {Ext.util.Region}
     */
    copy: function() {
        return new this.self(this.y, this.right, this.bottom, this.x);
    },

    /**
     * Copy the values of another Region to this Region
     * @param {Ext.util.Region} p The region to copy from.
     * @return {Ext.util.Region} This Region
     */
    copyFrom: function(p) {
        var me = this;
        me.top = me.y = me[1] = p.y;
        me.right = p.right;
        me.bottom = p.bottom;
        me.left = me.x = me[0] = p.x;

        return this;
    },

    /*
     * Dump this to an eye-friendly string, great for debugging
     * @return {String}
     */
    toString: function() {
        return "Region[" + this.top + "," + this.right + "," + this.bottom + "," + this.left + "]";
    },

    /**
     * Translate this region by the given offset amount
     * @param {Ext.util.Offset/Object} x Object containing the `x` and `y` properties.
     * Or the x value is using the two argument form.
     * @param {Number} y The y value unless using an Offset object.
     * @return {Ext.util.Region} this This Region
     */
    translateBy: function(x, y) {
        if (arguments.length == 1) {
            y = x.y;
            x = x.x;
        }
        var me = this;
        me.top = me.y += y;
        me.right += x;
        me.bottom += y;
        me.left = me.x += x;

        return me;
    },

    /**
     * Round all the properties of this region
     * @return {Ext.util.Region} this This Region
     */
    round: function() {
        var me = this;
        me.top = me.y = Math.round(me.y);
        me.right = Math.round(me.right);
        me.bottom = Math.round(me.bottom);
        me.left = me.x = Math.round(me.x);

        return me;
    },

    /**
     * Check whether this region is equivalent to the given region
     * @param {Ext.util.Region} region The region to compare with
     * @return {Boolean}
     */
    equals: function(region) {
        return (this.top == region.top && this.right == region.right && this.bottom == region.bottom && this.left == region.left);
    }
});

