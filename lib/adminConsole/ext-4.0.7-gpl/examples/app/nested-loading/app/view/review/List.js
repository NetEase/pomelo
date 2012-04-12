/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * A view which displays a list of reviews for a specified book.
 * @extends Ext.view.View
 */
Ext.define('Books.view.review.List', {
    alias: 'widget.reviewlist',
    extend: 'Ext.panel.Panel',

    requires: ['Ext.layout.container.Card'],

    initComponent: function() {
        this.dataview = Ext.create('Ext.view.View', {
            id: 'reviews',
            border: false,
            cls: 'review-list',

            autoScroll: true,

            store: 'Books.store.Review',
            itemSelector: '.review',
            tpl: new Ext.XTemplate(
                '<tpl for=".">',
                    '<div class="review {[xindex === 1 ? "first-review" : ""]}">',
                        '<div class="title">{title} {[this.stars(values)]}</div>',
                        '<div class="author">By <span>{author}</span> - {date}</div>',
                        '<div class="comment">{comment}</div>',
                    '</div>',
                '</tpl>',
                {
                    stars: function(values) {
                        var res = "";

                        //print out the stars for each of the ratings
                        for (var i = 0; i < values.rating; i++) {
                            res += '<img src="./resources/images/star.' + ((Ext.isIE6) ? 'gif' : 'png') + '" />';
                        }

                        //print out transparent stars for the rest (up to 5)
                        while (i < 5) {
                            res += '<img src="./resources/images/star_no.' + ((Ext.isIE6) ? 'gif' : 'png') + '" />';
                            i++;
                        }

                        return res;
                    }
                }
            )
        });

        Ext.apply(this, {
            border: false,
            flex: 1,
            id: 'test',

            layout: 'card',

            dockedItems: [
                Ext.create('Books.view.Header', {
                    html: 'Reviews'
                })
            ],

            items: [
                this.dataview,
                Ext.create('widget.panel', {
                    id: 'test2',
                    html: 'asdasdsa'
                })
            ]
        });

        this.callParent(arguments);
    },

    /**
     * Used to bind a store to this dataview.
     * Delegates to bindStore and also shows this view
     * @param {Ext.data.Model} record The record to bind
     * @param {Ext.data.Store} store The reviews store used by the application
     */
    bind: function(record, store) {
        //put the reviews into the store and bind the store to thie dataview
        store.loadData(record.data.reviews || []);
        this.dataview.bindStore(store);
    }
});

