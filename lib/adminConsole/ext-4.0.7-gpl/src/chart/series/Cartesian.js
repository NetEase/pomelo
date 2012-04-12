/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * @class Ext.chart.series.Cartesian
 * @extends Ext.chart.series.Series
 *
 * Common base class for series implementations which plot values using x/y coordinates.
 */
Ext.define('Ext.chart.series.Cartesian', {

    /* Begin Definitions */

    extend: 'Ext.chart.series.Series',

    alternateClassName: ['Ext.chart.CartesianSeries', 'Ext.chart.CartesianChart'],

    /* End Definitions */

    /**
     * The field used to access the x axis value from the items from the data
     * source.
     *
     * @cfg xField
     * @type String
     */
    xField: null,

    /**
     * The field used to access the y-axis value from the items from the data
     * source.
     *
     * @cfg yField
     * @type String
     */
    yField: null,

    /**
     * @cfg {String} axis
     * The position of the axis to bind the values to. Possible values are 'left', 'bottom', 'top' and 'right'.
     * You must explicitly set this value to bind the values of the line series to the ones in the axis, otherwise a
     * relative scale will be used.
     */
    axis: 'left',

    getLegendLabels: function() {
        var me = this,
            labels = [],
            combinations = me.combinations;

        Ext.each([].concat(me.yField), function(yField, i) {
            var title = me.title;
            // Use the 'title' config if present, otherwise use the raw yField name
            labels.push((Ext.isArray(title) ? title[i] : title) || yField);
        });

        // Handle yFields combined via legend drag-drop
        if (combinations) {
            Ext.each(combinations, function(combo) {
                var label0 = labels[combo[0]],
                    label1 = labels[combo[1]];
                labels[combo[1]] = label0 + ' & ' + label1;
                labels.splice(combo[0], 1);
            });
        }

        return labels;
    },

    /**
     * @protected Iterates over a given record's values for each of this series's yFields,
     * executing a given function for each value. Any yFields that have been combined
     * via legend drag-drop will be treated as a single value.
     * @param {Ext.data.Model} record
     * @param {Function} fn
     * @param {Object} scope
     */
    eachYValue: function(record, fn, scope) {
        Ext.each(this.getYValueAccessors(), function(accessor, i) {
            fn.call(scope, accessor(record), i);
        });
    },

    /**
     * @protected Returns the number of yField values, taking into account fields combined
     * via legend drag-drop.
     * @return {Number}
     */
    getYValueCount: function() {
        return this.getYValueAccessors().length;
    },

    combine: function(index1, index2) {
        var me = this,
            accessors = me.getYValueAccessors(),
            accessor1 = accessors[index1],
            accessor2 = accessors[index2];

        // Combine the yValue accessors for the two indexes into a single accessor that returns their sum
        accessors[index2] = function(record) {
            return accessor1(record) + accessor2(record);
        };
        accessors.splice(index1, 1);

        me.callParent([index1, index2]);
    },

    clearCombinations: function() {
        // Clear combined accessors, they'll get regenerated on next call to getYValueAccessors
        delete this.yValueAccessors;
        this.callParent();
    },

    /**
     * @protected Returns an array of functions, each of which returns the value of the yField
     * corresponding to function's index in the array, for a given record (each function takes the
     * record as its only argument.) If yFields have been combined by the user via legend drag-drop,
     * this list of accessors will be kept in sync with those combinations.
     * @return {Array} array of accessor functions
     */
    getYValueAccessors: function() {
        var me = this,
            accessors = me.yValueAccessors;
        if (!accessors) {
            accessors = me.yValueAccessors = [];
            Ext.each([].concat(me.yField), function(yField) {
                accessors.push(function(record) {
                    return record.get(yField);
                });
            });
        }
        return accessors;
    },

    /**
     * Calculate the min and max values for this series's xField.
     * @return {Array} [min, max]
     */
    getMinMaxXValues: function() {
        var me = this,
            min, max,
            xField = me.xField;

        if (me.getRecordCount() > 0) {
            min = Infinity;
            max = -min;
            me.eachRecord(function(record) {
                var xValue = record.get(xField);
                if (xValue > max) {
                    max = xValue;
                }
                if (xValue < min) {
                    min = xValue;
                }
            });
        } else {
            min = max = 0;
        }
        return [min, max];
    },

    /**
     * Calculate the min and max values for this series's yField(s). Takes into account yField
     * combinations, exclusions, and stacking.
     * @return {Array} [min, max]
     */
    getMinMaxYValues: function() {
        var me = this,
            stacked = me.stacked,
            min, max,
            positiveTotal, negativeTotal;

        function eachYValueStacked(yValue, i) {
            if (!me.isExcluded(i)) {
                if (yValue < 0) {
                    negativeTotal += yValue;
                } else {
                    positiveTotal += yValue;
                }
            }
        }

        function eachYValue(yValue, i) {
            if (!me.isExcluded(i)) {
                if (yValue > max) {
                    max = yValue;
                }
                if (yValue < min) {
                    min = yValue;
                }
            }
        }

        if (me.getRecordCount() > 0) {
            min = Infinity;
            max = -min;
            me.eachRecord(function(record) {
                if (stacked) {
                    positiveTotal = 0;
                    negativeTotal = 0;
                    me.eachYValue(record, eachYValueStacked);
                    if (positiveTotal > max) {
                        max = positiveTotal;
                    }
                    if (negativeTotal < min) {
                        min = negativeTotal;
                    }
                } else {
                    me.eachYValue(record, eachYValue);
                }
            });
        } else {
            min = max = 0;
        }
        return [min, max];
    },

    getAxesForXAndYFields: function() {
        var me = this,
            axes = me.chart.axes,
            axis = [].concat(me.axis),
            xAxis, yAxis;

        if (Ext.Array.indexOf(axis, 'top') > -1) {
            xAxis = 'top';
        } else if (Ext.Array.indexOf(axis, 'bottom') > -1) {
            xAxis = 'bottom';
        } else {
            if (axes.get('top')) {
                xAxis = 'top';
            } else if (axes.get('bottom')) {
                xAxis = 'bottom';
            }
        }

        if (Ext.Array.indexOf(axis, 'left') > -1) {
            yAxis = 'left';
        } else if (Ext.Array.indexOf(axis, 'right') > -1) {
            yAxis = 'right';
        } else {
            if (axes.get('left')) {
                yAxis = 'left';
            } else if (axes.get('right')) {
                yAxis = 'right';
            }
        }

        return {
            xAxis: xAxis,
            yAxis: yAxis
        };
    }


});

