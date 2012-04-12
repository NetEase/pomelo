/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * @class Ext.panel.AbstractPanel
 * @extends Ext.container.Container
 * A base class which provides methods common to Panel classes across the Sencha product range.
 * @private
 */
Ext.define('Ext.panel.AbstractPanel', {

    /* Begin Definitions */

    extend: 'Ext.container.Container',

    requires: ['Ext.util.MixedCollection', 'Ext.Element', 'Ext.toolbar.Toolbar'],

    /* End Definitions */

    /**
     * @cfg {String} [baseCls='x-panel']
     * The base CSS class to apply to this panel's element.
     */
    baseCls : Ext.baseCSSPrefix + 'panel',

    /**
     * @cfg {Number/String} bodyPadding
     * A shortcut for setting a padding style on the body element. The value can either be
     * a number to be applied to all sides, or a normal css string describing padding.
     */

    /**
     * @cfg {Boolean} bodyBorder
     * A shortcut to add or remove the border on the body of a panel. This only applies to a panel
     * which has the {@link #frame} configuration set to `true`.
     */

    /**
     * @cfg {String/Object/Function} bodyStyle
     * Custom CSS styles to be applied to the panel's body element, which can be supplied as a valid CSS style string,
     * an object containing style property name/value pairs or a function that returns such a string or object.
     * For example, these two formats are interpreted to be equivalent:<pre><code>
bodyStyle: 'background:#ffc; padding:10px;'

bodyStyle: {
    background: '#ffc',
    padding: '10px'
}
     * </code></pre>
     */

    /**
     * @cfg {String/String[]} bodyCls
     * A CSS class, space-delimited string of classes, or array of classes to be applied to the panel's body element.
     * The following examples are all valid:<pre><code>
bodyCls: 'foo'
bodyCls: 'foo bar'
bodyCls: ['foo', 'bar']
     * </code></pre>
     */

    isPanel: true,

    componentLayout: 'dock',

    /**
     * @cfg {Object} defaultDockWeights
     * This object holds the default weights applied to dockedItems that have no weight. These start with a
     * weight of 1, to allow negative weights to insert before top items and are odd numbers
     * so that even weights can be used to get between different dock orders.
     *
     * To make default docking order match border layout, do this:
     * <pre><code>
Ext.panel.AbstractPanel.prototype.defaultDockWeights = { top: 1, bottom: 3, left: 5, right: 7 };</code></pre>
     * Changing these defaults as above or individually on this object will effect all Panels.
     * To change the defaults on a single panel, you should replace the entire object:
     * <pre><code>
initComponent: function () {
    // NOTE: Don't change members of defaultDockWeights since the object is shared.
    this.defaultDockWeights = { top: 1, bottom: 3, left: 5, right: 7 };

    this.callParent();
}</code></pre>
     *
     * To change only one of the default values, you do this:
     * <pre><code>
initComponent: function () {
    // NOTE: Don't change members of defaultDockWeights since the object is shared.
    this.defaultDockWeights = Ext.applyIf({ top: 10 }, this.defaultDockWeights);

    this.callParent();
}</code></pre>
     */
    defaultDockWeights: { top: 1, left: 3, right: 5, bottom: 7 },

    renderTpl: [
        '<div id="{id}-body" class="{baseCls}-body<tpl if="bodyCls"> {bodyCls}</tpl>',
            ' {baseCls}-body-{ui}<tpl if="uiCls">',
                '<tpl for="uiCls"> {parent.baseCls}-body-{parent.ui}-{.}</tpl>',
            '</tpl>"<tpl if="bodyStyle"> style="{bodyStyle}"</tpl>>',
        '</div>'
    ],

    // TODO: Move code examples into product-specific files. The code snippet below is Touch only.
    /**
     * @cfg {Object/Object[]} dockedItems
     * A component or series of components to be added as docked items to this panel.
     * The docked items can be docked to either the top, right, left or bottom of a panel.
     * This is typically used for things like toolbars or tab bars:
     * <pre><code>
var panel = new Ext.panel.Panel({
    fullscreen: true,
    dockedItems: [{
        xtype: 'toolbar',
        dock: 'top',
        items: [{
            text: 'Docked to the top'
        }]
    }]
});</code></pre>
     */

    border: true,

    initComponent : function() {
        var me = this;

        me.addEvents(
            /**
             * @event bodyresize
             * Fires after the Panel has been resized.
             * @param {Ext.panel.Panel} p the Panel which has been resized.
             * @param {Number} width The Panel body's new width.
             * @param {Number} height The Panel body's new height.
             */
            'bodyresize'
            // // inherited
            // 'activate',
            // // inherited
            // 'deactivate'
        );

        me.addChildEls('body');

        //!frame
        //!border

        if (me.frame && me.border && me.bodyBorder === undefined) {
            me.bodyBorder = false;
        }
        if (me.frame && me.border && (me.bodyBorder === false || me.bodyBorder === 0)) {
            me.manageBodyBorders = true;
        }

        me.callParent();
    },

    // @private
    initItems : function() {
        var me = this,
            items = me.dockedItems;

        me.callParent();
        me.dockedItems = Ext.create('Ext.util.MixedCollection', false, me.getComponentId);
        if (items) {
            me.addDocked(items);
        }
    },

    /**
     * Finds a docked component by id, itemId or position. Also see {@link #getDockedItems}
     * @param {String/Number} comp The id, itemId or position of the docked component (see {@link #getComponent} for details)
     * @return {Ext.Component} The docked component (if found)
     */
    getDockedComponent: function(comp) {
        if (Ext.isObject(comp)) {
            comp = comp.getItemId();
        }
        return this.dockedItems.get(comp);
    },

    /**
     * Attempts a default component lookup (see {@link Ext.container.Container#getComponent}). If the component is not found in the normal
     * items, the dockedItems are searched and the matched component (if any) returned (see {@link #getDockedComponent}). Note that docked
     * items will only be matched by component id or itemId -- if you pass a numeric index only non-docked child components will be searched.
     * @param {String/Number} comp The component id, itemId or position to find
     * @return {Ext.Component} The component (if found)
     */
    getComponent: function(comp) {
        var component = this.callParent(arguments);
        if (component === undefined && !Ext.isNumber(comp)) {
            // If the arg is a numeric index skip docked items
            component = this.getDockedComponent(comp);
        }
        return component;
    },

    /**
     * Parses the {@link bodyStyle} config if available to create a style string that will be applied to the body element.
     * This also includes {@link bodyPadding} and {@link bodyBorder} if available.
     * @return {String} A CSS style string with body styles, padding and border.
     * @private
     */
    initBodyStyles: function() {
        var me = this,
            bodyStyle = me.bodyStyle,
            styles = [],
            Element = Ext.Element,
            prop;

        if (Ext.isFunction(bodyStyle)) {
            bodyStyle = bodyStyle();
        }
        if (Ext.isString(bodyStyle)) {
            styles = bodyStyle.split(';');
        } else {
            for (prop in bodyStyle) {
                if (bodyStyle.hasOwnProperty(prop)) {
                    styles.push(prop + ':' + bodyStyle[prop]);
                }
            }
        }

        if (me.bodyPadding !== undefined) {
            styles.push('padding: ' + Element.unitizeBox((me.bodyPadding === true) ? 5 : me.bodyPadding));
        }
        if (me.frame && me.bodyBorder) {
            if (!Ext.isNumber(me.bodyBorder)) {
                me.bodyBorder = 1;
            }
            styles.push('border-width: ' + Element.unitizeBox(me.bodyBorder));
        }
        delete me.bodyStyle;
        return styles.length ? styles.join(';') : undefined;
    },

    /**
     * Parse the {@link bodyCls} config if available to create a comma-delimited string of
     * CSS classes to be applied to the body element.
     * @return {String} The CSS class(es)
     * @private
     */
    initBodyCls: function() {
        var me = this,
            cls = '',
            bodyCls = me.bodyCls;

        if (bodyCls) {
            Ext.each(bodyCls, function(v) {
                cls += " " + v;
            });
            delete me.bodyCls;
        }
        return cls.length > 0 ? cls : undefined;
    },

    /**
     * Initialized the renderData to be used when rendering the renderTpl.
     * @return {Object} Object with keys and values that are going to be applied to the renderTpl
     * @private
     */
    initRenderData: function() {
        return Ext.applyIf(this.callParent(), {
            bodyStyle: this.initBodyStyles(),
            bodyCls: this.initBodyCls()
        });
    },

    /**
     * Adds docked item(s) to the panel.
     * @param {Object/Object[]} component The Component or array of components to add. The components
     * must include a 'dock' parameter on each component to indicate where it should be docked ('top', 'right',
     * 'bottom', 'left').
     * @param {Number} pos (optional) The index at which the Component will be added
     */
    addDocked : function(items, pos) {
        var me = this,
            i = 0,
            item, length;

        items = me.prepareItems(items);
        length = items.length;

        for (; i < length; i++) {
            item = items[i];
            item.dock = item.dock || 'top';

            // Allow older browsers to target docked items to style without borders
            if (me.border === false) {
                // item.cls = item.cls || '' + ' ' + me.baseCls + '-noborder-docked-' + item.dock;
            }

            if (pos !== undefined) {
                me.dockedItems.insert(pos + i, item);
            }
            else {
                me.dockedItems.add(item);
            }
            item.onAdded(me, i);
            me.onDockedAdd(item);
        }

        // Set flag which means that beforeLayout will not veto the layout due to the size not changing
        me.componentLayout.childrenChanged = true;
        if (me.rendered && !me.suspendLayout) {
            me.doComponentLayout();
        }
        return items;
    },

    // Placeholder empty functions
    onDockedAdd : Ext.emptyFn,
    onDockedRemove : Ext.emptyFn,

    /**
     * Inserts docked item(s) to the panel at the indicated position.
     * @param {Number} pos The index at which the Component will be inserted
     * @param {Object/Object[]} component. The Component or array of components to add. The components
     * must include a 'dock' paramater on each component to indicate where it should be docked ('top', 'right',
     * 'bottom', 'left').
     */
    insertDocked : function(pos, items) {
        this.addDocked(items, pos);
    },

    /**
     * Removes the docked item from the panel.
     * @param {Ext.Component} item. The Component to remove.
     * @param {Boolean} autoDestroy (optional) Destroy the component after removal.
     */
    removeDocked : function(item, autoDestroy) {
        var me = this,
            layout,
            hasLayout;

        if (!me.dockedItems.contains(item)) {
            return item;
        }

        layout = me.componentLayout;
        hasLayout = layout && me.rendered;

        if (hasLayout) {
            layout.onRemove(item);
        }

        me.dockedItems.remove(item);
        item.onRemoved();
        me.onDockedRemove(item);

        if (autoDestroy === true || (autoDestroy !== false && me.autoDestroy)) {
            item.destroy();
        } else if (hasLayout) {
            // not destroying, make any layout related removals
            layout.afterRemove(item);    
        }


        // Set flag which means that beforeLayout will not veto the layout due to the size not changing
        me.componentLayout.childrenChanged = true;
        if (!me.destroying && !me.suspendLayout) {
            me.doComponentLayout();
        }

        return item;
    },

    /**
     * Retrieve an array of all currently docked Components.
     * @param {String} cqSelector A {@link Ext.ComponentQuery ComponentQuery} selector string to filter the returned items.
     * @return {Ext.Component[]} An array of components.
     */
    getDockedItems : function(cqSelector) {
        var me = this,
            defaultWeight = me.defaultDockWeights,
            dockedItems;

        if (me.dockedItems && me.dockedItems.items.length) {
            // Allow filtering of returned docked items by CQ selector.
            if (cqSelector) {
                dockedItems = Ext.ComponentQuery.query(cqSelector, me.dockedItems.items);
            } else {
                dockedItems = me.dockedItems.items.slice();
            }

            Ext.Array.sort(dockedItems, function(a, b) {
                // Docked items are ordered by their visual representation by default (t,l,r,b)
                var aw = a.weight || defaultWeight[a.dock],
                    bw = b.weight || defaultWeight[b.dock];
                if (Ext.isNumber(aw) && Ext.isNumber(bw)) {
                    return aw - bw;
                }
                return 0;
            });

            return dockedItems;
        }
        return [];
    },

    // inherit docs
    addUIClsToElement: function(cls, force) {
        var me = this,
            result = me.callParent(arguments),
            classes = [Ext.baseCSSPrefix + cls, me.baseCls + '-body-' + cls, me.baseCls + '-body-' + me.ui + '-' + cls],
            array, i;

        if (!force && me.rendered) {
            if (me.bodyCls) {
                me.body.addCls(me.bodyCls);
            } else {
                me.body.addCls(classes);
            }
        } else {
            if (me.bodyCls) {
                array = me.bodyCls.split(' ');

                for (i = 0; i < classes.length; i++) {
                    if (!Ext.Array.contains(array, classes[i])) {
                        array.push(classes[i]);
                    }
                }

                me.bodyCls = array.join(' ');
            } else {
                me.bodyCls = classes.join(' ');
            }
        }

        return result;
    },

    // inherit docs
    removeUIClsFromElement: function(cls, force) {
        var me = this,
            result = me.callParent(arguments),
            classes = [Ext.baseCSSPrefix + cls, me.baseCls + '-body-' + cls, me.baseCls + '-body-' + me.ui + '-' + cls],
            array, i;

        if (!force && me.rendered) {
            if (me.bodyCls) {
                me.body.removeCls(me.bodyCls);
            } else {
                me.body.removeCls(classes);
            }
        } else {
            if (me.bodyCls) {
                array = me.bodyCls.split(' ');

                for (i = 0; i < classes.length; i++) {
                    Ext.Array.remove(array, classes[i]);
                }

                me.bodyCls = array.join(' ');
            }
        }

        return result;
    },

    // inherit docs
    addUIToElement: function(force) {
        var me = this,
            cls = me.baseCls + '-body-' + me.ui,
            array;

        me.callParent(arguments);

        if (!force && me.rendered) {
            if (me.bodyCls) {
                me.body.addCls(me.bodyCls);
            } else {
                me.body.addCls(cls);
            }
        } else {
            if (me.bodyCls) {
                array = me.bodyCls.split(' ');

                if (!Ext.Array.contains(array, cls)) {
                    array.push(cls);
                }

                me.bodyCls = array.join(' ');
            } else {
                me.bodyCls = cls;
            }
        }
    },

    // inherit docs
    removeUIFromElement: function() {
        var me = this,
            cls = me.baseCls + '-body-' + me.ui,
            array;

        me.callParent(arguments);

        if (me.rendered) {
            if (me.bodyCls) {
                me.body.removeCls(me.bodyCls);
            } else {
                me.body.removeCls(cls);
            }
        } else {
            if (me.bodyCls) {
                array = me.bodyCls.split(' ');
                Ext.Array.remove(array, cls);
                me.bodyCls = array.join(' ');
            } else {
                me.bodyCls = cls;
            }
        }
    },

    // @private
    getTargetEl : function() {
        return this.body;
    },

    getRefItems: function(deep) {
        var items = this.callParent(arguments),
            // deep fetches all docked items, and their descendants using '*' selector and then '* *'
            dockedItems = this.getDockedItems(deep ? '*,* *' : undefined),
            ln = dockedItems.length,
            i = 0,
            item;

        // Find the index where we go from top/left docked items to right/bottom docked items
        for (; i < ln; i++) {
            item = dockedItems[i];
            if (item.dock === 'right' || item.dock === 'bottom') {
                break;
            }
        }

        // Return docked items in the top/left position before our container items, and
        // return right/bottom positioned items after our container items.
        // See AbstractDock.renderItems() for more information.
        return Ext.Array.splice(dockedItems, 0, i).concat(items).concat(dockedItems);
    },

    beforeDestroy: function(){
        var docked = this.dockedItems,
            c;

        if (docked) {
            while ((c = docked.first())) {
                this.removeDocked(c, true);
            }
        }
        this.callParent();
    },

    setBorder: function(border) {
        var me = this;
        me.border = (border !== undefined) ? border : true;
        if (me.rendered) {
            me.doComponentLayout();
        }
    }
});
