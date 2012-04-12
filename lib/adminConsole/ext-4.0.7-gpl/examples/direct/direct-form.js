/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
Ext.require([
    'Ext.direct.*',
    'Ext.form.*',
    'Ext.tip.QuickTipManager',
    'Ext.layout.container.Accordion'
]);

Ext.onReady(function(){    
    /*
     * Notice that Direct requests will batch together if they occur
     * within the enableBuffer delay period (in milliseconds).
     * Slow the buffering down from the default of 10ms to 100ms
     */
    Ext.app.REMOTING_API.enableBuffer = 100;
    Ext.direct.Manager.addProvider(Ext.app.REMOTING_API);
    
    // provide feedback for any errors
    Ext.tip.QuickTipManager.init();
    
    var basicInfo = Ext.create('Ext.form.Panel', {
        // configs for FormPanel
        title: 'Basic Information',
        border: false,
        bodyPadding: 10,
        // configs for BasicForm
        api: {
            // The server-side method to call for load() requests
            load: Profile.getBasicInfo,
            // The server-side must mark the submit handler as a 'formHandler'
            submit: Profile.updateBasicInfo
        },
        // specify the order for the passed params
        paramOrder: ['uid', 'foo'],
        dockedItems: [{
            dock: 'bottom',
            xtype: 'toolbar',
            ui: 'footer',
            style: 'margin: 0 5px 5px 0;',
            items: ['->', {
                text: 'Submit',
                handler: function(){
                    basicInfo.getForm().submit({
                        params: {
                            foo: 'bar',
                            uid: 34
                        }
                    });
                }      
            }]
        }],
        defaultType: 'textfield',
        defaults: {
            anchor: '100%'
        },
        items: [{
            fieldLabel: 'Name',
            name: 'name'
        },{
            fieldLabel: 'Email',
            msgTarget: 'side',
            name: 'email'
        },{
            fieldLabel: 'Company',
            name: 'company'
        }]
    });
    
    var phoneInfo = Ext.create('Ext.form.Panel', {
        title: 'Phone Numbers',
        border: false,
        api: {
            load: Profile.getPhoneInfo
        },
        bodyPadding: 10,
        paramOrder: ['uid'],
        defaultType: 'textfield',
        defaults: {
            anchor: '100%'
        },
        items: [{
            fieldLabel: 'Office',
            name: 'office'
        },{
            fieldLabel: 'Cell',
            name: 'cell'
        },{
            fieldLabel: 'Home',
            name: 'home'
        }]
    });
    
    var locationInfo = Ext.create('Ext.form.Panel', {
        title: 'Location Information',
        border: false,
        bodyPadding: 10,
        api: {
            load: Profile.getLocationInfo
        },
        paramOrder: ['uid'],
        defaultType: 'textfield',
        defaults: {
            anchor: '100%'
        },
        items: [{
            fieldLabel: 'Street',
            name: 'street'
        },{
            fieldLabel: 'City',
            name: 'city'
        },{
            fieldLabel: 'State',
            name: 'state'
        },{
            fieldLabel: 'Zip',
            name: 'zip'
        }]
    });
    
    var accordion = Ext.create('Ext.panel.Panel', {
        layout: 'accordion',
        renderTo: Ext.getBody(),
        title: 'My Profile',
        width: 300,
        height: 240,
        items: [basicInfo, phoneInfo, locationInfo]
    });
    
    // load the forms (notice the load requests will get batched together)
    basicInfo.getForm().load({
        // pass 2 arguments to server side getBasicInfo method (len=2)
        params: {
            foo: 'bar',
            uid: 34
        }
    });

    phoneInfo.getForm().load({
        params: {
            uid: 5
        }
    });

    // defer this request just to simulate the request not getting batched
    // since it exceeds to configured buffer
    Ext.Function.defer(function(){
        locationInfo.getForm().load({
            params: {
                uid: 5
            }
        });
    }, 200);

    // rpc call
    TestAction.doEcho('sample');
});

