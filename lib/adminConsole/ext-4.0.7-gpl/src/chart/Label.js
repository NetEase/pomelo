/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * @class Ext.chart.Label
 *
 * Labels is a mixin to the Series class. Labels methods are implemented
 * in each of the Series (Pie, Bar, etc) for label creation and placement.
 *
 * The methods implemented by the Series are:
 *
 * - **`onCreateLabel(storeItem, item, i, display)`** Called each time a new label is created.
 *   The arguments of the method are:
 *   - *`storeItem`* The element of the store that is related to the label sprite.
 *   - *`item`* The item related to the label sprite. An item is an object containing the position of the shape
 *     used to describe the visualization and also pointing to the actual shape (circle, rectangle, path, etc).
 *   - *`i`* The index of the element created (i.e the first created label, second created label, etc)
 *   - *`display`* The display type. May be <b>false</b> if the label is hidden
 *
 *  - **`onPlaceLabel(label, storeItem, item, i, display, animate)`** Called for updating the position of the label.
 *    The arguments of the method are:
 *    - *`label`* The sprite label.</li>
 *    - *`storeItem`* The element of the store that is related to the label sprite</li>
 *    - *`item`* The item related to the label sprite. An item is an object containing the position of the shape
 *      used to describe the visualization and also pointing to the actual shape (circle, rectangle, path, etc).
 *    - *`i`* The index of the element to be updated (i.e. whether it is the first, second, third from the labelGroup)
 *    - *`display`* The display type. May be <b>false</b> if the label is hidden.
 *    - *`animate`* A boolean value to set or unset animations for the labels.
 */
Ext.define('Ext.chart.Label', {

    /* Begin Definitions */

    requires: ['Ext.draw.Color'],

    /* End Definitions */

    /**
     * @cfg {Object} label
     * Object with the following properties:
     *
     * - **display** : String
     *
     *   Specifies the presence and position of labels for each pie slice. Either "rotate", "middle", "insideStart",
     *   "insideEnd", "outside", "over", "under", or "none" to prevent label rendering.
     *   Default value: 'none'.
     *
     * - **color** : String
     *
     *   The color of the label text.
     *   Default value: '#000' (black).
     *
     * - **contrast** : Boolean
     *
     *   True to render the label in contrasting color with the backround.
     *   Default value: false.
     *
     * - **field** : String
     *
     *   The name of the field to be displayed in the label.
     *   Default value: 'name'.
     *
     * - **minMargin** : Number
     *
     *   Specifies the minimum distance from a label to the origin of the visualization.
     *   This parameter is useful when using PieSeries width variable pie slice lengths.
     *   Default value: 50.
     *
     * - **font** : String
     *
     *   The font used for the labels.
     *   Default value: "11px Helvetica, sans-serif".
     *
     * - **orientation** : String
     *
     *   Either "horizontal" or "vertical".
     *   Dafault value: "horizontal".
     *
     * - **renderer** : Function
     *
     *   Optional function for formatting the label into a displayable value.
     *   Default value: function(v) { return v; }
     */

    //@private a regex to parse url type colors.
    colorStringRe: /url\s*\(\s*#([^\/)]+)\s*\)/,

    //@private the mixin constructor. Used internally by Series.
    constructor: function(config) {
        var me = this;
        me.label = Ext.applyIf(me.label || {},
        {
            display: "none",
            color: "#000",
            field: "name",
            minMargin: 50,
            font: "11px Helvetica, sans-serif",
            orientation: "horizontal",
            renderer: function(v) {
                return v;
            }
        });

        if (me.label.display !== 'none') {
            me.labelsGroup = me.chart.surface.getGroup(me.seriesId + '-labels');
        }
    },

    //@private a method to render all labels in the labelGroup
    renderLabels: function() {
        var me = this,
            chart = me.chart,
            gradients = chart.gradients,
            items = me.items,
            animate = chart.animate,
            config = me.label,
            display = config.display,
            color = config.color,
            field = [].concat(config.field),
            group = me.labelsGroup,
            groupLength = (group || 0) && group.length,
            store = me.chart.store,
            len = store.getCount(),
            itemLength = (items || 0) && items.length,
            ratio = itemLength / len,
            gradientsCount = (gradients || 0) && gradients.length,
            Color = Ext.draw.Color,
            hides = [],
            gradient, i, count, groupIndex, index, j, k, colorStopTotal, colorStopIndex, colorStop, item, label,
            storeItem, sprite, spriteColor, spriteBrightness, labelColor, colorString;

        if (display == 'none') {
            return;
        }
        // no items displayed, hide all labels
        if(itemLength == 0){
            while(groupLength--)
                hides.push(groupLength);
        }else{
            for (i = 0, count = 0, groupIndex = 0; i < len; i++) {
                index = 0;
                for (j = 0; j < ratio; j++) {
                    item = items[count];
                    label = group.getAt(groupIndex);
                    storeItem = store.getAt(i);
                    //check the excludes
                    while(this.__excludes && this.__excludes[index] && ratio > 1) {
                        if(field[j]){
                            hides.push(groupIndex);
                        }
                        index++;

                    }

                    if (!item && label) {
                        label.hide(true);
                        groupIndex++;
                    }

                    if (item && field[j]) {
                        if (!label) {
                            label = me.onCreateLabel(storeItem, item, i, display, j, index);
                        }
                        me.onPlaceLabel(label, storeItem, item, i, display, animate, j, index);
                        groupIndex++;

                        //set contrast
                        if (config.contrast && item.sprite) {
                            sprite = item.sprite;
                            //set the color string to the color to be set.
                            if (sprite._endStyle) {
                                colorString = sprite._endStyle.fill;
                            }
                            else if (sprite._to) {
                                colorString = sprite._to.fill;
                            }
                            else {
                                colorString = sprite.attr.fill;
                            }
                            colorString = colorString || sprite.attr.fill;

                            spriteColor = Color.fromString(colorString);
                            //color wasn't parsed property maybe because it's a gradient id
                            if (colorString && !spriteColor) {
                                colorString = colorString.match(me.colorStringRe)[1];
                                for (k = 0; k < gradientsCount; k++) {
                                    gradient = gradients[k];
                                    if (gradient.id == colorString) {
                                        //avg color stops
                                        colorStop = 0; colorStopTotal = 0;
                                        for (colorStopIndex in gradient.stops) {
                                            colorStop++;
                                            colorStopTotal += Color.fromString(gradient.stops[colorStopIndex].color).getGrayscale();
                                        }
                                        spriteBrightness = (colorStopTotal / colorStop) / 255;
                                        break;
                                    }
                                }
                            }
                            else {
                                spriteBrightness = spriteColor.getGrayscale() / 255;
                            }
                            if (label.isOutside) {
                                spriteBrightness = 1;
                            }
                            labelColor = Color.fromString(label.attr.color || label.attr.fill).getHSL();
                            labelColor[2] = spriteBrightness > 0.5 ? 0.2 : 0.8;
                            label.setAttributes({
                                fill: String(Color.fromHSL.apply({}, labelColor))
                            }, true);
                        }

                    }
                    count++;
                    index++;
                }
            }
        }
        me.hideLabels(hides);
    },
    hideLabels: function(hides){
        var labelsGroup = this.labelsGroup,
            hlen = hides.length;
        while(hlen--)
            labelsGroup.getAt(hides[hlen]).hide(true);
    }
});
