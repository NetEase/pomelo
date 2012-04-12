/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * @class Ext.menu.KeyNav
 * @private
 */
Ext.define('Ext.menu.KeyNav', {
    extend: 'Ext.util.KeyNav',

    requires: ['Ext.FocusManager'],
    
    constructor: function(menu) {
        var me = this;

        me.menu = menu;
        me.callParent([menu.el, {
            down: me.down,
            enter: me.enter,
            esc: me.escape,
            left: me.left,
            right: me.right,
            space: me.enter,
            tab: me.tab,
            up: me.up
        }]);
    },

    down: function(e) {
        var me = this,
            fi = me.menu.focusedItem;

        if (fi && e.getKey() == Ext.EventObject.DOWN && me.isWhitelisted(fi)) {
            return true;
        }
        me.focusNextItem(1);
    },

    enter: function(e) {
        var menu = this.menu,
            focused = menu.focusedItem;
 
        if (menu.activeItem) {
            menu.onClick(e);
        } else if (focused && focused.isFormField) {
            // prevent stopEvent being called
            return true;
        }
    },

    escape: function(e) {
        Ext.menu.Manager.hideAll();
    },

    focusNextItem: function(step) {
        var menu = this.menu,
            items = menu.items,
            focusedItem = menu.focusedItem,
            startIdx = focusedItem ? items.indexOf(focusedItem) : -1,
            idx = startIdx + step;

        while (idx != startIdx) {
            if (idx < 0) {
                idx = items.length - 1;
            } else if (idx >= items.length) {
                idx = 0;
            }

            var item = items.getAt(idx);
            if (menu.canActivateItem(item)) {
                menu.setActiveItem(item);
                break;
            }
            idx += step;
        }
    },

    isWhitelisted: function(item) {
        return Ext.FocusManager.isWhitelisted(item);
    },

    left: function(e) {
        var menu = this.menu,
            fi = menu.focusedItem,
            ai = menu.activeItem;

        if (fi && this.isWhitelisted(fi)) {
            return true;
        }

        menu.hide();
        if (menu.parentMenu) {
            menu.parentMenu.focus();
        }
    },

    right: function(e) {
        var menu = this.menu,
            fi = menu.focusedItem,
            ai = menu.activeItem,
            am;

        if (fi && this.isWhitelisted(fi)) {
            return true;
        }

        if (ai) {
            am = menu.activeItem.menu;
            if (am) {
                ai.expandMenu(0);
                Ext.defer(function() {
                    am.setActiveItem(am.items.getAt(0));
                }, 25);
            }
        }
    },

    tab: function(e) {
        var me = this;

        if (e.shiftKey) {
            me.up(e);
        } else {
            me.down(e);
        }
    },

    up: function(e) {
        var me = this,
            fi = me.menu.focusedItem;

        if (fi && e.getKey() == Ext.EventObject.UP && me.isWhitelisted(fi)) {
            return true;
        }
        me.focusNextItem(-1);
    }
});
