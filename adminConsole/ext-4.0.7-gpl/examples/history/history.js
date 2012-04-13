/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
Ext.require([
    'Ext.util.History',
    'Ext.tab.Panel'
]);

Ext.onReady(function() {
    // The only requirement for this to work is that you must have a hidden field and
    // an iframe available in the page with ids corresponding to Ext.History.fieldId
    // and Ext.History.iframeId.  See history.html for an example.
    Ext.History.init();

    // Needed if you want to handle history for multiple components in the same page.
    // Should be something that won't be in component ids.
    var tokenDelimiter = ':';
    
    function onTabChange(tabPanel, tab) {
        var tabs = [],
            ownerCt = tabPanel.ownerCt, 
            oldToken, newToken;

        tabs.push(tab.id);
        tabs.push(tabPanel.id);

        while (ownerCt && ownerCt.is('tabpanel')) {
            tabs.push(ownerCt.id);
            ownerCt = ownerCt.ownerCt;
        }
        
        newToken = tabs.reverse().join(tokenDelimiter);
        
        oldToken = Ext.History.getToken();
       
        if (oldToken === null || oldToken.search(newToken) === -1) {
            Ext.History.add(newToken);
        }
    }
    
    // Handle this change event in order to restore the UI to the appropriate history state
    function onAfterRender() {
        Ext.History.on('change', function(token) {
            var parts, tabPanel, length, i;
            
            if (token) {
                parts = token.split(tokenDelimiter);
                length = parts.length;
                
                // setActiveTab in all nested tabs
                for (i = 0; i < length - 1; i++) {
                    Ext.getCmp(parts[i]).setActiveTab(Ext.getCmp(parts[i + 1]));
                }
            }
        });
        
        // This is the initial default state.  Necessary if you navigate starting from the
        // page without any existing history token params and go back to the start state.
        var activeTab1 = Ext.getCmp('main-tabs').getActiveTab(),
            activeTab2 = activeTab1.getActiveTab();
            
        onTabChange(activeTab1, activeTab2);
    }
    
    Ext.create('Ext.TabPanel', {
        renderTo: Ext.getBody(),
        id: 'main-tabs',
        height: 300,
        width: 600,
        activeTab: 0,
        defaults: {
            padding: 10
        },
        
        items: [{
            xtype: 'tabpanel',
            title: 'Tab 1',
            id: 'tab1',
            activeTab: 0,
            padding: 5,
            border: true,
            plain: true,
            
            defaults: {
                padding: 10
            },

            items: [{
                title: 'Sub-tab 1',
                id: 'subtab1',
                html: 'Sub-tab 1 content'
            },{
                title: 'Sub-tab 2',
                id: 'subtab2',
                html: 'Sub-tab 2 content'
            },{
                title: 'Sub-tab 3',
                id: 'subtab3',
                html: 'Sub-tab 3 content'
            }],
            
            listeners: {
                tabchange: onTabChange
            }
        },{
            title: 'Tab 2',
            id: 'tab2',
            html: 'Tab 2 content'
        },{
            title: 'Tab 3',
            id: 'tab3',
            html: 'Tab 3 content'
        },{
            title: 'Tab 4',
            id: 'tab4',
            html: 'Tab 4 content'
        },{
            title: 'Tab 5',
            id: 'tab5',
            html: 'Tab 5 content'
        }],
        listeners: {
            tabchange: onTabChange,
            afterrender: onAfterRender 
        }
    });
});
