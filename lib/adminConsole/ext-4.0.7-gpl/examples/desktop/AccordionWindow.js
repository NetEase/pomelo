/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/*!
 * Ext JS Library 4.0
 * Copyright(c) 2006-2011 Sencha Inc.
 * licensing@sencha.com
 * http://www.sencha.com/license
 */

Ext.define('MyDesktop.AccordionWindow', {
    extend: 'Ext.ux.desktop.Module',

    requires: [
        'Ext.data.TreeStore',
        'Ext.layout.container.Accordion',
        'Ext.toolbar.Spacer',
        'Ext.tree.Panel'
    ],

    id:'acc-win',

    init : function(){
        this.launcher = {
            text: 'Accordion Window',
            iconCls:'accordion',
            handler : this.createWindow,
            scope: this
        };
    },

    createTree : function(){
        var tree = Ext.create('Ext.tree.Panel', {
            id:'im-tree',
            title: 'Online Users',
            rootVisible:false,
            lines:false,
            autoScroll:true,
            tools:[{
                type: 'refresh',
                handler: function(c, t) {
                    tree.setLoading(true, tree.body);
                    var root = tree.getRootNode();
                    root.collapseChildren(true, false);
                    Ext.Function.defer(function() { // mimic a server call
                        tree.setLoading(false);
                        root.expand(true, true);
                    }, 1000);
                }
            }],
            store: Ext.create('Ext.data.TreeStore', {
                root: {
                    text:'Online',
                    expanded: true,
                    children:[{
                        text:'Friends',
                        expanded:true,
                        children:[
                            { text:'Brian', iconCls:'user', leaf:true },
                            { text:'Kevin', iconCls:'user', leaf:true },
                            { text:'Mark', iconCls:'user', leaf:true },
                            { text:'Matt', iconCls:'user', leaf:true },
                            { text:'Michael', iconCls:'user', leaf:true },
                            { text:'Mike Jr', iconCls:'user', leaf:true },
                            { text:'Mike Sr', iconCls:'user', leaf:true },
                            { text:'JR', iconCls:'user', leaf:true },
                            { text:'Rich', iconCls:'user', leaf:true },
                            { text:'Nige', iconCls:'user', leaf:true },
                            { text:'Zac', iconCls:'user', leaf:true }
                        ]
                    },{
                        text:'Family',
                        expanded:true,
                        children:[
                            { text:'Kiana', iconCls:'user-girl', leaf:true },
                            { text:'Aubrey', iconCls:'user-girl', leaf:true },
                            { text:'Cale', iconCls:'user-kid', leaf:true }
                        ]
                    }]
                }
            })
        });

        return tree;
    },

    createWindow : function(){
        var desktop = this.app.getDesktop();
        var win = desktop.getWindow('acc-win');

        if (!win) {
            win = desktop.createWindow({
                id: 'acc-win',
                title: 'Accordion Window',
                width: 250,
                height: 400,
                iconCls: 'accordion',
                animCollapse: false,
                constrainHeader: true,
                bodyBorder: true,
                tbar: {
                    xtype: 'toolbar',
                    ui: 'plain',
                    items: [{
                        tooltip:{title:'Rich Tooltips', text:'Let your users know what they can do!'},
                        iconCls:'connect'
                    },
                    '-',
                    {
                        tooltip:'Add a new user',
                        iconCls:'user-add'
                    },
                    ' ',
                    {
                        tooltip:'Remove the selected user',
                        iconCls:'user-delete'
                    }]
                },

                layout: 'accordion',
                border: false,

                items: [
                    this.createTree(),
                    {
                        title: 'Settings',
                        html:'<p>Something useful would be in here.</p>',
                        autoScroll:true
                    },
                    {
                        title: 'Even More Stuff',
                        html : '<p>Something useful would be in here.</p>'
                    },
                    {
                        title: 'My Stuff',
                        html : '<p>Something useful would be in here.</p>'
                    }
                ]
            });
        }

        win.show();
        return win;
    }
});

