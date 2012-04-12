/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * The sidebar view for the application. Used to display a list of books.
 * @extends Ext.view.View
 */
Ext.define('Books.view.book.SideBar', {
    alias: 'widget.booksidebar',
    extend: 'Ext.view.View',
    
    initComponent: function() {
        Ext.apply(this, {
            id: 'sidebar',
            
            dock: 'left',
            width: 180,
            border: false,
            cls: 'sidebar-list',
            
            selModel: {
                deselectOnContainerClick: false
            },
            
            store: '',
            itemSelector: '.product',
            tpl: new Ext.XTemplate(
                '<div class="sidebar-title">Books</div>',
                '<tpl for=".">',
                    '<div class="product">{name}</div>',
                '</tpl>'
            )
        });
                
        this.callParent(arguments);
    }
});
