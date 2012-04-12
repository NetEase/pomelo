/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * The main application viewport, which displays the whole application
 * @extends Ext.Viewport
 */
Ext.define('Books.view.Viewport', {
    extend: 'Ext.Viewport',    
    layout: 'fit',
    
    requires: [
        'Books.view.Header',
        'Books.view.book.View',
        'Books.view.book.SideBar',
        'Books.view.review.List'
    ],
    
    initComponent: function() {
        var me = this;
        
        Ext.apply(me, {
            items: [
                {
                    xtype: 'panel',
                    border: false,
                    id    : 'viewport',
                    layout: {
                        type: 'vbox',
                        align: 'stretch'
                    },
                    
                    dockedItems: [
                        Ext.create('Books.view.Header'),
                        Ext.create('Books.view.book.SideBar')
                    ],
                    
                    items: [
                        Ext.create('Books.view.book.View'),
                        Ext.create('Books.view.review.List')
                    ]
                }
            ]
        });
                
        me.callParent(arguments);
    }
});
