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
    'Ext.layout.container.Table'
]);

Ext.onReady(function() {
    var fakeHTML = "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";
    
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
        title: 'Standard',
        tbar: [{
            xtype:'splitbutton',
            text: 'Menu Button',
            iconCls: 'add16',
            menu: [{text: 'Menu Button 1'}]
        },'-',{
            xtype:'splitbutton',
            text: 'Cut',
            iconCls: 'add16',
            menu: [{text: 'Cut Menu Item'}]
        },{
            text: 'Copy',
            iconCls: 'add16'
        },{
            text: 'Paste',
            iconCls: 'add16',
            menu: [{text: 'Paste Menu Item'}]
        },'-',{
            text: 'Format',
            iconCls: 'add16'
        }]
    });

    new SamplePanel({
        title: 'Multi columns',
        tbar: [{
            xtype: 'buttongroup',
            title: 'Clipboard',
            columns: 2,
            defaults: {
                scale: 'small'
            },
            items: [{
                xtype:'splitbutton',
                text: 'Menu Button',
                iconCls: 'add16',
                menu: [{text: 'Menu Item 1'}]
            },{
                xtype:'splitbutton',
                text: 'Cut',
                iconCls: 'add16',
                menu: [{text: 'Cut Menu Item'}]
            },{
                text: 'Copy',
                iconCls: 'add16'
            },{
                text: 'Paste',
                iconCls: 'add16',
                menu: [{text: 'Paste Menu Item'}]
            },{
                text: 'Format',
                iconCls: 'add16'
            }]
        },{
            xtype: 'buttongroup',
            title: 'Other Bogus Actions',
            columns: 2,
            defaults: {
                scale: 'small'
            },
            items: [{
                xtype:'splitbutton',
                text: 'Menu Button',
                iconCls: 'add16',
                menu: [{text: 'Menu Button 1'}]
            },{
                xtype:'splitbutton',
                text: 'Cut',
                iconCls: 'add16',
                menu: [{text: 'Cut Menu Item'}]
            },{
                text: 'Copy',
                iconCls: 'add16'
            },{
                text: 'Paste',
                iconCls: 'add16',
                menu: [{text: 'Paste Menu Item'}]
            },{
                text: 'Format',
                iconCls: 'add16'
            }]
        }]
    });
    
    new SamplePanel({
        title: 'Multi columns (No titles, double stack)',
        tbar: [{
            xtype: 'buttongroup',
            columns: 3,
            defaults: {
                scale: 'small'
            },
            items: [{
                xtype:'splitbutton',
                text: 'Menu Button',
                iconCls: 'add16',
                menu: [{text: 'Menu Item 1'}]
            },{
                xtype:'splitbutton',
                text: 'Cut',
                iconCls: 'add16',
                menu: [{text: 'Cut Menu Item'}]
            },{
                text: 'Copy',
                iconCls: 'add16'
            },{
                text: 'Paste',
                iconCls: 'add16',
                menu: [{text: 'Paste Menu Item'}]
            },{
                text: 'Format',
                iconCls: 'add16'
            }]
        },{
            xtype: 'buttongroup',
            columns: 3,
            defaults: {
                scale: 'small'
            },
            items: [{
                xtype:'splitbutton',
                text: 'Menu Button',
                iconCls: 'add16',
                menu: [{text: 'Menu Item 1'}]
            },{
                xtype:'splitbutton',
                text: 'Cut',
                iconCls: 'add16',
                menu: [{text: 'Cut Menu Item'}]
            },{
                text: 'Copy',
                iconCls: 'add16'
            },{
                text: 'Paste',
                iconCls: 'add16',
                menu: [{text: 'Paste Menu Item'}]
            },{
                text: 'Format',
                iconCls: 'add16'
            }]
        }]
    });
    
    new SamplePanel({
        title: 'Mix and match icon sizes to create a huge unusable toolbar',
        tbar: [{
            xtype: 'buttongroup',
            columns: 3,
            title: 'Clipboard',
            items: [{
                text: 'Paste',
                scale: 'large',
                rowspan: 3, iconCls: 'add',
                iconAlign: 'top',
                cls: 'x-btn-as-arrow'
            },{
                xtype:'splitbutton',
                text: 'Menu Button',
                scale: 'large',
                rowspan: 3,
                iconCls: 'add',
                iconAlign: 'top',
                arrowAlign:'bottom',
                menu: [{text: 'Menu Item 1'}]
            },{
                xtype:'splitbutton', text: 'Cut', iconCls: 'add16', menu: [{text: 'Cut Menu Item'}]
            },{
                text: 'Copy', iconCls: 'add16'
            },{
                text: 'Format', iconCls: 'add16'
            }]
        },{
            xtype: 'buttongroup',
            columns: 3,
            title: 'Other Actions',
            items: [{
                text: 'Paste',
                scale: 'large',
                rowspan: 3, iconCls: 'add',
                iconAlign: 'top',
                cls: 'x-btn-as-arrow'
            },{
                xtype:'splitbutton',
                text: 'Menu Button',
                scale: 'large',
                rowspan: 3,
                iconCls: 'add',
                iconAlign: 'top',
                arrowAlign:'bottom',
                menu: [{text: 'Menu Button 1'}]
            },{
                xtype:'splitbutton', text: 'Cut', iconCls: 'add16', menu: [{text: 'Cut Menu Item'}]
            },{
                text: 'Copy', iconCls: 'add16'
            },{
                text: 'Format', iconCls: 'add16'
            }]
        }]
    });
    
    new SamplePanel({
        title: 'Medium icons, arrows to the bottom',
        tbar: [{
            xtype: 'buttongroup',
            title: 'Clipboard',
            defaults: {
                scale: 'medium',
                iconAlign:'top'
            },
            items: [{
                xtype:'splitbutton',
                text: 'Menu Button',
                iconCls: 'add24',
                arrowAlign:'bottom',
                menu: [{text: 'Menu Item 1'}]
            },{
                xtype:'splitbutton',
                text: 'Cut',
                iconCls: 'add24',
                arrowAlign:'bottom',
                menu: [{text: 'Cut Menu Item'}]
            },{
                text: 'Copy',
                iconCls: 'add24',
                cls: 'x-btn-as-arrow'
            },{
                text: 'Paste',
                iconCls: 'add24',
                arrowAlign:'bottom',
                menu: [{text: 'Paste Menu Item'}]
            },{
                text: 'Format<br/>Stuff',
                iconCls: 'add24'
            }]
        },{
            xtype: 'buttongroup',
            title: 'Other Bogus Actions',
            defaults: {
                scale: 'medium',
                iconAlign:'top'
            },
            items: [{
                xtype:'splitbutton',
                text: 'Menu Button',
                iconCls: 'add24',
                arrowAlign:'bottom',
                menu: [{text: 'Menu Item 1'}]
            },{
                xtype:'splitbutton',
                text: 'Cut',
                iconCls: 'add24',
                arrowAlign:'bottom',
                menu: [{text: 'Cut Menu Item'}]
            },{
                text: 'Copy',
                iconCls: 'add24',
                cls: 'x-btn-as-arrow'
            },{
                text: 'Paste',
                iconCls: 'add24',
                arrowAlign:'bottom',
                menu: [{text: 'Paste Menu Item'}]
            },{
                text: 'Format',
                iconCls: 'add24',
                cls: 'x-btn-as-arrow'
            }]
        }]
    });
    
    
    new SamplePanel({
        title: 'Medium icons, text and arrows to the left',
        tbar: [{
            xtype:'buttongroup',
            items: [{
                text: 'Cut',
                iconCls: 'add24',
                scale: 'medium'
            },{
                text: 'Copy',
                iconCls: 'add24',
                scale: 'medium'
            },{
                text: 'Paste',
                iconCls: 'add24',
                scale: 'medium',
                menu: [{text: 'Paste Menu Item'}]
            }]
        }, {
            xtype:'buttongroup',
            items: [{
                text: 'Format',
                iconCls: 'add24',
                scale: 'medium'
            }]
        }]
    });
    
    new SamplePanel({
        title: 'Small icons, text and arrows to the left',
        tbar: [{
            xtype:'buttongroup',
            items: [{
                text: 'Cut',
                iconCls: 'add16',
                scale: 'small'
            },{
                text: 'Copy',
                iconCls: 'add16',
                scale: 'small'
            },{
                text: 'Paste',
                iconCls: 'add16',
                scale: 'small',
                menu: [{text: 'Paste Menu Item'}]
            }]
        }, {
            xtype:'buttongroup',
            items: [{
                text: 'Format',
                iconCls: 'add16',
                scale: 'small'
            }]
        }]
    });
});
