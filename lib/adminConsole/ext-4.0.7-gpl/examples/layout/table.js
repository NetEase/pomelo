/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
Ext.onReady(function() {
    var panel = Ext.create('Ext.Panel', {
        id:'main-panel',
        baseCls:'x-plain',
        renderTo: Ext.getBody(),
        layout: {
            type: 'table',
            columns: 3
        },
        // applied to child components
        defaults: {frame:true, width:200, height: 200},
        items:[{
            title:'Item 1'
        },{
            title:'Item 2'
        },{
            title:'Item 3'
        },{
            title:'Item 4',
            width:410,
            colspan:2
        },{
            title:'Item 5'
        },{
            title:'Item 6'
        },{
            title:'Item 7',
            width:410,
            colspan:2
        },{
            title:'Item 8',
            rowspan: 2,
            height: 410
        },{
            title:'Item 9'
        },{
            title:'Item 10'
        },{
            title:'Item 11',
            rowspan: 2,
            height: 410
        },{
            title:'Item 12'
        },{
            title:'Item 13'
        },{
            title:'Item 14',
            rowspan: 2,
            height: 410
        },{
            title:'Item 15'
        },{
            title:'Item 16'
        },{
            title:'Item 17',
            rowspan: 2,
            height: 410
        },{
            title:'Item 18',
            width:410,
            colspan:2
        },{
            title:'Item 19'
        },{
            title:'Item 20'
        }]
    });
});

