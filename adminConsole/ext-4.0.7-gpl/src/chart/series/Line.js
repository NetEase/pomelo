/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * @class Ext.chart.series.Line
 * @extends Ext.chart.series.Cartesian
 *
 * Creates a Line Chart. A Line Chart is a useful visualization technique to display quantitative information for different
 * categories or other real values (as opposed to the bar chart), that can show some progression (or regression) in the dataset.
 * As with all other series, the Line Series must be appended in the *series* Chart array configuration. See the Chart
 * documentation for more information. A typical configuration object for the line series could be:
 *
 *     @example
 *     var store = Ext.create('Ext.data.JsonStore', {
 *         fields: ['name', 'data1', 'data2', 'data3', 'data4', 'data5'],
 *         data: [
 *             { 'name': 'metric one',   'data1': 10, 'data2': 12, 'data3': 14, 'data4': 8,  'data5': 13 },
 *             { 'name': 'metric two',   'data1': 7,  'data2': 8,  'data3': 16, 'data4': 10, 'data5': 3  },
 *             { 'name': 'metric three', 'data1': 5,  'data2': 2,  'data3': 14, 'data4': 12, 'data5': 7  },
 *             { 'name': 'metric four',  'data1': 2,  'data2': 14, 'data3': 6,  'data4': 1,  'data5': 23 },
 *             { 'name': 'metric five',  'data1': 4,  'data2': 4,  'data3': 36, 'data4': 13, 'data5': 33 }
 *         ]
 *     });
 *
 *     Ext.create('Ext.chart.Chart', {
 *         renderTo: Ext.getBody(),
 *         width: 500,
 *         height: 300,
 *         animate: true,
 *         store: store,
 *         axes: [
 *             {
 *                 type: 'Numeric',
 *                 position: 'left',
 *                 fields: ['data1', 'data2'],
 *                 label: {
 *                     renderer: Ext.util.Format.numberRenderer('0,0')
 *                 },
 *                 title: 'Sample Values',
 *                 grid: true,
 *                 minimum: 0
 *             },
 *             {
 *                 type: 'Category',
 *                 position: 'bottom',
 *                 fields: ['name'],
 *                 title: 'Sample Metrics'
 *             }
 *         ],
 *         series: [
 *             {
 *                 type: 'line',
 *                 highlight: {
 *                     size: 7,
 *                     radius: 7
 *                 },
 *                 axis: 'left',
 *                 xField: 'name',
 *                 yField: 'data1',
 *                 markerConfig: {
 *                     type: 'cross',
 *                     size: 4,
 *                     radius: 4,
 *                     'stroke-width': 0
 *                 }
 *             },
 *             {
 *                 type: 'line',
 *                 highlight: {
 *                     size: 7,
 *                     radius: 7
 *                 },
 *                 axis: 'left',
 *                 fill: true,
 *                 xField: 'name',
 *                 yField: 'data2',
 *                 markerConfig: {
 *                     type: 'circle',
 *                     size: 4,
 *                     radius: 4,
 *                     'stroke-width': 0
 *                 }
 *             }
 *         ]
 *     });
 *
 * In this configuration we're adding two series (or lines), one bound to the `data1`
 * property of the store and the other to `data3`. The type for both configurations is
 * `line`. The `xField` for both series is the same, the name propert of the store.
 * Both line series share the same axis, the left axis. You can set particular marker
 * configuration by adding properties onto the markerConfig object. Both series have
 * an object as highlight so that markers animate smoothly to the properties in highlight
 * when hovered. The second series has `fill=true` which means that the line will also
 * have an area below it of the same color.
 *
 * **Note:** In the series definition remember to explicitly set the axis to bind the
 * values of the line series to. This can be done by using the `axis` configuration property.
 */
