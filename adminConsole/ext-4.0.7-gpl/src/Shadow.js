/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * @class Ext.Shadow
 * Simple class that can provide a shadow effect for any element.  Note that the element MUST be absolutely positioned,
 * and the shadow does not provide any shimming.  This should be used only in simple cases -- for more advanced
 * functionality that can also provide the same shadow effect, see the {@link Ext.Layer} class.
 */
Ext.define('Ext.Shadow', {
    requires: ['Ext.ShadowPool'],

    /**
     * Creates new Shadow.
     * @param {Object} config (optional) Config object.
     */
    constructor: function(config) {
        var me = this,
            adjusts = {
                h: 0
            },
            offset,
            rad;
        
        Ext.apply(me, config);
        if (!Ext.isString(me.mode)) {
            me.mode = me.defaultMode;
        }
        offset = me.offset;
        rad = Math.floor(offset / 2);
        me.opacity = 50;
        switch (me.mode.toLowerCase()) {
            // all this hideous nonsense calculates the various offsets for shadows
            case "drop":
                if (Ext.supports.CSS3BoxShadow) {
                    adjusts.w = adjusts.h = -offset;
                    adjusts.l = adjusts.t = offset;
                } else {
                    adjusts.w = 0;
                    adjusts.l = adjusts.t = offset;
                    adjusts.t -= 1;
                    if (Ext.isIE) {
                        adjusts.l -= offset + rad;
                        adjusts.t -= offset + rad;
                        adjusts.w -= rad;
                        adjusts.h -= rad;
                        adjusts.t += 1;
                    }
                }
                break;
            case "sides":
                if (Ext.supports.CSS3BoxShadow) {
                    adjusts.h -= offset;
                    adjusts.t = offset;
                    adjusts.l = adjusts.w = 0;
                } else {
                    adjusts.w = (offset * 2);
                    adjusts.l = -offset;
                    adjusts.t = offset - 1;
                    if (Ext.isIE) {
                        adjusts.l -= (offset - rad);
                        adjusts.t -= offset + rad;
                        adjusts.l += 1;
                        adjusts.w -= (offset - rad) * 2;
                        adjusts.w -= rad + 1;
                        adjusts.h -= 1;
                    }
                }
                break;
            case "frame":
                if (Ext.supports.CSS3BoxShadow) {
                    adjusts.l = adjusts.w = adjusts.t = 0;
                } else {
                    adjusts.w = adjusts.h = (offset * 2);
                    adjusts.l = adjusts.t = -offset;
                    adjusts.t += 1;
                    adjusts.h -= 2;
                    if (Ext.isIE) {
                        adjusts.l -= (offset - rad);
                        adjusts.t -= (offset - rad);
                        adjusts.l += 1;
                        adjusts.w -= (offset + rad + 1);
                        adjusts.h -= (offset + rad);
                        adjusts.h += 1;
                    }
                    break;
                }
        }
        me.adjusts = adjusts;
    },

    /**
     * @cfg {String} mode
     * The shadow display mode.  Supports the following options:<div class="mdetail-params"><ul>
     * <li><b><tt>sides</tt></b> : Shadow displays on both sides and bottom only</li>
     * <li><b><tt>frame</tt></b> : Shadow displays equally on all four sides</li>
     * <li><b><tt>drop</tt></b> : Traditional bottom-right drop shadow</li>
     * </ul></div>
     */
    /**
     * @cfg {Number} offset
     * The number of pixels to offset the shadow from the element
     */
    offset: 4,

    // private
    defaultMode: "drop",

    /**
     * Displays the shadow under the target element
     * @param {String/HTMLElement/Ext.Element} targetEl The id or element under which the shadow should display
     */
    show: function(target) {
        var me = this,
            index;
        
        target = Ext.get(target);
        if (!me.el) {
            me.el = Ext.ShadowPool.pull();
            if (me.el.dom.nextSibling != target.dom) {
                me.el.insertBefore(target);
            }
        }
        index = (parseInt(target.getStyle("z-index"), 10) - 1) || 0;
        me.el.setStyle("z-index", me.zIndex || index);
        if (Ext.isIE && !Ext.supports.CSS3BoxShadow) {
            me.el.dom.style.filter = "progid:DXImageTransform.Microsoft.alpha(opacity=" + me.opacity + ") progid:DXImageTransform.Microsoft.Blur(pixelradius=" + (me.offset) + ")";
        }
        me.realign(
            target.getLeft(true),
            target.getTop(true),
            target.dom.offsetWidth,
            target.dom.offsetHeight
        );
        me.el.dom.style.display = "block";
    },

    /**
     * Returns true if the shadow is visible, else false
     */
    isVisible: function() {
        return this.el ? true: false;
    },

    /**
     * Direct alignment when values are already available. Show must be called at least once before
     * calling this method to ensure it is initialized.
     * @param {Number} left The target element left position
     * @param {Number} top The target element top position
     * @param {Number} width The target element width
     * @param {Number} height The target element height
     */
    realign: function(l, t, targetWidth, targetHeight) {
        if (!this.el) {
            return;
        }
        var adjusts = this.adjusts,
            d = this.el.dom,
            targetStyle = d.style,
            shadowWidth,
            shadowHeight,
            cn,
            sww, 
            sws, 
            shs;

        targetStyle.left = (l + adjusts.l) + "px";
        targetStyle.top = (t + adjusts.t) + "px";
        shadowWidth = Math.max(targetWidth + adjusts.w, 0);
        shadowHeight = Math.max(targetHeight + adjusts.h, 0);
        sws = shadowWidth + "px";
        shs = shadowHeight + "px";
        if (targetStyle.width != sws || targetStyle.height != shs) {
            targetStyle.width = sws;
            targetStyle.height = shs;
            if (Ext.supports.CSS3BoxShadow) {
                targetStyle.boxShadow = '0 0 ' + this.offset + 'px 0 #888';
            } else {

                // Adjust the 9 point framed element to poke out on the required sides
                if (!Ext.isIE) {
                    cn = d.childNodes;
                    sww = Math.max(0, (shadowWidth - 12)) + "px";
                    cn[0].childNodes[1].style.width = sww;
                    cn[1].childNodes[1].style.width = sww;
                    cn[2].childNodes[1].style.width = sww;
                    cn[1].style.height = Math.max(0, (shadowHeight - 12)) + "px";
                }
            }
        }
    },

    /**
     * Hides this shadow
     */
    hide: function() {
        var me = this;
        
        if (me.el) {
            me.el.dom.style.display = "none";
            Ext.ShadowPool.push(me.el);
            delete me.el;
        }
    },

    /**
     * Adjust the z-index of this shadow
     * @param {Number} zindex The new z-index
     */
    setZIndex: function(z) {
        this.zIndex = z;
        if (this.el) {
            this.el.setStyle("z-index", z);
        }
    },
    
    /**
     * Sets the opacity of the shadow
     * @param {Number} opacity The opacity
     */
    setOpacity: function(opacity){
        if (this.el) {
            if (Ext.isIE && !Ext.supports.CSS3BoxShadow) {
                opacity = Math.floor(opacity * 100 / 2) / 100;
            }
            this.opacity = opacity;
            this.el.setOpacity(opacity);
        }
    }
});
