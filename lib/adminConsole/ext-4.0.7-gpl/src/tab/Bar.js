/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * @author Ed Spencer
 * TabBar is used internally by a {@link Ext.tab.Panel TabPanel} and typically should not need to be created manually.
 * The tab bar automatically removes the default title provided by {@link Ext.panel.Header}
 */
Ext.define('Ext.tab.Bar', {
    extend: 'Ext.panel.Header',
    alias: 'widget.tabbar',
    baseCls: Ext.baseCSSPrefix + 'tab-bar',

    requires: [
        'Ext.tab.Tab',
        'Ext.FocusManager'
    ],

    isTabBar: true,
    
    /**
     * @cfg {String} title @hide
     */
    
    /**
     * @cfg {String} iconCls @hide
     */

    // @private
    defaultType: 'tab',

    /**
     * @cfg {Boolean} plain
     * True to not show the full background on the tabbar
     */
    plain: false,

    // @private
    renderTpl: [
        '<div id="{id}-body" class="{baseCls}-body <tpl if="bodyCls"> {bodyCls}</tpl> <tpl if="ui"> {baseCls}-body-{ui}<tpl for="uiCls"> {parent.baseCls}-body-{parent.ui}-{.}</tpl></tpl>"<tpl if="bodyStyle"> style="{bodyStyle}"</tpl>></div>',
        '<div id="{id}-strip" class="{baseCls}-strip<tpl if="ui"> {baseCls}-strip-{ui}<tpl for="uiCls"> {parent.baseCls}-strip-{parent.ui}-{.}</tpl></tpl>"></div>'
    ],

    /**
     * @cfg {Number} minTabWidth
     * The minimum width for a tab in this tab Bar. Defaults to the tab Panel's {@link Ext.tab.Panel#minTabWidth minTabWidth} value.
     * @deprecated This config is deprecated. It is much easier to use the {@link Ext.tab.Panel#minTabWidth minTabWidth} config on the TabPanel.
     */

    /**
     * @cfg {Number} maxTabWidth
     * The maximum width for a tab in this tab Bar. Defaults to the tab Panel's {@link Ext.tab.Panel#maxTabWidth maxTabWidth} value.
     * @deprecated This config is deprecated. It is much easier to use the {@link Ext.tab.Panel#maxTabWidth maxTabWidth} config on the TabPanel.
     */

    // @private
    initComponent: function() {
        var me = this,
            keys;

        if (me.plain) {
            me.setUI(me.ui + '-plain');
        }

        me.addClsWithUI(me.dock);

        me.addEvents(
            /**
             * @event change
             * Fired when the currently-active tab has changed
             * @param {Ext.tab.Bar} tabBar The TabBar
             * @param {Ext.tab.Tab} tab The new Tab
             * @param {Ext.Component} card The card that was just shown in the TabPanel
             */
            'change'
        );

        me.addChildEls('body', 'strip');
        me.callParent(arguments);

        // TabBar must override the Header's align setting.
        me.layout.align = (me.orientation == 'vertical') ? 'left' : 'top';
        me.layout.overflowHandler = Ext.create('Ext.layout.container.boxOverflow.Scroller', me.layout);

        me.remove(me.titleCmp);
        delete me.titleCmp;

        // Subscribe to Ext.FocusManager for key navigation
        keys = me.orientation == 'vertical' ? ['up', 'down'] : ['left', 'right'];
        Ext.FocusManager.subscribe(me, {
            keys: keys
        });

        Ext.apply(me.renderData, {
            bodyCls: me.bodyCls
        });
    },

    // @private
    onAdd: function(tab) {
        tab.position = this.dock;
        this.callParent(arguments);
    },
    
    onRemove: function(tab) {
        var me = this;
        
        if (tab === me.previousTab) {
            me.previousTab = null;
        }
        if (me.items.getCount() === 0) {
            me.activeTab = null;
        }
        me.callParent(arguments);    
    },

    // @private
    afterRender: function() {
        var me = this;

        me.mon(me.el, {
            scope: me,
            click: me.onClick,
            delegate: '.' + Ext.baseCSSPrefix + 'tab'
        });
        me.callParent(arguments);

    },

    afterComponentLayout : function() {
        var me = this;

        me.callParent(arguments);
        me.strip.setWidth(me.el.getWidth());
    },

    // @private
    onClick: function(e, target) {
        // The target might not be a valid tab el.
        var tab = Ext.getCmp(target.id),
            tabPanel = this.tabPanel;

        target = e.getTarget();

        if (tab && tab.isDisabled && !tab.isDisabled()) {
            if (tab.closable && target === tab.closeEl.dom) {
                tab.onCloseClick();
            } else {
                if (tabPanel) {
                    // TabPanel will card setActiveTab of the TabBar
                    tabPanel.setActiveTab(tab.card);
                } else {
                    this.setActiveTab(tab);
                }
                tab.focus();
            }
        }
    },

    /**
     * @private
     * Closes the given tab by removing it from the TabBar and removing the corresponding card from the TabPanel
     * @param {Ext.tab.Tab} tab The tab to close
     */
    closeTab: function(tab) {
        var me = this,
            card = tab.card,
            tabPanel = me.tabPanel,
            nextTab;

        if (card && card.fireEvent('beforeclose', card) === false) {
            return false;
        }

        if (tab.active && me.items.getCount() > 1) {
            nextTab = me.previousTab || tab.next('tab') || me.items.first();
            me.setActiveTab(nextTab);
            if (tabPanel) {
                tabPanel.setActiveTab(nextTab.card);
            }
        }
        /*
         * force the close event to fire. By the time this function returns,
         * the tab is already destroyed and all listeners have been purged
         * so the tab can't fire itself.
         */
        tab.fireClose();
        me.remove(tab);

        if (tabPanel && card) {
            card.fireEvent('close', card);
            tabPanel.remove(card);
        }

        if (nextTab) {
            nextTab.focus();
        }
    },

    /**
     * @private
     * Marks the given tab as active
     * @param {Ext.tab.Tab} tab The tab to mark active
     */
    setActiveTab: function(tab) {
        if (tab.disabled) {
            return;
        }
        var me = this;
        if (me.activeTab) {
            me.previousTab = me.activeTab;
            me.activeTab.deactivate();
        }
        tab.activate();

        if (me.rendered) {
            me.layout.layout();
            tab.el && tab.el.scrollIntoView(me.layout.getRenderTarget());
        }
        me.activeTab = tab;
        me.fireEvent('change', me, tab, tab.card);
    }
});

