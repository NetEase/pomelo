/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
Ext.Loader.setConfig({ enabled: true });
Ext.Loader.setPath('Ext.ux', '../ux');

Ext.require([
    'Ext.grid.*',
    'Ext.data.*',
    'Ext.ux.ajax.SimManager'
]);

Ext.define('Task', {
    extend: 'Ext.data.Model',
    idProperty: 'taskId',
    fields: [
        {name: 'projectId', type: 'int'},
        {name: 'project', type: 'string'},
        {name: 'taskId', type: 'int'},
        {name: 'description', type: 'string'},
        {name: 'estimate', type: 'float'},
        {name: 'rate', type: 'float'},
        {name: 'cost', type: 'float'},
        {name: 'due', type: 'date', dateFormat:'m/d/Y'}
    ]
});

Ext.onReady(function(){
    initAjaxSim();

    var store = Ext.create('Ext.data.Store', {
        model: 'Task',
        autoLoad: true,
        remoteSort: true,
        remoteGroup: true,
        proxy: {
            type: 'ajax',
            //url: 'remote-group-summary-grid.json',
            url: 'remote-group-summary-data',
            reader: {
                type: 'json',
                root: 'data'
            }
        },
        sorters: {property: 'due', direction: 'ASC'},
        groupField: 'project'
    });
    
    var grid = Ext.create('Ext.grid.Panel', {
        width: 800,
        height: 450,
        title: 'Sponsored Projects',
        renderTo: Ext.getBody(),
        store: store,
        viewConfig: {
            stripeRows: false
        },
        dockedItems: [{
            dock: 'top',
            xtype: 'toolbar',
            items: [{
                text: 'Show Summary',
                pressed: true,
                enableToggle: true,
                toggleHandler: function(btn, pressed){
                    var view = grid.getView();
                    view.getFeature('group').toggleSummaryRow(pressed);
                    view.refresh();
                }
            }]
        }],
        features: [{
            id: 'group',
            ftype: 'groupingsummary',
            groupHeaderTpl: '{name}',
            hideGroupedHeader: true,
            remoteRoot: 'summaryData'
        }],
        columns: [{
            text: 'Task',
            flex: 1,
            sortable: true,
            tdCls: 'task',
            dataIndex: 'description',
            hideable: false,
            summaryRenderer: function(value, summaryData, dataIndex) {
                return ((value === 0 || value > 1) ? '(' + value + ' Tasks)' : '(1 Task)');
            }
        }, {
            header: 'Project',
            width: 20,
            sortable: true,
            dataIndex: 'project'
        }, {
            header: 'Due Date',
            width: 80,
            sortable: true,
            dataIndex: 'due',
            renderer: Ext.util.Format.dateRenderer('m/d/Y')
        }, {
            header: 'Estimate',
            width: 75,
            sortable: true,
            dataIndex: 'estimate',
            renderer: function(value, metaData, record, rowIdx, colIdx, store, view){
                return value + ' hours';
            },
            summaryRenderer: function(value, summaryData, dataIndex) {
                return value + ' hours';
            }
        }, {
            header: 'Rate',
            width: 75,
            sortable: true,
            renderer: Ext.util.Format.usMoney,
            summaryRenderer: Ext.util.Format.usMoney,
            dataIndex: 'rate',
            summaryType: 'average'
        }, {
            id: 'cost',
            header: 'Cost',
            width: 75,
            sortable: false,
            groupable: false,
            renderer: function(value, metaData, record, rowIdx, colIdx, store, view) {
                return Ext.util.Format.usMoney(record.get('estimate') * record.get('rate'));
            },
            dataIndex: 'cost',
            summaryRenderer: Ext.util.Format.usMoney
        }]
    });
});

/*
 * Setup our faux Ajax response "simlet".
 */
function initAjaxSim () {
    Ext.ux.ajax.SimManager.register({
        'remote-group-summary-data' : {
            stype: 'json',

            data: [
                {projectId: 100, project: 'Forms: Field Anchoring', taskId: 112, description: 'Integrate 2.0 Forms with 2.0 Layouts', estimate: 6, rate: 150, due:'06/24/2007'},
                {projectId: 100, project: 'Forms: Field Anchoring', taskId: 113, description: 'Implement AnchorLayout', estimate: 4, rate: 150, due:'06/25/2007'},
                {projectId: 100, project: 'Forms: Field Anchoring', taskId: 114, description: 'Add support for multiple types of anchors', estimate: 4, rate: 150, due:'06/27/2007'},
                {projectId: 100, project: 'Forms: Field Anchoring', taskId: 115, description: 'Testing and debugging', estimate: 8, rate: 0, due:'06/29/2007'},
                {projectId: 101, project: 'Grid: Single-level Grouping', taskId: 101, description: 'Add required rendering "hooks" to GridView', estimate: 6, rate: 100, due:'07/01/2007'},
                {projectId: 101, project: 'Grid: Single-level Grouping', taskId: 102, description: 'Extend GridView and override rendering functions', estimate: 6, rate: 100, due:'07/03/2007'},
                {projectId: 101, project: 'Grid: Single-level Grouping', taskId: 103, description: 'Extend Store with grouping functionality', estimate: 4, rate: 100, due:'07/04/2007'},
                {projectId: 101, project: 'Grid: Single-level Grouping', taskId: 121, description: 'Default CSS Styling', estimate: 2, rate: 100, due:'07/05/2007'},
                {projectId: 101, project: 'Grid: Single-level Grouping', taskId: 104, description: 'Testing and debugging', estimate: 6, rate: 100, due:'07/06/2007'},
                {projectId: 102, project: 'Grid: Summary Rows', taskId: 105, description: 'Ext Grid plugin integration', estimate: 4, rate: 125, due:'07/01/2007'},
                {projectId: 102, project: 'Grid: Summary Rows', taskId: 106, description: 'Summary creation during rendering phase', estimate: 4, rate: 125, due:'07/02/2007'},
                {projectId: 102, project: 'Grid: Summary Rows', taskId: 107, description: 'Dynamic summary updates in editor grids', estimate: 6, rate: 125, due:'07/05/2007'},
                {projectId: 102, project: 'Grid: Summary Rows', taskId: 108, description: 'Remote summary integration', estimate: 4, rate: 125, due:'07/05/2007'},
                {projectId: 102, project: 'Grid: Summary Rows', taskId: 109, description: 'Summary renderers and calculators', estimate: 4, rate: 125, due:'07/06/2007'},
                {projectId: 102, project: 'Grid: Summary Rows', taskId: 110, description: 'Integrate summaries with GroupingView', estimate: 10, rate: 125, due:'07/11/2007'},
                {projectId: 102, project: 'Grid: Summary Rows', taskId: 111, description: 'Testing and debugging', estimate: 8, rate: 125, due:'07/15/2007'}
            ],

            getGroupSummary: function (groupField, rows, ctx) {
                var ret = Ext.apply({}, rows[0]);
                ret.cost = 0;
                ret.estimate = 0;
                Ext.each(rows, function (row) {
                    ret.estimate += row.estimate;
                    ret.cost += row.estimate * row.rate;
                });
                ret.estimate *= -1;
                ret.cost *= -1;
                return ret;
            }
        }
    });
}

