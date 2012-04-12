/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
Ext.require([
    'Ext.slider.*', 
    'Ext.form.*',
    'Ext.window.MessageBox'
]);

Ext.onReady(function(){
    Ext.create('Ext.form.Panel', {
        width: 400,
        height: 160,
        title: 'Sound Settings',
        bodyPadding: 10,
        renderTo: 'container',
        defaultType: 'sliderfield',
        defaults: {
            anchor: '95%',
            tipText: function(thumb){
                return String(thumb.value) + '%';
            } 
        },
        items: [{
            fieldLabel: 'Sound Effects',
            value: 50,
            name: 'fx'
        },{
            fieldLabel: 'Ambient Sounds',
            value: 80,
            name: 'ambient'
        },{
            fieldLabel: 'Interface Sounds',
            value: 25,
            name: 'iface'
        }],
        dockedItems: {
            xtype: 'toolbar',
            dock: 'bottom',
            ui: 'footer',
            items: [{
                text: 'Max All',
                handler: function(){
                    this.up('form').items.each(function(c){
                        c.setValue(100);
                    });
                }
            }, '->', {
                text: 'Save',
                handler: function(){
                    var values = this.up('form').getForm().getValues(),
                        s = ['Sounds Effects: <b>{0}%</b>',
                            'Ambient Sounds: <b>{1}%</b>',
                            'Interface Sounds: <b>{2}%</b>'];
                    
                    Ext.Msg.alert({
                        title: 'Settings Saved',
                        msg: Ext.String.format(s.join('<br />'), values.fx, values.ambient, values.iface),
                        icon: Ext.Msg.INFO,
                        buttons: Ext.Msg.OK
                    }); 
                }
            },{
                text: 'Reset',
                handler: function(){
                    this.up('form').getForm().reset();
                }
            }]
        }
    });
});

