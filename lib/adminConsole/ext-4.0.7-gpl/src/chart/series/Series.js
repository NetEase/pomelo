/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * @class Ext.chart.series.Series
 *
 * Series is the abstract class containing the common logic to all chart series. Series includes
 * methods from Labels, Highlights, Tips and Callouts mixins. This class implements the logic of handling
 * mouse events, animating, hiding, showing all elements and returning the color of the series to be used as a legend item.
 *
 * ## Listeners
 *
 * The series class supports listeners via the Observable syntax. Some of these listeners are:
 *
 *  - `itemmouseup` When the user interacts with a marker.
 *  - `itemmousedown` When the user interacts with a marker.
 *  - `itemmousemove` When the user iteracts with a marker.
 *  - `afterrender` Will be triggered when the animation ends or when the series has been rendered completely.
 *
 * For example:
 *
 *     series: [{
 *             type: 'column',
 *             axis: 'left',
 *             listeners: {
 *                     'afterrender': function() {
 *                             console('afterrender');
 *                     }
 *             },
 *             xField: 'category',
 *             yField: 'data1'
 *     }]
 */
Ext.define('Ext.chart.series.Series', {

    /* Begin Definitions */

    mixins: {
        observable: 'Ext.util.Observable',
        labels: 'Ext.chart.Label',
        highlights: 'Ext.chart.Highlight',
        tips: 'Ext.chart.Tip',
        callouts: 'Ext.chart.Callout'
    },

    /* End Definitions */

    /**
     * @cfg {Boolean/Object} highlight
     * If set to `true` it will highlight the markers or the series when hovering
     * with the mouse. This parameter can also be an object with the same style
     * properties you would apply to a {@link Ext.draw.Sprite} to apply custom
     * styles to markers and series.
     */

    /**
     * @cfg {Object} tips
     * Add tooltips to the visualization's markers. The options for the tips are the
     * same configuration used with {@link Ext.tip.ToolTip}. For example:
     *
     *     tips: {
     *       trackMouse: true,
     *       width: 140,
     *       height: 28,
     *       renderer: function(storeItem, item) {
     *         this.setTitle(storeItem.get('name') + ': ' + storeItem.get('data1') + ' views');
     *       }
     *     },
     */

    /**
     * @cfg {String} type
     * The type of series. Set in subclasses.
     */
    type: null,

    /**
     * @cfg {String} title
     * The human-readable name of the series.
     */
    title: null,

    /**
     * @cfg {Boolean} showInLegend
     * Whether to show this series in the legend.
     */
    showInLegend: true,

    /**
     * @cfg {Function} renderer
     * A function that can be overridden to set custom styling properties to each rendered element.
     * Passes in (sprite, record, attributes, index, store) to the function.
     */
    renderer: function(sprite, record, attributes, index, store) {
        return attributes;
    },

    /**
     * @cfg {Array} shadowAttributes
     * An array with shadow attributes
     */
    shadowAttributes: null,

    //@private triggerdrawlistener flag
    triggerAfterDraw: false,

    /**
     * @cfg {Object} listeners
     * An (optional) object with event callbacks. All event callbacks get the target *item* as first parameter. The callback functions are:
     *
     *  - itemmouseover
     *  - itemmouseout
     *  - itemmousedown
     *  - itemmouseup
     */

    constructor: function(config) {
        var me = this;
        if (config) {
            Ext.apply(me, config);
        }

        me.shadowGroups = [];

        me.mixins.labels.constructor.call(me, config);
        me.mixins.highlights.constructor.call(me, config);
        me.mixins.tips.constructor.call(me, config);
        me.mixins.callouts.constructor.call(me, config);

        me.addEvents({
            scope: me,
            itemmouseover: true,
            itemmouseout: true,
            itemmousedown: true,
            itemmouseup: true,
            mouseleave: true,
            afterdraw: true,

            /**
             * @event titlechange
             * Fires when the series title is changed via {@link #setTitle}.
             * @param {String} title The new title value
             * @param {Number} index The index in the collection of titles
             */
            titlechange: true
        });

        me.mixins.observable.constructor.call(me, config);

        me.on({
            scope: me,
            itemmouseover: me.onItemMouseOver,
            itemmouseout: me.onItemMouseOut,
            mouseleave: me.onMouseLeave
        });
    },
    
    /**
     * Iterate over each of the records for this series. The default implementation simply iterates
     * through the entire data store, but individual series implementations can override this to
     * provide custom handling, e.g. adding/removing records.
     * @param {Function} fn The function to execute for each record.
     * @param {Object} scope Scope for the fn.
     */
    eachRecord: function(fn, scope) {
        var chart = this.chart;
        (chart.substore || chart.store).each(fn, scope);
    },

    /**
     * Return the number of records being displayed in this series. Defaults to the number of
     * records in the store; individual series implementations can override to provide custom handling.
     */
    getRecordCount: function() {
        var chart = this.chart,
            store = chart.substore || chart.store;
        return store ? store.getCount() : 0;
    },

    /**
     * Determines whether the series item at the given index has been excluded, i.e. toggled off in the legend.
     * @param index
     */
    isExcluded: function(index) {
        var excludes = this.__excludes;
        return !!(excludes && excludes[index]);
    },

    // @private set the bbox and clipBox for the series
    setBBox: function(noGutter) {
        var me = this,
            chart = me.chart,
            chartBBox = chart.chartBBox,
            gutterX = noGutter ? 0 : chart.maxGutter[0],
            gutterY = noGutter ? 0 : chart.maxGutter[1],
            clipBox, bbox;

        clipBox = {
            x: chartBBox.x,
            y: chartBBox.y,
            width: chartBBox.width,
            height: chartBBox.height
        };
        me.clipBox = clipBox;

        bbox = {
            x: (clipBox.x + gutterX) - (chart.zoom.x * chart.zoom.width),
            y: (clipBox.y + gutterY) - (chart.zoom.y * chart.zoom.height),
            width: (clipBox.width - (gutterX * 2)) * chart.zoom.width,
            height: (clipBox.height - (gutterY * 2)) * chart.zoom.height
        };
        me.bbox = bbox;
    },

    // @private set the animation for the sprite
    onAnimate: function(sprite, attr) {
        var me = this;
        sprite.stopAnimation();
        if (me.triggerAfterDraw) {
            return sprite.animate(Ext.applyIf(attr, me.chart.animate));
        } else {
            me.triggerAfterDraw = true;
            return sprite.animate(Ext.apply(Ext.applyIf(attr, me.chart.animate), {
                listeners: {
                    'afteranimate': function() {
                        me.triggerAfterDraw = false;
                        me.fireEvent('afterrender');
                    }
                }
            }));
        }
    },

    // @private return the gutter.
    getGutters: function() {
        return [0, 0];
    },

    // @private wrapper for the itemmouseover event.
    onItemMouseOver: function(item) {
        var me = this;
        if (item.series === me) {
            if (me.highlight) {
                me.highlightItem(item);
            }
            if (me.tooltip) {
                me.showTip(item);
            }
        }
    },

    // @private wrapper for the itemmouseout event.
    onItemMouseOut: function(item) {
        var me = this;
        if (item.series === me) {
            me.unHighlightItem();
            if (me.tooltip) {
                me.hideTip(item);
            }
        }
    },

    // @private wrapper for the mouseleave event.
    onMouseLeave: function() {
        var me = this;
        me.unHighlightItem();
        if (me.tooltip) {
            me.hideTip();
        }
    },

    /**
     * For a given x/y point relative to the Surface, find a corresponding item from this
     * series, if any.
     * @param {Number} x
     * @param {Number} y
     * @return {Object} An object describing the item, or null if there is no matching item.
     * The exact contents of this object will vary by series type, but should always contain the following:
     * @return {Ext.chart.series.Series} return.series the Series object to which the item belongs
     * @return {Object} return.value the value(s) of the item's data point
     * @return {Array} return.point the x/y coordinates relative to the chart box of a single point
     * for this data item, which can be used as e.g. a tooltip anchor point.
     * @return {Ext.draw.Sprite} return.sprite the item's rendering Sprite.
     */
    getItemForPoint: function(x, y) {
        //if there are no items to query just return null.
        if (!this.items || !this.items.length || this.seriesIsHidden) {
            return null;
        }
        var me = this,
            items = me.items,
            bbox = me.bbox,
            item, i, ln;
        // Check bounds
        if (!Ext.draw.Draw.withinBox(x, y, bbox)) {
            return null;
        }
        for (i = 0, ln = items.length; i < ln; i++) {
            if (items[i] && this.isItemInPoint(x, y, items[i], i)) {
                return items[i];
            }
        }

        return null;
    },

    isItemInPoint: function(x, y, item, i) {
        return false;
    },

    /**
     * Hides all the elements in the series.
     */
    hideAll: function() {
        var me = this,
            items = me.items,
            item, len, i, j, l, sprite, shadows;

        me.seriesIsHidden = true;
        me._prevShowMarkers = me.showMarkers;

        me.showMarkers = false;
        //hide all labels
        me.hideLabels(0);
        //hide all sprites
        for (i = 0, len = items.length; i < len; i++) {
            item = items[i];
            sprite = item.sprite;
            if (sprite) {
                sprite.setAttributes({
                    hidden: true
                }, true);
            }

            if (sprite && sprite.shadows) {
                shadows = sprite.shadows;
                for (j = 0, l = shadows.length; j < l; ++j) {
                    shadows[j].setAttributes({
                        hidden: true
                    }, true);
                }
            }
        }
    },

    /**
     * Shows all the elements in the series.
     */
    showAll: function() {
        var me = this,
            prevAnimate = me.chart.animate;
        me.chart.animate = false;
        me.seriesIsHidden = false;
        me.showMarkers = me._prevShowMarkers;
        me.drawSeries();
        me.chart.animate = prevAnimate;
    },

    /**
     * Returns a string with the color to be used for the series legend item.
     */
    getLegendColor: function(index) {
        var me = this, fill, stroke;
        if (me.seriesStyle) {
            fill = me.seriesStyle.fill;
            stroke = me.seriesStyle.stroke;
            if (fill && fill != 'none') {
                return fill;
            }
            return stroke;
        }
        return '#000';
    },

    /**
     * Checks whether the data field should be visible in the legend
     * @private
     * @param {Number} index The index of the current item
     */
    visibleInLegend: function(index){
        var excludes = this.__excludes;
        if (excludes) {
            return !excludes[index];
        }
        return !this.seriesIsHidden;
    },

    /**
     * Changes the value of the {@link #title} for the series.
     * Arguments can take two forms:
     * <ul>
     * <li>A single String value: this will be used as the new single title for the series (applies
     * to series with only one yField)</li>
     * <li>A numeric index and a String value: this will set the title for a single indexed yField.</li>
     * </ul>
     * @param {Number} index
     * @param {String} title
     */
    setTitle: function(index, title) {
        var me = this,
            oldTitle = me.title;

        if (Ext.isString(index)) {
            title = index;
            index = 0;
        }

        if (Ext.isArray(oldTitle)) {
            oldTitle[index] = title;
        } else {
            me.title = title;
        }

        me.fireEvent('titlechange', title, index);
    }
});

