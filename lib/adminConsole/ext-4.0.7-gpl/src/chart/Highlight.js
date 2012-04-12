/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * @class Ext.chart.Highlight
 * A mixin providing highlight functionality for Ext.chart.series.Series.
 */
Ext.define('Ext.chart.Highlight', {

    /* Begin Definitions */

    requires: ['Ext.fx.Anim'],

    /* End Definitions */

    /**
     * Highlight the given series item.
     * @param {Boolean/Object} Default's false. Can also be an object width style properties (i.e fill, stroke, radius) 
     * or just use default styles per series by setting highlight = true.
     */
    highlight: false,

    highlightCfg : null,

    constructor: function(config) {
        if (config.highlight) {
            if (config.highlight !== true) { //is an object
                this.highlightCfg = Ext.apply({}, config.highlight);
            }
            else {
                this.highlightCfg = {
                    fill: '#fdd',
                    radius: 20,
                    lineWidth: 5,
                    stroke: '#f55'
                };
            }
        }
    },

    /**
     * Highlight the given series item.
     * @param {Object} item Info about the item; same format as returned by #getItemForPoint.
     */
    highlightItem: function(item) {
        if (!item) {
            return;
        }
        
        var me = this,
            sprite = item.sprite,
            opts = me.highlightCfg,
            surface = me.chart.surface,
            animate = me.chart.animate,
            p, from, to, pi;

        if (!me.highlight || !sprite || sprite._highlighted) {
            return;
        }
        if (sprite._anim) {
            sprite._anim.paused = true;
        }
        sprite._highlighted = true;
        if (!sprite._defaults) {
            sprite._defaults = Ext.apply({}, sprite.attr);
            from = {};
            to = {};
            for (p in opts) {
                if (! (p in sprite._defaults)) {
                    sprite._defaults[p] = surface.availableAttrs[p];
                }
                from[p] = sprite._defaults[p];
                to[p] = opts[p];
                if (Ext.isObject(opts[p])) {
                    from[p] = {};
                    to[p] = {};
                    Ext.apply(sprite._defaults[p], sprite.attr[p]);
                    Ext.apply(from[p], sprite._defaults[p]);
                    for (pi in sprite._defaults[p]) {
                        if (! (pi in opts[p])) {
                            to[p][pi] = from[p][pi];
                        } else {
                            to[p][pi] = opts[p][pi];
                        }
                    }
                    for (pi in opts[p]) {
                        if (! (pi in to[p])) {
                            to[p][pi] = opts[p][pi];
                        }
                    }
                }
            }
            sprite._from = from;
            sprite._to = to;
            sprite._endStyle = to;
        }
        if (animate) {
            sprite._anim = Ext.create('Ext.fx.Anim', {
                target: sprite,
                from: sprite._from,
                to: sprite._to,
                duration: 150
            });
        } else {
            sprite.setAttributes(sprite._to, true);
        }
    },

    /**
     * Un-highlight any existing highlights
     */
    unHighlightItem: function() {
        if (!this.highlight || !this.items) {
            return;
        }

        var me = this,
            items = me.items,
            len = items.length,
            opts = me.highlightCfg,
            animate = me.chart.animate,
            i = 0,
            obj, p, sprite;

        for (; i < len; i++) {
            if (!items[i]) {
                continue;
            }
            sprite = items[i].sprite;
            if (sprite && sprite._highlighted) {
                if (sprite._anim) {
                    sprite._anim.paused = true;
                }
                obj = {};
                for (p in opts) {
                    if (Ext.isObject(sprite._defaults[p])) {
                        obj[p] = {};
                        Ext.apply(obj[p], sprite._defaults[p]);
                    }
                    else {
                        obj[p] = sprite._defaults[p];
                    }
                }
                if (animate) {
                    //sprite._to = obj;
                    sprite._endStyle = obj;
                    sprite._anim = Ext.create('Ext.fx.Anim', {
                        target: sprite,
                        to: obj,
                        duration: 150
                    });
                }
                else {
                    sprite.setAttributes(obj, true);
                }
                delete sprite._highlighted;
                //delete sprite._defaults;
            }
        }
    },

    cleanHighlights: function() {
        if (!this.highlight) {
            return;
        }

        var group = this.group,
            markerGroup = this.markerGroup,
            i = 0,
            l;
        for (l = group.getCount(); i < l; i++) {
            delete group.getAt(i)._defaults;
        }
        if (markerGroup) {
            for (l = markerGroup.getCount(); i < l; i++) {
                delete markerGroup.getAt(i)._defaults;
            }
        }
    }
});
