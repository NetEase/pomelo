/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * @class Ext.chart.Mask
 *
 * Defines a mask for a chart's series.
 * The 'chart' member must be set prior to rendering.
 *
 * A Mask can be used to select a certain region in a chart.
 * When enabled, the `select` event will be triggered when a
 * region is selected by the mask, allowing the user to perform
 * other tasks like zooming on that region, etc.
 *
 * In order to use the mask one has to set the Chart `mask` option to
 * `true`, `vertical` or `horizontal`. Then a possible configuration for the
 * listener could be:
 *
        items: {
            xtype: 'chart',
            animate: true,
            store: store1,
            mask: 'horizontal',
            listeners: {
                select: {
                    fn: function(me, selection) {
                        me.setZoom(selection);
                        me.mask.hide();
                    }
                }
            },

 * In this example we zoom the chart to that particular region. You can also get
 * a handle to a mask instance from the chart object. The `chart.mask` element is a
 * `Ext.Panel`.
 * 
 */
Ext.define('Ext.chart.Mask', {
    require: ['Ext.chart.MaskLayer'],
    /**
     * Creates new Mask.
     * @param {Object} config (optional) Config object.
     */
    constructor: function(config) {
        var me = this;

        me.addEvents('select');

        if (config) {
            Ext.apply(me, config);
        }
        if (me.mask) {
            me.on('afterrender', function() {
                //create a mask layer component
                var comp = Ext.create('Ext.chart.MaskLayer', {
                    renderTo: me.el
                });
                comp.el.on({
                    'mousemove': function(e) {
                        me.onMouseMove(e);
                    },
                    'mouseup': function(e) {
                        me.resized(e);
                    }
                });
                //create a resize handler for the component
                var resizeHandler = Ext.create('Ext.resizer.Resizer', {
                    el: comp.el,
                    handles: 'all',
                    pinned: true
                });
                resizeHandler.on({
                    'resize': function(e) {
                        me.resized(e);    
                    }    
                });
                comp.initDraggable();
                me.maskType = me.mask;
                me.mask = comp;
                me.maskSprite = me.surface.add({
                    type: 'path',
                    path: ['M', 0, 0],
                    zIndex: 1001,
                    opacity: 0.7,
                    hidden: true,
                    stroke: '#444'
                });
            }, me, { single: true });
        }
    },
    
    resized: function(e) {
        var me = this,
            bbox = me.bbox || me.chartBBox,
            x = bbox.x,
            y = bbox.y,
            width = bbox.width,
            height = bbox.height,
            box = me.mask.getBox(true),
            max = Math.max,
            min = Math.min,
            staticX = box.x - x,
            staticY = box.y - y;
        
        staticX = max(staticX, x);
        staticY = max(staticY, y);
        staticX = min(staticX, width);
        staticY = min(staticY, height);
        box.x = staticX;
        box.y = staticY;
        me.fireEvent('select', me, box);
    },

    onMouseUp: function(e) {
        var me = this,
            bbox = me.bbox || me.chartBBox,
            sel = me.maskSelection;
        me.maskMouseDown = false;
        me.mouseDown = false;
        if (me.mouseMoved) {
            me.onMouseMove(e);
            me.mouseMoved = false;
            me.fireEvent('select', me, {
                x: sel.x - bbox.x,
                y: sel.y - bbox.y,
                width: sel.width,
                height: sel.height
            });
        }
    },

    onMouseDown: function(e) {
        var me = this;
        me.mouseDown = true;
        me.mouseMoved = false;
        me.maskMouseDown = {
            x: e.getPageX() - me.el.getX(),
            y: e.getPageY() - me.el.getY()
        };
    },

    onMouseMove: function(e) {
        var me = this,
            mask = me.maskType,
            bbox = me.bbox || me.chartBBox,
            x = bbox.x,
            y = bbox.y,
            math = Math,
            floor = math.floor,
            abs = math.abs,
            min = math.min,
            max = math.max,
            height = floor(y + bbox.height),
            width = floor(x + bbox.width),
            posX = e.getPageX(),
            posY = e.getPageY(),
            staticX = posX - me.el.getX(),
            staticY = posY - me.el.getY(),
            maskMouseDown = me.maskMouseDown,
            path;
        
        me.mouseMoved = me.mouseDown;
        staticX = max(staticX, x);
        staticY = max(staticY, y);
        staticX = min(staticX, width);
        staticY = min(staticY, height);
        if (maskMouseDown && me.mouseDown) {
            if (mask == 'horizontal') {
                staticY = y;
                maskMouseDown.y = height;
                posY = me.el.getY() + bbox.height + me.insetPadding;
            }
            else if (mask == 'vertical') {
                staticX = x;
                maskMouseDown.x = width;
            }
            width = maskMouseDown.x - staticX;
            height = maskMouseDown.y - staticY;
            path = ['M', staticX, staticY, 'l', width, 0, 0, height, -width, 0, 'z'];
            me.maskSelection = {
                x: width > 0 ? staticX : staticX + width,
                y: height > 0 ? staticY : staticY + height,
                width: abs(width),
                height: abs(height)
            };
            me.mask.updateBox(me.maskSelection);
            me.mask.show();
            me.maskSprite.setAttributes({
                hidden: true    
            }, true);
        }
        else {
            if (mask == 'horizontal') {
                path = ['M', staticX, y, 'L', staticX, height];
            }
            else if (mask == 'vertical') {
                path = ['M', x, staticY, 'L', width, staticY];
            }
            else {
                path = ['M', staticX, y, 'L', staticX, height, 'M', x, staticY, 'L', width, staticY];
            }
            me.maskSprite.setAttributes({
                path: path,
                fill: me.maskMouseDown ? me.maskSprite.stroke : false,
                'stroke-width': mask === true ? 1 : 3,
                hidden: false
            }, true);
        }
    },

    onMouseLeave: function(e) {
        var me = this;
        me.mouseMoved = false;
        me.mouseDown = false;
        me.maskMouseDown = false;
        me.mask.hide();
        me.maskSprite.hide(true);
    }
});
    
