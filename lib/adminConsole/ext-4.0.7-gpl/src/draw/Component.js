/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * @class Ext.draw.Component
 * @extends Ext.Component
 *
 * The Draw Component is a surface in which sprites can be rendered. The Draw Component
 * manages and holds a `Surface` instance: an interface that has
 * an SVG or VML implementation depending on the browser capabilities and where
 * Sprites can be appended.
 *
 * One way to create a draw component is:
 *
 *     @example
 *     var drawComponent = Ext.create('Ext.draw.Component', {
 *         viewBox: false,
 *         items: [{
 *             type: 'circle',
 *             fill: '#79BB3F',
 *             radius: 100,
 *             x: 100,
 *             y: 100
 *         }]
 *     });
 *
 *     Ext.create('Ext.Window', {
 *         width: 215,
 *         height: 235,
 *         layout: 'fit',
 *         items: [drawComponent]
 *     }).show();
 *
 * In this case we created a draw component and added a sprite to it.
 * The *type* of the sprite is *circle* so if you run this code you'll see a yellow-ish
 * circle in a Window. When setting `viewBox` to `false` we are responsible for setting the object's position and
 * dimensions accordingly.
 *
 * You can also add sprites by using the surface's add method:
 *
 *     drawComponent.surface.add({
 *         type: 'circle',
 *         fill: '#79BB3F',
 *         radius: 100,
 *         x: 100,
 *         y: 100
 *     });
 *
 * For more information on Sprites, the core elements added to a draw component's surface,
 * refer to the Ext.draw.Sprite documentation.
 */
Ext.define('Ext.draw.Component', {

    /* Begin Definitions */

    alias: 'widget.draw',

    extend: 'Ext.Component',

    requires: [
        'Ext.draw.Surface',
        'Ext.layout.component.Draw'
    ],

    /* End Definitions */

    /**
     * @cfg {String[]} enginePriority
     * Defines the priority order for which Surface implementation to use. The first
     * one supported by the current environment will be used.
     */
    enginePriority: ['Svg', 'Vml'],

    baseCls: Ext.baseCSSPrefix + 'surface',

    componentLayout: 'draw',

    /**
     * @cfg {Boolean} viewBox
     * Turn on view box support which will scale and position items in the draw component to fit to the component while
     * maintaining aspect ratio. Note that this scaling can override other sizing settings on yor items. Defaults to true.
     */
    viewBox: true,

    /**
     * @cfg {Boolean} autoSize
     * Turn on autoSize support which will set the bounding div's size to the natural size of the contents. Defaults to false.
     */
    autoSize: false,

    /**
     * @cfg {Object[]} gradients (optional) Define a set of gradients that can be used as `fill` property in sprites.
     * The gradients array is an array of objects with the following properties:
     *
     *  - `id` - string - The unique name of the gradient.
     *  - `angle` - number, optional - The angle of the gradient in degrees.
     *  - `stops` - object - An object with numbers as keys (from 0 to 100) and style objects as values
     *
     * ## Example
     *
     *     gradients: [{
     *         id: 'gradientId',
     *         angle: 45,
     *         stops: {
     *             0: {
     *                 color: '#555'
     *             },
     *             100: {
     *                 color: '#ddd'
     *             }
     *         }
     *     }, {
     *         id: 'gradientId2',
     *         angle: 0,
     *         stops: {
     *             0: {
     *                 color: '#590'
     *             },
     *             20: {
     *                 color: '#599'
     *             },
     *             100: {
     *                 color: '#ddd'
     *             }
     *         }
     *     }]
     *
     * Then the sprites can use `gradientId` and `gradientId2` by setting the fill attributes to those ids, for example:
     *
     *     sprite.setAttributes({
     *         fill: 'url(#gradientId)'
     *     }, true);
     */
    initComponent: function() {
        this.callParent(arguments);

        this.addEvents(
            'mousedown',
            'mouseup',
            'mousemove',
            'mouseenter',
            'mouseleave',
            'click'
        );
    },

    /**
     * @private
     *
     * Create the Surface on initial render
     */
    onRender: function() {
        var me = this,
            viewBox = me.viewBox,
            autoSize = me.autoSize,
            bbox, items, width, height, x, y;
        me.callParent(arguments);

        if (me.createSurface() !== false) {
            items = me.surface.items;

            if (viewBox || autoSize) {
                bbox = items.getBBox();
                width = bbox.width;
                height = bbox.height;
                x = bbox.x;
                y = bbox.y;
                if (me.viewBox) {
                    me.surface.setViewBox(x, y, width, height);
                }
                else {
                    // AutoSized
                    me.autoSizeSurface();
                }
            }
        }
    },

    //@private
    autoSizeSurface: function() {
        var me = this,
            items = me.surface.items,
            bbox = items.getBBox(),
            width = bbox.width,
            height = bbox.height;
        items.setAttributes({
            translate: {
                x: -bbox.x,
                //Opera has a slight offset in the y axis.
                y: -bbox.y + (+Ext.isOpera)
            }
        }, true);
        if (me.rendered) {
            me.setSize(width, height);
            me.surface.setSize(width, height);
        }
        else {
            me.surface.setSize(width, height);
        }
        me.el.setSize(width, height);
    },

    /**
     * Create the Surface instance. Resolves the correct Surface implementation to
     * instantiate based on the 'enginePriority' config. Once the Surface instance is
     * created you can use the handle to that instance to add sprites. For example:
     *
     *     drawComponent.surface.add(sprite);
     */
    createSurface: function() {
        var surface = Ext.draw.Surface.create(Ext.apply({}, {
                width: this.width,
                height: this.height,
                renderTo: this.el
            }, this.initialConfig));
        if (!surface) {
            // In case we cannot create a surface, return false so we can stop
            return false;
        }
        this.surface = surface;


        function refire(eventName) {
            return function(e) {
                this.fireEvent(eventName, e);
            };
        }

        surface.on({
            scope: this,
            mouseup: refire('mouseup'),
            mousedown: refire('mousedown'),
            mousemove: refire('mousemove'),
            mouseenter: refire('mouseenter'),
            mouseleave: refire('mouseleave'),
            click: refire('click')
        });
    },


    /**
     * @private
     *
     * Clean up the Surface instance on component destruction
     */
    onDestroy: function() {
        var surface = this.surface;
        if (surface) {
            surface.destroy();
        }
        this.callParent(arguments);
    }

});

