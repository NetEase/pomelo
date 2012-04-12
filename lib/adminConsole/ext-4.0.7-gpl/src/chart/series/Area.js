/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * @class Ext.chart.series.Area
 * @extends Ext.chart.series.Cartesian
 *
 * Creates a Stacked Area Chart. The stacked area chart is useful when displaying multiple aggregated layers of information.
 * As with all other series, the Area Series must be appended in the *series* Chart array configuration. See the Chart
 * documentation for more information. A typical configuration object for the area series could be:
 *
 *     @example
 *     var store = Ext.create('Ext.data.JsonStore', {
 *         fields: ['name', 'data1', 'data2', 'data3', 'data4', 'data5'],
 *         data: [
 *             { 'name': 'metric one',   'data1':10, 'data2':12, 'data3':14, 'data4':8,  'data5':13 },
 *             { 'name': 'metric two',   'data1':7,  'data2':8,  'data3':16, 'data4':10, 'data5':3  },
 *             { 'name': 'metric three', 'data1':5,  'data2':2,  'data3':14, 'data4':12, 'data5':7  },
 *             { 'name': 'metric four',  'data1':2,  'data2':14, 'data3':6,  'data4':1,  'data5':23 },
 *             { 'name': 'metric five',  'data1':27, 'data2':38, 'data3':36, 'data4':13, 'data5':33 }
 *         ]
 *     });
 *
 *     Ext.create('Ext.chart.Chart', {
 *         renderTo: Ext.getBody(),
 *         width: 500,
 *         height: 300,
 *         store: store,
 *         axes: [
 *             {
 *                 type: 'Numeric',
 *                 grid: true,
 *                 position: 'left',
 *                 fields: ['data1', 'data2', 'data3', 'data4', 'data5'],
 *                 title: 'Sample Values',
 *                 grid: {
 *                     odd: {
 *                         opacity: 1,
 *                         fill: '#ddd',
 *                         stroke: '#bbb',
 *                         'stroke-width': 1
 *                     }
 *                 },
 *                 minimum: 0,
 *                 adjustMinimumByMajorUnit: 0
 *             },
 *             {
 *                 type: 'Category',
 *                 position: 'bottom',
 *                 fields: ['name'],
 *                 title: 'Sample Metrics',
 *                 grid: true,
 *                 label: {
 *                     rotate: {
 *                         degrees: 315
 *                     }
 *                 }
 *             }
 *         ],
 *         series: [{
 *             type: 'area',
 *             highlight: false,
 *             axis: 'left',
 *             xField: 'name',
 *             yField: ['data1', 'data2', 'data3', 'data4', 'data5'],
 *             style: {
 *                 opacity: 0.93
 *             }
 *         }]
 *     });
 *
 * In this configuration we set `area` as the type for the series, set highlighting options to true for highlighting elements on hover,
 * take the left axis to measure the data in the area series, set as xField (x values) the name field of each element in the store,
 * and as yFields (aggregated layers) seven data fields from the same store. Then we override some theming styles by adding some opacity
 * to the style object.
 *
 * @xtype area
 */
