/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
Ext.require(['*']);
var buttons = [{
    xtype: 'tbtext',
    text : 'Text'
},  {
    xtype: 'tbseparator'
}];
for (var i = 0; i < 20; i++) {
    buttons.push({
        text: 'Button ' + (i + 1),
        handler: function(b) {
            Ext.Msg.alert('Click', 'You clicked ' + b.text);
        }
    })
}

Ext.onReady(function() {
    Ext.create('Ext.toolbar.Toolbar', {
        renderTo: Ext.getBody(),
        width : 600,
        layout: {
            overflowHandler: 'Menu'
        },
        items: buttons
    });
});
