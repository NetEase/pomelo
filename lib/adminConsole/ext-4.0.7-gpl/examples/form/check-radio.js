/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
Ext.require([
    'Ext.form.*',
    'Ext.layout.container.Column',
    'Ext.window.MessageBox',
    'Ext.fx.target.Element'
]);

Ext.onReady(function(){


    /*====================================================================
     * Individual checkbox/radio examples
     *====================================================================*/

    // Using checkbox/radio groups will generally be more convenient and flexible than
    // using individual checkbox and radio controls, but this shows that you can
    // certainly do so if you only have a single control at a time.
    var individual = {
        xtype: 'container',
        layout: 'hbox',
        margin: '0 0 10',
        items: [{
            xtype: 'fieldset',
            flex: 1,
            title: 'Individual Checkboxes',
            defaultType: 'checkbox', // each item will be a checkbox
            layout: 'anchor',
            defaults: {
                anchor: '100%',
                hideEmptyLabel: false
            },
            items: [{
                xtype: 'textfield',
                name: 'txt-test1',
                fieldLabel: 'Alignment Test'
            }, {
                fieldLabel: 'Favorite Animals',
                boxLabel: 'Dog',
                name: 'fav-animal-dog',
                inputValue: 'dog'
            }, {
                boxLabel: 'Cat',
                name: 'fav-animal-cat',
                inputValue: 'cat'
            }, {
                checked: true,
                boxLabel: 'Monkey',
                name: 'fav-animal-monkey',
                inputValue: 'monkey'
            }]
        }, {
            xtype: 'component',
            width: 10
        }, {
            xtype: 'fieldset',
            flex: 1,
            title: 'Individual Radios',
            defaultType: 'radio', // each item will be a radio button
            layout: 'anchor',
            defaults: {
                anchor: '100%',
                hideEmptyLabel: false
            },
            items: [{
                xtype: 'textfield',
                name: 'txt-test2',
                fieldLabel: 'Alignment Test'
            }, {
                checked: true,
                fieldLabel: 'Favorite Color',
                boxLabel: 'Red',
                name: 'fav-color',
                inputValue: 'red'
            }, {
                boxLabel: 'Blue',
                name: 'fav-color',
                inputValue: 'blue'
            }, {
                boxLabel: 'Green',
                name: 'fav-color',
                inputValue: 'green'
            }]
        }]
    };




    /*====================================================================
     * CheckGroup example
     *====================================================================*/
    var checkGroup = {
        xtype: 'fieldset',
        title: 'Checkbox Groups (initially collapsed)',
        layout: 'anchor',
        defaults: {
            anchor: '100%',
            labelStyle: 'padding-left:4px;'
        },
        collapsible: true,
        collapsed: true,
        items: [{
            xtype: 'textfield',
            name: 'txt-test3',
            fieldLabel: 'Alignment Test'
        },{
            // Use the default, automatic layout to distribute the controls evenly
            // across a single row
            xtype: 'checkboxgroup',
            fieldLabel: 'Auto Layout',
            cls: 'x-check-group-alt',
            items: [
                {boxLabel: 'Item 1', name: 'cb-auto-1'},
                {boxLabel: 'Item 2', name: 'cb-auto-2', checked: true},
                {boxLabel: 'Item 3', name: 'cb-auto-3'},
                {boxLabel: 'Item 4', name: 'cb-auto-4'},
                {boxLabel: 'Item 5', name: 'cb-auto-5'}
            ]
        },{
            xtype: 'checkboxgroup',
            fieldLabel: 'Single Column',
            // Put all controls in a single column with width 100%
            columns: 1,
            items: [
                {boxLabel: 'Item 1', name: 'cb-col-1'},
                {boxLabel: 'Item 2', name: 'cb-col-2', checked: true},
                {boxLabel: 'Item 3', name: 'cb-col-3'}
            ]
        },{
            xtype: 'checkboxgroup',
            fieldLabel: 'Multi-Column (horizontal)',
            cls: 'x-check-group-alt',
            // Distribute controls across 3 even columns, filling each row
            // from left to right before starting the next row
            columns: 3,
            items: [
                {boxLabel: 'Item 1', name: 'cb-horiz-1'},
                {boxLabel: 'Item 2', name: 'cb-horiz-2', checked: true},
                {boxLabel: 'Item 3', name: 'cb-horiz-3'},
                {boxLabel: 'Item 4', name: 'cb-horiz-4'},
                {boxLabel: 'Item 5', name: 'cb-horiz-5'}
            ]
        },{
            xtype: 'checkboxgroup',
            fieldLabel: 'Multi-Column (vertical)',
            // Distribute controls across 3 even columns, filling each column
            // from top to bottom before starting the next column
            columns: 3,
            vertical: true,
            items: [
                {boxLabel: 'Item 1', name: 'cb-vert-1'},
                {boxLabel: 'Item 2', name: 'cb-vert-2', checked: true},
                {boxLabel: 'Item 3', name: 'cb-vert-3'},
                {boxLabel: 'Item 4', name: 'cb-vert-4'},
                {boxLabel: 'Item 5', name: 'cb-vert-5'}
            ]
        },{
            xtype: 'checkboxgroup',
            fieldLabel: 'Multi-Column<br />(custom widths)',
            cls: 'x-check-group-alt',
            // Specify exact column widths (could also include float values for %)
            columns: [100, 100],
            vertical: true,
            items: [
                {boxLabel: 'Item 1', name: 'cb-custwidth', inputValue: 1},
                {boxLabel: 'Item 2', name: 'cb-custwidth', inputValue: 2, checked: true},
                {boxLabel: 'Item 3', name: 'cb-custwidth', inputValue: 3},
                {boxLabel: 'Item 4', name: 'cb-custwidth', inputValue: 4},
                {boxLabel: 'Item 5', name: 'cb-custwidth', inputValue: 5}
            ]
        },{
            xtype: 'checkboxgroup',
            fieldLabel: 'Custom Layout<br />(w/ validation)',
            allowBlank: false,
            msgTarget: 'side',
            autoFitErrors: false,
            anchor: '-18',
            // You can change the 'layout' to anything you want, and include any nested
            // container structure, for complete layout control. In this example we only
            // want one item in the middle column, which would not be possible using the
            // default 'checkboxgroup' layout's columns config.  We also want to put
            // headings at the top of each column.
            layout: 'column',
            defaultType: 'container',
            items: [{
                columnWidth: .25,
                items: [
                    {xtype: 'component', html: 'Heading 1', cls:'x-form-check-group-label'},
                    {xtype: 'checkboxfield', boxLabel: 'Item 1', name: 'cb-cust-1'},
                    {xtype: 'checkboxfield', boxLabel: 'Item 2', name: 'cb-cust-2'}
                ]
            },{
                columnWidth: .5,
                items: [
                    {xtype: 'component', html: 'Heading 2', cls:'x-form-check-group-label'},
                    {xtype: 'checkboxfield', boxLabel: 'A long item just for fun', name: 'cb-cust-3'}
                ]
            },{
                columnWidth: .25,
                items: [
                    {xtype: 'component', html: 'Heading 3', cls:'x-form-check-group-label'},
                    {xtype: 'checkboxfield', boxLabel: 'Item 4', name: 'cb-cust-4'},
                    {xtype: 'checkboxfield', boxLabel: 'Item 5', name: 'cb-cust-5'}
                ]
            }]
        }]
    };

    /*====================================================================
     * RadioGroup examples
     *====================================================================*/
    // NOTE: These radio examples use the exact same options as the checkbox ones
    // above, so the comments will not be repeated.  Please see comments above for
    // additional explanation on some config options.

    var radioGroup = {
        xtype: 'fieldset',
        title: 'Radio Groups',
        layout: 'anchor',
        defaults: {
            anchor: '100%',
            labelStyle: 'padding-left:4px;'
        },
        collapsible: true,
        items: [{
            xtype: 'textfield',
            name: 'txt-test4',
            fieldLabel: 'Alignment Test'
        },{
            xtype: 'radiogroup',
            fieldLabel: 'Auto Layout',
            cls: 'x-check-group-alt',
            items: [
                {boxLabel: 'Item 1', name: 'rb-auto', inputValue: 1},
                {boxLabel: 'Item 2', name: 'rb-auto', inputValue: 2, checked: true},
                {boxLabel: 'Item 3', name: 'rb-auto', inputValue: 3},
                {boxLabel: 'Item 4', name: 'rb-auto', inputValue: 4},
                {boxLabel: 'Item 5', name: 'rb-auto', inputValue: 5}
            ]
        },{
            xtype: 'radiogroup',
            fieldLabel: 'Single Column',
            columns: 1,
            items: [
                {boxLabel: 'Item 1', name: 'rb-col', inputValue: 1},
                {boxLabel: 'Item 2', name: 'rb-col', inputValue: 2, checked: true},
                {boxLabel: 'Item 3', name: 'rb-col', inputValue: 3}
            ]
        },{
            xtype: 'radiogroup',
            fieldLabel: 'Multi-Column (horizontal)',
            cls: 'x-check-group-alt',
            columns: 3,
            items: [
                {boxLabel: 'Item 1', name: 'rb-horiz-1', inputValue: 1},
                {boxLabel: 'Item 2', name: 'rb-horiz-1', inputValue: 2, checked: true},
                {boxLabel: 'Item 3', name: 'rb-horiz-1', inputValue: 3},
                {boxLabel: 'Item 1', name: 'rb-horiz-2', inputValue: 1, checked: true},
                {boxLabel: 'Item 2', name: 'rb-horiz-2', inputValue: 2}
            ]
        },{
            xtype: 'radiogroup',
            fieldLabel: 'Multi-Column (vertical)',
            columns: 3,
            vertical: true,
            items: [
                {boxLabel: 'Item 1', name: 'rb-vert', inputValue: 1},
                {boxLabel: 'Item 2', name: 'rb-vert', inputValue: 2, checked: true},
                {boxLabel: 'Item 3', name: 'rb-vert', inputValue: 3},
                {boxLabel: 'Item 4', name: 'rb-vert', inputValue: 4},
                {boxLabel: 'Item 5', name: 'rb-vert', inputValue: 5}
            ]
        },{
            xtype: 'radiogroup',
            fieldLabel: 'Multi-Column<br />(custom widths)',
            cls: 'x-check-group-alt',
            columns: [100, 100],
            vertical: true,
            items: [
                {boxLabel: 'Item 1', name: 'rb-custwidth', inputValue: 1},
                {boxLabel: 'Item 2', name: 'rb-custwidth', inputValue: 2, checked: true},
                {boxLabel: 'Item 3', name: 'rb-custwidth', inputValue: 3},
                {boxLabel: 'Item 4', name: 'rb-custwidth', inputValue: 4},
                {boxLabel: 'Item 5', name: 'rb-custwidth', inputValue: 5}
            ]
        },{
            xtype: 'radiogroup',
            fieldLabel: 'Custom Layout<br />(w/ validation)',
            allowBlank: false,
            msgTarget: 'side',
            autoFitErrors: false,
            anchor: '-18',
            layout: 'column',
            defaultType: 'container',
            items: [{
                columnWidth: .25,
                items: [
                    {xtype: 'component', html: 'Heading 1', cls:'x-form-check-group-label'},
                    {xtype: 'radiofield', boxLabel: 'Item 1', name: 'rb-cust', inputValue: 1},
                    {xtype: 'radiofield', boxLabel: 'Item 2', name: 'rb-cust', inputValue: 2}
                ]
            },{
                columnWidth: .5,
                items: [
                    {xtype: 'component', html: 'Heading 2', cls:'x-form-check-group-label'},
                    {xtype: 'radiofield', boxLabel: 'A long item just for fun', name: 'rb-cust', inputValue: 3}
                ]
            },{
                columnWidth: .25,
                items: [
                    {xtype: 'component', html: 'Heading 3', cls:'x-form-check-group-label'},
                    {xtype: 'radiofield', boxLabel: 'Item 4', name: 'rb-cust', inputValue: 4},
                    {xtype: 'radiofield', boxLabel: 'Item 5', name: 'rb-cust', inputValue: 5}
                ]
            }]
        }]
    };


    // combine all that into one huge form
    var fp = Ext.create('Ext.FormPanel', {
        title: 'Check/Radio Groups Example',
        frame: true,
        fieldDefaults: {
            labelWidth: 110
        },
        width: 600,
        renderTo:'form-ct',
        bodyPadding: 10,
        items: [
            individual,
            checkGroup,
            radioGroup
        ],
        buttons: [{
            text: 'Save',
            handler: function(){
               if(fp.getForm().isValid()){
                    Ext.Msg.alert('Submitted Values', 'The following will be sent to the server: <br />'+
                        fp.getForm().getValues(true).replace(/&/g,', '));
                }
            }
        },{
            text: 'Reset',
            handler: function(){
                fp.getForm().reset();
            }
        }]
    });
});