Ext.define('Ext.chart.series.Area', {

    /* Begin Definitions */

    extend: 'Ext.chart.series.Cartesian',

    alias: 'series.area',

    requires: ['Ext.chart.axis.Axis', 'Ext.draw.Color', 'Ext.fx.Anim'],

    /* End Definitions */

    type: 'area',

    // @private Area charts are alyways stacked
    stacked: true,

    /**
     * @cfg {Object} style
     * Append styling properties to this object for it to override theme properties.
     */
    style: {},

    constructor: function(config) {
        this.callParent(arguments);
        var me = this,
            surface = me.chart.surface,
            i, l;
        Ext.apply(me, config, {
            __excludes: [],
            highlightCfg: {
                lineWidth: 3,
                stroke: '#55c',
                opacity: 0.8,
                color: '#f00'
            }
        });
        if (me.highlight) {
            me.highlightSprite = surface.add({
                type: 'path',
                path: ['M', 0, 0],
                zIndex: 1000,
                opacity: 0.3,
                lineWidth: 5,
                hidden: true,
                stroke: '#444'
            });
        }
        me.group = surface.getGroup(me.seriesId);
    },

    // @private Shrinks dataSets down to a smaller size
    shrink: function(xValues, yValues, size) {
        var len = xValues.length,
            ratio = Math.floor(len / size),
            i, j,
            xSum = 0,
            yCompLen = this.areas.length,
            ySum = [],
            xRes = [],
            yRes = [];
        //initialize array
        for (j = 0; j < yCompLen; ++j) {
            ySum[j] = 0;
        }
        for (i = 0; i < len; ++i) {
            xSum += xValues[i];
            for (j = 0; j < yCompLen; ++j) {
                ySum[j] += yValues[i][j];
            }
            if (i % ratio == 0) {
                //push averages
                xRes.push(xSum/ratio);
                for (j = 0; j < yCompLen; ++j) {
                    ySum[j] /= ratio;
                }
                yRes.push(ySum);
                //reset sum accumulators
                xSum = 0;
                for (j = 0, ySum = []; j < yCompLen; ++j) {
                    ySum[j] = 0;
                }
            }
        }
        return {
            x: xRes,
            y: yRes
        };
    },

    // @private Get chart and data boundaries
    getBounds: function() {
        var me = this,
            chart = me.chart,
            store = chart.getChartStore(),
            areas = [].concat(me.yField),
            areasLen = areas.length,
            xValues = [],
            yValues = [],
            infinity = Infinity,
            minX = infinity,
            minY = infinity,
            maxX = -infinity,
            maxY = -infinity,
            math = Math,
            mmin = math.min,
            mmax = math.max,
            bbox, xScale, yScale, xValue, yValue, areaIndex, acumY, ln, sumValues, clipBox, areaElem;

        me.setBBox();
        bbox = me.bbox;

        // Run through the axis
        if (me.axis) {
            axis = chart.axes.get(me.axis);
            if (axis) {
                out = axis.calcEnds();
                minY = out.from || axis.prevMin;
                maxY = mmax(out.to || axis.prevMax, 0);
            }
        }

        if (me.yField && !Ext.isNumber(minY)) {
            axis = Ext.create('Ext.chart.axis.Axis', {
                chart: chart,
                fields: [].concat(me.yField)
            });
            out = axis.calcEnds();
            minY = out.from || axis.prevMin;
            maxY = mmax(out.to || axis.prevMax, 0);
        }

        if (!Ext.isNumber(minY)) {
            minY = 0;
        }
        if (!Ext.isNumber(maxY)) {
            maxY = 0;
        }

        store.each(function(record, i) {
            xValue = record.get(me.xField);
            yValue = [];
            if (typeof xValue != 'number') {
                xValue = i;
            }
            xValues.push(xValue);
            acumY = 0;
            for (areaIndex = 0; areaIndex < areasLen; areaIndex++) {
                areaElem = record.get(areas[areaIndex]);
                if (typeof areaElem == 'number') {
                    minY = mmin(minY, areaElem);
                    yValue.push(areaElem);
                    acumY += areaElem;
                }
            }
            minX = mmin(minX, xValue);
            maxX = mmax(maxX, xValue);
            maxY = mmax(maxY, acumY);
            yValues.push(yValue);
        }, me);

        xScale = bbox.width / ((maxX - minX) || 1);
        yScale = bbox.height / ((maxY - minY) || 1);

        ln = xValues.length;
        if ((ln > bbox.width) && me.areas) {
            sumValues = me.shrink(xValues, yValues, bbox.width);
            xValues = sumValues.x;
            yValues = sumValues.y;
        }

        return {
            bbox: bbox,
            minX: minX,
            minY: minY,
            xValues: xValues,
            yValues: yValues,
            xScale: xScale,
            yScale: yScale,
            areasLen: areasLen
        };
    },

    // @private Build an array of paths for the chart
    getPaths: function() {
        var me = this,
            chart = me.chart,
            store = chart.getChartStore(),
            first = true,
            bounds = me.getBounds(),
            bbox = bounds.bbox,
            items = me.items = [],
            componentPaths = [],
            componentPath,
            paths = [],
            i, ln, x, y, xValue, yValue, acumY, areaIndex, prevAreaIndex, areaElem, path;

        ln = bounds.xValues.length;
        // Start the path
        for (i = 0; i < ln; i++) {
            xValue = bounds.xValues[i];
            yValue = bounds.yValues[i];
            x = bbox.x + (xValue - bounds.minX) * bounds.xScale;
            acumY = 0;
            for (areaIndex = 0; areaIndex < bounds.areasLen; areaIndex++) {
                // Excluded series
                if (me.__excludes[areaIndex]) {
                    continue;
                }
                if (!componentPaths[areaIndex]) {
                    componentPaths[areaIndex] = [];
                }
                areaElem = yValue[areaIndex];
                acumY += areaElem;
                y = bbox.y + bbox.height - (acumY - bounds.minY) * bounds.yScale;
                if (!paths[areaIndex]) {
                    paths[areaIndex] = ['M', x, y];
                    componentPaths[areaIndex].push(['L', x, y]);
                } else {
                    paths[areaIndex].push('L', x, y);
                    componentPaths[areaIndex].push(['L', x, y]);
                }
                if (!items[areaIndex]) {
                    items[areaIndex] = {
                        pointsUp: [],
                        pointsDown: [],
                        series: me
                    };
                }
                items[areaIndex].pointsUp.push([x, y]);
            }
        }

        // Close the paths
        for (areaIndex = 0; areaIndex < bounds.areasLen; areaIndex++) {
            // Excluded series
            if (me.__excludes[areaIndex]) {
                continue;
            }
            path = paths[areaIndex];
            // Close bottom path to the axis
            if (areaIndex == 0 || first) {
                first = false;
                path.push('L', x, bbox.y + bbox.height,
                          'L', bbox.x, bbox.y + bbox.height,
                          'Z');
            }
            // Close other paths to the one before them
            else {
                componentPath = componentPaths[prevAreaIndex];
                componentPath.reverse();
                path.push('L', x, componentPath[0][2]);
                for (i = 0; i < ln; i++) {
                    path.push(componentPath[i][0],
                              componentPath[i][1],
                              componentPath[i][2]);
                    items[areaIndex].pointsDown[ln -i -1] = [componentPath[i][1], componentPath[i][2]];
                }
                path.push('L', bbox.x, path[2], 'Z');
            }
            prevAreaIndex = areaIndex;
        }
        return {
            paths: paths,
            areasLen: bounds.areasLen
        };
    },

    /**
     * Draws the series for the current chart.
     */
    drawSeries: function() {
        var me = this,
            chart = me.chart,
            store = chart.getChartStore(),
            surface = chart.surface,
            animate = chart.animate,
            group = me.group,
            endLineStyle = Ext.apply(me.seriesStyle, me.style),
            colorArrayStyle = me.colorArrayStyle,
            colorArrayLength = colorArrayStyle && colorArrayStyle.length || 0,
            areaIndex, areaElem, paths, path, rendererAttributes;

        me.unHighlightItem();
        me.cleanHighlights();

        if (!store || !store.getCount()) {
            return;
        }

        paths = me.getPaths();

        if (!me.areas) {
            me.areas = [];
        }

        for (areaIndex = 0; areaIndex < paths.areasLen; areaIndex++) {
            // Excluded series
            if (me.__excludes[areaIndex]) {
                continue;
            }
            if (!me.areas[areaIndex]) {
                me.items[areaIndex].sprite = me.areas[areaIndex] = surface.add(Ext.apply({}, {
                    type: 'path',
                    group: group,
                    // 'clip-rect': me.clipBox,
                    path: paths.paths[areaIndex],
                    stroke: endLineStyle.stroke || colorArrayStyle[areaIndex % colorArrayLength],
                    fill: colorArrayStyle[areaIndex % colorArrayLength]
                }, endLineStyle || {}));
            }
            areaElem = me.areas[areaIndex];
            path = paths.paths[areaIndex];
            if (animate) {
                //Add renderer to line. There is not a unique record associated with this.
                rendererAttributes = me.renderer(areaElem, false, {
                    path: path,
                    // 'clip-rect': me.clipBox,
                    fill: colorArrayStyle[areaIndex % colorArrayLength],
                    stroke: endLineStyle.stroke || colorArrayStyle[areaIndex % colorArrayLength]
                }, areaIndex, store);
                //fill should not be used here but when drawing the special fill path object
                me.animation = me.onAnimate(areaElem, {
                    to: rendererAttributes
                });
            } else {
                rendererAttributes = me.renderer(areaElem, false, {
                    path: path,
                    // 'clip-rect': me.clipBox,
                    hidden: false,
                    fill: colorArrayStyle[areaIndex % colorArrayLength],
                    stroke: endLineStyle.stroke || colorArrayStyle[areaIndex % colorArrayLength]
                }, areaIndex, store);
                me.areas[areaIndex].setAttributes(rendererAttributes, true);
            }
        }
        me.renderLabels();
        me.renderCallouts();
    },

    // @private
    onAnimate: function(sprite, attr) {
        sprite.show();
        return this.callParent(arguments);
    },

    // @private
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

    // @private
    onPlaceLabel: function(label, storeItem, item, i, display, animate, index) {
        var me = this,
            chart = me.chart,
            resizing = chart.resizing,
            config = me.label,
            format = config.renderer,
            field = config.field,
            bbox = me.bbox,
            x = item.point[0],
            y = item.point[1],
            bb, width, height;

        label.setAttributes({
            text: format(storeItem.get(field[index])),
            hidden: true
        }, true);

        bb = label.getBBox();
        width = bb.width / 2;
        height = bb.height / 2;

        x = x - width < bbox.x? bbox.x + width : x;
        x = (x + width > bbox.x + bbox.width) ? (x - (x + width - bbox.x - bbox.width)) : x;
        y = y - height < bbox.y? bbox.y + height : y;
        y = (y + height > bbox.y + bbox.height) ? (y - (y + height - bbox.y - bbox.height)) : y;

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
            if (resizing) {
                me.animation.on('afteranimate', function() {
                    label.show(true);
                });
            } else {
                label.show(true);
            }
        }
    },

    // @private
    onPlaceCallout : function(callout, storeItem, item, i, display, animate, index) {
        var me = this,
            chart = me.chart,
            surface = chart.surface,
            resizing = chart.resizing,
            config = me.callouts,
            items = me.items,
            prev = (i == 0) ? false : items[i -1].point,
            next = (i == items.length -1) ? false : items[i +1].point,
            cur = item.point,
            dir, norm, normal, a, aprev, anext,
            bbox = callout.label.getBBox(),
            offsetFromViz = 30,
            offsetToSide = 10,
            offsetBox = 3,
            boxx, boxy, boxw, boxh,
            p, clipRect = me.clipRect,
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
        if (aprev > 0 && anext < 0 && normal[1] < 0 || aprev < 0 && anext > 0 && normal[1] > 0) {
            normal[0] *= -1;
            normal[1] *= -1;
        } else if (Math.abs(aprev) < Math.abs(anext) && normal[0] < 0 || Math.abs(aprev) > Math.abs(anext) && normal[0] > 0) {
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

        //set the line from the middle of the pie to the box.
        callout.lines.setAttributes({
            path: ["M", cur[0], cur[1], "L", x, y, "Z"]
        }, true);
        //set box position
        callout.box.setAttributes({
            x: boxx,
            y: boxy,
            width: boxw,
            height: boxh
        }, true);
        //set text position
        callout.label.setAttributes({
            x: x + (normal[0] > 0? offsetBox : -(bbox.width + offsetBox)),
            y: y
        }, true);
        for (p in callout) {
            callout[p].show(true);
        }
    },

    isItemInPoint: function(x, y, item, i) {
        var me = this,
            pointsUp = item.pointsUp,
            pointsDown = item.pointsDown,
            abs = Math.abs,
            dist = Infinity, p, pln, point;

        for (p = 0, pln = pointsUp.length; p < pln; p++) {
            point = [pointsUp[p][0], pointsUp[p][1]];
            if (dist > abs(x - point[0])) {
                dist = abs(x - point[0]);
            } else {
                point = pointsUp[p -1];
                if (y >= point[1] && (!pointsDown.length || y <= (pointsDown[p -1][1]))) {
                    item.storeIndex = p -1;
                    item.storeField = me.yField[i];
                    item.storeItem = me.chart.store.getAt(p -1);
                    item._points = pointsDown.length? [point, pointsDown[p -1]] : [point];
                    return true;
                } else {
                    break;
                }
            }
        }
        return false;
    },

    /**
     * Highlight this entire series.
     * @param {Object} item Info about the item; same format as returned by #getItemForPoint.
     */
    highlightSeries: function() {
        var area, to, fillColor;
        if (this._index !== undefined) {
            area = this.areas[this._index];
            if (area.__highlightAnim) {
                area.__highlightAnim.paused = true;
            }
            area.__highlighted = true;
            area.__prevOpacity = area.__prevOpacity || area.attr.opacity || 1;
            area.__prevFill = area.__prevFill || area.attr.fill;
            area.__prevLineWidth = area.__prevLineWidth || area.attr.lineWidth;
            fillColor = Ext.draw.Color.fromString(area.__prevFill);
            to = {
                lineWidth: (area.__prevLineWidth || 0) + 2
            };
            if (fillColor) {
                to.fill = fillColor.getLighter(0.2).toString();
            }
            else {
                to.opacity = Math.max(area.__prevOpacity - 0.3, 0);
            }
            if (this.chart.animate) {
                area.__highlightAnim = Ext.create('Ext.fx.Anim', Ext.apply({
                    target: area,
                    to: to
                }, this.chart.animate));
            }
            else {
                area.setAttributes(to, true);
            }
        }
    },

    /**
     * UnHighlight this entire series.
     * @param {Object} item Info about the item; same format as returned by #getItemForPoint.
     */
    unHighlightSeries: function() {
        var area;
        if (this._index !== undefined) {
            area = this.areas[this._index];
            if (area.__highlightAnim) {
                area.__highlightAnim.paused = true;
            }
            if (area.__highlighted) {
                area.__highlighted = false;
                area.__highlightAnim = Ext.create('Ext.fx.Anim', {
                    target: area,
                    to: {
                        fill: area.__prevFill,
                        opacity: area.__prevOpacity,
                        lineWidth: area.__prevLineWidth
                    }
                });
            }
        }
    },

    /**
     * Highlight the specified item. If no item is provided the whole series will be highlighted.
     * @param item {Object} Info about the item; same format as returned by #getItemForPoint
     */
    highlightItem: function(item) {
        var me = this,
            points, path;
        if (!item) {
            this.highlightSeries();
            return;
        }
        points = item._points;
        path = points.length == 2? ['M', points[0][0], points[0][1], 'L', points[1][0], points[1][1]]
                : ['M', points[0][0], points[0][1], 'L', points[0][0], me.bbox.y + me.bbox.height];
        me.highlightSprite.setAttributes({
            path: path,
            hidden: false
        }, true);
    },

    /**
     * Un-highlights the specified item. If no item is provided it will un-highlight the entire series.
     * @param {Object} item Info about the item; same format as returned by #getItemForPoint
     */
    unHighlightItem: function(item) {
        if (!item) {
            this.unHighlightSeries();
        }

        if (this.highlightSprite) {
            this.highlightSprite.hide(true);
        }
    },

    // @private
    hideAll: function() {
        if (!isNaN(this._index)) {
            this.__excludes[this._index] = true;
            this.areas[this._index].hide(true);
            this.drawSeries();
        }
    },

    // @private
    showAll: function() {
        if (!isNaN(this._index)) {
            this.__excludes[this._index] = false;
            this.areas[this._index].show(true);
            this.drawSeries();
        }
    },

    /**
     * Returns the color of the series (to be displayed as color for the series legend item).
     * @param item {Object} Info about the item; same format as returned by #getItemForPoint
     */
    getLegendColor: function(index) {
        var me = this;
        return me.colorArrayStyle[index % me.colorArrayStyle.length];
    }
});
/**
 * @class Ext.chart.series.Area
 * @extends Ext.chart.series.Cartesian
 *
 * Creates a Stacked Area Chart. The stacked area chart is useful when displaying multiple aggregated layers of information.
 * As with all other series, the Area Series must be appended in the *series* Chart array configuration. See the Chart
 * documentation for more information. A typical configuration object for the area series could be:
 *
 *     @example
 *     var store = Ext.create('Ext.data.JsonStore', {
 *         fields: ['name', 'data1', 'data2', 'data3', 'data4', 'data5'],
 *         data: [
 *             { 'name': 'metric one',   'data1':10, 'data2':12, 'data3':14, 'data4':8,  'data5':13 },
 *             { 'name': 'metric two',   'data1':7,  'data2':8,  'data3':16, 'data4':10, 'data5':3  },
 *             { 'name': 'metric three', 'data1':5,  'data2':2,  'data3':14, 'data4':12, 'data5':7  },
 *             { 'name': 'metric four',  'data1':2,  'data2':14, 'data3':6,  'data4':1,  'data5':23 },
 *             { 'name': 'metric five',  'data1':27, 'data2':38, 'data3':36, 'data4':13, 'data5':33 }
 *         ]
 *     });
 *
 *     Ext.create('Ext.chart.Chart', {
 *         renderTo: Ext.getBody(),
 *         width: 500,
 *         height: 300,
 *         store: store,
 *         axes: [
 *             {
 *                 type: 'Numeric',
 *                 grid: true,
 *                 position: 'left',
 *                 fields: ['data1', 'data2', 'data3', 'data4', 'data5'],
 *                 title: 'Sample Values',
 *                 grid: {
 *                     odd: {
 *                         opacity: 1,
 *                         fill: '#ddd',
 *                         stroke: '#bbb',
 *                         'stroke-width': 1
 *                     }
 *                 },
 *                 minimum: 0,
 *                 adjustMinimumByMajorUnit: 0
 *             },
 *             {
 *                 type: 'Category',
 *                 position: 'bottom',
 *                 fields: ['name'],
 *                 title: 'Sample Metrics',
 *                 grid: true,
 *                 label: {
 *                     rotate: {
 *                         degrees: 315
 *                     }
 *                 }
 *             }
 *         ],
 *         series: [{
 *             type: 'area',
 *             highlight: false,
 *             axis: 'left',
 *             xField: 'name',
 *             yField: ['data1', 'data2', 'data3', 'data4', 'data5'],
 *             style: {
 *                 opacity: 0.93
 *             }
 *         }]
 *     });
 *
 * In this configuration we set `area` as the type for the series, set highlighting options to true for highlighting elements on hover,
 * take the left axis to measure the data in the area series, set as xField (x values) the name field of each element in the store,
 * and as yFields (aggregated layers) seven data fields from the same store. Then we override some theming styles by adding some opacity
 * to the style object.
 *
 * @xtype area
 */
