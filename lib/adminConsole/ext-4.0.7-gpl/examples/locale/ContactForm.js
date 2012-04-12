/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
Ext.define('Ext.app.ContactForm', {
    extend: 'Ext.form.Panel',
    requires: [
     'Ext.data.ArrayStore',
     'Ext.data.reader.Array',
     'Ext.form.field.ComboBox',
     'Ext.form.field.Date'
    ],
    formTitle: 'Contact Information (English)',
    firstName: 'First Name',
    lastName: 'Surname',
    surnamePrefix: 'Surname Prefix',
    company: 'Company',
    state: 'State',
    stateEmptyText: 'Choose a state...',
    email: 'E-mail',
    birth: 'Date of Birth',
    save: 'Save',
    cancel: 'Cancel',
    initComponent : function(config) {
        Ext.apply(this, {
            url: 'save-form.php',
            frame: true,
            title: this.formTitle,
            bodyStyle: 'padding:5px 5px 0',
            width: 370,
            defaultType: 'textfield',
            defaults: {
                width: 330
            },
            items: [{
                    fieldLabel: this.firstName,
                    name: 'firstname',
                    allowBlank:false
                },{
                    fieldLabel: this.lastName,
                    name: 'lastName'
                },{
                    fieldLabel: this.surnamePrefix,
                    width: 150,
                    name: 'surnamePrefix'
                },{
                    fieldLabel: this.company,
                    name: 'company'
                },  Ext.create('Ext.form.field.ComboBox', {
                    fieldLabel: this.province,
                    hiddenName: 'state',
                    store: Ext.create('Ext.data.ArrayStore', {
                        fields: ['provincie'],
                        data : Ext.exampledata.dutch_provinces // from dutch-provinces.js
                    }),
                    displayField: 'provincie',
                    typeAhead: true,
                    queryMode: 'local',
                    triggerAction: 'all',
                    emptyText: this.stateEmptyText,
                    selectOnFocus:true
                }), {
                    fieldLabel: this.email,
                    name: 'email',
                    vtype:'email'
                }, Ext.create('Ext.form.field.Date', {
                    fieldLabel: this.birth,
                    name: 'birth'
                })
            ],

            buttons: [{
                text: this.save
            },{
                text: this.cancel
            }]
        });

        this.callParent(arguments);
    }
});

Ext.require([
   'Ext.tip.QuickTipManager'
]);

Ext.onReady(function(){
    Ext.tip.QuickTipManager.init();

    // turn on validation errors beside the field globally
    Ext.form.field.Base.prototype.msgTarget = 'side';

    var bd = Ext.getBody();

    bd.createChild({tag: 'h2', html: 'Localized Contact Form'});

    // simple form
    var simple = Ext.create('Ext.app.ContactForm', {});
    simple.render(document.body);
});

