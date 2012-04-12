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
    'Ext.tip.QuickTipManager',
    'Ext.window.Window',
    'Ext.tab.Panel',
    'Ext.ux.TabScrollerMenu'
]);

Ext.onReady(function() {
    // enable the tabTip config below
    Ext.tip.QuickTipManager.init();

    var win = Ext.createWidget('window', {
        height: 400,
        width: 600,
        layout: 'fit',
        title: 'Exercising scrollable tabs with a TabScroller menu',
        border: false,
        items: {
            xtype: 'tabpanel',
            activeTab: 0,
            itemId: 'tabPanel',
            plugins: [{
                ptype: 'tabscrollermenu',
                maxText  : 15,
                pageSize : 5
            }],
            items: [{
                title: 'First tab',
                html: 'Creating more tabs...'
            }]
        }
    });

    win.show();

    // Add a bunch of tabs dynamically
    var tabLimit = 12,
        tabPanel = win.getComponent('tabPanel');

    Ext.defer(function (num) {
        var i,
            title,
            tabs = [];
        for (i = 1; i <= tabLimit; i++) {
            title = 'Tab # ' + i;
            tabs.push({
                title: title,
                html: 'Hi, I am tab ' + i,
                tabTip: title,
                closable: true
            });
        }
        tabPanel.add(tabs);
        tabPanel.getComponent(0).body.update('Done!');
    }, 100);
});
