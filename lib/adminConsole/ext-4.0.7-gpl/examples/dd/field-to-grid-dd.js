/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
Ext.require(['*']);

// A DropZone which cooperates with DragZones whose dragData contains
// a "field" property representing a form Field. Fields may be dropped onto
// grid data cells containing a matching data type.
Ext.define('Ext.ux.CellFieldDropZone', {
    extend: 'Ext.dd.DropZone',

    constructor: function(){},

//  Call the DropZone constructor using the View's scrolling element
//  only after the grid has been rendered.
    init: function(grid) {
        var me = this;

        if (grid.rendered) {
            me.grid = grid;
            grid.getView().on({
                render: function(v) {
                    me.view = v;
                    Ext.ux.CellFieldDropZone.superclass.constructor.call(me, me.view.el);
                },
                single: true
            });
        } else {
            grid.on('render', me.init, me, {single: true});
        }
    },

//  Scroll the main configured Element when we drag close to the edge
    containerScroll: true,

    getTargetFromEvent: function(e) {
        var me = this,
            v = me.view;

//      Ascertain whether the mousemove is within a grid cell
        var cell = e.getTarget(v.cellSelector);
        if (cell) {

//          We *are* within a grid cell, so ask the View exactly which one,
//          Extract data from the Model to create a target object for
//          processing in subsequent onNodeXXXX methods. Note that the target does
//          not have to be a DOM element. It can be whatever the noNodeXXX methods are
//          programmed to expect.
            var row = v.findItemByChild(cell),
                columnIndex = cell.cellIndex;

            if (row && Ext.isDefined(columnIndex)) {
                return {
                    node: cell,
                    record: v.getRecord(row),
                    fieldName: me.grid.columns[columnIndex].dataIndex
                };
            }
        }
    },

//  On Node enter, see if it is valid for us to drop the field on that type of column.
    onNodeEnter: function(target, dd, e, dragData) {
        delete this.dropOK;
        if (!target) {
            return;
        }

//      Check that a field is being dragged.
        var f = dragData.field;
        if (!f) {
            return;
        }

//      Check whether the data type of the column being dropped on accepts the
//      dragged field type. If so, set dropOK flag, and highlight the target node.
        var type = target.record.fields.get(target.fieldName).type,
            types = Ext.data.Types;
        switch(type){
            case types.FLOAT:
            case types.INT:
                if (!f.isXType('numberfield')) {
                    return;
                }
                break;
            case types.DATE:
                if (!f.isXType('datefield')) {
                    return;
                }
                break;
            case types.BOOL:
                if (!f.isXType('checkbox')) {
                    return;
                }
        }
        this.dropOK = true;
        Ext.fly(target.node).addCls('x-drop-target-active');
    },

//  Return the class name to add to the drag proxy. This provides a visual indication
//  of drop allowed or not allowed.
    onNodeOver: function(target, dd, e, dragData) {
        return this.dropOK ? this.dropAllowed : this.dropNotAllowed;
    },

//  highlight the target node.
    onNodeOut: function(target, dd, e, dragData) {
        Ext.fly(target.node).removeCls('x-drop-target-active');
    },

//  Process the drop event if we have previously ascertained that a drop is OK.
    onNodeDrop: function(target, dd, e, dragData) {
        if (this.dropOK) {
            target.record.set(target.fieldName, dragData.field.getValue());
            return true;
        }
    }
});

//  A class which makes Fields within a Panel draggable.
//  the dragData delivered to a cooperating DropZone's methods contains
//  the dragged Field in the property "field".
Ext.define('Ext.ux.PanelFieldDragZone', {

    extend: 'Ext.dd.DragZone',

    constructor: function(){},

//  Call the DRagZone's constructor. The Panel must have been rendered.
    init: function(panel) {
        if (panel.nodeType) {
            Ext.ux.PanelFieldDragZone.superclass.init.apply(this, arguments);
        } else {
            if (panel.rendered) {
                Ext.ux.PanelFieldDragZone.superclass.constructor.call(this, panel.getEl());
                var i = Ext.fly(panel.getEl()).select('input');
                i.unselectable();
            } else {
                panel.on('afterlayout', this.init, this, {single: true});
            }
        }
    },

    scroll: false,

//  On mousedown, we ascertain whether it is on one of our draggable Fields.
//  If so, we collect data about the draggable object, and return a drag data
//  object which contains our own data, plus a "ddel" property which is a DOM
//  node which provides a "view" of the dragged data.
    getDragData: function(e) {
        var t = e.getTarget('input');
        if (t) {
            e.stopEvent();

//          Ugly code to "detach" the drag gesture from the input field.
//          Without this, Opera never changes the mouseover target from the input field
//          even when dragging outside of the field - it just keeps selecting.
            if (Ext.isOpera) {
                Ext.fly(t).on('mousemove', function(e1){
                    t.style.visibility = 'hidden';
                    Ext.defer(function(){
                        t.style.visibility = '';
                    }, 1);
                }, null, {single:true});
            }

//          Get the data we are dragging: the Field
//          create a ddel for the drag proxy to display
            var f = Ext.ComponentQuery.query('field[inputEl]{inputEl.id=="' + t.id + '"}')[0];
            var d = document.createElement('div');
            d.className = 'x-form-text';
            d.appendChild(document.createTextNode(t.value));
            Ext.fly(d).setWidth(f.getEl().getWidth());
            return {
                field: f,
                ddel: d
            };
        }
    },

//  The coordinates to slide the drag proxy back to on failed drop.
    getRepairXY: function() {
        return this.dragData.field.getEl().getXY();
    }
});

