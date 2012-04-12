/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * @class Ext.grid.feature.Summary
 * @extends Ext.grid.feature.AbstractSummary
 * 
 * This feature is used to place a summary row at the bottom of the grid. If using a grouping, 
 * see {@link Ext.grid.feature.GroupingSummary}. There are 2 aspects to calculating the summaries, 
 * calculation and rendering.
 * 
 * ## Calculation
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
 *         fields: ['student', {
 *             name: 'mark',
 *             type: 'int'
 *         }]
 *     });
 *     
 *     Ext.create('Ext.grid.Panel', {
 *         width: 200,
 *         height: 140,
 *         renderTo: document.body,
 *         features: [{
 *             ftype: 'summary'
 *         }],
 *         store: {
 *             model: 'TestResult',
 *             data: [{
 *                 student: 'Student 1',
 *                 mark: 84
 *             },{
 *                 student: 'Student 2',
 *                 mark: 72
 *             },{
 *                 student: 'Student 3',
 *                 mark: 96
 *             },{
 *                 student: 'Student 4',
 *                 mark: 68
 *             }]
 *         },
 *         columns: [{
 *             dataIndex: 'student',
 *             text: 'Name',
 *             summaryType: 'count',
 *             summaryRenderer: function(value, summaryData, dataIndex) {
 *                 return Ext.String.format('{0} student{1}', value, value !== 1 ? 's' : ''); 
 *             }
 *         }, {
 *             dataIndex: 'mark',
 *             text: 'Mark',
 *             summaryType: 'average'
 *         }]
 *     });
 */
Ext.define('Ext.grid.feature.Summary', {
    
    /* Begin Definitions */
    
    extend: 'Ext.grid.feature.AbstractSummary',
    
    alias: 'feature.summary',
    
    /* End Definitions */
    
    /**
     * Gets any fragments needed for the template.
     * @private
     * @return {Object} The fragments
     */
    getFragmentTpl: function() {
        // this gets called before render, so we'll setup the data here.
        this.summaryData = this.generateSummaryData(); 
        return this.getSummaryFragments();
    },
    
    /**
     * Overrides the closeRows method on the template so we can include our own custom
     * footer.
     * @private
     * @return {Object} The custom fragments
     */
    getTableFragments: function(){
        if (this.showSummaryRow) {
            return {
                closeRows: this.closeRows
            };
        }
    },
    
    /**
     * Provide our own custom footer for the grid.
     * @private
     * @return {String} The custom footer
     */
    closeRows: function() {
        return '</tpl>{[this.printSummaryRow()]}';
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
            active = me.summaryData,
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
            store = me.view.store,
            columns = me.view.headerCt.getColumnsForTpl(),
            i = 0,
            length = columns.length,
            fieldData,
            key,
            comp;
            
        for (i = 0, length = columns.length; i < length; ++i) {
            comp = Ext.getCmp(columns[i].id);
            data[comp.id] = me.getSummary(store, comp.summaryType, comp.dataIndex, false);
        }
        return data;
    }
});
