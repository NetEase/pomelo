/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * @author Ed Spencer, Tommy Maintz, Brian Moeskau
 *
 * A basic tab container. TabPanels can be used exactly like a standard {@link Ext.panel.Panel} for
 * layout purposes, but also have special support for containing child Components
 * (`{@link Ext.container.Container#items items}`) that are managed using a
 * {@link Ext.layout.container.Card CardLayout layout manager}, and displayed as separate tabs.
 *
 * **Note:** By default, a tab's close tool _destroys_ the child tab Component and all its descendants.
 * This makes the child tab Component, and all its descendants **unusable**.  To enable re-use of a tab,
 * configure the TabPanel with `{@link #autoDestroy autoDestroy: false}`.
 *
 * ## TabPanel's layout
 *
 * TabPanels use a Dock layout to position the {@link Ext.tab.Bar TabBar} at the top of the widget.
 * Panels added to the TabPanel will have their header hidden by default because the Tab will
 * automatically take the Panel's configured title and icon.
 *
 * TabPanels use their {@link Ext.panel.Header header} or {@link Ext.panel.Panel#fbar footer}
 * element (depending on the {@link #tabPosition} configuration) to accommodate the tab selector buttons.
 * This means that a TabPanel will not display any configured title, and will not display any configured
 * header {@link Ext.panel.Panel#tools tools}.
 *
 * To display a header, embed the TabPanel in a {@link Ext.panel.Panel Panel} which uses
 * `{@link Ext.container.Container#layout layout: 'fit'}`.
 *
 * ## Controlling tabs
 *
 * Configuration options for the {@link Ext.tab.Tab} that represents the component can be passed in
 * by specifying the tabConfig option:
 *
 *     @example
 *     Ext.create('Ext.tab.Panel', {
 *         width: 400,
 *         height: 400,
 *         renderTo: document.body,
 *         items: [{
 *             title: 'Foo'
 *         }, {
 *             title: 'Bar',
 *             tabConfig: {
 *                 title: 'Custom Title',
 *                 tooltip: 'A button tooltip'
 *             }
 *         }]
 *     });
 *
 * # Examples
 *
 * Here is a basic TabPanel rendered to the body. This also shows the useful configuration {@link #activeTab},
 * which allows you to set the active tab on render. If you do not set an {@link #activeTab}, no tabs will be
 * active by default.
 *
 *     @example
 *     Ext.create('Ext.tab.Panel', {
 *         width: 300,
 *         height: 200,
 *         activeTab: 0,
 *         items: [
 *             {
 *                 title: 'Tab 1',
 *                 bodyPadding: 10,
 *                 html : 'A simple tab'
 *             },
 *             {
 *                 title: 'Tab 2',
 *                 html : 'Another one'
 *             }
 *         ],
 *         renderTo : Ext.getBody()
 *     });
 *
 * It is easy to control the visibility of items in the tab bar. Specify hidden: true to have the
 * tab button hidden initially. Items can be subsequently hidden and show by accessing the
 * tab property on the child item.
 *
 *     @example
 *     var tabs = Ext.create('Ext.tab.Panel', {
 *         width: 400,
 *         height: 400,
 *         renderTo: document.body,
 *         items: [{
 *             title: 'Home',
 *             html: 'Home',
 *             itemId: 'home'
 *         }, {
 *             title: 'Users',
 *             html: 'Users',
 *             itemId: 'users',
 *             hidden: true
 *         }, {
 *             title: 'Tickets',
 *             html: 'Tickets',
 *             itemId: 'tickets'
 *         }]
 *     });
 *
 *     setTimeout(function(){
 *         tabs.child('#home').tab.hide();
 *         var users = tabs.child('#users');
 *         users.tab.show();
 *         tabs.setActiveTab(users);
 *     }, 1000);
 *
 * You can remove the background of the TabBar by setting the {@link #plain} property to `true`.
 *
 *     @example
 *     Ext.create('Ext.tab.Panel', {
 *         width: 300,
 *         height: 200,
 *         activeTab: 0,
 *         plain: true,
 *         items: [
 *             {
 *                 title: 'Tab 1',
 *                 bodyPadding: 10,
 *                 html : 'A simple tab'
 *             },
 *             {
 *                 title: 'Tab 2',
 *                 html : 'Another one'
 *             }
 *         ],
 *         renderTo : Ext.getBody()
 *     });
 *
 * Another useful configuration of TabPanel is {@link #tabPosition}. This allows you to change the
 * position where the tabs are displayed. The available options for this are `'top'` (default) and
 * `'bottom'`.
 *
 *     @example
 *     Ext.create('Ext.tab.Panel', {
 *         width: 300,
 *         height: 200,
 *         activeTab: 0,
 *         bodyPadding: 10,
 *         tabPosition: 'bottom',
 *         items: [
 *             {
 *                 title: 'Tab 1',
 *                 html : 'A simple tab'
 *             },
 *             {
 *                 title: 'Tab 2',
 *                 html : 'Another one'
 *             }
 *         ],
 *         renderTo : Ext.getBody()
 *     });
 *
 * The {@link #setActiveTab} is a very useful method in TabPanel which will allow you to change the
 * current active tab. You can either give it an index or an instance of a tab. For example:
 *
 *     @example
 *     var tabs = Ext.create('Ext.tab.Panel', {
 *         items: [
 *             {
 *                 id   : 'my-tab',
 *                 title: 'Tab 1',
 *                 html : 'A simple tab'
 *             },
 *             {
 *                 title: 'Tab 2',
 *                 html : 'Another one'
 *             }
 *         ],
 *         renderTo : Ext.getBody()
 *     });
 *
 *     var tab = Ext.getCmp('my-tab');
 *
 *     Ext.create('Ext.button.Button', {
 *         renderTo: Ext.getBody(),
 *         text    : 'Select the first tab',
 *         scope   : this,
 *         handler : function() {
 *             tabs.setActiveTab(tab);
 *         }
 *     });
 *
 *     Ext.create('Ext.button.Button', {
 *         text    : 'Select the second tab',
 *         scope   : this,
 *         handler : function() {
 *             tabs.setActiveTab(1);
 *         },
 *         renderTo : Ext.getBody()
 *     });
 *
 * The {@link #getActiveTab} is a another useful method in TabPanel which will return the current active tab.
 *
 *     @example
 *     var tabs = Ext.create('Ext.tab.Panel', {
 *         items: [
 *             {
 *                 title: 'Tab 1',
 *                 html : 'A simple tab'
 *             },
 *             {
 *                 title: 'Tab 2',
 *                 html : 'Another one'
 *             }
 *         ],
 *         renderTo : Ext.getBody()
 *     });
 *
 *     Ext.create('Ext.button.Button', {
 *         text    : 'Get active tab',
 *         scope   : this,
 *         handler : function() {
 *             var tab = tabs.getActiveTab();
 *             alert('Current tab: ' + tab.title);
 *         },
 *         renderTo : Ext.getBody()
 *     });
 *
 * Adding a new tab is very simple with a TabPanel. You simple call the {@link #add} method with an config
 * object for a panel.
 *
 *     @example
 *     var tabs = Ext.create('Ext.tab.Panel', {
 *         items: [
 *             {
 *                 title: 'Tab 1',
 *                 html : 'A simple tab'
 *             },
 *             {
 *                 title: 'Tab 2',
 *                 html : 'Another one'
 *             }
 *         ],
 *         renderTo : Ext.getBody()
 *     });
 *
 *     Ext.create('Ext.button.Button', {
 *         text    : 'New tab',
 *         scope   : this,
 *         handler : function() {
 *             var tab = tabs.add({
 *                 // we use the tabs.items property to get the length of current items/tabs
 *                 title: 'Tab ' + (tabs.items.length + 1),
 *                 html : 'Another one'
 *             });
 *
 *             tabs.setActiveTab(tab);
 *         },
 *         renderTo : Ext.getBody()
 *     });
 *
 * Additionally, removing a tab is very also simple with a TabPanel. You simple call the {@link #remove} method
 * with an config object for a panel.
 *
 *     @example
 *     var tabs = Ext.create('Ext.tab.Panel', {
 *         items: [
 *             {
 *                 title: 'Tab 1',
 *                 html : 'A simple tab'
 *             },
 *             {
 *                 id   : 'remove-this-tab',
 *                 title: 'Tab 2',
 *                 html : 'Another one'
 *             }
 *         ],
 *         renderTo : Ext.getBody()
 *     });
 *
 *     Ext.create('Ext.button.Button', {
 *         text    : 'Remove tab',
 *         scope   : this,
 *         handler : function() {
 *             var tab = Ext.getCmp('remove-this-tab');
 *             tabs.remove(tab);
 *         },
 *         renderTo : Ext.getBody()
 *     });
 */
Ext.define('Ext.tab.Panel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.tabpanel',
    alternateClassName: ['Ext.TabPanel'],

    requires: ['Ext.layout.container.Card', 'Ext.tab.Bar'],

    /**
     * @cfg {String} tabPosition
     * The position where the tab strip should be rendered. Can be `top` or `bottom`.
     */
    tabPosition : 'top',

    /**
     * @cfg {String/Number} activeItem
     * Doesn't apply for {@link Ext.tab.Panel TabPanel}, use {@link #activeTab} instead.
     */

    /**
     * @cfg {String/Number/Ext.Component} activeTab
     * The tab to activate initially. Either an ID, index or the tab component itself.
     */

    /**
     * @cfg {Object} tabBar
     * Optional configuration object for the internal {@link Ext.tab.Bar}.
     * If present, this is passed straight through to the TabBar's constructor
     */

    /**
     * @cfg {Object} layout
     * Optional configuration object for the internal {@link Ext.layout.container.Card card layout}.
     * If present, this is passed straight through to the layout's constructor
     */

    /**
     * @cfg {Boolean} removePanelHeader
     * True to instruct each Panel added to the TabContainer to not render its header element.
     * This is to ensure that the title of the panel does not appear twice.
     */
    removePanelHeader: true,

    /**
     * @cfg {Boolean} plain
     * True to not show the full background on the TabBar.
     */
    plain: false,

    /**
     * @cfg {String} itemCls
     * The class added to each child item of this TabPanel.
     */
    itemCls: 'x-tabpanel-child',

    /**
     * @cfg {Number} minTabWidth
     * The minimum width for a tab in the {@link #tabBar}.
     */
    minTabWidth: undefined,

    /**
     * @cfg {Number} maxTabWidth The maximum width for each tab.
     */
    maxTabWidth: undefined,

    /**
     * @cfg {Boolean} deferredRender
     *
     * True by default to defer the rendering of child {@link Ext.container.Container#items items} to the browsers DOM
     * until a tab is activated. False will render all contained {@link Ext.container.Container#items items} as soon as
     * the {@link Ext.layout.container.Card layout} is rendered. If there is a significant amount of content or a lot of
     * heavy controls being rendered into panels that are not displayed by default, setting this to true might improve
     * performance.
     *
     * The deferredRender property is internally passed to the layout manager for TabPanels ({@link
     * Ext.layout.container.Card}) as its {@link Ext.layout.container.Card#deferredRender} configuration value.
     *
     * **Note**: leaving deferredRender as true means that the content within an unactivated tab will not be available
     */
    deferredRender : true,

    //inherit docs
    initComponent: function() {
        var me = this,
            dockedItems = me.dockedItems || [],
            activeTab = me.activeTab || 0;

        me.layout = Ext.create('Ext.layout.container.Card', Ext.apply({
            owner: me,
            deferredRender: me.deferredRender,
            itemCls: me.itemCls
        }, me.layout));

        /**
         * @property {Ext.tab.Bar} tabBar Internal reference to the docked TabBar
         */
        me.tabBar = Ext.create('Ext.tab.Bar', Ext.apply({}, me.tabBar, {
            dock: me.tabPosition,
            plain: me.plain,
            border: me.border,
            cardLayout: me.layout,
            tabPanel: me
        }));

        if (dockedItems && !Ext.isArray(dockedItems)) {
            dockedItems = [dockedItems];
        }

        dockedItems.push(me.tabBar);
        me.dockedItems = dockedItems;

        me.addEvents(
            /**
             * @event
             * Fires before a tab change (activated by {@link #setActiveTab}). Return false in any listener to cancel
             * the tabchange
             * @param {Ext.tab.Panel} tabPanel The TabPanel
             * @param {Ext.Component} newCard The card that is about to be activated
             * @param {Ext.Component} oldCard The card that is currently active
             */
            'beforetabchange',

            /**
             * @event
             * Fires when a new tab has been activated (activated by {@link #setActiveTab}).
             * @param {Ext.tab.Panel} tabPanel The TabPanel
             * @param {Ext.Component} newCard The newly activated item
             * @param {Ext.Component} oldCard The previously active item
             */
            'tabchange'
        );
        me.callParent(arguments);

        //set the active tab
        me.setActiveTab(activeTab);
        //set the active tab after initial layout
        me.on('afterlayout', me.afterInitialLayout, me, {single: true});
    },

    /**
     * @private
     * We have to wait until after the initial layout to visually activate the activeTab (if set).
     * The active tab has different margins than normal tabs, so if the initial layout happens with
     * a tab active, its layout will be offset improperly due to the active margin style. Waiting
     * until after the initial layout avoids this issue.
     */
    afterInitialLayout: function() {
        var me = this,
            card = me.getComponent(me.activeTab);

        if (card) {
            me.layout.setActiveItem(card);
        }
    },

    /**
     * Makes the given card active. Makes it the visible card in the TabPanel's CardLayout and highlights the Tab.
     * @param {String/Number/Ext.Component} card The card to make active. Either an ID, index or the component itself.
     */
    setActiveTab: function(card) {
        var me = this,
            previous;

        card = me.getComponent(card);
        if (card) {
            previous = me.getActiveTab();

            if (previous && previous !== card && me.fireEvent('beforetabchange', me, card, previous) === false) {
                return false;
            }

            me.tabBar.setActiveTab(card.tab);
            me.activeTab = card;
            if (me.rendered) {
                me.layout.setActiveItem(card);
            }

            if (previous && previous !== card) {
                me.fireEvent('tabchange', me, card, previous);
            }
        }
    },

    /**
     * Returns the item that is currently active inside this TabPanel. Note that before the TabPanel first activates a
     * child component this will return whatever was configured in the {@link #activeTab} config option
     * @return {String/Number/Ext.Component} The currently active item
     */
    getActiveTab: function() {
        return this.activeTab;
    },

    /**
     * Returns the {@link Ext.tab.Bar} currently used in this TabPanel
     * @return {Ext.tab.Bar} The TabBar
     */
    getTabBar: function() {
        return this.tabBar;
    },

    /**
     * @ignore
     * Makes sure we have a Tab for each item added to the TabPanel
     */
    onAdd: function(item, index) {
        var me = this,
            cfg = item.tabConfig || {},
            defaultConfig = {
                xtype: 'tab',
                card: item,
                disabled: item.disabled,
                closable: item.closable,
                hidden: item.hidden,
                tabBar: me.tabBar
            };

        if (item.closeText) {
            defaultConfig.closeText = item.closeText;
        }
        cfg = Ext.applyIf(cfg, defaultConfig);
        item.tab = me.tabBar.insert(index, cfg);

        item.on({
            scope : me,
            enable: me.onItemEnable,
            disable: me.onItemDisable,
            beforeshow: me.onItemBeforeShow,
            iconchange: me.onItemIconChange,
            titlechange: me.onItemTitleChange
        });

        if (item.isPanel) {
            if (me.removePanelHeader) {
                item.preventHeader = true;
                if (item.rendered) {
                    item.updateHeader();
                }
            }
            if (item.isPanel && me.border) {
                item.setBorder(false);
            }
        }

        // ensure that there is at least one active tab
        if (this.rendered && me.items.getCount() === 1) {
            me.setActiveTab(0);
        }
    },

    /**
     * @private
     * Enable corresponding tab when item is enabled.
     */
    onItemEnable: function(item){
        item.tab.enable();
    },

    /**
     * @private
     * Disable corresponding tab when item is enabled.
     */
    onItemDisable: function(item){
        item.tab.disable();
    },

    /**
     * @private
     * Sets activeTab before item is shown.
     */
    onItemBeforeShow: function(item) {
        if (item !== this.activeTab) {
            this.setActiveTab(item);
            return false;
        }
    },

    /**
     * @private
     * Update the tab iconCls when panel iconCls has been set or changed.
     */
    onItemIconChange: function(item, newIconCls) {
        item.tab.setIconCls(newIconCls);
        this.getTabBar().doLayout();
    },

    /**
     * @private
     * Update the tab title when panel title has been set or changed.
     */
    onItemTitleChange: function(item, newTitle) {
        item.tab.setText(newTitle);
        this.getTabBar().doLayout();
    },


    /**
     * @ignore
     * If we're removing the currently active tab, activate the nearest one. The item is removed when we call super,
     * so we can do preprocessing before then to find the card's index
     */
    doRemove: function(item, autoDestroy) {
        var me = this,
            items = me.items,
            // At this point the item hasn't been removed from the items collection.
            // As such, if we want to check if there are no more tabs left, we have to
            // check for one, as opposed to 0.
            hasItemsLeft = items.getCount() > 1;

        if (me.destroying || !hasItemsLeft) {
            me.activeTab = null;
        } else if (item === me.activeTab) {
             me.setActiveTab(item.next() || items.getAt(0));
        }
        me.callParent(arguments);

        // Remove the two references
        delete item.tab.card;
        delete item.tab;
    },

    /**
     * @ignore
     * Makes sure we remove the corresponding Tab when an item is removed
     */
    onRemove: function(item, autoDestroy) {
        var me = this;

        item.un({
            scope : me,
            enable: me.onItemEnable,
            disable: me.onItemDisable,
            beforeshow: me.onItemBeforeShow
        });
        if (!me.destroying && item.tab.ownerCt == me.tabBar) {
            me.tabBar.remove(item.tab);
        }
    }
});