Ext.define('Ext.chart.series.Line', {

    /* Begin Definitions */

    extend: 'Ext.chart.series.Cartesian',

    alternateClassName: ['Ext.chart.LineSeries', 'Ext.chart.LineChart'],

    requires: ['Ext.chart.axis.Axis', 'Ext.chart.Shape', 'Ext.draw.Draw', 'Ext.fx.Anim'],

    /* End Definitions */

    type: 'line',

    alias: 'series.line',

    /**
     * @cfg {String} axis
     * The position of the axis to bind the values to. Possible values are 'left', 'bottom', 'top' and 'right'.
     * You must explicitly set this value to bind the values of the line series to the ones in the axis, otherwise a
     * relative scale will be used.
     */

    /**
     * @cfg {Number} selectionTolerance
     * The offset distance from the cursor position to the line series to trigger events (then used for highlighting series, etc).
     */
    selectionTolerance: 20,

    /**
     * @cfg {Boolean} showMarkers
     * Whether markers should be displayed at the data points along the line. If true,
     * then the {@link #markerConfig} config item will determine the markers' styling.
     */
    showMarkers: true,

    /**
     * @cfg {Object} markerConfig
     * The display style for the markers. Only used if {@link #showMarkers} is true.
     * The markerConfig is a configuration object containing the same set of properties defined in
     * the Sprite class. For example, if we were to set red circles as markers to the line series we could
     * pass the object:
     *
     <pre><code>
        markerConfig: {
            type: 'circle',
            radius: 4,
            'fill': '#f00'
        }
     </code></pre>

     */
    markerConfig: {},

    /**
     * @cfg {Object} style
     * An object containing style properties for the visualization lines and fill.
     * These styles will override the theme styles.  The following are valid style properties:
     *
     * - `stroke` - an rgb or hex color string for the background color of the line
     * - `stroke-width` - the width of the stroke (integer)
     * - `fill` - the background fill color string (hex or rgb), only works if {@link #fill} is `true`
     * - `opacity` - the opacity of the line and the fill color (decimal)
     *
     * Example usage:
     *
     *     style: {
     *         stroke: '#00ff00',
     *         'stroke-width': 10,
     *         fill: '#80A080',
     *         opacity: 0.2
     *     }
     */
    style: {},

    /**
     * @cfg {Boolean/Number} smooth
     * If set to `true` or a non-zero number, the line will be smoothed/rounded around its points; otherwise
     * straight line segments will be drawn.
     *
     * A numeric value is interpreted as a divisor of the horizontal distance between consecutive points in
     * the line; larger numbers result in sharper curves while smaller numbers result in smoother curves.
     *
     * If set to `true` then a default numeric value of 3 will be used. Defaults to `false`.
     */
    smooth: false,

    /**
     * @private Default numeric smoothing value to be used when {@link #smooth} = true.
     */
    defaultSmoothness: 3,

    /**
     * @cfg {Boolean} fill
     * If true, the area below the line will be filled in using the {@link #style eefill} and
     * {@link #style opacity} config properties. Defaults to false.
     */
    fill: false,

    constructor: function(config) {
        this.callParent(arguments);
        var me = this,
            surface = me.chart.surface,
            shadow = me.chart.shadow,
            i, l;
        Ext.apply(me, config, {
            highlightCfg: {
                'stroke-width': 3
            },
            shadowAttributes: [{
                "stroke-width": 6,
                "stroke-opacity": 0.05,
                stroke: 'rgb(0, 0, 0)',
                translate: {
                    x: 1,
                    y: 1
                }
            }, {
                "stroke-width": 4,
                "stroke-opacity": 0.1,
                stroke: 'rgb(0, 0, 0)',
                translate: {
                    x: 1,
                    y: 1
                }
            }, {
                "stroke-width": 2,
                "stroke-opacity": 0.15,
                stroke: 'rgb(0, 0, 0)',
                translate: {
                    x: 1,
                    y: 1
                }
            }]
        });
        me.group = surface.getGroup(me.seriesId);
        if (me.showMarkers) {
            me.markerGroup = surface.getGroup(me.seriesId + '-markers');
        }
        if (shadow) {
            for (i = 0, l = me.shadowAttributes.length; i < l; i++) {
                me.shadowGroups.push(surface.getGroup(me.seriesId + '-shadows' + i));
            }
        }
    },

    // @private makes an average of points when there are more data points than pixels to be rendered.
    shrink: function(xValues, yValues, size) {
        // Start at the 2nd point...
        var len = xValues.length,
            ratio = Math.floor(len / size),
            i = 1,
            xSum = 0,
            ySum = 0,
            xRes = [xValues[0]],
            yRes = [yValues[0]];

        for (; i < len; ++i) {
            xSum += xValues[i] || 0;
            ySum += yValues[i] || 0;
            if (i % ratio == 0) {
                xRes.push(xSum/ratio);
                yRes.push(ySum/ratio);
                xSum = 0;
                ySum = 0;
            }
        }
        return {
            x: xRes,
            y: yRes
        };
    },

    /**
     * Draws the series for the current chart.
     */
    drawSeries: function() {
        var me = this,
            chart = me.chart,
            chartAxes = chart.axes,
            store = chart.getChartStore(),
            storeCount = store.getCount(),
            surface = me.chart.surface,
            bbox = {},
            group = me.group,
            showMarkers = me.showMarkers,
            markerGroup = me.markerGroup,
            enableShadows = chart.shadow,
            shadowGroups = me.shadowGroups,
            shadowAttributes = me.shadowAttributes,
            smooth = me.smooth,
            lnsh = shadowGroups.length,
            dummyPath = ["M"],
            path = ["M"],
            renderPath = ["M"],
            smoothPath = ["M"],
            markerIndex = chart.markerIndex,
            axes = [].concat(me.axis),
            shadowBarAttr,
            xValues = [],
            xValueMap = {},
            yValues = [],
            yValueMap = {},
            onbreak = false,
            storeIndices = [],
            markerStyle = me.markerStyle,
            seriesStyle = me.style,
            colorArrayStyle = me.colorArrayStyle,
            colorArrayLength = colorArrayStyle && colorArrayStyle.length || 0,
            isNumber = Ext.isNumber,
            seriesIdx = me.seriesIdx, 
            boundAxes = me.getAxesForXAndYFields(),
            boundXAxis = boundAxes.xAxis,
            boundYAxis = boundAxes.yAxis,
            shadows, shadow, shindex, fromPath, fill, fillPath, rendererAttributes,
            x, y, prevX, prevY, firstX, firstY, markerCount, i, j, ln, axis, ends, marker, markerAux, item, xValue,
            yValue, coords, xScale, yScale, minX, maxX, minY, maxY, line, animation, endMarkerStyle,
            endLineStyle, type, count, items;

        if (me.fireEvent('beforedraw', me) === false) {
            return;
        }

        //if store is empty or the series is excluded in the legend then there's nothing to draw.
        if (!storeCount || me.seriesIsHidden) {
            items = this.items;
            if (items) {
                for (i = 0, ln = items.length; i < ln; ++i) {
                    if (items[i].sprite) {
                        items[i].sprite.hide(true);
                    }
                }
            }
            return;
        }

        //prepare style objects for line and markers
        endMarkerStyle = Ext.apply(markerStyle || {}, me.markerConfig);
        type = endMarkerStyle.type;
        delete endMarkerStyle.type;
        endLineStyle = seriesStyle;
        //if no stroke with is specified force it to 0.5 because this is
        //about making *lines*
        if (!endLineStyle['stroke-width']) {
            endLineStyle['stroke-width'] = 0.5;
        }
        //If we're using a time axis and we need to translate the points,
        //then reuse the first markers as the last markers.
        if (markerIndex && markerGroup && markerGroup.getCount()) {
            for (i = 0; i < markerIndex; i++) {
                marker = markerGroup.getAt(i);
                markerGroup.remove(marker);
                markerGroup.add(marker);
                markerAux = markerGroup.getAt(markerGroup.getCount() - 2);
                marker.setAttributes({
                    x: 0,
                    y: 0,
                    translate: {
                        x: markerAux.attr.translation.x,
                        y: markerAux.attr.translation.y
                    }
                }, true);
            }
        }

        me.unHighlightItem();
        me.cleanHighlights();

        me.setBBox();
        bbox = me.bbox;
        me.clipRect = [bbox.x, bbox.y, bbox.width, bbox.height];
        for (i = 0, ln = axes.length; i < ln; i++) {
            axis = chartAxes.get(axes[i]);
            if (axis) {
                ends = axis.calcEnds();
                if (axis.position == 'top' || axis.position == 'bottom') {
                    minX = ends.from;
                    maxX = ends.to;
                }
                else {
                    minY = ends.from;
                    maxY = ends.to;
                }
            }
        }
        // If a field was specified without a corresponding axis, create one to get bounds
        //only do this for the axis where real values are bound (that's why we check for
        //me.axis)
        if (me.xField && !isNumber(minX) &&
            (boundXAxis == 'bottom' || boundXAxis == 'top') && 
            !chartAxes.get(boundXAxis)) {
            axis = Ext.create('Ext.chart.axis.Axis', {
                chart: chart,
                fields: [].concat(me.xField)
            }).calcEnds();
            minX = axis.from;
            maxX = axis.to;
        }
        if (me.yField && !isNumber(minY) &&
            (boundYAxis == 'right' || boundYAxis == 'left') &&
            !chartAxes.get(boundYAxis)) {
            axis = Ext.create('Ext.chart.axis.Axis', {
                chart: chart,
                fields: [].concat(me.yField)
            }).calcEnds();
            minY = axis.from;
            maxY = axis.to;
        }
        if (isNaN(minX)) {
            minX = 0;
            xScale = bbox.width / ((storeCount - 1) || 1);
        }
        else {
            xScale = bbox.width / ((maxX - minX) || (storeCount -1) || 1);
        }

        if (isNaN(minY)) {
            minY = 0;
            yScale = bbox.height / ((storeCount - 1) || 1);
        }
        else {
            yScale = bbox.height / ((maxY - minY) || (storeCount - 1) || 1);
        }

        // Extract all x and y values from the store
        me.eachRecord(function(record, i) {
            xValue = record.get(me.xField);

            // Ensure a value
            if (typeof xValue == 'string' || typeof xValue == 'object' && !Ext.isDate(xValue)
                //set as uniform distribution if the axis is a category axis.
                || boundXAxis && chartAxes.get(boundXAxis) && chartAxes.get(boundXAxis).type == 'Category') {
                    if (xValue in xValueMap) {
                        xValue = xValueMap[xValue];
                    } else {
                        xValue = xValueMap[xValue] = i;
                    }
            }

            // Filter out values that don't fit within the pan/zoom buffer area
            yValue = record.get(me.yField);
            //skip undefined values
            if (typeof yValue == 'undefined' || (typeof yValue == 'string' && !yValue)) {
                //<debug warn>
                if (Ext.isDefined(Ext.global.console)) {
                    Ext.global.console.warn("[Ext.chart.series.Line]  Skipping a store element with an undefined value at ", record, xValue, yValue);
                }
                //</debug>
                return;
            }
            // Ensure a value
            if (typeof yValue == 'string' || typeof yValue == 'object' && !Ext.isDate(yValue)
                //set as uniform distribution if the axis is a category axis.
                || boundYAxis && chartAxes.get(boundYAxis) && chartAxes.get(boundYAxis).type == 'Category') {
                yValue = i;
            }
            storeIndices.push(i);
            xValues.push(xValue);
            yValues.push(yValue);
        });

        ln = xValues.length;
        if (ln > bbox.width) {
            coords = me.shrink(xValues, yValues, bbox.width);
            xValues = coords.x;
            yValues = coords.y;
        }

        me.items = [];

        count = 0;
        ln = xValues.length;
        for (i = 0; i < ln; i++) {
            xValue = xValues[i];
            yValue = yValues[i];
            if (yValue === false) {
                if (path.length == 1) {
                    path = [];
                }
                onbreak = true;
                me.items.push(false);
                continue;
            } else {
                x = (bbox.x + (xValue - minX) * xScale).toFixed(2);
                y = ((bbox.y + bbox.height) - (yValue - minY) * yScale).toFixed(2);
                if (onbreak) {
                    onbreak = false;
                    path.push('M');
                }
                path = path.concat([x, y]);
            }
            if ((typeof firstY == 'undefined') && (typeof y != 'undefined')) {
                firstY = y;
                firstX = x;
            }
            // If this is the first line, create a dummypath to animate in from.
            if (!me.line || chart.resizing) {
                dummyPath = dummyPath.concat([x, bbox.y + bbox.height / 2]);
            }

            // When resizing, reset before animating
            if (chart.animate && chart.resizing && me.line) {
                me.line.setAttributes({
                    path: dummyPath
                }, true);
                if (me.fillPath) {
                    me.fillPath.setAttributes({
                        path: dummyPath,
                        opacity: 0.2
                    }, true);
                }
                if (me.line.shadows) {
                    shadows = me.line.shadows;
                    for (j = 0, lnsh = shadows.length; j < lnsh; j++) {
                        shadow = shadows[j];
                        shadow.setAttributes({
                            path: dummyPath
                        }, true);
                    }
                }
            }
            if (showMarkers) {
                marker = markerGroup.getAt(count++);
                if (!marker) {
                    marker = Ext.chart.Shape[type](surface, Ext.apply({
                        group: [group, markerGroup],
                        x: 0, y: 0,
                        translate: {
                            x: +(prevX || x),
                            y: prevY || (bbox.y + bbox.height / 2)
                        },
                        value: '"' + xValue + ', ' + yValue + '"',
                        zIndex: 4000
                    }, endMarkerStyle));
                    marker._to = {
                        translate: {
                            x: +x,
                            y: +y
                        }
                    };
                } else {
                    marker.setAttributes({
                        value: '"' + xValue + ', ' + yValue + '"',
                        x: 0, y: 0,
                        hidden: false
                    }, true);
                    marker._to = {
                        translate: {
                            x: +x, 
                            y: +y
                        }
                    };
                }
            }
            me.items.push({
                series: me,
                value: [xValue, yValue],
                point: [x, y],
                sprite: marker,
                storeItem: store.getAt(storeIndices[i])
            });
            prevX = x;
            prevY = y;
        }

        if (path.length <= 1) {
            //nothing to be rendered
            return;
        }

        if (me.smooth) {
            smoothPath = Ext.draw.Draw.smooth(path, isNumber(smooth) ? smooth : me.defaultSmoothness);
        }

        renderPath = smooth ? smoothPath : path;

        //Correct path if we're animating timeAxis intervals
        if (chart.markerIndex && me.previousPath) {
            fromPath = me.previousPath;
            if (!smooth) {
                Ext.Array.erase(fromPath, 1, 2);
            }
        } else {
            fromPath = path;
        }

        // Only create a line if one doesn't exist.
        if (!me.line) {
            me.line = surface.add(Ext.apply({
                type: 'path',
                group: group,
                path: dummyPath,
                stroke: endLineStyle.stroke || endLineStyle.fill
            }, endLineStyle || {}));

            if (enableShadows) {
                me.line.setAttributes(Ext.apply({}, me.shadowOptions), true);
            }

            //unset fill here (there's always a default fill withing the themes).
            me.line.setAttributes({
                fill: 'none',
                zIndex: 3000
            });
            if (!endLineStyle.stroke && colorArrayLength) {
                me.line.setAttributes({
                    stroke: colorArrayStyle[seriesIdx % colorArrayLength]
                }, true);
            }
            if (enableShadows) {
                //create shadows
                shadows = me.line.shadows = [];
                for (shindex = 0; shindex < lnsh; shindex++) {
                    shadowBarAttr = shadowAttributes[shindex];
                    shadowBarAttr = Ext.apply({}, shadowBarAttr, { path: dummyPath });
                    shadow = surface.add(Ext.apply({}, {
                        type: 'path',
                        group: shadowGroups[shindex]
                    }, shadowBarAttr));
                    shadows.push(shadow);
                }
            }
        }
        if (me.fill) {
            fillPath = renderPath.concat([
                ["L", x, bbox.y + bbox.height],
                ["L", firstX, bbox.y + bbox.height],
                ["L", firstX, firstY]
            ]);
            if (!me.fillPath) {
                me.fillPath = surface.add({
                    group: group,
                    type: 'path',
                    opacity: endLineStyle.opacity || 0.3,
                    fill: endLineStyle.fill || colorArrayStyle[seriesIdx % colorArrayLength],
                    path: dummyPath
                });
            }
        }
        markerCount = showMarkers && markerGroup.getCount();
        if (chart.animate) {
            fill = me.fill;
            line = me.line;
            //Add renderer to line. There is not unique record associated with this.
            rendererAttributes = me.renderer(line, false, { path: renderPath }, i, store);
            Ext.apply(rendererAttributes, endLineStyle || {}, {
                stroke: endLineStyle.stroke || endLineStyle.fill
            });
            //fill should not be used here but when drawing the special fill path object
            delete rendererAttributes.fill;
            line.show(true);
            if (chart.markerIndex && me.previousPath) {
                me.animation = animation = me.onAnimate(line, {
                    to: rendererAttributes,
                    from: {
                        path: fromPath
                    }
                });
            } else {
                me.animation = animation = me.onAnimate(line, {
                    to: rendererAttributes
                });
            }
            //animate shadows
            if (enableShadows) {
                shadows = line.shadows;
                for(j = 0; j < lnsh; j++) {
                    shadows[j].show(true);
                    if (chart.markerIndex && me.previousPath) {
                        me.onAnimate(shadows[j], {
                            to: { path: renderPath },
                            from: { path: fromPath }
                        });
                    } else {
                        me.onAnimate(shadows[j], {
                            to: { path: renderPath }
                        });
                    }
                }
            }
            //animate fill path
            if (fill) {
                me.fillPath.show(true);
                me.onAnimate(me.fillPath, {
                    to: Ext.apply({}, {
                        path: fillPath,
                        fill: endLineStyle.fill || colorArrayStyle[seriesIdx % colorArrayLength],
                        'stroke-width': 0
                    }, endLineStyle || {})
                });
            }
            //animate markers
            if (showMarkers) {
                count = 0;
                for(i = 0; i < ln; i++) {
                    if (me.items[i]) {
                        item = markerGroup.getAt(count++);
                        if (item) {
                            rendererAttributes = me.renderer(item, store.getAt(i), item._to, i, store);
                            me.onAnimate(item, {
                                to: Ext.apply(rendererAttributes, endMarkerStyle || {})
                            });
                            item.show(true);
                        }
                    }
                }
                for(; count < markerCount; count++) {
                    item = markerGroup.getAt(count);
                    item.hide(true);
                }
//                for(i = 0; i < (chart.markerIndex || 0)-1; i++) {
//                    item = markerGroup.getAt(i);
//                    item.hide(true);
//                }
            }
        } else {
            rendererAttributes = me.renderer(me.line, false, { path: renderPath, hidden: false }, i, store);
            Ext.apply(rendererAttributes, endLineStyle || {}, {
                stroke: endLineStyle.stroke || endLineStyle.fill
            });
            //fill should not be used here but when drawing the special fill path object
            delete rendererAttributes.fill;
            me.line.setAttributes(rendererAttributes, true);
            //set path for shadows
            if (enableShadows) {
                shadows = me.line.shadows;
                for(j = 0; j < lnsh; j++) {
                    shadows[j].setAttributes({
                        path: renderPath,
                        hidden: false
                    }, true);
                }
            }
            if (me.fill) {
                me.fillPath.setAttributes({
                    path: fillPath,
                    hidden: false
                }, true);
            }
            if (showMarkers) {
                count = 0;
                for(i = 0; i < ln; i++) {
                    if (me.items[i]) {
                        item = markerGroup.getAt(count++);
                        if (item) {
                            rendererAttributes = me.renderer(item, store.getAt(i), item._to, i, store);
                            item.setAttributes(Ext.apply(endMarkerStyle || {}, rendererAttributes || {}), true);
                            item.show(true);
                        }
                    }
                }
                for(; count < markerCount; count++) {
                    item = markerGroup.getAt(count);
                    item.hide(true);
                }
            }
        }

        if (chart.markerIndex) {
            if (me.smooth) {
                Ext.Array.erase(path, 1, 2);
            } else {
                Ext.Array.splice(path, 1, 0, path[1], path[2]);
            }
            me.previousPath = path;
        }
        me.renderLabels();
        me.renderCallouts();

        me.fireEvent('draw', me);
    },

    // @private called when a label is to be created.
    onCreateLabel: function(storeItem, item, i, display) {
        var me = this,
            group = me.labelsGroup,
            config = me.label,
            bbox = me.bbox,
            endLabelStyle = Ext.apply(config, me.seriesLabelStyle);

        return me.chart.surface.add(Ext.apply({
            'type': 'text',
            'text-anchor': 'middle',
            'group': group,
            'x': item.point[0],
            'y': bbox.y + bbox.height / 2
        }, endLabelStyle || {}));
    },

    // @private called when a label is to be created.
    onPlaceLabel: function(label, storeItem, item, i, display, animate) {
        var me = this,
            chart = me.chart,
            resizing = chart.resizing,
            config = me.label,
            format = config.renderer,
            field = config.field,
            bbox = me.bbox,
            x = item.point[0],
            y = item.point[1],
            radius = item.sprite.attr.radius,
            bb, width, height;

        label.setAttributes({
            text: format(storeItem.get(field)),
            hidden: true
        }, true);

        if (display == 'rotate') {
            label.setAttributes({
                'text-anchor': 'start',
                'rotation': {
                    x: x,
                    y: y,
                    degrees: -45
                }
            }, true);
            //correct label position to fit into the box
            bb = label.getBBox();
            width = bb.width;
            height = bb.height;
            x = x < bbox.x? bbox.x : x;
            x = (x + width > bbox.x + bbox.width)? (x - (x + width - bbox.x - bbox.width)) : x;
            y = (y - height < bbox.y)? bbox.y + height : y;

        } else if (display == 'under' || display == 'over') {
            //TODO(nicolas): find out why width/height values in circle bounding boxes are undefined.
            bb = item.sprite.getBBox();
            bb.width = bb.width || (radius * 2);
            bb.height = bb.height || (radius * 2);
            y = y + (display == 'over'? -bb.height : bb.height);
            //correct label position to fit into the box
            bb = label.getBBox();
            width = bb.width/2;
            height = bb.height/2;
            x = x - width < bbox.x? bbox.x + width : x;
            x = (x + width > bbox.x + bbox.width) ? (x - (x + width - bbox.x - bbox.width)) : x;
            y = y - height < bbox.y? bbox.y + height : y;
            y = (y + height > bbox.y + bbox.height) ? (y - (y + height - bbox.y - bbox.height)) : y;
        }

        if (me.chart.animate && !me.chart.resizing) {
            label.show(true);
            me.onAnimate(label, {
                to: {
                    x: x,
                    y: y
                }
            });
        } else {
            label.setAttributes({
                x: x,
                y: y
            }, true);
            if (resizing && me.animation) {
                me.animation.on('afteranimate', function() {
                    label.show(true);
                });
            } else {
                label.show(true);
            }
        }
    },

    //@private Overriding highlights.js highlightItem method.
    highlightItem: function() {
        var me = this;
        me.callParent(arguments);
        if (me.line && !me.highlighted) {
            if (!('__strokeWidth' in me.line)) {
                me.line.__strokeWidth = me.line.attr['stroke-width'] || 0;
            }
            if (me.line.__anim) {
                me.line.__anim.paused = true;
            }
            me.line.__anim = Ext.create('Ext.fx.Anim', {
                target: me.line,
                to: {
                    'stroke-width': me.line.__strokeWidth + 3
                }
            });
            me.highlighted = true;
        }
    },

    //@private Overriding highlights.js unHighlightItem method.
    unHighlightItem: function() {
        var me = this;
        me.callParent(arguments);
        if (me.line && me.highlighted) {
            me.line.__anim = Ext.create('Ext.fx.Anim', {
                target: me.line,
                to: {
                    'stroke-width': me.line.__strokeWidth
                }
            });
            me.highlighted = false;
        }
    },

    //@private called when a callout needs to be placed.
    onPlaceCallout : function(callout, storeItem, item, i, display, animate, index) {
        if (!display) {
            return;
        }

        var me = this,
            chart = me.chart,
            surface = chart.surface,
            resizing = chart.resizing,
            config = me.callouts,
            items = me.items,
            prev = i == 0? false : items[i -1].point,
            next = (i == items.length -1)? false : items[i +1].point,
            cur = [+item.point[0], +item.point[1]],
            dir, norm, normal, a, aprev, anext,
            offsetFromViz = config.offsetFromViz || 30,
            offsetToSide = config.offsetToSide || 10,
            offsetBox = config.offsetBox || 3,
            boxx, boxy, boxw, boxh,
            p, clipRect = me.clipRect,
            bbox = {
                width: config.styles.width || 10,
                height: config.styles.height || 10
            },
            x, y;

        //get the right two points
        if (!prev) {
            prev = cur;
        }
        if (!next) {
            next = cur;
        }
        a = (next[1] - prev[1]) / (next[0] - prev[0]);
        aprev = (cur[1] - prev[1]) / (cur[0] - prev[0]);
        anext = (next[1] - cur[1]) / (next[0] - cur[0]);

        norm = Math.sqrt(1 + a * a);
        dir = [1 / norm, a / norm];
        normal = [-dir[1], dir[0]];

        //keep the label always on the outer part of the "elbow"
        if (aprev > 0 && anext < 0 && normal[1] < 0
            || aprev < 0 && anext > 0 && normal[1] > 0) {
            normal[0] *= -1;
            normal[1] *= -1;
        } else if (Math.abs(aprev) < Math.abs(anext) && normal[0] < 0
                   || Math.abs(aprev) > Math.abs(anext) && normal[0] > 0) {
            normal[0] *= -1;
            normal[1] *= -1;
        }
        //position
        x = cur[0] + normal[0] * offsetFromViz;
        y = cur[1] + normal[1] * offsetFromViz;

        //box position and dimensions
        boxx = x + (normal[0] > 0? 0 : -(bbox.width + 2 * offsetBox));
        boxy = y - bbox.height /2 - offsetBox;
        boxw = bbox.width + 2 * offsetBox;
        boxh = bbox.height + 2 * offsetBox;

        //now check if we're out of bounds and invert the normal vector correspondingly
        //this may add new overlaps between labels (but labels won't be out of bounds).
        if (boxx < clipRect[0] || (boxx + boxw) > (clipRect[0] + clipRect[2])) {
            normal[0] *= -1;
        }
        if (boxy < clipRect[1] || (boxy + boxh) > (clipRect[1] + clipRect[3])) {
            normal[1] *= -1;
        }

        //update positions
        x = cur[0] + normal[0] * offsetFromViz;
        y = cur[1] + normal[1] * offsetFromViz;

        //update box position and dimensions
        boxx = x + (normal[0] > 0? 0 : -(bbox.width + 2 * offsetBox));
        boxy = y - bbox.height /2 - offsetBox;
        boxw = bbox.width + 2 * offsetBox;
        boxh = bbox.height + 2 * offsetBox;

        if (chart.animate) {
            //set the line from the middle of the pie to the box.
            me.onAnimate(callout.lines, {
                to: {
                    path: ["M", cur[0], cur[1], "L", x, y, "Z"]
                }
            });
            //set component position
            if (callout.panel) {
                callout.panel.setPosition(boxx, boxy, true);
            }
        }
        else {
            //set the line from the middle of the pie to the box.
            callout.lines.setAttributes({
                path: ["M", cur[0], cur[1], "L", x, y, "Z"]
            }, true);
            //set component position
            if (callout.panel) {
                callout.panel.setPosition(boxx, boxy);
            }
        }
        for (p in callout) {
            callout[p].show(true);
        }
    },

    isItemInPoint: function(x, y, item, i) {
        var me = this,
            items = me.items,
            tolerance = me.selectionTolerance,
            result = null,
            prevItem,
            nextItem,
            prevPoint,
            nextPoint,
            ln,
            x1,
            y1,
            x2,
            y2,
            xIntersect,
            yIntersect,
            dist1, dist2, dist, midx, midy,
            sqrt = Math.sqrt, abs = Math.abs;

        nextItem = items[i];
        prevItem = i && items[i - 1];

        if (i >= ln) {
            prevItem = items[ln - 1];
        }
        prevPoint = prevItem && prevItem.point;
        nextPoint = nextItem && nextItem.point;
        x1 = prevItem ? prevPoint[0] : nextPoint[0] - tolerance;
        y1 = prevItem ? prevPoint[1] : nextPoint[1];
        x2 = nextItem ? nextPoint[0] : prevPoint[0] + tolerance;
        y2 = nextItem ? nextPoint[1] : prevPoint[1];
        dist1 = sqrt((x - x1) * (x - x1) + (y - y1) * (y - y1));
        dist2 = sqrt((x - x2) * (x - x2) + (y - y2) * (y - y2));
        dist = Math.min(dist1, dist2);

        if (dist <= tolerance) {
            return dist == dist1? prevItem : nextItem;
        }
        return false;
    },

    // @private toggle visibility of all series elements (markers, sprites).
    toggleAll: function(show) {
        var me = this,
            i, ln, shadow, shadows;
        if (!show) {
            Ext.chart.series.Cartesian.prototype.hideAll.call(me);
        }
        else {
            Ext.chart.series.Cartesian.prototype.showAll.call(me);
        }
        if (me.line) {
            me.line.setAttributes({
                hidden: !show
            }, true);
            //hide shadows too
            if (me.line.shadows) {
                for (i = 0, shadows = me.line.shadows, ln = shadows.length; i < ln; i++) {
                    shadow = shadows[i];
                    shadow.setAttributes({
                        hidden: !show
                    }, true);
                }
            }
        }
        if (me.fillPath) {
            me.fillPath.setAttributes({
                hidden: !show
            }, true);
        }
    },

    // @private hide all series elements (markers, sprites).
    hideAll: function() {
        this.toggleAll(false);
    },

    // @private hide all series elements (markers, sprites).
    showAll: function() {
        this.toggleAll(true);
    }
});

