/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * @class Ext.chooser.Window
 * @extends Ext.window.Window
 * @author Ed Spencer
 * 
 * This is a simple subclass of the built-in Ext.window.Window class. Although it weighs in at 100+ lines, most of this
 * is just configuration. This Window class uses a border layout and creates a DataView in the central region and an
 * information panel in the east. It also sets up a toolbar to enable sorting and filtering of the items in the 
 * DataView. We add a few simple methods to the class at the bottom, see the comments inline for details.
 */
Ext.define('Ext.chooser.Window', {
    extend: 'Ext.window.Window',
    uses: [
        'Ext.layout.container.Border',
        'Ext.form.field.Text',
        'Ext.form.field.ComboBox',
        'Ext.toolbar.TextItem'
    ],
    
    height: 400,
    width : 600,
    title : 'Choose an Image',
    closeAction: 'hide',
    layout: 'border',
    // modal: true,
    border: false,
    bodyBorder: false,
    
    /**
     * initComponent is a great place to put any code that needs to be run when a new instance of a component is
     * created. Here we just specify the items that will go into our Window, plus the Buttons that we want to appear
     * at the bottom. Finally we call the superclass initComponent.
     */
    initComponent: function() {
        this.items = [
            {
                xtype: 'panel',
                region: 'center',
                autoScroll: true,
                
                items: {
                    xtype: 'iconbrowser',
                    id: 'img-chooser-view',
                    listeners: {
                        scope: this,
                        selectionchange: this.onIconSelect,
                        itemdblclick: this.fireImageSelected
                    }
                },
                
                tbar: [
                    {
                        xtype: 'textfield',
                        name : 'filter',
                        fieldLabel: 'Filter',
                        labelAlign: 'right',
                        labelWidth: 35,
                        listeners: {
                            scope : this,
                            buffer: 50,
                            change: this.filter
                        }
                    },
                    ' ',
                    {
                        xtype: 'combo',
                        fieldLabel: 'Sort By',
                        labelAlign: 'right',
                        labelWidth: 45,
                        valueField: 'field',
                        displayField: 'label',
                        value: 'Type',
                        editable: false,
                        store: Ext.create('Ext.data.Store', {
                            fields: ['field', 'label'],
                            sorters: 'type',
                            proxy : {
                                type: 'memory',
                                data  : [{label: 'Name', field: 'name'}, {label: 'Type', field: 'type'}]
                            }
                        }),
                        listeners: {
                            scope : this,
                            select: this.sort
                        }
                    }
                ]
            },
            {
                xtype: 'infopanel',
                region: 'east',
                split: true
            }
        ];
        
        this.buttons = [
            {
                text: 'OK',
                scope: this,
                handler: this.fireImageSelected
            },
            {
                text: 'Cancel',
                scope: this,
                handler: function() {
                    this.hide();
                }
            }
        ];
        
        this.callParent(arguments);
        
        /**
         * Specifies a new event that this component will fire when the user selects an item. The event is fired by the
         * fireImageSelected function below. Other components can listen to this event and take action when it is fired
         */
        this.addEvents(
            /**
             * @event selected
             * Fired whenever the user selects an image by double clicked it or clicking the window's OK button
             * @param {Ext.data.Model} image The image that was selected
             */
            'selected'
        );
    },
    
    /**
     * @private
     * Called whenever the user types in the Filter textfield. Filters the DataView's store
     */
    filter: function(field, newValue) {
        var store = this.down('iconbrowser').store,
            dataview = this.down('dataview');
        
        store.suspendEvents();
        store.clearFilter();
        dataview.getSelectionModel().clearSelections();
        store.resumeEvents();
        store.filter({
            property: 'name',
            anyMatch: true,
            value   : newValue
        });
    },
    
    /**
     * @private
     * Called whenever the user changes the sort field using the top toolbar's combobox
     */
    sort: function() {
        var field = this.down('combobox').getValue();
        
        this.down('dataview').store.sort(field);
    },
    
    /**
     * Called whenever the user clicks on an item in the DataView. This tells the info panel in the east region to
     * display the details of the image that was clicked on
     */
    onIconSelect: function(dataview, selections) {
        var selected = selections[0];
        
        if (selected) {
            this.down('infopanel').loadRecord(selected);
        }
    },
    
    /**
     * Fires the 'selected' event, informing other components that an image has been selected
     */
    fireImageSelected: function() {
        var selectedImage = this.down('iconbrowser').selModel.getSelection()[0];
        
        if (selectedImage) {
            this.fireEvent('selected', selectedImage);
            this.hide();
        }
    }
});
