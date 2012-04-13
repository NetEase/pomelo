/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
Ext.Loader.setConfig({
    enabled: true
});

Ext.Loader.setPath('Ext.ux', '../ux/');

Ext.require([
  'Ext.form.Panel',
  'Ext.form.field.Date',
  'Ext.tip.QuickTipManager',
  'Ext.ux.statusbar.StatusBar',
  'Ext.ux.statusbar.ValidationStatus'
]);


Ext.onReady(function(){
    Ext.tip.QuickTipManager.init();
    var fp = Ext.create('Ext.FormPanel', {
        title: 'StatusBar with Integrated Form Validation',
        renderTo: Ext.getBody(),
        width: 350,
        autoHeight: true,
        id: 'status-form',
        renderTo: Ext.getBody(),
        labelWidth: 75,
        bodyPadding: 10,
        defaults: {
            anchor: '95%',
            allowBlank: false,
            selectOnFocus: true,
            msgTarget: 'side'
        },
        items:[{
            xtype: 'textfield',
            fieldLabel: 'Name',
            blankText: 'Name is required'
        },{
            xtype: 'datefield',
            fieldLabel: 'Birthdate',
            blankText: 'Birthdate is required'
        }],
        dockedItems: [{
            xtype: 'toolbar',
            dock: 'bottom',
            ui: 'footer',
            items: ['->', {
                text: 'Save',
                handler: function(){
                    if(fp.getForm().isValid()){
                        var sb = Ext.getCmp('form-statusbar');
                        sb.showBusy('Saving form...');
                        fp.getEl().mask();
                        fp.getForm().submit({
                            url: 'fake.php',
                            success: function(){
                                sb.setStatus({
                                    text:'Form saved!',
                                    iconCls:'',
                                    clear: true
                                });
                                fp.getEl().unmask();
                            }
                        });
                    }
                }
            }]
        }, 
            Ext.create('Ext.ux.StatusBar', {
                dock: 'bottom',
                id: 'form-statusbar',
                defaultText: 'Ready',
                plugins: Ext.create('Ext.ux.statusbar.ValidationStatus', {form:'status-form'})
            })]
    });
});
