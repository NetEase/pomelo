/**
 * @class {name}.Viewport
 * @extends Ext.Panel
 * This is a default generated class which would usually be used to initialize your application's
 * main viewport. By default this is simply a welcome screen that tells you that the app was 
 * generated correctly.
 */
{name}.Viewport = Ext.extend(Ext.Panel, {
    id        : 'viewport',
    layout    : 'card',
    fullscreen: true,

    initComponent: function() {
        var store = new Ext.data.Store({
            fields: ['text', 'href'],
            data  : [
                {
                    text: 'Touch API',
                    href: 'http://dev.sencha.com/deploy/touch/docs/'
                },
                {
                    text: 'Touch Examples',
                    href: 'http://dev.sencha.com/deploy/touch/examples/'
                }
            ]
        });

        Ext.apply(this, {
            dockedItems: [
                {
                    dock : 'left',
                    xtype: 'list',
                    store: store,
                    width: 250,

                    tpl         : '<{tpl} for="."><div class="link"><strong>\{text\}</strong></div></{tpl}>',
                    itemSelector: 'div.link',

                    listeners: {
                        itemtap: this.onListItemTap
                    },

                    dockedItems: [
                        {
                            xtype: 'toolbar',
                            dock : 'top',
                            ui   : 'light'
                        }
                    ]
                }
            ],

            items: [
                {
                    xtype : 'panel',
                    layout: 'fit',

                    dockedItems: [
                        {
                            dock : 'top',
                            xtype: 'toolbar',
                            title: 'Welcome to Sencha Touch'
                        }
                    ],

                    items: [
                        {
                            xtype: 'panel',
                            style: 'background:#fff',

                            styleHtmlContent: true,

                            html : [
                                '<h3>Getting Started</h3>',
                                '<p>You have successfully generated the {name} application. Currently this app is a blank slate, ',
                                'with just the minimum set of files and directories. The file creating this interface can be found ',
                                'in app/views/Viewport.js</p>'
                            ]
                        }
                    ]
                }
            ]
        });

        {name}.Viewport.superclass.initComponent.apply(this, arguments);
    },

    onListItemTap: function(list, index, node, e) {
        var record = list.getRecord(node);

        window.open(record.get('href'));
    }
});
