/**
 * @example Grouping Grid Panel
 *
 * A grid panel that demonstrates grouping rows using the {@link Ext.grid.feature.Grouping} feature
 */
Ext.require('Ext.data.Store');
Ext.require('Ext.grid.Panel');

Ext.define('Employee', {
    extend: 'Ext.data.Model',
    fields: [ 'name', 'seniority', 'department' ]
});

Ext.onReady(function() {

    var employeeStore = Ext.create('Ext.data.Store', {
        model: 'Employee',
        data: [
            { name: 'Michael Scott', seniority: 7, department: 'Manangement' },
            { name: 'Dwight Schrute', seniority: 2, department: 'Sales' },
            { name: 'Jim Halpert', seniority: 3, department: 'Sales' },
            { name: 'Kevin Malone', seniority: 4, department: 'Accounting' },
            { name: 'Angela Martin', seniority: 5, department: 'Accounting' }
        ],
        groupField: 'department'
    });

    Ext.create('Ext.grid.Panel', {
        renderTo: Ext.getBody(),
        store: employeeStore,
        width: 200,
        height: 300,
        title: 'Employees - Scranton Branch',
        columns: [
            {
                text: 'Name',
                width: 100,
                dataIndex: 'name'
            },
            {
                text: 'Seniority',
                flex: 1,
                dataIndex: 'seniority'
            }
        ],
        features: [{ ftype: 'grouping' }]
    });

});
