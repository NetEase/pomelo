/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * @class Ext.Element
 */
Ext.Element.addMethods({
    /**
     * Gets the x,y coordinates specified by the anchor position on the element.
     * @param {String} [anchor='c'] The specified anchor position.  See {@link #alignTo}
     * for details on supported anchor positions.
     * @param {Boolean} [local] True to get the local (element top/left-relative) anchor position instead
     * of page coordinates
     * @param {Object} [size] An object containing the size to use for calculating anchor position
     * {width: (target width), height: (target height)} (defaults to the element's current size)
     * @return {Number[]} [x, y] An array containing the element's x and y coordinates
     */
    getAnchorXY : function(anchor, local, s){
        //Passing a different size is useful for pre-calculating anchors,
        //especially for anchored animations that change the el size.
        anchor = (anchor || "tl").toLowerCase();
        s = s || {};

        var me = this,
            vp = me.dom == document.body || me.dom == document,
            w = s.width || vp ? Ext.Element.getViewWidth() : me.getWidth(),
            h = s.height || vp ? Ext.Element.getViewHeight() : me.getHeight(),
            xy,
            r = Math.round,
            o = me.getXY(),
            scroll = me.getScroll(),
            extraX = vp ? scroll.left : !local ? o[0] : 0,
            extraY = vp ? scroll.top : !local ? o[1] : 0,
            hash = {
                c  : [r(w * 0.5), r(h * 0.5)],
                t  : [r(w * 0.5), 0],
                l  : [0, r(h * 0.5)],
                r  : [w, r(h * 0.5)],
                b  : [r(w * 0.5), h],
                tl : [0, 0],
                bl : [0, h],
                br : [w, h],
                tr : [w, 0]
            };

        xy = hash[anchor];
        return [xy[0] + extraX, xy[1] + extraY];
    },

    /**
     * Anchors an element to another element and realigns it when the window is resized.
     * @param {String/HTMLElement/Ext.Element} element The element to align to.
     * @param {String} position The position to align to.
     * @param {Number[]} [offsets] Offset the positioning by [x, y]
     * @param {Boolean/Object} [animate] True for the default animation or a standard Element animation config object
     * @param {Boolean/Number} [monitorScroll] True to monitor body scroll and reposition. If this parameter
     * is a number, it is used as the buffer delay (defaults to 50ms).
     * @param {Function} [callback] The function to call after the animation finishes
     * @return {Ext.Element} this
     */
    anchorTo : function(el, alignment, offsets, animate, monitorScroll, callback){
        var me = this,
            dom = me.dom,
            scroll = !Ext.isEmpty(monitorScroll),
            action = function(){
                Ext.fly(dom).alignTo(el, alignment, offsets, animate);
                Ext.callback(callback, Ext.fly(dom));
            },
            anchor = this.getAnchor();

        // previous listener anchor, remove it
        this.removeAnchor();
        Ext.apply(anchor, {
            fn: action,
            scroll: scroll
        });

        Ext.EventManager.onWindowResize(action, null);

        if(scroll){
            Ext.EventManager.on(window, 'scroll', action, null,
                {buffer: !isNaN(monitorScroll) ? monitorScroll : 50});
        }
        action.call(me); // align immediately
        return me;
    },

    /**
     * Remove any anchor to this element. See {@link #anchorTo}.
     * @return {Ext.Element} this
     */
    removeAnchor : function(){
        var me = this,
            anchor = this.getAnchor();

        if(anchor && anchor.fn){
            Ext.EventManager.removeResizeListener(anchor.fn);
            if(anchor.scroll){
                Ext.EventManager.un(window, 'scroll', anchor.fn);
            }
            delete anchor.fn;
        }
        return me;
    },

    // private
    getAnchor : function(){
        var data = Ext.Element.data,
            dom = this.dom;
            if (!dom) {
                return;
            }
            var anchor = data(dom, '_anchor');

        if(!anchor){
            anchor = data(dom, '_anchor', {});
        }
        return anchor;
    },

    getAlignVector: function(el, spec, offset) {
        var me = this,
            side = {t:"top", l:"left", r:"right", b: "bottom"},
            thisRegion = me.getRegion(),
            elRegion;

        el = Ext.get(el);
        if(!el || !el.dom){
            //<debug>
            Ext.Error.raise({
                sourceClass: 'Ext.Element',
                sourceMethod: 'getAlignVector',
                msg: 'Attempted to align an element that doesn\'t exist'
            });
            //</debug>
        }

        elRegion = el.getRegion();
    },

    /**
     * Gets the x,y coordinates to align this element with another element. See {@link #alignTo} for more info on the
     * supported position values.
     * @param {String/HTMLElement/Ext.Element} element The element to align to.
     * @param {String} [position="tl-bl?"] The position to align to (defaults to )
     * @param {Number[]} [offsets] Offset the positioning by [x, y]
     * @return {Number[]} [x, y]
     */
    getAlignToXY : function(el, p, o){
        el = Ext.get(el);

        if(!el || !el.dom){
            //<debug>
            Ext.Error.raise({
                sourceClass: 'Ext.Element',
                sourceMethod: 'getAlignToXY',
                msg: 'Attempted to align an element that doesn\'t exist'
            });
            //</debug>
        }

        o = o || [0,0];
        p = (!p || p == "?" ? "tl-bl?" : (!(/-/).test(p) && p !== "" ? "tl-" + p : p || "tl-bl")).toLowerCase();

        var me = this,
            d = me.dom,
            a1,
            a2,
            x,
            y,
            //constrain the aligned el to viewport if necessary
            w,
            h,
            r,
            dw = Ext.Element.getViewWidth() -10, // 10px of margin for ie
            dh = Ext.Element.getViewHeight()-10, // 10px of margin for ie
            p1y,
            p1x,
            p2y,
            p2x,
            swapY,
            swapX,
            doc = document,
            docElement = doc.documentElement,
            docBody = doc.body,
            scrollX = (docElement.scrollLeft || docBody.scrollLeft || 0)+5,
            scrollY = (docElement.scrollTop || docBody.scrollTop || 0)+5,
            c = false, //constrain to viewport
            p1 = "",
            p2 = "",
            m = p.match(/^([a-z]+)-([a-z]+)(\?)?$/);

        if(!m){
            //<debug>
            Ext.Error.raise({
                sourceClass: 'Ext.Element',
                sourceMethod: 'getAlignToXY',
                el: el,
                position: p,
                offset: o,
                msg: 'Attemmpted to align an element with an invalid position: "' + p + '"'
            });
            //</debug>
        }

        p1 = m[1];
        p2 = m[2];
        c = !!m[3];

        //Subtract the aligned el's internal xy from the target's offset xy
        //plus custom offset to get the aligned el's new offset xy
        a1 = me.getAnchorXY(p1, true);
        a2 = el.getAnchorXY(p2, false);

        x = a2[0] - a1[0] + o[0];
        y = a2[1] - a1[1] + o[1];

        if(c){
           w = me.getWidth();
           h = me.getHeight();
           r = el.getRegion();
           //If we are at a viewport boundary and the aligned el is anchored on a target border that is
           //perpendicular to the vp border, allow the aligned el to slide on that border,
           //otherwise swap the aligned el to the opposite border of the target.
           p1y = p1.charAt(0);
           p1x = p1.charAt(p1.length-1);
           p2y = p2.charAt(0);
           p2x = p2.charAt(p2.length-1);
           swapY = ((p1y=="t" && p2y=="b") || (p1y=="b" && p2y=="t"));
           swapX = ((p1x=="r" && p2x=="l") || (p1x=="l" && p2x=="r"));


           if (x + w > dw + scrollX) {
                x = swapX ? r.left-w : dw+scrollX-w;
           }
           if (x < scrollX) {
               x = swapX ? r.right : scrollX;
           }
           if (y + h > dh + scrollY) {
                y = swapY ? r.top-h : dh+scrollY-h;
            }
           if (y < scrollY){
               y = swapY ? r.bottom : scrollY;
           }
        }
        return [x,y];
    },

    /**
     * Aligns this element with another element relative to the specified anchor points. If the other element is the
     * document it aligns it to the viewport.
     * The position parameter is optional, and can be specified in any one of the following formats:
     * <ul>
     *   <li><b>Blank</b>: Defaults to aligning the element's top-left corner to the target's bottom-left corner ("tl-bl").</li>
     *   <li><b>One anchor (deprecated)</b>: The passed anchor position is used as the target element's anchor point.
     *       The element being aligned will position its top-left corner (tl) to that point.  <i>This method has been
     *       deprecated in favor of the newer two anchor syntax below</i>.</li>
     *   <li><b>Two anchors</b>: If two values from the table below are passed separated by a dash, the first value is used as the
     *       element's anchor point, and the second value is used as the target's anchor point.</li>
     * </ul>
     * In addition to the anchor points, the position parameter also supports the "?" character.  If "?" is passed at the end of
     * the position string, the element will attempt to align as specified, but the position will be adjusted to constrain to
     * the viewport if necessary.  Note that the element being aligned might be swapped to align to a different position than
     * that specified in order to enforce the viewport constraints.
     * Following are all of the supported anchor positions:
<pre>
Value  Description
-----  -----------------------------
tl     The top left corner (default)
t      The center of the top edge
tr     The top right corner
l      The center of the left edge
c      In the center of the element
r      The center of the right edge
bl     The bottom left corner
b      The center of the bottom edge
br     The bottom right corner
</pre>
Example Usage:
<pre><code>
// align el to other-el using the default positioning ("tl-bl", non-constrained)
el.alignTo("other-el");

// align the top left corner of el with the top right corner of other-el (constrained to viewport)
el.alignTo("other-el", "tr?");

// align the bottom right corner of el with the center left edge of other-el
el.alignTo("other-el", "br-l?");

// align the center of el with the bottom left corner of other-el and
// adjust the x position by -6 pixels (and the y position by 0)
el.alignTo("other-el", "c-bl", [-6, 0]);
</code></pre>
     * @param {String/HTMLElement/Ext.Element} element The element to align to.
     * @param {String} [position="tl-bl?"] The position to align to
     * @param {Number[]} [offsets] Offset the positioning by [x, y]
     * @param {Boolean/Object} [animate] true for the default animation or a standard Element animation config object
     * @return {Ext.Element} this
     */
    alignTo : function(element, position, offsets, animate){
        var me = this;
        return me.setXY(me.getAlignToXY(element, position, offsets),
                        me.anim && !!animate ? me.anim(animate) : false);
    },

    // private ==>  used outside of core
    adjustForConstraints : function(xy, parent) {
        var vector = this.getConstrainVector(parent, xy);
        if (vector) {
            xy[0] += vector[0];
            xy[1] += vector[1];
        }
        return xy;
    },

    /**
     * <p>Returns the <code>[X, Y]</code> vector by which this element must be translated to make a best attempt
     * to constrain within the passed constraint. Returns <code>false</code> is this element does not need to be moved.</p>
     * <p>Priority is given to constraining the top and left within the constraint.</p>
     * <p>The constraint may either be an existing element into which this element is to be constrained, or
     * an {@link Ext.util.Region Region} into which this element is to be constrained.</p>
     * @param constrainTo {Mixed} The Element or {@link Ext.util.Region Region} into which this element is to be constrained.
     * @param proposedPosition {Array} A proposed <code>[X, Y]</code> position to test for validity and to produce a vector for instead
     * of using this Element's current position;
     * @returns {Number[]/Boolean} <b>If</b> this element <i>needs</i> to be translated, an <code>[X, Y]</code>
     * vector by which this element must be translated. Otherwise, <code>false</code>.
     */
    getConstrainVector: function(constrainTo, proposedPosition) {
        if (!(constrainTo instanceof Ext.util.Region)) {
            constrainTo = Ext.get(constrainTo).getViewRegion();
        }
        var thisRegion = this.getRegion(),
            vector = [0, 0],
            shadowSize = this.shadow && this.shadow.offset,
            overflowed = false;

        // Shift this region to occupy the proposed position
        if (proposedPosition) {
            thisRegion.translateBy(proposedPosition[0] - thisRegion.x, proposedPosition[1] - thisRegion.y);
        }

        // Reduce the constrain region to allow for shadow
        // TODO: Rewrite the Shadow class. When that's done, get the extra for each side from the Shadow.
        if (shadowSize) {
            constrainTo.adjust(0, -shadowSize, -shadowSize, shadowSize);
        }

        // Constrain the X coordinate by however much this Element overflows
        if (thisRegion.right > constrainTo.right) {
            overflowed = true;
            vector[0] = (constrainTo.right - thisRegion.right);    // overflowed the right
        }
        if (thisRegion.left + vector[0] < constrainTo.left) {
            overflowed = true;
            vector[0] = (constrainTo.left - thisRegion.left);      // overflowed the left
        }

        // Constrain the Y coordinate by however much this Element overflows
        if (thisRegion.bottom > constrainTo.bottom) {
            overflowed = true;
            vector[1] = (constrainTo.bottom - thisRegion.bottom);  // overflowed the bottom
        }
        if (thisRegion.top + vector[1] < constrainTo.top) {
            overflowed = true;
            vector[1] = (constrainTo.top - thisRegion.top);        // overflowed the top
        }
        return overflowed ? vector : false;
    },

    /**
    * Calculates the x, y to center this element on the screen
    * @return {Number[]} The x, y values [x, y]
    */
    getCenterXY : function(){
        return this.getAlignToXY(document, 'c-c');
    },

    /**
    * Centers the Element in either the viewport, or another Element.
    * @param {String/HTMLElement/Ext.Element} centerIn (optional) The element in which to center the element.
    */
    center : function(centerIn){
        return this.alignTo(centerIn || document, 'c-c');
    }
});

