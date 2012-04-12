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
    'Ext.tab.Panel'
]);


/*!
 * Ext JS Library 3.3.1
 * Copyright(c) 2006-2010 Sencha Inc.
 * licensing@sencha.com
 * http://www.sencha.com/license
 */
Ext.onReady(function(){

    Ext.QuickTips.init();

    var bd = Ext.getBody();

    /*
     * ================  Simple form  =======================
     */
    bd.createChild({tag: 'h2', html: 'Form 1 - Very Simple'});


    var simple = Ext.create('Ext.form.Panel', {
        url:'save-form.php',
        frame:true,
        title: 'Simple Form',
        bodyStyle:'padding:5px 5px 0',
        width: 350,
        fieldDefaults: {
            msgTarget: 'side',
            labelWidth: 75
        },
        defaultType: 'textfield',
        defaults: {
            anchor: '100%'
        },

        items: [{
            fieldLabel: 'First Name',
            name: 'first',
            allowBlank:false
        },{
            fieldLabel: 'Last Name',
            name: 'last'
        },{
            fieldLabel: 'Company',
            name: 'company'
        }, {
            fieldLabel: 'Email',
            name: 'email',
            vtype:'email'
        }, {
            xtype: 'timefield',
            fieldLabel: 'Time',
            name: 'time',
            minValue: '8:00am',
            maxValue: '6:00pm'
        }],

        buttons: [{
            text: 'Save'
        },{
            text: 'Cancel'
        }]
    });

    simple.render(document.body);


    /*
     * ================  Form 2  =======================
     */
    bd.createChild({tag: 'h2', html: 'Form 2 - Adding fieldsets'});

    var fsf = Ext.create('Ext.form.Panel', {
        url:'save-form.php',
        frame:true,
        title: 'Simple Form with FieldSets',
        bodyStyle:'padding:5px 5px 0',
        width: 350,
        fieldDefaults: {
            msgTarget: 'side',
            labelWidth: 75
        },
        defaults: {
            anchor: '100%'
        },

        items: [{
            xtype:'fieldset',
            checkboxToggle:true,
            title: 'User Information',
            defaultType: 'textfield',
            collapsed: true,
            layout: 'anchor',
            defaults: {
                anchor: '100%'
            },
            items :[{
                fieldLabel: 'First Name',
                name: 'first',
                allowBlank:false
            },{
                fieldLabel: 'Last Name',
                name: 'last'
            },{
                fieldLabel: 'Company',
                name: 'company'
            }, {
                fieldLabel: 'Email',
                name: 'email',
                vtype:'email'
            }]
        },{
            xtype:'fieldset',
            title: 'Phone Number',
            collapsible: true,
            defaultType: 'textfield',
            layout: 'anchor',
            defaults: {
                anchor: '100%'
            },
            items :[{
                fieldLabel: 'Home',
                name: 'home',
                value: '(888) 555-1212'
            },{
                fieldLabel: 'Business',
                name: 'business'
            },{
                fieldLabel: 'Mobile',
                name: 'mobile'
            },{
                fieldLabel: 'Fax',
                name: 'fax'
            }]
        }],

        buttons: [{
            text: 'Save'
        },{
            text: 'Cancel'
        }]
    });

    fsf.render(document.body);

    /*
     * ================  Form 3  =======================
     */
    bd.createChild({tag: 'h2', html: 'Form 3 - A little more complex'});


    var top = Ext.create('Ext.form.Panel', {
        frame:true,
        title: 'Multi Column, Nested Layouts and Anchoring',
        bodyStyle:'padding:5px 5px 0',
        width: 600,
        fieldDefaults: {
            labelAlign: 'top',
            msgTarget: 'side'
        },

        items: [{
            xtype: 'container',
            anchor: '100%',
            layout:'column',
            items:[{
                xtype: 'container',
                columnWidth:.5,
                layout: 'anchor',
                items: [{
                    xtype:'textfield',
                    fieldLabel: 'First Name',
                    name: 'first',
                    anchor:'96%'
                }, {
                    xtype:'textfield',
                    fieldLabel: 'Company',
                    name: 'company',
                    anchor:'96%'
                }]
            },{
                xtype: 'container',
                columnWidth:.5,
                layout: 'anchor',
                items: [{
                    xtype:'textfield',
                    fieldLabel: 'Last Name',
                    name: 'last',
                    anchor:'100%'
                },{
                    xtype:'textfield',
                    fieldLabel: 'Email',
                    name: 'email',
                    vtype:'email',
                    anchor:'100%'
                }]
            }]
        }, {
            xtype: 'htmleditor',
            name: 'bio',
            fieldLabel: 'Biography',
            height: 200,
            anchor: '100%'
        }],

        buttons: [{
            text: 'Save'
        },{
            text: 'Cancel'
        }]
    });

    top.render(document.body);


    /*
     * ================  Form 4  =======================
     */
    bd.createChild({tag: 'h2', html: 'Form 4 - Forms can be a TabPanel...'});



    var tabs = Ext.create('Ext.form.Panel', {
        width: 350,
        border: false,
        bodyBorder: false,
        fieldDefaults: {
            labelWidth: 75,
            msgTarget: 'side'
        },
        defaults: {
            anchor: '100%'
        },

        items: {
            xtype:'tabpanel',
            activeTab: 0,
            defaults:{
                bodyStyle:'padding:10px'
            },

            items:[{
                title:'Personal Details',
                defaultType: 'textfield',

                items: [{
                    fieldLabel: 'First Name',
                    name: 'first',
                    allowBlank:false,
                    value: 'Ed'
                },{
                    fieldLabel: 'Last Name',
                    name: 'last',
                    value: 'Spencer'
                },{
                    fieldLabel: 'Company',
                    name: 'company',
                    value: 'Ext JS'
                }, {
                    fieldLabel: 'Email',
                    name: 'email',
                    vtype:'email'
                }]
            },{
                title:'Phone Numbers',
                defaultType: 'textfield',

                items: [{
                    fieldLabel: 'Home',
                    name: 'home',
                    value: '(888) 555-1212'
                },{
                    fieldLabel: 'Business',
                    name: 'business'
                },{
                    fieldLabel: 'Mobile',
                    name: 'mobile'
                },{
                    fieldLabel: 'Fax',
                    name: 'fax'
                }]
            }]
        },

        buttons: [{
            text: 'Save'
        },{
            text: 'Cancel'
        }]
    });

    tabs.render(document.body);



    /*
     * ================  Form 5  =======================
     */
    bd.createChild({tag: 'h2', html: 'Form 5 - ... and forms can contain TabPanel(s)'});

    var tab2 = Ext.create('Ext.form.Panel', {
        title: 'Inner Tabs',
        bodyStyle:'padding:5px',
        width: 600,
        fieldDefaults: {
            labelAlign: 'top',
            msgTarget: 'side'
        },
        defaults: {
            anchor: '100%'
        },

        items: [{
            layout:'column',
            border:false,
            items:[{
                columnWidth:.5,
                border:false,
                layout: 'anchor',
                defaultType: 'textfield',
                items: [{
                    fieldLabel: 'First Name',
                    name: 'first',
                    anchor:'95%'
                }, {
                    fieldLabel: 'Company',
                    name: 'company',
                    anchor:'95%'
                }]
            },{
                columnWidth:.5,
                border:false,
                layout: 'anchor',
                defaultType: 'textfield',
                items: [{
                    fieldLabel: 'Last Name',
                    name: 'last',
                    anchor:'95%'
                },{
                    fieldLabel: 'Email',
                    name: 'email',
                    vtype:'email',
                    anchor:'95%'
                }]
            }]
        },{
            xtype:'tabpanel',
            plain:true,
            activeTab: 0,
            height:235,
            defaults:{bodyStyle:'padding:10px'},
            items:[{
                title:'Personal Details',
                defaults: {width: 230},
                defaultType: 'textfield',

                items: [{
                    fieldLabel: 'First Name',
                    name: 'first',
                    allowBlank:false,
                    value: 'Jamie'
                },{
                    fieldLabel: 'Last Name',
                    name: 'last',
                    value: 'Avins'
                },{
                    fieldLabel: 'Company',
                    name: 'company',
                    value: 'Ext JS'
                }, {
                    fieldLabel: 'Email',
                    name: 'email',
                    vtype:'email'
                }]
            },{
                title:'Phone Numbers',
                defaults: {width: 230},
                defaultType: 'textfield',

                items: [{
                    fieldLabel: 'Home',
                    name: 'home',
                    value: '(888) 555-1212'
                },{
                    fieldLabel: 'Business',
                    name: 'business'
                },{
                    fieldLabel: 'Mobile',
                    name: 'mobile'
                },{
                    fieldLabel: 'Fax',
                    name: 'fax'
                }]
            },{
                cls: 'x-plain',
                title: 'Biography',
                layout: 'fit',
                items: {
                    xtype: 'htmleditor',
                    name: 'bio2',
                    fieldLabel: 'Biography'
                }
            }]
        }],

        buttons: [{
            text: 'Save'
        },{
            text: 'Cancel'
        }]
    });

    tab2.render(document.body);
});



