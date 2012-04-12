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
    'Ext.data.*',
    'Ext.window.MessageBox'
]);

Ext.onReady(function() {

    var formPanel,

        // The data store for the State comboboxes
        statesStore = Ext.create('Ext.data.ArrayStore', {
            fields: ['abbr'],
            data : Ext.example.states // from states.js
        }),

        // The data store for the Month combobox 
        monthsStore = Ext.create('Ext.data.Store', {
            fields: ['name', 'num'],
            data: (function() {
                var data = [];
                Ext.Array.forEach(Ext.Date.monthNames, function(name, i) {
                    data[i] = {name: name, num: i + 1};
                });
                return data;
            })()
        });

    /**
     * Common change listener for the Mailing Address fields - if the checkbox to use the same
     * values for Billing Address is checked, this copies the values over as they change.
     */
    function onMailingAddrFieldChange(field) {
        var copyToBilling = formPanel.down('[name=billingSameAsMailing]').getValue();
        if (copyToBilling) {
            formPanel.down('[name=' + field.billingFieldName + ']').setValue(field.getValue());
        }
    }


    formPanel = Ext.widget('form', {
        renderTo: Ext.getBody(),
        title: 'Complete Check Out',
        frame: true,
        width: 550,
        bodyPadding: 5,
        fieldDefaults: {
            labelAlign: 'right',
            labelWidth: 90,
            msgTarget: 'qtip'
        },

        items: [
            // Contact info
            {
                xtype: 'fieldset',
                title: 'Your Contact Information',
                defaultType: 'textfield',
                layout: 'anchor',
                defaults: {
                    anchor: '100%'
                },
                items: [{
                    xtype: 'fieldcontainer',
                    fieldLabel: 'Name',
                    layout: 'hbox',
                    combineErrors: true,
                    defaultType: 'textfield',
                    defaults: {
                        hideLabel: 'true'
                    },
                    items: [{
                        name: 'firstName',
                        fieldLabel: 'First Name',
                        flex: 2,
                        emptyText: 'First',
                        allowBlank: false
                    }, {
                        name: 'lastName',
                        fieldLabel: 'Last Name',
                        flex: 3,
                        margins: '0 0 0 6',
                        emptyText: 'Last',
                        allowBlank: false
                    }]
                }, {
                    xtype: 'container',
                    layout: 'hbox',
                    defaultType: 'textfield',
                    items: [{
                        fieldLabel: 'Email Address',
                        name: 'email',
                        vtype: 'email',
                        flex: 1,
                        allowBlank: false
                    }, {
                        fieldLabel: 'Phone Number',
                        labelWidth: 100,
                        name: 'phone',
                        width: 190,
                        emptyText: 'xxx-xxx-xxxx',
                        maskRe: /[\d\-]/,
                        regex: /^\d{3}-\d{3}-\d{4}$/,
                        regexText: 'Must be in the format xxx-xxx-xxxx'
                    }]
                }]
            },

            // Mailing Address
            {
                xtype: 'fieldset',
                title: 'Mailing Address',
                defaultType: 'textfield',
                layout: 'anchor',
                defaults: {
                    anchor: '100%'
                },
                items: [{
                    fieldLabel: 'Street Address',
                    name: 'mailingStreet',
                    listeners: {change: onMailingAddrFieldChange},
                    billingFieldName: 'billingStreet',
                    allowBlank: false
                }, {
                    xtype: 'container',
                    layout: 'hbox',
                    items: [{
                        xtype: 'textfield',
                        fieldLabel: 'City',
                        name: 'mailingCity',
                        listeners: {change: onMailingAddrFieldChange},
                        billingFieldName: 'billingCity',
                        flex: 1,
                        allowBlank: false
                    }, {
                        xtype: 'combobox',
                        name: 'mailingState',
                        listeners: {change: onMailingAddrFieldChange},
                        billingFieldName: 'billingState',
                        fieldLabel: 'State',
                        labelWidth: 50,
                        width: 100,
                        store: statesStore,
                        valueField: 'abbr',
                        displayField: 'abbr',
                        typeAhead: true,
                        queryMode: 'local',
                        allowBlank: false,
                        forceSelection: true
                    }, {
                        xtype: 'textfield',
                        fieldLabel: 'Postal Code',
                        labelWidth: 80,
                        name: 'mailingPostalCode',
                        listeners: {change: onMailingAddrFieldChange},
                        billingFieldName: 'billingPostalCode',
                        width: 160,
                        allowBlank: false,
                        maxLength: 10,
                        enforceMaxLength: true,
                        maskRe: /[\d\-]/,
                        regex: /^\d{5}(\-\d{4})?$/,
                        regexText: 'Must be in the format xxxxx or xxxxx-xxxx'
                    }]
                }]
            },

            // Billing Address
            {
                xtype: 'fieldset',
                title: 'Billing Address',
                layout: 'anchor',
                defaults: {
                    anchor: '100%'
                },
                items: [{
                    xtype: 'checkbox',
                    name: 'billingSameAsMailing',
                    boxLabel: 'Same as Mailing Address?',
                    hideLabel: true,
                    checked: true,
                    style: 'margin-bottom:10px',

                    /**
                     * Enables or disables the billing address fields according to whether the checkbox is checked.
                     * In addition to disabling the fields, they are animated to a low opacity so they don't take
                     * up visual attention.
                     */
                    handler: function(me, checked) {
                        var fieldset = me.ownerCt;
                        Ext.Array.forEach(fieldset.previousSibling().query('textfield'), onMailingAddrFieldChange);
                        Ext.Array.forEach(fieldset.query('textfield'), function(field) {
                            field.setDisabled(checked);
                            // Animate the opacity on each field. Would be more efficient to wrap them in a container
                            // and animate the opacity on just the single container element, but IE has a bug where
                            // the alpha filter does not get applied on position:relative children.
                            // This must only be applied when it is not IE6, as it has issues with opacity when cleartype
                            // is enabled
                            if (!Ext.isIE6) {
                                field.el.animate({opacity: checked ? .3 : 1});
                            }
                        });
                    }
                }, {
                    xtype: 'textfield',
                    fieldLabel: 'Street Address',
                    name: 'billingStreet',
                    //style: 'opacity:.3',
                    disabled: true,
                    allowBlank: false
                }, {
                    xtype: 'container',
                    layout: 'hbox',
                    items: [{
                        xtype: 'textfield',
                        fieldLabel: 'City',
                        name: 'billingCity',
                        style: (!Ext.isIE6) ? 'opacity:.3' : '',
                        flex: 1,
                        disabled: true,
                        allowBlank: false
                    }, {
                        xtype: 'combobox',
                        name: 'billingState',
                        style: (!Ext.isIE6) ? 'opacity:.3' : '',
                        fieldLabel: 'State',
                        labelWidth: 50,
                        width: 100,
                        store: statesStore,
                        valueField: 'abbr',
                        displayField: 'abbr',
                        typeAhead: true,
                        queryMode: 'local',
                        disabled: true,
                        allowBlank: false,
                        forceSelection: true
                    }, {
                        xtype: 'textfield',
                        fieldLabel: 'Postal Code',
                        labelWidth: 80,
                        name: 'billingPostalCode',
                        style: (!Ext.isIE6) ? 'opacity:.3' : '',
                        width: 160,
                        disabled: true,
                        allowBlank: false,
                        maxLength: 10,
                        enforceMaxLength: true,
                        maskRe: /[\d\-]/,
                        regex: /^\d{5}(\-\d{4})?$/,
                        regexText: 'Must be in the format xxxxx or xxxxx-xxxx'
                    }]
                }]
            },

            // Credit card info
            {
                xtype: 'fieldset',
                title: 'Payment',
                layout: 'anchor',
                defaults: {
                    anchor: '100%'
                },
                items: [{
                    xtype: 'radiogroup',
                    layout: 'hbox',
                    defaults: {
                        name: 'ccType',
                        margins: '0 15 0 0'
                    },
                    items: [{
                        inputValue: 'visa',
                        boxLabel: 'VISA',
                        checked: true
                    }, {
                        inputValue: 'mastercard',
                        boxLabel: 'MasterCard'
                    }, {
                        inputValue: 'amex',
                        boxLabel: 'American Express'
                    }, {
                        inputValue: 'discover',
                        boxLabel: 'Discover'
                    }]
                }, {
                    xtype: 'textfield',
                    name: 'ccName',
                    fieldLabel: 'Name On Card',
                    allowBlank: false
                }, {
                    xtype: 'container',
                    layout: 'hbox',
                    items: [{
                        xtype: 'textfield',
                        name: 'ccNumber',
                        fieldLabel: 'Card Number',
                        flex: 1,
                        allowBlank: false,
                        minLength: 15,
                        maxLength: 16,
                        enforceMaxLength: true,
                        maskRe: /\d/
                    }, {
                        xtype: 'fieldcontainer',
                        fieldLabel: 'Expiration',
                        labelWidth: 75,
                        layout: 'hbox',
                        width: 235,
                        items: [{
                            xtype: 'combobox',
                            name: 'ccExpireMonth',
                            displayField: 'name',
                            valueField: 'num',
                            queryMode: 'local',
                            emptyText: 'Month',
                            hideLabel: true,
                            margins: '0 6 0 0',
                            store: monthsStore,
                            flex: 1,
                            allowBlank: false,
                            forceSelection: true
                        }, {
                            xtype: 'numberfield',
                            name: 'ccExpireYear',
                            hideLabel: true,
                            width: 55,
                            value: new Date().getFullYear(),
                            minValue: new Date().getFullYear(),
                            allowBlank: false
                        }]
                    }]
                }]
            }
        ],

        buttons: [{
            text: 'Reset',
            handler: function() {
                this.up('form').getForm().reset();
            }
        }, {
            text: 'Complete Purchase',
            width: 150,
            handler: function() {
                var form = this.up('form').getForm();
                if (form.isValid()) {
                    Ext.MessageBox.alert('Submitted Values', form.getValues(true));
                }
            }
        }]

    });

});

