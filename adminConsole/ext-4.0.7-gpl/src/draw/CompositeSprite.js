/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * @class Ext.draw.CompositeSprite
 * @extends Ext.util.MixedCollection
 *
 * A composite Sprite handles a group of sprites with common methods to a sprite
 * such as `hide`, `show`, `setAttributes`. These methods are applied to the set of sprites
 * added to the group.
 *
 * CompositeSprite extends {@link Ext.util.MixedCollection} so you can use the same methods
 * in `MixedCollection` to iterate through sprites, add and remove elements, etc.
 *
 * In order to create a CompositeSprite, one has to provide a handle to the surface where it is
 * rendered:
 *
 *     var group = Ext.create('Ext.draw.CompositeSprite', {
 *         surface: drawComponent.surface
 *     });
 *                  
 * Then just by using `MixedCollection` methods it's possible to add {@link Ext.draw.Sprite}s:
 *  
 *     group.add(sprite1);
 *     group.add(sprite2);
 *     group.add(sprite3);
 *                  
 * And then apply common Sprite methods to them:
 *  
 *     group.setAttributes({
 *         fill: '#f00'
 *     }, true);
 */
Ext.define('Ext.draw.CompositeSprite', {

    /* Begin Definitions */

    extend: 'Ext.util.MixedCollection',
    mixins: {
        animate: 'Ext.util.Animate'
    },

    /* End Definitions */
    isCompositeSprite: true,
    constructor: function(config) {
        var me = this;
        
        config = config || {};
        Ext.apply(me, config);

        me.addEvents(
            'mousedown',
            'mouseup',
            'mouseover',
            'mouseout',
            'click'
        );
        me.id = Ext.id(null, 'ext-sprite-group-');
        me.callParent();
    },

    // @private
    onClick: function(e) {
        this.fireEvent('click', e);
    },

    // @private
    onMouseUp: function(e) {
        this.fireEvent('mouseup', e);
    },

    // @private
    onMouseDown: function(e) {
        this.fireEvent('mousedown', e);
    },

    // @private
    onMouseOver: function(e) {
        this.fireEvent('mouseover', e);
    },

    // @private
    onMouseOut: function(e) {
        this.fireEvent('mouseout', e);
    },

    attachEvents: function(o) {
        var me = this;
        
        o.on({
            scope: me,
            mousedown: me.onMouseDown,
            mouseup: me.onMouseUp,
            mouseover: me.onMouseOver,
            mouseout: me.onMouseOut,
            click: me.onClick
        });
    },

    // Inherit docs from MixedCollection
    add: function(key, o) {
        var result = this.callParent(arguments);
        this.attachEvents(result);
        return result;
    },

    insert: function(index, key, o) {
        return this.callParent(arguments);
    },

    // Inherit docs from MixedCollection
    remove: function(o) {
        var me = this;
        
        o.un({
            scope: me,
            mousedown: me.onMouseDown,
            mouseup: me.onMouseUp,
            mouseover: me.onMouseOver,
            mouseout: me.onMouseOut,
            click: me.onClick
        });
        return me.callParent(arguments);
    },
    
    /**
     * Returns the group bounding box.
     * Behaves like {@link Ext.draw.Sprite#getBBox} method.
     * @return {Object} an object with x, y, width, and height properties.
     */
    getBBox: function() {
        var i = 0,
            sprite,
            bb,
            items = this.items,
            len = this.length,
            infinity = Infinity,
            minX = infinity,
            maxHeight = -infinity,
            minY = infinity,
            maxWidth = -infinity,
            maxWidthBBox, maxHeightBBox;
        
        for (; i < len; i++) {
            sprite = items[i];
            if (sprite.el) {
                bb = sprite.getBBox();
                minX = Math.min(minX, bb.x);
                minY = Math.min(minY, bb.y);
                maxHeight = Math.max(maxHeight, bb.height + bb.y);
                maxWidth = Math.max(maxWidth, bb.width + bb.x);
            }
        }
        
        return {
            x: minX,
            y: minY,
            height: maxHeight - minY,
            width: maxWidth - minX
        };
    },

    /**
     * Iterates through all sprites calling `setAttributes` on each one. For more information {@link Ext.draw.Sprite}
     * provides a description of the attributes that can be set with this method.
     * @param {Object} attrs Attributes to be changed on the sprite.
     * @param {Boolean} redraw Flag to immediatly draw the change.
     * @return {Ext.draw.CompositeSprite} this
     */
    setAttributes: function(attrs, redraw) {
        var i = 0,
            items = this.items,
            len = this.length;
            
        for (; i < len; i++) {
            items[i].setAttributes(attrs, redraw);
        }
        return this;
    },

    /**
     * Hides all sprites. If the first parameter of the method is true
     * then a redraw will be forced for each sprite.
     * @param {Boolean} redraw Flag to immediatly draw the change.
     * @return {Ext.draw.CompositeSprite} this
     */
    hide: function(redraw) {
        var i = 0,
            items = this.items,
            len = this.length;
            
        for (; i < len; i++) {
            items[i].hide(redraw);
        }
        return this;
    },

    /**
     * Shows all sprites. If the first parameter of the method is true
     * then a redraw will be forced for each sprite.
     * @param {Boolean} redraw Flag to immediatly draw the change.
     * @return {Ext.draw.CompositeSprite} this
     */
    show: function(redraw) {
        var i = 0,
            items = this.items,
            len = this.length;
            
        for (; i < len; i++) {
            items[i].show(redraw);
        }
        return this;
    },

    redraw: function() {
        var me = this,
            i = 0,
            items = me.items,
            surface = me.getSurface(),
            len = me.length;
        
        if (surface) {
            for (; i < len; i++) {
                surface.renderItem(items[i]);
            }
        }
        return me;
    },

    setStyle: function(obj) {
        var i = 0,
            items = this.items,
            len = this.length,
            item, el;
            
        for (; i < len; i++) {
            item = items[i];
            el = item.el;
            if (el) {
                el.setStyle(obj);
            }
        }
    },

    addCls: function(obj) {
        var i = 0,
            items = this.items,
            surface = this.getSurface(),
            len = this.length;
        
        if (surface) {
            for (; i < len; i++) {
                surface.addCls(items[i], obj);
            }
        }
    },

    removeCls: function(obj) {
        var i = 0,
            items = this.items,
            surface = this.getSurface(),
            len = this.length;
        
        if (surface) {
            for (; i < len; i++) {
                surface.removeCls(items[i], obj);
            }
        }
    },
    
    /**
     * Grab the surface from the items
     * @private
     * @return {Ext.draw.Surface} The surface, null if not found
     */
    getSurface: function(){
        var first = this.first();
        if (first) {
            return first.surface;
        }
        return null;
    },
    
    /**
     * Destroys the SpriteGroup
     */
    destroy: function(){
        var me = this,
            surface = me.getSurface(),
            item;
            
        if (surface) {
            while (me.getCount() > 0) {
                item = me.first();
                me.remove(item);
                surface.remove(item);
            }
        }
        me.clearListeners();
    }
});

