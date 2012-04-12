/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
Ext.require('Ext.tab.*');

Ext.onReady(function(){
    // basic tabs 1, built from existing content
    var tabs = Ext.createWidget('tabpanel', {
        renderTo: 'tabs1',
        width: 450,
        activeTab: 0,
        defaults :{
            bodyPadding: 10
        },
        items: [{
            contentEl:'script', 
            title: 'Short Text',
            closable: true
        },{
            contentEl:'markup', 
            title: 'Long Text'
        }]
    });
    
    // second tabs built from JS
    var tabs2 = Ext.createWidget('tabpanel', {
        renderTo: document.body,
        activeTab: 0,
        width: 600,
        height: 250,
        plain: true,
        defaults :{
            autoScroll: true,
            bodyPadding: 10
        },
        items: [{
                title: 'Normal Tab',
                html: "My content was added during construction."
            },{
                title: 'Ajax Tab 1',
                loader: {
                    url: 'ajax1.htm',
                    contentType: 'html',
                    loadMask: true
                },
                listeners: {
                    activate: function(tab) {
                        tab.loader.load();
                    }
                }
            },{
                title: 'Ajax Tab 2',
                loader: {
                    url: 'ajax2.htm',
                    contentType: 'html',
                    autoLoad: true,
                    params: 'foo=123&bar=abc'
                }
            },{
                title: 'Event Tab',
                listeners: {
                    activate: function(tab){
                        alert(tab.title + ' was activated.');
                    }
                },
                html: "I am tab 4's content. I also have an event listener attached."
            },{
                title: 'Disabled Tab',
                disabled: true,
                html: "Can't see me cause I'm disabled"
            }
        ]
    });
});