Ext.onReady(function(){

    var myData = [
        ['3m Co',71.72,0.02,0.03,'9/1 12:00am'],
        ['Alcoa Inc',29.01,0.42,1.47,'9/1 12:00am'],
        ['Altria Group Inc',83.81,0.28,0.34,'9/1 12:00am'],
        ['American Express Company',52.55,0.01,0.02,'9/1 12:00am'],
        ['American International Group, Inc.',64.13,0.31,0.49,'9/1 12:00am'],
        ['AT&T Inc.',31.61,-0.48,-1.54,'9/1 12:00am'],
        ['Boeing Co.',75.43,0.53,0.71,'9/1 12:00am'],
        ['Caterpillar Inc.',67.27,0.92,1.39,'9/1 12:00am'],
        ['Citigroup, Inc.',49.37,0.02,0.04,'9/1 12:00am'],
        ['E.I. du Pont de Nemours and Company',40.48,0.51,1.28,'9/1 12:00am'],
        ['Exxon Mobil Corp',68.1,-0.43,-0.64,'9/1 12:00am'],
        ['General Electric Company',34.14,-0.08,-0.23,'9/1 12:00am'],
        ['General Motors Corporation',30.27,1.09,3.74,'9/1 12:00am'],
        ['Hewlett-Packard Co.',36.53,-0.03,-0.08,'9/1 12:00am'],
        ['Honeywell Intl Inc',38.77,0.05,0.13,'9/1 12:00am'],
        ['Intel Corporation',19.88,0.31,1.58,'9/1 12:00am'],
        ['International Business Machines',81.41,0.44,0.54,'9/1 12:00am'],
        ['Johnson & Johnson',64.72,0.06,0.09,'9/1 12:00am'],
        ['JP Morgan & Chase & Co',45.73,0.07,0.15,'9/1 12:00am'],
        ['McDonald\'s Corporation',36.76,0.86,2.40,'9/1 12:00am'],
        ['Merck & Co., Inc.',40.96,0.41,1.01,'9/1 12:00am'],
        ['Microsoft Corporation',25.84,0.14,0.54,'9/1 12:00am'],
        ['Pfizer Inc',27.96,0.4,1.45,'9/1 12:00am'],
        ['The Coca-Cola Company',45.07,0.26,0.58,'9/1 12:00am'],
        ['The Home Depot, Inc.',34.64,0.35,1.02,'9/1 12:00am'],
        ['The Procter & Gamble Company',61.91,0.01,0.02,'9/1 12:00am'],
        ['United Technologies Corporation',63.26,0.55,0.88,'9/1 12:00am'],
        ['Verizon Communications',35.57,0.39,1.11,'9/1 12:00am'],
        ['Wal-Mart Stores, Inc.',45.45,0.73,1.63,'9/1 12:00am']
    ];

    // example of custom renderer function
    function change(val){
        if(val > 0){
            return '<span style="color:green;">' + val + '</span>';
        }else if(val < 0){
            return '<span style="color:red;">' + val + '</span>';
        }
        return val;
    }

    // example of custom renderer function
    function pctChange(val){
        if(val > 0){
            return '<span style="color:green;">' + val + '%</span>';
        }else if(val < 0){
            return '<span style="color:red;">' + val + '%</span>';
        }
        return val;
    }

    // create the data store
    var store = Ext.create('Ext.data.ArrayStore', {
        fields: [
           {name: 'company'},
           {name: 'price', type: 'float'},
           {name: 'change', type: 'float'},
           {name: 'pctChange', type: 'float'},
           {name: 'lastChange', type: 'date', dateFormat: 'n/j h:ia'}
        ],
        data: myData
    });

    var helpWindow = Ext.create('Ext.Window', {
        title: 'Source code',
        width: 920,
        height: 500,
        closeAction: 'hide',
        layout: 'fit',
        items: {
            hideLabel: true,
            xtype: 'textarea',
            readOnly: true
        },
        listeners: {
            render: function(w) {
                Ext.Ajax.request({
                    url: 'field-to-grid-dd.js',
                    success: function(r) {
                        w.items.first().setValue(r.responseText);
                    }
                });
            }
        }
    });

    // create the Grid
    var grid = Ext.create('Ext.grid.Panel', {
        store: store,
        columns: [
            {id:'company',header: "Company", width: 160, sortable: true, dataIndex: 'company'},
            {header: "Price", width: 75, sortable: true, renderer: 'usMoney', dataIndex: 'price'},
            {header: "Change", width: 75, sortable: true, renderer: change, dataIndex: 'change'},
            {header: "% Change", width: 75, sortable: true, renderer: pctChange, dataIndex: 'pctChange'},
            {header: "Last Updated", width: 85, sortable: true, renderer: Ext.util.Format.dateRenderer('m/d/Y'), dataIndex: 'lastChange'}
        ],
        plugins: Ext.create('Ext.ux.CellFieldDropZone'),
        stripeRows: true,
        autoExpandColumn: 'company',
        height:350,
        width:600,
        title:'Array Grid',
        dockedItems: [{
            dock: 'bottom',
            xtype: 'toolbar',
            items: {
                text: 'View Source',
                handler: function() {
                    helpWindow.show();
                }
            }
        }]
    });

    grid.render('grid-example');

    var f = Ext.create('Ext.Panel', {
        frame: true,
        width: 600,
        plugins: Ext.create('Ext.ux.PanelFieldDragZone'),
        labelWidth: 150,
        items: [{
            xtype: 'textfield',
            fieldLabel: 'Drag this text',
            value: 'test'
        },{
            xtype: 'numberfield',
            fieldLabel: 'Drag this number',
            value: '1.2'
        },{
            xtype: 'datefield',
            fieldLabel: 'Drag this date',
            value: new Date()
        }],
        renderTo: Ext.getBody()
    });
});

