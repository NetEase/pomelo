/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
Ext.onReady(function() {
    Ext.create('Ext.Viewport', {
        layout:'anchor',
        items:[{
            title:'Item 1',
            html:'100% 20%',
            anchor:'100% 20%'
        },{
            title:'Item 2',
            html:'50% 30%',
            anchor:'50% 30%'
        },{
            title:'Item 3',
            html:'-100 50%',
            anchor:'-100 50%'
        }]
    });
});
