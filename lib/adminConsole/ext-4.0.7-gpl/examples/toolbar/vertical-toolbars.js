/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
Ext.require([
    'Ext.panel.*',
    'Ext.toolbar.*',
    'Ext.button.*',
    'Ext.container.ButtonGroup',
    'Ext.layout.container.Table',
    'Ext.tip.QuickTipManager'
]);

Ext.onReady(function() {
    var fakeHTML = "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";

    Ext.QuickTips.init();

    // The default dockedItem weights have TLRB order, but TBLR matches border layout:
    Ext.panel.AbstractPanel.prototype.defaultDockWeights = { top: 1, bottom: 3, left: 5, right: 7 };

    var SamplePanel = Ext.extend(Ext.Panel, {
        width    : 500,
        height   : 250,
        style    : 'margin-top:15px',
        bodyStyle: 'padding:10px',
        renderTo : Ext.getBody(),
        html     : fakeHTML,
        autoScroll: true
    });
    
    new SamplePanel({
        title: 'Standard (lbar)',
        lbar: [{
                iconCls: 'add16',
                tooltip: 'Button 1'
            },
            '-',
            {
                iconCls: 'add16',
                tooltip: {
                    text: 'Button 2',
                    anchor: 'left'
                }
            },{
                iconCls: 'add16'
            },{
                iconCls: 'add16'
            },
            '-',
            {
                iconCls: 'add16'
            }
        ]
    });

    new SamplePanel({
        title: 'Standard w/Split Buttons (rbar)',
        rbar: [{
                iconCls: 'add16',
                menu: [{text: 'Menu Button 1'}]
            },'-',{
                iconCls: 'add16',
                menu: [{text: 'Cut Menu Item'}]
            },{
                iconCls: 'add16'
            },{
                iconCls: 'add16',
                menu: [{text: 'Paste Menu Item'}]
            },'-',{
                iconCls: 'add16'
            }
        ]
    });

    new SamplePanel({
        title: 'Standard w/Short Text',
        lbar: [{
                xtype:'splitbutton',
                text: 'Menu',
                iconCls: 'add16',
                menu: [{text: 'Menu Button 1'}]
            },
            //'-',
            {
                xtype:'splitbutton',
                text: 'Cut',
                textAlign: 'left',
                iconCls: 'add16',
                menu: [{text: 'Cut Menu Item'}]
            },{
                text: 'Copy',
                textAlign: 'left',
                iconCls: 'add16'
            },{
                text: 'Paste',
                textAlign: 'left',
                iconCls: 'add16',
                menu: [{text: 'Paste Menu Item'}]
            },
            //'-',
            {
                text: 'Format',
                textAlign: 'left',
                iconCls: 'add16'
            }
        ]
    });

    new SamplePanel({
        title: 'Standard w/Long Text',
        rbar: [{
                xtype:'splitbutton',
                text: 'Menu Button',
                iconCls: 'add16',
                textAlign: 'left',
                menu: [{text: 'Menu Button 1'}]
            },'-',{
                xtype:'splitbutton',
                text: 'Cut Selection',
                iconCls: 'add16',
                textAlign: 'left',
                menu: [{text: 'Cut Menu Item'}]
            },{
                text: 'Copy Selection',
                textAlign: 'left',
                iconCls: 'add16'
            },{
                text: 'Paste',
                iconCls: 'add16',
                textAlign: 'left',
                menu: [{text: 'Paste Menu Item'}]
            },'-',{
                text: 'Format',
                textAlign: 'left',
                iconCls: 'add16'
            }
        ]
    });

    new SamplePanel({
        title: 'One of Everything',
        tbar: [{
                iconCls: 'add16',
                text: 'Button 1'
            },
            '-',
            {
                iconCls: 'add16',
                text: 'Button 2'
            },{
                iconCls: 'add16'
            },{
                iconCls: 'add16'
            },
            '-',
            {
                iconCls: 'add16'
            }
        ],
        lbar: [{
                iconCls: 'add16',
                tooltip: 'Button 1'
            },
            '-',
            {
                iconCls: 'add16',
                tooltip: {
                    text: 'Button 2',
                    anchor: 'left'
                }
            },{
                iconCls: 'add16'
            },{
                iconCls: 'add16'
            },
            '-',
            {
                iconCls: 'add16'
            }
        ],
        rbar: [{
                iconCls: 'add16',
                tooltip: 'Button 1'
            },
            '-',
            {
                iconCls: 'add16',
                tooltip: {
                    text: 'Button 2',
                    anchor: 'left'
                }
            },{
                iconCls: 'add16'
            },{
                iconCls: 'add16'
            },
            '-',
            {
                iconCls: 'add16'
            }
        ],
        bbar: [{
                iconCls: 'add16',
                text: 'Button 3'
            },
            '-',
            {
                iconCls: 'add16',
                text: 'Button 4'
            },{
                iconCls: 'add16'
            },{
                iconCls: 'add16'
            },
            '-',
            {
                iconCls: 'add16',
                text: 'Button 5',
                menu: [
                    { text: "Menu Item 1" }
                ]
            }
        ]
    });
});

