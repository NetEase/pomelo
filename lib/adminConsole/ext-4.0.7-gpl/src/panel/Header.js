/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * @class Ext.panel.Header
 * @extends Ext.container.Container
 * Simple header class which is used for on {@link Ext.panel.Panel} and {@link Ext.window.Window}
 */
Ext.define('Ext.panel.Header', {
    extend: 'Ext.container.Container',
    uses: ['Ext.panel.Tool', 'Ext.draw.Component', 'Ext.util.CSS'],
    alias: 'widget.header',

    isHeader       : true,
    defaultType    : 'tool',
    indicateDrag   : false,
    weight         : -1,

    renderTpl: [
        '<div id="{id}-body" class="{baseCls}-body<tpl if="bodyCls"> {bodyCls}</tpl>',
        '<tpl if="uiCls">',
            '<tpl for="uiCls"> {parent.baseCls}-body-{parent.ui}-{.}</tpl>',
        '</tpl>"',
        '<tpl if="bodyStyle"> style="{bodyStyle}"</tpl>></div>'],

    /**
     * @cfg {String} title
     * The title text to display
     */

    /**
     * @cfg {String} iconCls
     * CSS class for icon in header. Used for displaying an icon to the left of a title.
     */

    initComponent: function() {
        var me = this,
            ruleStyle,
            rule,
            style,
            titleTextEl,
            ui;

        me.indicateDragCls = me.baseCls + '-draggable';
        me.title = me.title || '&#160;';
        me.tools = me.tools || [];
        me.items = me.items || [];
        me.orientation = me.orientation || 'horizontal';
        me.dock = (me.dock) ? me.dock : (me.orientation == 'horizontal') ? 'top' : 'left';

        //add the dock as a ui
        //this is so we support top/right/left/bottom headers
        me.addClsWithUI(me.orientation);
        me.addClsWithUI(me.dock);

        me.addChildEls('body');

        // Add Icon
        if (!Ext.isEmpty(me.iconCls)) {
            me.initIconCmp();
            me.items.push(me.iconCmp);
        }

        // Add Title
        if (me.orientation == 'vertical') {
            // Hack for IE6/7's inability to display an inline-block
            if (Ext.isIE6 || Ext.isIE7) {
                me.width = this.width || 24;
            } else if (Ext.isIEQuirks) {
                me.width = this.width || 25;
            }

            me.layout = {
                type : 'vbox',
                align: 'center',
                clearInnerCtOnLayout: true,
                bindToOwnerCtContainer: false
            };
            me.textConfig = {
                cls: me.baseCls + '-text',
                type: 'text',
                text: me.title,
                rotate: {
                    degrees: 90
                }
            };
            ui = me.ui;
            if (Ext.isArray(ui)) {
                ui = ui[0];
            }
            ruleStyle = '.' + me.baseCls + '-text-' + ui;
            if (Ext.scopeResetCSS) {
                ruleStyle = '.' + Ext.baseCSSPrefix + 'reset ' + ruleStyle;
            }
            rule = Ext.util.CSS.getRule(ruleStyle);
            if (rule) {
                style = rule.style;
            }
            if (style) {
                Ext.apply(me.textConfig, {
                    'font-family': style.fontFamily,
                    'font-weight': style.fontWeight,
                    'font-size': style.fontSize,
                    fill: style.color
                });
            }
            me.titleCmp = Ext.create('Ext.draw.Component', {
                ariaRole  : 'heading',
                focusable: false,
                viewBox: false,
                flex : 1,
                autoSize: true,
                margins: '5 0 0 0',
                items: [ me.textConfig ],
                // this is a bit of a cheat: we are not selecting an element of titleCmp
                // but rather of titleCmp.items[0] (so we cannot use childEls)
                renderSelectors: {
                    textEl: '.' + me.baseCls + '-text'
                }
            });
        } else {
            me.layout = {
                type : 'hbox',
                align: 'middle',
                clearInnerCtOnLayout: true,
                bindToOwnerCtContainer: false
            };
            me.titleCmp = Ext.create('Ext.Component', {
                xtype     : 'component',
                ariaRole  : 'heading',
                focusable: false,
                flex : 1,
                cls: me.baseCls + '-text-container',
                renderTpl : [
                    '<span id="{id}-textEl" class="{cls}-text {cls}-text-{ui}">{title}</span>'
                ],
                renderData: {
                    title: me.title,
                    cls  : me.baseCls,
                    ui   : me.ui
                },
                childEls: ['textEl']
            });
        }
        me.items.push(me.titleCmp);

        // Add Tools
        me.items = me.items.concat(me.tools);
        this.callParent();
    },

    initIconCmp: function() {
        this.iconCmp = Ext.create('Ext.Component', {
            focusable: false,
            renderTpl : [
                '<img id="{id}-iconEl" alt="" src="{blank}" class="{cls}-icon {iconCls}"/>'
            ],
            renderData: {
                blank  : Ext.BLANK_IMAGE_URL,
                cls    : this.baseCls,
                iconCls: this.iconCls,
                orientation: this.orientation
            },
            childEls: ['iconEl'],
            iconCls: this.iconCls
        });
    },

    afterRender: function() {
        var me = this;

        me.el.unselectable();
        if (me.indicateDrag) {
            me.el.addCls(me.indicateDragCls);
        }
        me.mon(me.el, {
            click: me.onClick,
            scope: me
        });
        me.callParent();
    },

    afterLayout: function() {
        var me = this;
        me.callParent(arguments);

        // IE7 needs a forced repaint to make the top framing div expand to full width
        if (Ext.isIE7) {
            me.el.repaint();
        }
    },

    // inherit docs
    addUIClsToElement: function(cls, force) {
        var me = this,
            result = me.callParent(arguments),
            classes = [me.baseCls + '-body-' + cls, me.baseCls + '-body-' + me.ui + '-' + cls],
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
            classes = [me.baseCls + '-body-' + cls, me.baseCls + '-body-' + me.ui + '-' + cls],
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
            array, cls;

        me.callParent(arguments);

        cls = me.baseCls + '-body-' + me.ui;
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

        if (!force && me.titleCmp && me.titleCmp.rendered && me.titleCmp.textEl) {
            me.titleCmp.textEl.addCls(me.baseCls + '-text-' + me.ui);
        }
    },

    // inherit docs
    removeUIFromElement: function() {
        var me = this,
            array, cls;

        me.callParent(arguments);

        cls = me.baseCls + '-body-' + me.ui;
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

        if (me.titleCmp && me.titleCmp.rendered && me.titleCmp.textEl) {
            me.titleCmp.textEl.removeCls(me.baseCls + '-text-' + me.ui);
        }
    },

    onClick: function(e) {
        if (!e.getTarget(Ext.baseCSSPrefix + 'tool')) {
            this.fireEvent('click', e);
        }
    },

    getTargetEl: function() {
        return this.body || this.frameBody || this.el;
    },

    /**
     * Sets the title of the header.
     * @param {String} title The title to be set
     */
    setTitle: function(title) {
        var me = this;
        if (me.rendered) {
            if (me.titleCmp.rendered) {
                if (me.titleCmp.surface) {
                    me.title = title || '';
                    var sprite = me.titleCmp.surface.items.items[0],
                        surface = me.titleCmp.surface;

                    surface.remove(sprite);
                    me.textConfig.type = 'text';
                    me.textConfig.text = title;
                    sprite = surface.add(me.textConfig);
                    sprite.setAttributes({
                        rotate: {
                            degrees: 90
                        }
                    }, true);
                    me.titleCmp.autoSizeSurface();
                } else {
                    me.title = title || '&#160;';
                    me.titleCmp.textEl.update(me.title);
                }
            } else {
                me.titleCmp.on({
                    render: function() {
                        me.setTitle(title);
                    },
                    single: true
                });
            }
        } else {
            me.on({
                render: function() {
                    me.layout.layout();
                    me.setTitle(title);
                },
                single: true
            });
        }
    },

    /**
     * Sets the CSS class that provides the icon image for this header.  This method will replace any existing
     * icon class if one has already been set.
     * @param {String} cls The new CSS class name
     */
    setIconCls: function(cls) {
        var me = this,
            isEmpty = !cls || !cls.length,
            iconCmp = me.iconCmp,
            el;
        
        me.iconCls = cls;
        if (!me.iconCmp && !isEmpty) {
            me.initIconCmp();
            me.insert(0, me.iconCmp);
        } else if (iconCmp) {
            if (isEmpty) {
                me.iconCmp.destroy();
            } else {
                el = iconCmp.iconEl;
                el.removeCls(iconCmp.iconCls);
                el.addCls(cls);
                iconCmp.iconCls = cls;
            }
        }
    },

    /**
     * Add a tool to the header
     * @param {Object} tool
     */
    addTool: function(tool) {
        this.tools.push(this.add(tool));
    },

    /**
     * @private
     * Set up the tools.&lt;tool type> link in the owning Panel.
     * Bind the tool to its owning Panel.
     * @param component
     * @param index
     */
    onAdd: function(component, index) {
        this.callParent([arguments]);
        if (component instanceof Ext.panel.Tool) {
            component.bindTo(this.ownerCt);
            this.tools[component.type] = component;
        }
    }
});

