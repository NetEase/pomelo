/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * Represents a 2D point with x and y properties, useful for comparison and instantiation
 * from an event:
 *
 *     var point = Ext.util.Point.fromEvent(e);
 *
 */
Ext.define('Ext.util.Point', {

    /* Begin Definitions */
    extend: 'Ext.util.Region',

    statics: {

        /**
         * Returns a new instance of Ext.util.Point base on the pageX / pageY values of the given event
         * @static
         * @param {Event} e The event
         * @return {Ext.util.Point}
         */
        fromEvent: function(e) {
            e = (e.changedTouches && e.changedTouches.length > 0) ? e.changedTouches[0] : e;
            return new this(e.pageX, e.pageY);
        }
    },

    /* End Definitions */

    /**
     * Creates a point from two coordinates.
     * @param {Number} x X coordinate.
     * @param {Number} y Y coordinate.
     */
    constructor: function(x, y) {
        this.callParent([y, x, y, x]);
    },

    /**
     * Returns a human-eye-friendly string that represents this point,
     * useful for debugging
     * @return {String}
     */
    toString: function() {
        return "Point[" + this.x + "," + this.y + "]";
    },

    /**
     * Compare this point and another point
     * @param {Ext.util.Point/Object} The point to compare with, either an instance
     * of Ext.util.Point or an object with left and top properties
     * @return {Boolean} Returns whether they are equivalent
     */
    equals: function(p) {
        return (this.x == p.x && this.y == p.y);
    },

    /**
     * Whether the given point is not away from this point within the given threshold amount.
     * @param {Ext.util.Point/Object} p The point to check with, either an instance
     * of Ext.util.Point or an object with left and top properties
     * @param {Object/Number} threshold Can be either an object with x and y properties or a number
     * @return {Boolean}
     */
    isWithin: function(p, threshold) {
        if (!Ext.isObject(threshold)) {
            threshold = {
                x: threshold,
                y: threshold
            };
        }

        return (this.x <= p.x + threshold.x && this.x >= p.x - threshold.x &&
                this.y <= p.y + threshold.y && this.y >= p.y - threshold.y);
    },

    /**
     * Compare this point with another point when the x and y values of both points are rounded. E.g:
     * [100.3,199.8] will equals to [100, 200]
     * @param {Ext.util.Point/Object} p The point to compare with, either an instance
     * of Ext.util.Point or an object with x and y properties
     * @return {Boolean}
     */
    roundedEquals: function(p) {
        return (Math.round(this.x) == Math.round(p.x) && Math.round(this.y) == Math.round(p.y));
    }
}, function() {
    /**
     * @method
     * Alias for {@link #translateBy}
     * @alias Ext.util.Region#translateBy
     */
    this.prototype.translate = Ext.util.Region.prototype.translateBy;
});

