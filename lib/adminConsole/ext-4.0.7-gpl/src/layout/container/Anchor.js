/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * @class Ext.layout.container.Anchor
 * @extends Ext.layout.container.Container
 * 
 * This is a layout that enables anchoring of contained elements relative to the container's dimensions.
 * If the container is resized, all anchored items are automatically rerendered according to their
 * `{@link #anchor}` rules.
 *
 * This class is intended to be extended or created via the {@link Ext.container.AbstractContainer#layout layout}: 'anchor' 
 * config, and should generally not need to be created directly via the new keyword.
 * 
 * AnchorLayout does not have any direct config options (other than inherited ones). By default,
 * AnchorLayout will calculate anchor measurements based on the size of the container itself. However, the
 * container using the AnchorLayout can supply an anchoring-specific config property of `anchorSize`.
 *
 * If anchorSize is specifed, the layout will use it as a virtual container for the purposes of calculating
 * anchor measurements based on it instead, allowing the container to be sized independently of the anchoring
 * logic if necessary.  
 *
 *     @example
 *     Ext.create('Ext.Panel', {
 *         width: 500,
 *         height: 400,
 *         title: "AnchorLayout Panel",
 *         layout: 'anchor',
 *         renderTo: Ext.getBody(),
 *         items: [
 *             {
 *                 xtype: 'panel',
 *                 title: '75% Width and 20% Height',
 *                 anchor: '75% 20%'
 *             },
 *             {
 *                 xtype: 'panel',
 *                 title: 'Offset -300 Width & -200 Height',
 *                 anchor: '-300 -200'		
 *             },
 *             {
 *                 xtype: 'panel',
 *                 title: 'Mixed Offset and Percent',
 *                 anchor: '-250 20%'
 *             }
 *         ]
 *     });
 */
Ext.define('Ext.layout.container.Anchor', {

    /* Begin Definitions */

    alias: 'layout.anchor',
    extend: 'Ext.layout.container.Container',
    alternateClassName: 'Ext.layout.AnchorLayout',

    /* End Definitions */

    /**
     * @cfg {String} anchor
     *
     * This configuation option is to be applied to **child `items`** of a container managed by
     * this layout (ie. configured with `layout:'anchor'`).
     *
     * This value is what tells the layout how an item should be anchored to the container. `items`
     * added to an AnchorLayout accept an anchoring-specific config property of **anchor** which is a string
     * containing two values: the horizontal anchor value and the vertical anchor value (for example, '100% 50%').
     * The following types of anchor values are supported:
     *
     * - **Percentage** : Any value between 1 and 100, expressed as a percentage.
     *
     *   The first anchor is the percentage width that the item should take up within the container, and the
     *   second is the percentage height.  For example:
     *
     *       // two values specified
     *       anchor: '100% 50%' // render item complete width of the container and
     *                          // 1/2 height of the container
     *       // one value specified
     *       anchor: '100%'     // the width value; the height will default to auto
     *
     * - **Offsets** : Any positive or negative integer value.
     *
     *   This is a raw adjustment where the first anchor is the offset from the right edge of the container,
     *   and the second is the offset from the bottom edge. For example:
     *
     *       // two values specified
     *       anchor: '-50 -100' // render item the complete width of the container
     *                          // minus 50 pixels and
     *                          // the complete height minus 100 pixels.
     *       // one value specified
     *       anchor: '-50'      // anchor value is assumed to be the right offset value
     *                          // bottom offset will default to 0
     *
     * - **Sides** : Valid values are `right` (or `r`) and `bottom` (or `b`).
     *
     *   Either the container must have a fixed size or an anchorSize config value defined at render time in
     *   order for these to have any effect.
     *   
     * - **Mixed** :
     *
     *   Anchor values can also be mixed as needed.  For example, to render the width offset from the container
     *   right edge by 50 pixels and 75% of the container's height use:
     *   
     *       anchor:   '-50 75%'
     */
    type: 'anchor',

    /**
     * @cfg {String} defaultAnchor
     * Default anchor for all child <b>container</b> items applied if no anchor or specific width is set on the child item.  Defaults to '100%'.
     */
    defaultAnchor: '100%',

    parseAnchorRE: /^(r|right|b|bottom)$/i,

    // private
    onLayout: function() {
        this.callParent(arguments);

        var me = this,
            size = me.getLayoutTargetSize(),
            owner = me.owner,
            target = me.getTarget(),
            ownerWidth = size.width,
            ownerHeight = size.height,
            overflow = target.getStyle('overflow'),
            components = me.getVisibleItems(owner),
            len = components.length,
            boxes = [],
            box, newTargetSize, component, anchorSpec, calcWidth, calcHeight,
            i, el, cleaner;

        if (ownerWidth < 20 && ownerHeight < 20) {
            return;
        }

        // Anchor layout uses natural HTML flow to arrange the child items.
        // To ensure that all browsers (I'm looking at you IE!) add the bottom margin of the last child to the
        // containing element height, we create a zero-sized element with style clear:both to force a "new line"
        if (!me.clearEl) {
            me.clearEl = target.createChild({
                cls: Ext.baseCSSPrefix + 'clear',
                role: 'presentation'
            });
        }

        // Work around WebKit RightMargin bug. We're going to inline-block all the children only ONCE and remove it when we're done
        if (!Ext.supports.RightMargin) {
            cleaner = Ext.Element.getRightMarginFixCleaner(target);
            target.addCls(Ext.baseCSSPrefix + 'inline-children');
        }

        for (i = 0; i < len; i++) {
            component = components[i];
            el = component.el;

            anchorSpec = component.anchorSpec;
            if (anchorSpec) {
                if (anchorSpec.right) {
                    calcWidth = me.adjustWidthAnchor(anchorSpec.right(ownerWidth) - el.getMargin('lr'), component);
                } else {
                    calcWidth = undefined;
                }
                if (anchorSpec.bottom) {
                    calcHeight = me.adjustHeightAnchor(anchorSpec.bottom(ownerHeight) - el.getMargin('tb'), component);
                } else {
                    calcHeight = undefined;
                }

                boxes.push({
                    component: component,
                    anchor: true,
                    width: calcWidth || undefined,
                    height: calcHeight || undefined
                });
            } else {
                boxes.push({
                    component: component,
                    anchor: false
                });
            }
        }

        // Work around WebKit RightMargin bug. We're going to inline-block all the children only ONCE and remove it when we're done
        if (!Ext.supports.RightMargin) {
            target.removeCls(Ext.baseCSSPrefix + 'inline-children');
            cleaner();
        }

        for (i = 0; i < len; i++) {
            box = boxes[i];
            me.setItemSize(box.component, box.width, box.height);
        }

        if (overflow && overflow != 'hidden' && !me.adjustmentPass) {
            newTargetSize = me.getLayoutTargetSize();
            if (newTargetSize.width != size.width || newTargetSize.height != size.height) {
                me.adjustmentPass = true;
                me.onLayout();
            }
        }

        delete me.adjustmentPass;
    },

    // private
    parseAnchor: function(a, start, cstart) {
        if (a && a != 'none') {
            var ratio;
            // standard anchor
            if (this.parseAnchorRE.test(a)) {
                var diff = cstart - start;
                return function(v) {
                    return v - diff;
                };
            }    
            // percentage
            else if (a.indexOf('%') != -1) {
                ratio = parseFloat(a.replace('%', '')) * 0.01;
                return function(v) {
                    return Math.floor(v * ratio);
                };
            }    
            // simple offset adjustment
            else {
                a = parseInt(a, 10);
                if (!isNaN(a)) {
                    return function(v) {
                        return v + a;
                    };
                }
            }
        }
        return null;
    },

    // private
    adjustWidthAnchor: function(value, comp) {
        return value;
    },

    // private
    adjustHeightAnchor: function(value, comp) {
        return value;
    },

    configureItem: function(item) {
        var me = this,
            owner = me.owner,
            anchor= item.anchor,
            anchorsArray,
            anchorSpec,
            anchorWidth,
            anchorHeight;

        if (!item.anchor && item.items && !Ext.isNumber(item.width) && !(Ext.isIE6 && Ext.isStrict)) {
            item.anchor = anchor = me.defaultAnchor;
        }

        // find the container anchoring size
        if (owner.anchorSize) {
            if (typeof owner.anchorSize == 'number') {
                anchorWidth = owner.anchorSize;
            }
            else {
                anchorWidth = owner.anchorSize.width;
                anchorHeight = owner.anchorSize.height;
            }
        }
        else {
            anchorWidth = owner.initialConfig.width;
            anchorHeight = owner.initialConfig.height;
        }

        if (anchor) {
            // cache all anchor values
            anchorsArray = anchor.split(' ');
            item.anchorSpec = anchorSpec = {
                right: me.parseAnchor(anchorsArray[0], item.initialConfig.width, anchorWidth),
                bottom: me.parseAnchor(anchorsArray[1], item.initialConfig.height, anchorHeight)
            };

            if (anchorSpec.right) {
                item.layoutManagedWidth = 1;
            } else {
                item.layoutManagedWidth = 2;
            }

            if (anchorSpec.bottom) {
                item.layoutManagedHeight = 1;
            } else {
                item.layoutManagedHeight = 2;
            }
        } else {
            item.layoutManagedWidth = 2;
            item.layoutManagedHeight = 2;
        }
        this.callParent(arguments);
    }

});
