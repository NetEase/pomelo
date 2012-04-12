/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * @class Ext.chart.axis.Abstract
 * Base class for all axis classes.
 * @private
 */
Ext.define('Ext.chart.axis.Abstract', {

    /* Begin Definitions */

    requires: ['Ext.chart.Chart'],

    /* End Definitions */

    /**
     * Creates new Axis.
     * @param {Object} config (optional) Config options.
     */
    constructor: function(config) {
        config = config || {};

        var me = this,
            pos = config.position || 'left';

        pos = pos.charAt(0).toUpperCase() + pos.substring(1);
        //axisLabel(Top|Bottom|Right|Left)Style
        config.label = Ext.apply(config['axisLabel' + pos + 'Style'] || {}, config.label || {});
        config.axisTitleStyle = Ext.apply(config['axisTitle' + pos + 'Style'] || {}, config.labelTitle || {});
        Ext.apply(me, config);
        me.fields = [].concat(me.fields);
        this.callParent();
        me.labels = [];
        me.getId();
        me.labelGroup = me.chart.surface.getGroup(me.axisId + "-labels");
    },

    alignment: null,
    grid: false,
    steps: 10,
    x: 0,
    y: 0,
    minValue: 0,
    maxValue: 0,

    getId: function() {
        return this.axisId || (this.axisId = Ext.id(null, 'ext-axis-'));
    },

    /*
      Called to process a view i.e to make aggregation and filtering over
      a store creating a substore to be used to render the axis. Since many axes
      may do different things on the data and we want the final result of all these
      operations to be rendered we need to call processView on all axes before drawing
      them.
    */
    processView: Ext.emptyFn,

    drawAxis: Ext.emptyFn,
    addDisplayAndLabels: Ext.emptyFn
});

