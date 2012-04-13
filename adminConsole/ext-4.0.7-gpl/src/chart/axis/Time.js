/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * @class Ext.chart.axis.Time
 * @extends Ext.chart.axis.Numeric
 *
 * A type of axis whose units are measured in time values. Use this axis
 * for listing dates that you will want to group or dynamically change.
 * If you just want to display dates as categories then use the
 * Category class for axis instead.
 *
 * For example:
 *
 *     axes: [{
 *         type: 'Time',
 *         position: 'bottom',
 *         fields: 'date',
 *         title: 'Day',
 *         dateFormat: 'M d',
 *
 *         constrain: true,
 *         fromDate: new Date('1/1/11'),
 *         toDate: new Date('1/7/11')
 *     }]
 *
 * In this example we're creating a time axis that has as title *Day*.
 * The field the axis is bound to is `date`.
 * The date format to use to display the text for the axis labels is `M d`
 * which is a three letter month abbreviation followed by the day number.
 * The time axis will show values for dates between `fromDate` and `toDate`.
 * Since `constrain` is set to true all other values for other dates not between
 * the fromDate and toDate will not be displayed.
 *
 */
Ext.define('Ext.chart.axis.Time', {

    /* Begin Definitions */

    extend: 'Ext.chart.axis.Numeric',

    alternateClassName: 'Ext.chart.TimeAxis',

    alias: 'axis.time',

    requires: ['Ext.data.Store', 'Ext.data.JsonStore'],

    /* End Definitions */

    /**
     * @cfg {String/Boolean} dateFormat
     * Indicates the format the date will be rendered on.
     * For example: 'M d' will render the dates as 'Jan 30', etc.
     * For a list of possible format strings see {@link Ext.Date Date}
     */
    dateFormat: false,

    /**
     * @cfg {Date} fromDate The starting date for the time axis.
     */
    fromDate: false,

    /**
     * @cfg {Date} toDate The ending date for the time axis.
     */
    toDate: false,

    /**
     * @cfg {Array/Boolean} step
     * An array with two components: The first is the unit of the step (day, month, year, etc).
     * The second one is the number of units for the step (1, 2, etc.).
     * Defaults to `[Ext.Date.DAY, 1]`.
     */
    step: [Ext.Date.DAY, 1],
    
    /**
     * @cfg {Boolean} constrain
     * If true, the values of the chart will be rendered only if they belong between the fromDate and toDate.
     * If false, the time axis will adapt to the new values by adding/removing steps.
     */
    constrain: false,

    // Avoid roundtoDecimal call in Numeric Axis's constructor
    roundToDecimal: false,
    
    constructor: function (config) {
        var me = this, label, f, df;
        me.callParent([config]);
        label = me.label || {};
        df = this.dateFormat;
        if (df) {
            if (label.renderer) {
                f = label.renderer;
                label.renderer = function(v) {
                    v = f(v);
                    return Ext.Date.format(new Date(f(v)), df);
                };
            } else {
                label.renderer = function(v) {
                    return Ext.Date.format(new Date(v >> 0), df);
                };
            }
        }
    },

    doConstrain: function () {
        var me = this,
            store = me.chart.store,
            data = [],
            series = me.chart.series.items,
            math = Math,
            mmax = math.max,
            mmin = math.min,
            fields = me.fields,
            ln = fields.length,
            range = me.getRange(),
            min = range.min, max = range.max, i, l, excludes = [],
            value, values, rec, data = [];
        for (i = 0, l = series.length; i < l; i++) {
            excludes[i] = series[i].__excludes;
        }
        store.each(function(record) {
            for (i = 0; i < ln; i++) {
                if (excludes[i]) {
                    continue;
                }
                value = record.get(fields[i]);
                if (+value < +min) return;
                if (+value > +max) return;
            }
            data.push(record);
        })
        me.chart.substore = Ext.create('Ext.data.JsonStore', { model: store.model, data: data });
    },

    // Before rendering, set current default step count to be number of records.
    processView: function () {
        var me = this;
        if (me.fromDate) {
            me.minimum = +me.fromDate;
        }
        if (me.toDate) {
            me.maximum = +me.toDate;
        }
        if (me.constrain) {
            me.doConstrain();
        }
     },

    // @private modifies the store and creates the labels for the axes.
    calcEnds: function() {
        var me = this, range, step = me.step;
        if (step) {
            range = me.getRange();
            range = Ext.draw.Draw.snapEndsByDateAndStep(new Date(range.min), new Date(range.max), Ext.isNumber(step) ? [Date.MILLI, step]: step);
            if (me.minimum) {
                range.from = me.minimum;
            }
            if (me.maximum) {
                range.to = me.maximum;
            }
            range.step = (range.to - range.from) / range.steps;
            return range;
        } else {
            return me.callParent(arguments);
        }
    }
 });


