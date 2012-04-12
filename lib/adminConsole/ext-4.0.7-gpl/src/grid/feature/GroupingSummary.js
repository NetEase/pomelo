/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * @class Ext.grid.feature.GroupingSummary
 * @extends Ext.grid.feature.Grouping
 *
 * This feature adds an aggregate summary row at the bottom of each group that is provided
 * by the {@link Ext.grid.feature.Grouping} feature. There are two aspects to the summary:
 *
 * ## Calculation
 *
 * The summary value needs to be calculated for each column in the grid. This is controlled
 * by the summaryType option specified on the column. There are several built in summary types,
 * which can be specified as a string on the column configuration. These call underlying methods
 * on the store:
 *
 *  - {@link Ext.data.Store#count count}
 *  - {@link Ext.data.Store#sum sum}
 *  - {@link Ext.data.Store#min min}
 *  - {@link Ext.data.Store#max max}
 *  - {@link Ext.data.Store#average average}
 *
 * Alternatively, the summaryType can be a function definition. If this is the case,
 * the function is called with an array of records to calculate the summary value.
 *
 * ## Rendering
 *
 * Similar to a column, the summary also supports a summaryRenderer function. This
 * summaryRenderer is called before displaying a value. The function is optional, if
 * not specified the default calculated value is shown. The summaryRenderer is called with:
 *
 *  - value {Object} - The calculated value.
 *  - summaryData {Object} - Contains all raw summary values for the row.
 *  - field {String} - The name of the field we are calculating
 *
 * ## Example Usage
 *
 *     @example
 *     Ext.define('TestResult', {
 *         extend: 'Ext.data.Model',
 *         fields: ['student', 'subject', {
 *             name: 'mark',
 *             type: 'int'
 *         }]
 *     });
 *
 *     Ext.create('Ext.grid.Panel', {
 *         width: 200,
 *         height: 240,
 *         renderTo: document.body,
 *         features: [{
 *             groupHeaderTpl: 'Subject: {name}',
 *             ftype: 'groupingsummary'
 *         }],
 *         store: {
 *             model: 'TestResult',
 *             groupField: 'subject',
 *             data: [{
 *                 student: 'Student 1',
 *                 subject: 'Math',
 *                 mark: 84
 *             },{
 *                 student: 'Student 1',
 *                 subject: 'Science',
 *                 mark: 72
 *             },{
 *                 student: 'Student 2',
 *                 subject: 'Math',
 *                 mark: 96
 *             },{
 *                 student: 'Student 2',
 *                 subject: 'Science',
 *                 mark: 68
 *             }]
 *         },
 *         columns: [{
 *             dataIndex: 'student',
 *             text: 'Name',
 *             summaryType: 'count',
 *             summaryRenderer: function(value){
 *                 return Ext.String.format('{0} student{1}', value, value !== 1 ? 's' : '');
 *             }
 *         }, {
 *             dataIndex: 'mark',
 *             text: 'Mark',
 *             summaryType: 'average'
 *         }]
 *     });
 */
Ext.define('Ext.grid.feature.GroupingSummary', {

    /* Begin Definitions */

    extend: 'Ext.grid.feature.Grouping',

    alias: 'feature.groupingsummary',

    mixins: {
        summary: 'Ext.grid.feature.AbstractSummary'
    },

    /* End Definitions */


   /**
    * Modifies the row template to include the summary row.
    * @private
    * @return {String} The modified template
    */
   getFeatureTpl: function() {
        var tpl = this.callParent(arguments);

        if (this.showSummaryRow) {
            // lop off the end </tpl> so we can attach it
            tpl = tpl.replace('</tpl>', '');
            tpl += '{[this.printSummaryRow(xindex)]}</tpl>';
        }
        return tpl;
    },

    /**
     * Gets any fragments needed for the template.
     * @private
     * @return {Object} The fragments
     */
    getFragmentTpl: function() {
        var me = this,
            fragments = me.callParent();

        Ext.apply(fragments, me.getSummaryFragments());
        if (me.showSummaryRow) {
            // this gets called before render, so we'll setup the data here.
            me.summaryGroups = me.view.store.getGroups();
            me.summaryData = me.generateSummaryData();
        }
        return fragments;
    },

    /**
     * Gets the data for printing a template row
     * @private
     * @param {Number} index The index in the template
     * @return {Array} The template values
     */
    getPrintData: function(index){
        var me = this,
            columns = me.view.headerCt.getColumnsForTpl(),
            i = 0,
            length = columns.length,
            data = [],
            name = me.summaryGroups[index - 1].name,
            active = me.summaryData[name],
            column;

        for (; i < length; ++i) {
            column = columns[i];
            column.gridSummaryValue = this.getColumnValue(column, active);
            data.push(column);
        }
        return data;
    },

    /**
     * Generates all of the summary data to be used when processing the template
     * @private
     * @return {Object} The summary data
     */
    generateSummaryData: function(){
        var me = this,
            data = {},
            remoteData = {},
            store = me.view.store,
            groupField = this.getGroupField(),
            reader = store.proxy.reader,
            groups = me.summaryGroups,
            columns = me.view.headerCt.getColumnsForTpl(),
            remote,
            i,
            length,
            fieldData,
            root,
            key,
            comp;

        for (i = 0, length = groups.length; i < length; ++i) {
            data[groups[i].name] = {};
        }

        /**
         * @cfg {String} [remoteRoot=undefined]  The name of the property which contains the Array of
         * summary objects. It allows to use server-side calculated summaries.
         */
        if (me.remoteRoot && reader.rawData) {
            // reset reader root and rebuild extractors to extract summaries data
            root = reader.root;
            reader.root = me.remoteRoot;
            reader.buildExtractors(true);
            Ext.Array.each(reader.getRoot(reader.rawData), function(value) {
                 remoteData[value[groupField]] = value;
            });
            // restore initial reader configuration
            reader.root = root;
            reader.buildExtractors(true);
        }

        for (i = 0, length = columns.length; i < length; ++i) {
            comp = Ext.getCmp(columns[i].id);
            fieldData = me.getSummary(store, comp.summaryType, comp.dataIndex, true);

            for (key in fieldData) {
                if (fieldData.hasOwnProperty(key)) {
                    data[key][comp.id] = fieldData[key];
                }
            }

            for (key in remoteData) {
                if (remoteData.hasOwnProperty(key)) {
                    remote = remoteData[key][comp.dataIndex];
                    if (remote !== undefined && data[key] !== undefined) {
                        data[key][comp.id] = remote;
                    }
                }
            }
        }
        return data;
    }
});

