/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
Ext.Loader.setConfig({enabled: true});
Ext.Loader.setPath('Ext.ux', '../ux');
Ext.require([
    'Ext.data.*',
    'Ext.panel.Panel',
    'Ext.view.View',
    'Ext.layout.container.Fit',
    'Ext.toolbar.Paging',
    'Ext.ux.form.SearchField'
]);

Ext.define('Post', {
    extend: 'Ext.data.Model',
    idProperty: 'post_id',
    fields: [
        {name: 'postId', mapping: 'post_id'},
        {name: 'title', mapping: 'topic_title'},
        {name: 'topicId', mapping: 'topic_id'},
        {name: 'author', mapping: 'author'},
        {name: 'lastPost', mapping: 'post_time', type: 'date', dateFormat: 'timestamp'},
        {name: 'excerpt', mapping: 'post_text'}
    ]
});

Ext.onReady(function(){
    
    var forumId = 4;

    var store = Ext.create('Ext.data.Store', {
        model: 'Post',
        proxy: {
            type: 'jsonp',
            url: 'http://sencha.com/forum/topics-remote.php',
            extraParams: {
                forumId: forumId
            },
            reader: {
                type: 'json',
                root: 'topics',
                totalProperty: 'totalCount'
            }
        },
        listeners: {
            beforeload: function(){
                var params = store.getProxy().extraParams;
                if (params.query) {
                    delete params.forumId;
                } else {
                    params.forumId = forumId;
                }
            }
        }
    });
    store.loadPage(1);

    var resultTpl = Ext.create('Ext.XTemplate',
        '<tpl for=".">',
        '<div class="search-item">',
            '<h3><span>{lastPost:this.formatDate}<br />by {author}</span>',
            '<a href="http://sencha.com/forum/showthread.php?t={topicId}&p={postId}" target="_blank">{title}</a></h3>',
            '<p>{excerpt}</p>',
        '</div></tpl>',
    {
        formatDate: function(value){
            return Ext.Date.format(value, 'M j, Y');
        }
    });

    var panel = Ext.create('Ext.panel.Panel', {
        title: 'Forum Search',
        height: 300,
        width: 600,
        renderTo: 'search-panel',
        id: 'search-results',
        layout: 'fit',
        items: {
            autoScroll: true,
            xtype: 'dataview',
            tpl: resultTpl,
            store: store,
            itemSelector: 'div.search-item'
        },
        dockedItems: [{
            dock: 'top',
            xtype: 'toolbar',
            items: {
                width: 400,
                fieldLabel: 'Search',
                labelWidth: 50,
                xtype: 'searchfield',
                store: store
            }
        }, {
            dock: 'bottom',
            xtype: 'pagingtoolbar',
            store: store,
            pageSize: 25,
            displayInfo: true,
            displayMsg: 'Topics {0} - {1} of {2}',
            emptyMsg: 'No topics to display'
        }]
    });
});

