/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
Ext.Loader.setConfig({enabled: true});

Ext.Loader.setPath('Ext.ux', '../ux/');

Ext.require([
    'Ext.Viewport',
    'Ext.tip.QuickTipManager',
    'Ext.tab.Panel',
    'Ext.ux.GroupTabPanel',
    'Ext.grid.*'
]);

Ext.onReady(function() {
	Ext.tip.QuickTipManager.init();
    
    // create some portlet tools using built in Ext tool ids
    var tools = [{
        type:'gear',
        handler: function(){
            Ext.Msg.alert('Message', 'The Settings tool was clicked.');
        }
    },{
        type:'close',
        handler: function(e, target, panel){
            panel.ownerCt.remove(panel, true);
        }
    }];

    Ext.create('Ext.Viewport', {
        layout:'fit',
        items:[{
            xtype: 'grouptabpanel',
    		activeGroup: 0,
    		items: [{
    			mainItem: 1,
    			items: [{
    				title: 'Tickets',
                    iconCls: 'x-icon-tickets',
                    tabTip: 'Tickets tabtip',
                    //border: false,
                    xtype: 'gridportlet',
                    height: null
    			}, 
                {
                    xtype: 'portalpanel',
                    title: 'Dashboard',
                    tabTip: 'Dashboard tabtip',
                    border: false,
                    items: [{
                        flex: 1,
                        items: [{
                            title: 'Portlet 1',
                            html: '<div class="portlet-content">'+Ext.example.bogusMarkup+'</div>'
                        },{
                            
                            title: 'Stock Portlet',
                            items: {
                                xtype: 'chartportlet'
                            }
                        },{
                            title: 'Portlet 2',
                            html: '<div class="portlet-content">'+Ext.example.bogusMarkup+'</div>'
                        }]
                    }]                  
                }, {
    				title: 'Subscriptions',
                    iconCls: 'x-icon-subscriptions',
                    tabTip: 'Subscriptions tabtip',
                    style: 'padding: 10px;',
                    border: false,
					layout: 'fit',
    				items: [{
						xtype: 'tabpanel',
						activeTab: 1,
						items: [{
							title: 'Nested Tabs',
							html: Ext.example.shortBogusMarkup
						}]	
					}]	
    			}, {
    				title: 'Users',
                    iconCls: 'x-icon-users',
                    tabTip: 'Users tabtip',
                    style: 'padding: 10px;',
    				html: Ext.example.shortBogusMarkup			
    			}]
            }, {
                expanded: true,
                items: [{
                    title: 'Configuration',
                    iconCls: 'x-icon-configuration',
                    tabTip: 'Configuration tabtip',
                    style: 'padding: 10px;',
                    html: Ext.example.shortBogusMarkup 
                }, {
                    title: 'Email Templates',
                    iconCls: 'x-icon-templates',
                    tabTip: 'Templates tabtip',
                    style: 'padding: 10px;',
                    border: false,
                    items:{
                            xtype: 'form', // since we are not using the default 'panel' xtype, we must specify it
                            id: 'form-panel',
                            labelWidth: 75,
                            title: 'Form Layout',
                            bodyStyle: 'padding:15px',
                            labelPad: 20,
                            defaults: {
                                width: 230,
                                labelSeparator: '',
                                msgTarget: 'side'
                            },
                            defaultType: 'textfield',
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
                                },{
                                    fieldLabel: 'Email',
                                    name: 'email',
                                    vtype:'email'
                                }
                            ],
                            buttons: [{text: 'Save'},{text: 'Cancel'}]
                        }
                }]
            }]
		}]
    });
});

