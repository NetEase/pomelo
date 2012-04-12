/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * Books controller
 * Used to manage books; showing the first book, showing a spefied book, loading books, and showing their
 * related views
 */
Ext.define('Books.controller.Books', {
    extend: 'Ext.app.Controller',
    
    models: ['Book'],
    stores: ['Books', 'Reviews'],
    
    refs: [
        {ref: 'bookSideBar', selector: 'booksidebar'},
        {ref: 'bookView',    selector: 'bookview'},
        {ref: 'reviewList',  selector: 'reviewlist'}
    ],
    
    init: function() {
        var me = this;
        
        me.control({
            'booksidebar': {
                selectionchange: me.onSideBarSelectionChange
            }
        });
        
        me.getBooksStore().on({
            scope: me,
            load : me.onBooksStoreLoad
        });
    },
    
    onLaunch: function() {
        this.getBookSideBar().bindStore(this.getBooksStore());
    },
    
    onSideBarSelectionChange: function(view, records) {
        if (records.length) {
            this.showBook(records[0]);
        }
    },
    
    /**
     * Called when the books store is loaded.
     * Checks if there are any records, and if there are, it delegates to show the first record
     * as well as selecting that record in the sidebar
     */
    onBooksStoreLoad: function(store, records) {
        Ext.defer(function() {
            if (records.length) {
                var record = records[0],
                    me = this;
                
                me.getBookSideBar().getSelectionModel().select(record);
            }
        }, 500, this);
    },
    
    /**
     * Shows a specified record by binding it to
     */
    showBook: function(record) {
        var me = this;
        
        me.getBookView().bind(record);
        me.getReviewList().bind(record, me.getReviewsStore());
    }
});
