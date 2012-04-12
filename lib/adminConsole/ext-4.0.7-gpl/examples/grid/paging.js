/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
Ext.Loader.setConfig({enabled: true});

Ext.Loader.setPath('Ext.ux', '../ux/');
Ext.require([
    'Ext.grid.*',
    'Ext.data.*',
    'Ext.util.*',
    'Ext.toolbar.Paging',
    'Ext.ux.PreviewPlugin',
    'Ext.ModelManager',
    'Ext.tip.QuickTipManager'
]);



Ext.onReady(function(){
    Ext.tip.QuickTipManager.init();

    Ext.define('ForumThread', {
        extend: 'Ext.data.Model',
        fields: [
            'title', 'forumtitle', 'forumid', 'username',
            {name: 'replycount', type: 'int'},
            {name: 'lastpost', mapping: 'lastpost', type: 'date', dateFormat: 'timestamp'},
            'lastposter', 'excerpt', 'threadid'
        ],
        idProperty: 'threadid'
    });

    // create the Data Store
    var store = Ext.create('Ext.data.Store', {
        pageSize: 50,
        model: 'ForumThread',
        remoteSort: true,
        proxy: {
            // load using script tags for cross domain, if the data in on the same domain as
            // this page, an HttpProxy would be better
            type: 'jsonp',
            url: 'http://www.sencha.com/forum/topics-browse-remote.php',
            reader: {
                root: 'topics',
                totalProperty: 'totalCount'
            },
            // sends single sort as multi parameter
            simpleSortMode: true
        },
        sorters: [{
            property: 'lastpost',
            direction: 'DESC'
        }]
    });

    // pluggable renders
    function renderTopic(value, p, record) {
        return Ext.String.format(
            '<b><a href="http://sencha.com/forum/showthread.php?t={2}" target="_blank">{0}</a></b><a href="http://sencha.com/forum/forumdisplay.php?f={3}" target="_blank">{1} Forum</a>',
            value,
            record.data.forumtitle,
            record.getId(),
            record.data.forumid
        );
    }

    function renderLast(value, p, r) {
        return Ext.String.format('{0}<br/>by {1}', Ext.Date.dateFormat(value, 'M j, Y, g:i a'), r.get('lastposter'));
    }


    var pluginExpanded = true;
    var grid = Ext.create('Ext.grid.Panel', {
        width: 700,
        height: 500,
        title: 'ExtJS.com - Browse Forums',
        store: store,
        disableSelection: true,
        loadMask: true,
        viewConfig: {
            id: 'gv',
            trackOver: false,
            stripeRows: false,
            plugins: [{
                ptype: 'preview',
                bodyField: 'excerpt',
                expanded: true,
                pluginId: 'preview'
            }]
        },
        // grid columns
        columns:[{
            // id assigned so we can apply custom css (e.g. .x-grid-cell-topic b { color:#333 })
            // TODO: This poses an issue in subclasses of Grid now because Headers are now Components
            // therefore the id will be registered in the ComponentManager and conflict. Need a way to
            // add additional CSS classes to the rendered cells.
            id: 'topic',
            text: "Topic",
            dataIndex: 'title',
            flex: 1,
            renderer: renderTopic,
            sortable: false
        },{
            text: "Author",
            dataIndex: 'username',
            width: 100,
            hidden: true,
            sortable: true
        },{
            text: "Replies",
            dataIndex: 'replycount',
            width: 70,
            align: 'right',
            sortable: true
        },{
            id: 'last',
            text: "Last Post",
            dataIndex: 'lastpost',
            width: 150,
            renderer: renderLast,
            sortable: true
        }],
        // paging bar on the bottom
        bbar: Ext.create('Ext.PagingToolbar', {
            store: store,
            displayInfo: true,
            displayMsg: 'Displaying topics {0} - {1} of {2}',
            emptyMsg: "No topics to display",
            items:[
                '-', {
                text: 'Show Preview',
                pressed: pluginExpanded,
                enableToggle: true,
                toggleHandler: function(btn, pressed) {
                    var preview = Ext.getCmp('gv').getPlugin('preview');
                    preview.toggleExpanded(pressed);
                }
            }]
        }),
        renderTo: 'topic-grid'
    });

    // trigger the data store load
    store.loadPage(1);
});