Ext.define('Ext.chart.series.Area', {

    /* Begin Definitions */

    extend: 'Ext.chart.series.Cartesian',

    alias: 'series.area',

    requires: ['Ext.chart.axis.Axis', 'Ext.draw.Color', 'Ext.fx.Anim'],

    /* End Definitions */

    type: 'area',

    // @private Area charts are alyways stacked
    stacked: true,

    /**
     * @cfg {Object} style
     * Append styling properties to this object for it to override theme properties.
     */
    style: {},

    constructor: function(config) {
        this.callParent(arguments);
        var me = this,
            surface = me.chart.surface,
            i, l;
        Ext.apply(me, config, {
            __excludes: [],
            highlightCfg: {
                lineWidth: 3,
                stroke: '#55c',
                opacity: 0.8,
                color: '#f00'
            }
        });
        if (me.highlight) {
            me.highlightSprite = surface.add({
                type: 'path',
                path: ['M', 0, 0],
                zIndex: 1000,
                opacity: 0.3,
                lineWidth: 5,
                hidden: true,
                stroke: '#444'
            });
        }
        me.group = surface.getGroup(me.seriesId);
    },

    // @private Shrinks dataSets down to a smaller size
    shrink: function(xValues, yValues, size) {
        var len = xValues.length,
            ratio = Math.floor(len / size),
            i, j,
            xSum = 0,
            yCompLen = this.areas.length,
            ySum = [],
            xRes = [],
            yRes = [];
        //initialize array
        for (j = 0; j < yCompLen; ++j) {
            ySum[j] = 0;
        }
        for (i = 0; i < len; ++i) {
            xSum += xValues[i];
            for (j = 0; j < yCompLen; ++j) {
                ySum[j] += yValues[i][j];
            }
            if (i % ratio == 0) {
                //push averages
                xRes.push(xSum/ratio);
                for (j = 0; j < yCompLen; ++j) {
                    ySum[j] /= ratio;
                }
                yRes.push(ySum);
                //reset sum accumulators
                xSum = 0;
                for (j = 0, ySum = []; j < yCompLen; ++j) {
                    ySum[j] = 0;
                }
            }
        }
        return {
            x: xRes,
            y: yRes
        };
    },

    // @private Get chart and data boundaries
    getBounds: function() {
        var me = this,
            chart = me.chart,
            store = chart.getChartStore(),
            areas = [].concat(me.yField),
            areasLen = areas.length,
            xValues = [],
            yValues = [],
            infinity = Infinity,
            minX = infinity,
            minY = infinity,
            maxX = -infinity,
            maxY = -infinity,
            math = Math,
            mmin = math.min,
            mmax = math.max,
            bbox, xScale, yScale, xValue, yValue, areaIndex, acumY, ln, sumValues, clipBox, areaElem;

        me.setBBox();
        bbox = me.bbox;

        // Run through the axis
        if (me.axis) {
            axis = chart.axes.get(me.axis);
            if (axis) {
                out = axis.calcEnds();
                minY = out.from || axis.prevMin;
                maxY = mmax(out.to || axis.prevMax, 0);
            }
        }

        if (me.yField && !Ext.isNumber(minY)) {
            axis = Ext.create('Ext.chart.axis.Axis', {
                chart: chart,
                fields: [].concat(me.yField)
            });
            out = axis.calcEnds();
            minY = out.from || axis.prevMin;
            maxY = mmax(out.to || axis.prevMax, 0);
        }

        if (!Ext.isNumber(minY)) {
            minY = 0;
        }
        if (!Ext.isNumber(maxY)) {
            maxY = 0;
        }

        store.each(function(record, i) {
            xValue = record.get(me.xField);
            yValue = [];
            if (typeof xValue != 'number') {
                xValue = i;
            }
            xValues.push(xValue);
            acumY = 0;
            for (areaIndex = 0; areaIndex < areasLen; areaIndex++) {
                areaElem = record.get(areas[areaIndex]);
                if (typeof areaElem == 'number') {
                    minY = mmin(minY, areaElem);
                    yValue.push(areaElem);
                    acumY += areaElem;
                }
            }
            minX = mmin(minX, xValue);
            maxX = mmax(maxX, xValue);
            maxY = mmax(maxY, acumY);
            yValues.push(yValue);
        }, me);

        xScale = bbox.width / ((maxX - minX) || 1);
        yScale = bbox.height / ((maxY - minY) || 1);

        ln = xValues.length;
        if ((ln > bbox.width) && me.areas) {
            sumValues = me.shrink(xValues, yValues, bbox.width);
            xValues = sumValues.x;
            yValues = sumValues.y;
        }

        return {
            bbox: bbox,
            minX: minX,
            minY: minY,
            xValues: xValues,
            yValues: yValues,
            xScale: xScale,
            yScale: yScale,
            areasLen: areasLen
        };
    },

    // @private Build an array of paths for the chart
    getPaths: function() {
        var me = this,
            chart = me.chart,
            store = chart.getChartStore(),
            first = true,
            bounds = me.getBounds(),
            bbox = bounds.bbox,
            items = me.items = [],
            componentPaths = [],
            componentPath,
            paths = [],
            i, ln, x, y, xValue, yValue, acumY, areaIndex, prevAreaIndex, areaElem, path;

        ln = bounds.xValues.length;
        // Start the path
        for (i = 0; i < ln; i++) {
            xValue = bounds.xValues[i];
            yValue = bounds.yValues[i];
            x = bbox.x + (xValue - bounds.minX) * bounds.xScale;
            acumY = 0;
            for (areaIndex = 0; areaIndex < bounds.areasLen; areaIndex++) {
                // Excluded series
                if (me.__excludes[areaIndex]) {
                    continue;
                }
                if (!componentPaths[areaIndex]) {
                    componentPaths[areaIndex] = [];
                }
                areaElem = yValue[areaIndex];
                acumY += areaElem;
                y = bbox.y + bbox.height - (acumY - bounds.minY) * bounds.yScale;
                if (!paths[areaIndex]) {
                    paths[areaIndex] = ['M', x, y];
                    componentPaths[areaIndex].push(['L', x, y]);
                } else {
                    paths[areaIndex].push('L', x, y);
                    componentPaths[areaIndex].push(['L', x, y]);
                }
                if (!items[areaIndex]) {
                    items[areaIndex] = {
                        pointsUp: [],
                        pointsDown: [],
                        series: me
                    };
                }
                items[areaIndex].pointsUp.push([x, y]);
            }
        }

        // Close the paths
        for (areaIndex = 0; areaIndex < bounds.areasLen; areaIndex++) {
            // Excluded series
            if (me.__excludes[areaIndex]) {
                continue;
            }
            path = paths[areaIndex];
            // Close bottom path to the axis
            if (areaIndex == 0 || first) {
                first = false;
                path.push('L', x, bbox.y + bbox.height,
                          'L', bbox.x, bbox.y + bbox.height,
                          'Z');
            }
            // Close other paths to the one before them
            else {
                componentPath = componentPaths[prevAreaIndex];
                componentPath.reverse();
                path.push('L', x, componentPath[0][2]);
                for (i = 0; i < ln; i++) {
                    path.push(componentPath[i][0],
                              componentPath[i][1],
                              componentPath[i][2]);
                    items[areaIndex].pointsDown[ln -i -1] = [componentPath[i][1], componentPath[i][2]];
                }
                path.push('L', bbox.x, path[2], 'Z');
            }
            prevAreaIndex = areaIndex;
        }
        return {
            paths: paths,
            areasLen: bounds.areasLen
        };
    },

    /**
     * Draws the series for the current chart.
     */
    drawSeries: function() {
        var me = this,
            chart = me.chart,
            store = chart.getChartStore(),
            surface = chart.surface,
            animate = chart.animate,
            group = me.group,
            endLineStyle = Ext.apply(me.seriesStyle, me.style),
            colorArrayStyle = me.colorArrayStyle,
            colorArrayLength = colorArrayStyle && colorArrayStyle.length || 0,
            areaIndex, areaElem, paths, path, rendererAttributes;

        me.unHighlightItem();
        me.cleanHighlights();

        if (!store || !store.getCount()) {
            return;
        }

        paths = me.getPaths();

        if (!me.areas) {
            me.areas = [];
        }

        for (areaIndex = 0; areaIndex < paths.areasLen; areaIndex++) {
            // Excluded series
            if (me.__excludes[areaIndex]) {
                continue;
            }
            if (!me.areas[areaIndex]) {
                me.items[areaIndex].sprite = me.areas[areaIndex] = surface.add(Ext.apply({}, {
                    type: 'path',
                    group: group,
                    // 'clip-rect': me.clipBox,
                    path: paths.paths[areaIndex],
                    stroke: endLineStyle.stroke || colorArrayStyle[areaIndex % colorArrayLength],
                    fill: colorArrayStyle[areaIndex % colorArrayLength]
                }, endLineStyle || {}));
            }
            areaElem = me.areas[areaIndex];
            path = paths.paths[areaIndex];
            if (animate) {
                //Add renderer to line. There is not a unique record associated with this.
                rendererAttributes = me.renderer(areaElem, false, {
                    path: path,
                    // 'clip-rect': me.clipBox,
                    fill: colorArrayStyle[areaIndex % colorArrayLength],
                    stroke: endLineStyle.stroke || colorArrayStyle[areaIndex % colorArrayLength]
                }, areaIndex, store);
                //fill should not be used here but when drawing the special fill path object
                me.animation = me.onAnimate(areaElem, {
                    to: rendererAttributes
                });
            } else {
                rendererAttributes = me.renderer(areaElem, false, {
                    path: path,
                    // 'clip-rect': me.clipBox,
                    hidden: false,
                    fill: colorArrayStyle[areaIndex % colorArrayLength],
                    stroke: endLineStyle.stroke || colorArrayStyle[areaIndex % colorArrayLength]
                }, areaIndex, store);
                me.areas[areaIndex].setAttributes(rendererAttributes, true);
            }
        }
        me.renderLabels();
        me.renderCallouts();
    },

    // @private
    onAnimate: function(sprite, attr) {
        sprite.show();
        return this.callParent(arguments);
    },

    // @private
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

    // @private
    onPlaceLabel: function(label, storeItem, item, i, display, animate, index) {
        var me = this,
            chart = me.chart,
            resizing = chart.resizing,
            config = me.label,
            format = config.renderer,
            field = config.field,
            bbox = me.bbox,
            x = item.point[0],
            y = item.point[1],
            bb, width, height;

        label.setAttributes({
            text: format(storeItem.get(field[index])),
            hidden: true
        }, true);

        bb = label.getBBox();
        width = bb.width / 2;
        height = bb.height / 2;

        x = x - width < bbox.x? bbox.x + width : x;
        x = (x + width > bbox.x + bbox.width) ? (x - (x + width - bbox.x - bbox.width)) : x;
        y = y - height < bbox.y? bbox.y + height : y;
        y = (y + height > bbox.y + bbox.height) ? (y - (y + height - bbox.y - bbox.height)) : y;

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
            if (resizing) {
                me.animation.on('afteranimate', function() {
                    label.show(true);
                });
            } else {
                label.show(true);
            }
        }
    },

    // @private
    onPlaceCallout : function(callout, storeItem, item, i, display, animate, index) {
        var me = this,
            chart = me.chart,
            surface = chart.surface,
            resizing = chart.resizing,
            config = me.callouts,
            items = me.items,
            prev = (i == 0) ? false : items[i -1].point,
            next = (i == items.length -1) ? false : items[i +1].point,
            cur = item.point,
            dir, norm, normal, a, aprev, anext,
            bbox = callout.label.getBBox(),
            offsetFromViz = 30,
            offsetToSide = 10,
            offsetBox = 3,
            boxx, boxy, boxw, boxh,
            p, clipRect = me.clipRect,
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
        if (aprev > 0 && anext < 0 && normal[1] < 0 || aprev < 0 && anext > 0 && normal[1] > 0) {
            normal[0] *= -1;
            normal[1] *= -1;
        } else if (Math.abs(aprev) < Math.abs(anext) && normal[0] < 0 || Math.abs(aprev) > Math.abs(anext) && normal[0] > 0) {
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

        //set the line from the middle of the pie to the box.
        callout.lines.setAttributes({
            path: ["M", cur[0], cur[1], "L", x, y, "Z"]
        }, true);
        //set box position
        callout.box.setAttributes({
            x: boxx,
            y: boxy,
            width: boxw,
            height: boxh
        }, true);
        //set text position
        callout.label.setAttributes({
            x: x + (normal[0] > 0? offsetBox : -(bbox.width + offsetBox)),
            y: y
        }, true);
        for (p in callout) {
            callout[p].show(true);
        }
    },

    isItemInPoint: function(x, y, item, i) {
        var me = this,
            pointsUp = item.pointsUp,
            pointsDown = item.pointsDown,
            abs = Math.abs,
            dist = Infinity, p, pln, point;

        for (p = 0, pln = pointsUp.length; p < pln; p++) {
            point = [pointsUp[p][0], pointsUp[p][1]];
            if (dist > abs(x - point[0])) {
                dist = abs(x - point[0]);
            } else {
                point = pointsUp[p -1];
                if (y >= point[1] && (!pointsDown.length || y <= (pointsDown[p -1][1]))) {
                    item.storeIndex = p -1;
                    item.storeField = me.yField[i];
                    item.storeItem = me.chart.store.getAt(p -1);
                    item._points = pointsDown.length? [point, pointsDown[p -1]] : [point];
                    return true;
                } else {
                    break;
                }
            }
        }
        return false;
    },

    /**
     * Highlight this entire series.
     * @param {Object} item Info about the item; same format as returned by #getItemForPoint.
     */
    highlightSeries: function() {
        var area, to, fillColor;
        if (this._index !== undefined) {
            area = this.areas[this._index];
            if (area.__highlightAnim) {
                area.__highlightAnim.paused = true;
            }
            area.__highlighted = true;
            area.__prevOpacity = area.__prevOpacity || area.attr.opacity || 1;
            area.__prevFill = area.__prevFill || area.attr.fill;
            area.__prevLineWidth = area.__prevLineWidth || area.attr.lineWidth;
            fillColor = Ext.draw.Color.fromString(area.__prevFill);
            to = {
                lineWidth: (area.__prevLineWidth || 0) + 2
            };
            if (fillColor) {
                to.fill = fillColor.getLighter(0.2).toString();
            }
            else {
                to.opacity = Math.max(area.__prevOpacity - 0.3, 0);
            }
            if (this.chart.animate) {
                area.__highlightAnim = Ext.create('Ext.fx.Anim', Ext.apply({
                    target: area,
                    to: to
                }, this.chart.animate));
            }
            else {
                area.setAttributes(to, true);
            }
        }
    },

    /**
     * UnHighlight this entire series.
     * @param {Object} item Info about the item; same format as returned by #getItemForPoint.
     */
    unHighlightSeries: function() {
        var area;
        if (this._index !== undefined) {
            area = this.areas[this._index];
            if (area.__highlightAnim) {
                area.__highlightAnim.paused = true;
            }
            if (area.__highlighted) {
                area.__highlighted = false;
                area.__highlightAnim = Ext.create('Ext.fx.Anim', {
                    target: area,
                    to: {
                        fill: area.__prevFill,
                        opacity: area.__prevOpacity,
                        lineWidth: area.__prevLineWidth
                    }
                });
            }
        }
    },

    /**
     * Highlight the specified item. If no item is provided the whole series will be highlighted.
     * @param item {Object} Info about the item; same format as returned by #getItemForPoint
     */
    highlightItem: function(item) {
        var me = this,
            points, path;
        if (!item) {
            this.highlightSeries();
            return;
        }
        points = item._points;
        path = points.length == 2? ['M', points[0][0], points[0][1], 'L', points[1][0], points[1][1]]
                : ['M', points[0][0], points[0][1], 'L', points[0][0], me.bbox.y + me.bbox.height];
        me.highlightSprite.setAttributes({
            path: path,
            hidden: false
        }, true);
    },

    /**
     * un-highlights the specified item. If no item is provided it will un-highlight the entire series.
     * @param item {Object} Info about the item; same format as returned by #getItemForPoint
     */
    unHighlightItem: function(item) {
        if (!item) {
            this.unHighlightSeries();
        }

        if (this.highlightSprite) {
            this.highlightSprite.hide(true);
        }
    },

    // @private
    hideAll: function() {
        if (!isNaN(this._index)) {
            this.__excludes[this._index] = true;
            this.areas[this._index].hide(true);
            this.drawSeries();
        }
    },

    // @private
    showAll: function() {
        if (!isNaN(this._index)) {
            this.__excludes[this._index] = false;
            this.areas[this._index].show(true);
            this.drawSeries();
        }
    },

    /**
     * Returns the color of the series (to be displayed as color for the series legend item).
     * @param item {Object} Info about the item; same format as returned by #getItemForPoint
     */
    getLegendColor: function(index) {
        var me = this;
        return me.colorArrayStyle[index % me.colorArrayStyle.length];
    }
});

