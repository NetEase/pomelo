/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * Charts provide a flexible way to achieve a wide range of data visualization capablitities.
 * Each Chart gets its data directly from a {@link Ext.data.Store Store}, and automatically
 * updates its display whenever data in the Store changes. In addition, the look and feel
 * of a Chart can be customized using {@link Ext.chart.theme.Theme Theme}s.
 * 
 * ## Creating a Simple Chart
 * 
 * Every Chart has three key parts - a {@link Ext.data.Store Store} that contains the data,
 * an array of {@link Ext.chart.axis.Axis Axes} which define the boundaries of the Chart,
 * and one or more {@link Ext.chart.series.Series Series} to handle the visual rendering of the data points.
 * 
 * ### 1. Creating a Store
 * 
 * The first step is to create a {@link Ext.data.Model Model} that represents the type of
 * data that will be displayed in the Chart. For example the data for a chart that displays
 * a weather forecast could be represented as a series of "WeatherPoint" data points with
 * two fields - "temperature", and "date":
 * 
 *     Ext.define('WeatherPoint', {
 *         extend: 'Ext.data.Model',
 *         fields: ['temperature', 'date']
 *     });
 * 
 * Next a {@link Ext.data.Store Store} must be created.  The store contains a collection of "WeatherPoint" Model instances.
 * The data could be loaded dynamically, but for sake of ease this example uses inline data:
 * 
 *     var store = Ext.create('Ext.data.Store', {
 *         model: 'WeatherPoint',
 *         data: [
 *             { temperature: 58, date: new Date(2011, 1, 1, 8) },
 *             { temperature: 63, date: new Date(2011, 1, 1, 9) },
 *             { temperature: 73, date: new Date(2011, 1, 1, 10) },
 *             { temperature: 78, date: new Date(2011, 1, 1, 11) },
 *             { temperature: 81, date: new Date(2011, 1, 1, 12) }
 *         ]
 *     });
 *    
 * For additional information on Models and Stores please refer to the [Data Guide](#/guide/data).
 * 
 * ### 2. Creating the Chart object
 * 
 * Now that a Store has been created it can be used in a Chart:
 * 
 *     Ext.create('Ext.chart.Chart', {
 *        renderTo: Ext.getBody(),
 *        width: 400,
 *        height: 300,
 *        store: store
 *     });
 *    
 * That's all it takes to create a Chart instance that is backed by a Store.
 * However, if the above code is run in a browser, a blank screen will be displayed.
 * This is because the two pieces that are responsible for the visual display,
 * the Chart's {@link #cfg-axes axes} and {@link #cfg-series series}, have not yet been defined.
 * 
 * ### 3. Configuring the Axes
 * 
 * {@link Ext.chart.axis.Axis Axes} are the lines that define the boundaries of the data points that a Chart can display.
 * This example uses one of the most common Axes configurations - a horizontal "x" axis, and a vertical "y" axis:
 * 
 *     Ext.create('Ext.chart.Chart', {
 *         ...
 *         axes: [
 *             {
 *                 title: 'Temperature',
 *                 type: 'Numeric',
 *                 position: 'left',
 *                 fields: ['temperature'],
 *                 minimum: 0,
 *                 maximum: 100
 *             },
 *             {
 *                 title: 'Time',
 *                 type: 'Time',
 *                 position: 'bottom',
 *                 fields: ['date'],
 *                 dateFormat: 'ga'
 *             }
 *         ]
 *     });
 *    
 * The "Temperature" axis is a vertical {@link Ext.chart.axis.Numeric Numeric Axis} and is positioned on the left edge of the Chart.
 * It represents the bounds of the data contained in the "WeatherPoint" Model's "temperature" field that was
 * defined above. The minimum value for this axis is "0", and the maximum is "100".
 * 
 * The horizontal axis is a {@link Ext.chart.axis.Time Time Axis} and is positioned on the bottom edge of the Chart.
 * It represents the bounds of the data contained in the "WeatherPoint" Model's "date" field.
 * The {@link Ext.chart.axis.Time#cfg-dateFormat dateFormat}
 * configuration tells the Time Axis how to format it's labels.
 * 
 * Here's what the Chart looks like now that it has its Axes configured:
 * 
 * {@img Ext.chart.Chart/Ext.chart.Chart1.png Chart Axes}
 * 
 * ### 4. Configuring the Series
 * 
 * The final step in creating a simple Chart is to configure one or more {@link Ext.chart.series.Series Series}.
 * Series are responsible for the visual representation of the data points contained in the Store.
 * This example only has one Series:
 * 
 *     Ext.create('Ext.chart.Chart', {
 *         ...
 *         axes: [
 *             ...
 *         ],
 *         series: [
 *             {
 *                 type: 'line',
 *                 xField: 'date',
 *                 yField: 'temperature'
 *             }
 *         ]
 *     });
 *     
 * This Series is a {@link Ext.chart.series.Line Line Series}, and it uses the "date" and "temperature" fields
 * from the "WeatherPoint" Models in the Store to plot its data points:
 * 
 * {@img Ext.chart.Chart/Ext.chart.Chart2.png Line Series}
 * 
 * See the [Simple Chart Example](doc-resources/Ext.chart.Chart/examples/simple_chart/index.html) for a live demo.
 * 
 * ## Themes
 * 
 * The color scheme for a Chart can be easily changed using the {@link #cfg-theme theme} configuration option:
 * 
 *     Ext.create('Ext.chart.Chart', {
 *         ...
 *         theme: 'Green',
 *         ...
 *     });
 * 
 * {@img Ext.chart.Chart/Ext.chart.Chart3.png Green Theme}
 * 
 * For more information on Charts please refer to the [Drawing and Charting Guide](#/guide/drawing_and_charting).
 * 
 */
Ext.define('Ext.chart.Chart', {

    /* Begin Definitions */

    alias: 'widget.chart',

    extend: 'Ext.draw.Component',
    
    mixins: {
        themeManager: 'Ext.chart.theme.Theme',
        mask: 'Ext.chart.Mask',
        navigation: 'Ext.chart.Navigation'
    },

    requires: [
        'Ext.util.MixedCollection',
        'Ext.data.StoreManager',
        'Ext.chart.Legend',
        'Ext.util.DelayedTask'
    ],

    /* End Definitions */

    // @private
    viewBox: false,

    /**
     * @cfg {String} theme
     * The name of the theme to be used. A theme defines the colors and other visual displays of tick marks
     * on axis, text, title text, line colors, marker colors and styles, etc. Possible theme values are 'Base', 'Green',
     * 'Sky', 'Red', 'Purple', 'Blue', 'Yellow' and also six category themes 'Category1' to 'Category6'. Default value
     * is 'Base'.
     */

    /**
     * @cfg {Boolean/Object} animate
     * True for the default animation (easing: 'ease' and duration: 500) or a standard animation config
     * object to be used for default chart animations. Defaults to false.
     */
    animate: false,

    /**
     * @cfg {Boolean/Object} legend
     * True for the default legend display or a legend config object. Defaults to false.
     */
    legend: false,

    /**
     * @cfg {Number} insetPadding
     * The amount of inset padding in pixels for the chart. Defaults to 10.
     */
    insetPadding: 10,

    /**
     * @cfg {String[]} enginePriority
     * Defines the priority order for which Surface implementation to use. The first one supported by the current
     * environment will be used. Defaults to `['Svg', 'Vml']`.
     */
    enginePriority: ['Svg', 'Vml'],

    /**
     * @cfg {Object/Boolean} background
     * The chart background. This can be a gradient object, image, or color. Defaults to false for no
     * background. For example, if `background` were to be a color we could set the object as
     *
     *     background: {
     *         //color string
     *         fill: '#ccc'
     *     }
     *
     * You can specify an image by using:
     *
     *     background: {
     *         image: 'http://path.to.image/'
     *     }
     *
     * Also you can specify a gradient by using the gradient object syntax:
     *
     *     background: {
     *         gradient: {
     *             id: 'gradientId',
     *             angle: 45,
     *             stops: {
     *                 0: {
     *                     color: '#555'
     *                 }
     *                 100: {
     *                     color: '#ddd'
     *                 }
     *             }
     *         }
     *     }
     */
    background: false,

    /**
     * @cfg {Object[]} gradients
     * Define a set of gradients that can be used as `fill` property in sprites. The gradients array is an
     * array of objects with the following properties:
     *
     * - **id** - string - The unique name of the gradient.
     * - **angle** - number, optional - The angle of the gradient in degrees.
     * - **stops** - object - An object with numbers as keys (from 0 to 100) and style objects as values
     *
     * For example:
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

    /**
     * @cfg {Ext.data.Store} store
     * The store that supplies data to this chart.
     */

    /**
     * @cfg {Ext.chart.series.Series[]} series
     * Array of {@link Ext.chart.series.Series Series} instances or config objects.  For example:
     * 
     *     series: [{
     *         type: 'column',
     *         axis: 'left',
     *         listeners: {
     *             'afterrender': function() {
     *                 console('afterrender');
     *             }
     *         },
     *         xField: 'category',
     *         yField: 'data1'
     *     }]
     */

    /**
     * @cfg {Ext.chart.axis.Axis[]} axes
     * Array of {@link Ext.chart.axis.Axis Axis} instances or config objects.  For example:
     * 
     *     axes: [{
     *         type: 'Numeric',
     *         position: 'left',
     *         fields: ['data1'],
     *         title: 'Number of Hits',
     *         minimum: 0,
     *         //one minor tick between two major ticks
     *         minorTickSteps: 1
     *     }, {
     *         type: 'Category',
     *         position: 'bottom',
     *         fields: ['name'],
     *         title: 'Month of the Year'
     *     }]
     */

    constructor: function(config) {
        var me = this,
            defaultAnim;
            
        config = Ext.apply({}, config);
        me.initTheme(config.theme || me.theme);
        if (me.gradients) {
            Ext.apply(config, { gradients: me.gradients });
        }
        if (me.background) {
            Ext.apply(config, { background: me.background });
        }
        if (config.animate) {
            defaultAnim = {
                easing: 'ease',
                duration: 500
            };
            if (Ext.isObject(config.animate)) {
                config.animate = Ext.applyIf(config.animate, defaultAnim);
            }
            else {
                config.animate = defaultAnim;
            }
        }
        me.mixins.mask.constructor.call(me, config);
        me.mixins.navigation.constructor.call(me, config);
        me.callParent([config]);
    },
    
    getChartStore: function(){
        return this.substore || this.store;    
    },

    initComponent: function() {
        var me = this,
            axes,
            series;
        me.callParent();
        me.addEvents(
            'itemmousedown',
            'itemmouseup',
            'itemmouseover',
            'itemmouseout',
            'itemclick',
            'itemdoubleclick',
            'itemdragstart',
            'itemdrag',
            'itemdragend',
            /**
             * @event beforerefresh
             * Fires before a refresh to the chart data is called. If the beforerefresh handler returns false the
             * {@link #refresh} action will be cancelled.
             * @param {Ext.chart.Chart} this
             */
            'beforerefresh',
            /**
             * @event refresh
             * Fires after the chart data has been refreshed.
             * @param {Ext.chart.Chart} this
             */
            'refresh'
        );
        Ext.applyIf(me, {
            zoom: {
                width: 1,
                height: 1,
                x: 0,
                y: 0
            }
        });
        me.maxGutter = [0, 0];
        me.store = Ext.data.StoreManager.lookup(me.store);
        axes = me.axes;
        me.axes = Ext.create('Ext.util.MixedCollection', false, function(a) { return a.position; });
        if (axes) {
            me.axes.addAll(axes);
        }
        series = me.series;
        me.series = Ext.create('Ext.util.MixedCollection', false, function(a) { return a.seriesId || (a.seriesId = Ext.id(null, 'ext-chart-series-')); });
        if (series) {
            me.series.addAll(series);
        }
        if (me.legend !== false) {
            me.legend = Ext.create('Ext.chart.Legend', Ext.applyIf({chart:me}, me.legend));
        }

        me.on({
            mousemove: me.onMouseMove,
            mouseleave: me.onMouseLeave,
            mousedown: me.onMouseDown,
            mouseup: me.onMouseUp,
            scope: me
        });
    },

    // @private overrides the component method to set the correct dimensions to the chart.
    afterComponentLayout: function(width, height) {
        var me = this;
        if (Ext.isNumber(width) && Ext.isNumber(height)) {
            me.curWidth = width;
            me.curHeight = height;
            me.redraw(true);
        }
        this.callParent(arguments);
    },

    /**
     * Redraws the chart. If animations are set this will animate the chart too. 
     * @param {Boolean} resize (optional) flag which changes the default origin points of the chart for animations.
     */
    redraw: function(resize) {
        var me = this,
            chartBBox = me.chartBBox = {
                x: 0,
                y: 0,
                height: me.curHeight,
                width: me.curWidth
            },
            legend = me.legend;
        me.surface.setSize(chartBBox.width, chartBBox.height);
        // Instantiate Series and Axes
        me.series.each(me.initializeSeries, me);
        me.axes.each(me.initializeAxis, me);
        //process all views (aggregated data etc) on stores
        //before rendering.
        me.axes.each(function(axis) {
            axis.processView();
        });
        me.axes.each(function(axis) {
            axis.drawAxis(true);
        });

        // Create legend if not already created
        if (legend !== false) {
            legend.create();
        }

        // Place axes properly, including influence from each other
        me.alignAxes();

        // Reposition legend based on new axis alignment
        if (me.legend !== false) {
            legend.updatePosition();
        }

        // Find the max gutter
        me.getMaxGutter();

        // Draw axes and series
        me.resizing = !!resize;

        me.axes.each(me.drawAxis, me);
        me.series.each(me.drawCharts, me);
        me.resizing = false;
    },

    // @private set the store after rendering the chart.
    afterRender: function() {
        var ref,
            me = this;
        this.callParent();

        if (me.categoryNames) {
            me.setCategoryNames(me.categoryNames);
        }

        if (me.tipRenderer) {
            ref = me.getFunctionRef(me.tipRenderer);
            me.setTipRenderer(ref.fn, ref.scope);
        }
        me.bindStore(me.store, true);
        me.refresh();
    },

    // @private get x and y position of the mouse cursor.
    getEventXY: function(e) {
        var me = this,
            box = this.surface.getRegion(),
            pageXY = e.getXY(),
            x = pageXY[0] - box.left,
            y = pageXY[1] - box.top;
        return [x, y];
    },

    // @private wrap the mouse down position to delegate the event to the series.
    onClick: function(e) {
        var me = this,
            position = me.getEventXY(e),
            item;

        // Ask each series if it has an item corresponding to (not necessarily exactly
        // on top of) the current mouse coords. Fire itemclick event.
        me.series.each(function(series) {
            if (Ext.draw.Draw.withinBox(position[0], position[1], series.bbox)) {
                if (series.getItemForPoint) {
                    item = series.getItemForPoint(position[0], position[1]);
                    if (item) {
                        series.fireEvent('itemclick', item);
                    }
                }
            }
        }, me);
    },

    // @private wrap the mouse down position to delegate the event to the series.
    onMouseDown: function(e) {
        var me = this,
            position = me.getEventXY(e),
            item;

        if (me.mask) {
            me.mixins.mask.onMouseDown.call(me, e);
        }
        // Ask each series if it has an item corresponding to (not necessarily exactly
        // on top of) the current mouse coords. Fire mousedown event.
        me.series.each(function(series) {
            if (Ext.draw.Draw.withinBox(position[0], position[1], series.bbox)) {
                if (series.getItemForPoint) {
                    item = series.getItemForPoint(position[0], position[1]);
                    if (item) {
                        series.fireEvent('itemmousedown', item);
                    }
                }
            }
        }, me);
    },

    // @private wrap the mouse up event to delegate it to the series.
    onMouseUp: function(e) {
        var me = this,
            position = me.getEventXY(e),
            item;

        if (me.mask) {
            me.mixins.mask.onMouseUp.call(me, e);
        }
        // Ask each series if it has an item corresponding to (not necessarily exactly
        // on top of) the current mouse coords. Fire mousedown event.
        me.series.each(function(series) {
            if (Ext.draw.Draw.withinBox(position[0], position[1], series.bbox)) {
                if (series.getItemForPoint) {
                    item = series.getItemForPoint(position[0], position[1]);
                    if (item) {
                        series.fireEvent('itemmouseup', item);
                    }
                }
            }
        }, me);
    },

    // @private wrap the mouse move event so it can be delegated to the series.
    onMouseMove: function(e) {
        var me = this,
            position = me.getEventXY(e),
            item, last, storeItem, storeField;

        if (me.mask) {
            me.mixins.mask.onMouseMove.call(me, e);
        }
        // Ask each series if it has an item corresponding to (not necessarily exactly
        // on top of) the current mouse coords. Fire itemmouseover/out events.
        me.series.each(function(series) {
            if (Ext.draw.Draw.withinBox(position[0], position[1], series.bbox)) {
                if (series.getItemForPoint) {
                    item = series.getItemForPoint(position[0], position[1]);
                    last = series._lastItemForPoint;
                    storeItem = series._lastStoreItem;
                    storeField = series._lastStoreField;


                    if (item !== last || item && (item.storeItem != storeItem || item.storeField != storeField)) {
                        if (last) {
                            series.fireEvent('itemmouseout', last);
                            delete series._lastItemForPoint;
                            delete series._lastStoreField;
                            delete series._lastStoreItem;
                        }
                        if (item) {
                            series.fireEvent('itemmouseover', item);
                            series._lastItemForPoint = item;
                            series._lastStoreItem = item.storeItem;
                            series._lastStoreField = item.storeField;
                        }
                    }
                }
            } else {
                last = series._lastItemForPoint;
                if (last) {
                    series.fireEvent('itemmouseout', last);
                    delete series._lastItemForPoint;
                    delete series._lastStoreField;
                    delete series._lastStoreItem;
                }
            }
        }, me);
    },

    // @private handle mouse leave event.
    onMouseLeave: function(e) {
        var me = this;
        if (me.mask) {
            me.mixins.mask.onMouseLeave.call(me, e);
        }
        me.series.each(function(series) {
            delete series._lastItemForPoint;
        });
    },

    // @private buffered refresh for when we update the store
    delayRefresh: function() {
        var me = this;
        if (!me.refreshTask) {
            me.refreshTask = Ext.create('Ext.util.DelayedTask', me.refresh, me);
        }
        me.refreshTask.delay(me.refreshBuffer);
    },

    // @private
    refresh: function() {
        var me = this;
        if (me.rendered && me.curWidth !== undefined && me.curHeight !== undefined) {
            if (me.fireEvent('beforerefresh', me) !== false) {
                me.redraw();
                me.fireEvent('refresh', me);
            }
        }
    },

    /**
     * Changes the data store bound to this chart and refreshes it.
     * @param {Ext.data.Store} store The store to bind to this chart
     */
    bindStore: function(store, initial) {
        var me = this;
        if (!initial && me.store) {
            if (store !== me.store && me.store.autoDestroy) {
                me.store.destroyStore();
            }
            else {
                me.store.un('datachanged', me.refresh, me);
                me.store.un('add', me.delayRefresh, me);
                me.store.un('remove', me.delayRefresh, me);
                me.store.un('update', me.delayRefresh, me);
                me.store.un('clear', me.refresh, me);
            }
        }
        if (store) {
            store = Ext.data.StoreManager.lookup(store);
            store.on({
                scope: me,
                datachanged: me.refresh,
                add: me.delayRefresh,
                remove: me.delayRefresh,
                update: me.delayRefresh,
                clear: me.refresh
            });
        }
        me.store = store;
        if (store && !initial) {
            me.refresh();
        }
    },

    // @private Create Axis
    initializeAxis: function(axis) {
        var me = this,
            chartBBox = me.chartBBox,
            w = chartBBox.width,
            h = chartBBox.height,
            x = chartBBox.x,
            y = chartBBox.y,
            themeAttrs = me.themeAttrs,
            config = {
                chart: me
            };
        if (themeAttrs) {
            config.axisStyle = Ext.apply({}, themeAttrs.axis);
            config.axisLabelLeftStyle = Ext.apply({}, themeAttrs.axisLabelLeft);
            config.axisLabelRightStyle = Ext.apply({}, themeAttrs.axisLabelRight);
            config.axisLabelTopStyle = Ext.apply({}, themeAttrs.axisLabelTop);
            config.axisLabelBottomStyle = Ext.apply({}, themeAttrs.axisLabelBottom);
            config.axisTitleLeftStyle = Ext.apply({}, themeAttrs.axisTitleLeft);
            config.axisTitleRightStyle = Ext.apply({}, themeAttrs.axisTitleRight);
            config.axisTitleTopStyle = Ext.apply({}, themeAttrs.axisTitleTop);
            config.axisTitleBottomStyle = Ext.apply({}, themeAttrs.axisTitleBottom);
        }
        switch (axis.position) {
            case 'top':
                Ext.apply(config, {
                    length: w,
                    width: h,
                    x: x,
                    y: y
                });
            break;
            case 'bottom':
                Ext.apply(config, {
                    length: w,
                    width: h,
                    x: x,
                    y: h
                });
            break;
            case 'left':
                Ext.apply(config, {
                    length: h,
                    width: w,
                    x: x,
                    y: h
                });
            break;
            case 'right':
                Ext.apply(config, {
                    length: h,
                    width: w,
                    x: w,
                    y: h
                });
            break;
        }
        if (!axis.chart) {
            Ext.apply(config, axis);
            axis = me.axes.replace(Ext.createByAlias('axis.' + axis.type.toLowerCase(), config));
        }
        else {
            Ext.apply(axis, config);
        }
    },


    /**
     * @private Adjust the dimensions and positions of each axis and the chart body area after accounting
     * for the space taken up on each side by the axes and legend.
     */
    alignAxes: function() {
        var me = this,
            axes = me.axes,
            legend = me.legend,
            edges = ['top', 'right', 'bottom', 'left'],
            chartBBox,
            insetPadding = me.insetPadding,
            insets = {
                top: insetPadding,
                right: insetPadding,
                bottom: insetPadding,
                left: insetPadding
            };

        function getAxis(edge) {
            var i = axes.findIndex('position', edge);
            return (i < 0) ? null : axes.getAt(i);
        }

        // Find the space needed by axes and legend as a positive inset from each edge
        Ext.each(edges, function(edge) {
            var isVertical = (edge === 'left' || edge === 'right'),
                axis = getAxis(edge),
                bbox;

            // Add legend size if it's on this edge
            if (legend !== false) {
                if (legend.position === edge) {
                    bbox = legend.getBBox();
                    insets[edge] += (isVertical ? bbox.width : bbox.height) + insets[edge];
                }
            }

            // Add axis size if there's one on this edge only if it has been
            //drawn before.
            if (axis && axis.bbox) {
                bbox = axis.bbox;
                insets[edge] += (isVertical ? bbox.width : bbox.height);
            }
        });
        // Build the chart bbox based on the collected inset values
        chartBBox = {
            x: insets.left,
            y: insets.top,
            width: me.curWidth - insets.left - insets.right,
            height: me.curHeight - insets.top - insets.bottom
        };
        me.chartBBox = chartBBox;

        // Go back through each axis and set its length and position based on the
        // corresponding edge of the chartBBox
        axes.each(function(axis) {
            var pos = axis.position,
                isVertical = (pos === 'left' || pos === 'right');

            axis.x = (pos === 'right' ? chartBBox.x + chartBBox.width : chartBBox.x);
            axis.y = (pos === 'top' ? chartBBox.y : chartBBox.y + chartBBox.height);
            axis.width = (isVertical ? chartBBox.width : chartBBox.height);
            axis.length = (isVertical ? chartBBox.height : chartBBox.width);
        });
    },

    // @private initialize the series.
    initializeSeries: function(series, idx) {
        var me = this,
            themeAttrs = me.themeAttrs,
            seriesObj, markerObj, seriesThemes, st,
            markerThemes, colorArrayStyle = [],
            i = 0, l,
            config = {
                chart: me,
                seriesId: series.seriesId
            };
        if (themeAttrs) {
            seriesThemes = themeAttrs.seriesThemes;
            markerThemes = themeAttrs.markerThemes;
            seriesObj = Ext.apply({}, themeAttrs.series);
            markerObj = Ext.apply({}, themeAttrs.marker);
            config.seriesStyle = Ext.apply(seriesObj, seriesThemes[idx % seriesThemes.length]);
            config.seriesLabelStyle = Ext.apply({}, themeAttrs.seriesLabel);
            config.markerStyle = Ext.apply(markerObj, markerThemes[idx % markerThemes.length]);
            if (themeAttrs.colors) {
                config.colorArrayStyle = themeAttrs.colors;
            } else {
                colorArrayStyle = [];
                for (l = seriesThemes.length; i < l; i++) {
                    st = seriesThemes[i];
                    if (st.fill || st.stroke) {
                        colorArrayStyle.push(st.fill || st.stroke);
                    }
                }
                if (colorArrayStyle.length) {
                    config.colorArrayStyle = colorArrayStyle;
                }
            }
            config.seriesIdx = idx;
        }
        if (series instanceof Ext.chart.series.Series) {
            Ext.apply(series, config);
        } else {
            Ext.applyIf(config, series);
            series = me.series.replace(Ext.createByAlias('series.' + series.type.toLowerCase(), config));
        }
        if (series.initialize) {
            series.initialize();
        }
    },

    // @private
    getMaxGutter: function() {
        var me = this,
            maxGutter = [0, 0];
        me.series.each(function(s) {
            var gutter = s.getGutters && s.getGutters() || [0, 0];
            maxGutter[0] = Math.max(maxGutter[0], gutter[0]);
            maxGutter[1] = Math.max(maxGutter[1], gutter[1]);
        });
        me.maxGutter = maxGutter;
    },

    // @private draw axis.
    drawAxis: function(axis) {
        axis.drawAxis();
    },

    // @private draw series.
    drawCharts: function(series) {
        series.triggerafterrender = false;
        series.drawSeries();
        if (!this.animate) {
            series.fireEvent('afterrender');
        }
    },

    // @private remove gently.
    destroy: function() {
        Ext.destroy(this.surface);
        this.bindStore(null);
        this.callParent(arguments);
    }
});

