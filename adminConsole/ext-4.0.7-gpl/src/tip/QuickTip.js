/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * @class Ext.tip.QuickTip
 * @extends Ext.tip.ToolTip
 * A specialized tooltip class for tooltips that can be specified in markup and automatically managed by the global
 * {@link Ext.tip.QuickTipManager} instance.  See the QuickTipManager documentation for additional usage details and examples.
 * @xtype quicktip
 */
Ext.define('Ext.tip.QuickTip', {
    extend: 'Ext.tip.ToolTip',
    alternateClassName: 'Ext.QuickTip',
    /**
     * @cfg {String/HTMLElement/Ext.Element} target The target HTMLElement, Ext.Element or id to associate with this Quicktip (defaults to the document).
     */
    /**
     * @cfg {Boolean} interceptTitles True to automatically use the element's DOM title value if available.
     */
    interceptTitles : false,

    // Force creation of header Component
    title: '&#160;',

    // private
    tagConfig : {
        namespace : "data-",
        attribute : "qtip",
        width : "qwidth",
        target : "target",
        title : "qtitle",
        hide : "hide",
        cls : "qclass",
        align : "qalign",
        anchor : "anchor"
    },

    // private
    initComponent : function(){
        var me = this;

        me.target = me.target || Ext.getDoc();
        me.targets = me.targets || {};
        me.callParent();
    },

    /**
     * Configures a new quick tip instance and assigns it to a target element.  The following config values are
     * supported (for example usage, see the {@link Ext.tip.QuickTipManager} class header):
     * <div class="mdetail-params"><ul>
     * <li>autoHide</li>
     * <li>cls</li>
     * <li>dismissDelay (overrides the singleton value)</li>
     * <li>target (required)</li>
     * <li>text (required)</li>
     * <li>title</li>
     * <li>width</li></ul></div>
     * @param {Object} config The config object
     */
    register : function(config){
        var configs = Ext.isArray(config) ? config : arguments,
            i = 0,
            len = configs.length,
            target, j, targetLen;

        for (; i < len; i++) {
            config = configs[i];
            target = config.target;
            if (target) {
                if (Ext.isArray(target)) {
                    for (j = 0, targetLen = target.length; j < targetLen; j++) {
                        this.targets[Ext.id(target[j])] = config;
                    }
                } else{
                    this.targets[Ext.id(target)] = config;
                }
            }
        }
    },

    /**
     * Removes this quick tip from its element and destroys it.
     * @param {String/HTMLElement/Ext.Element} el The element from which the quick tip is to be removed or ID of the element.
     */
    unregister : function(el){
        delete this.targets[Ext.id(el)];
    },

    /**
     * Hides a visible tip or cancels an impending show for a particular element.
     * @param {String/HTMLElement/Ext.Element} el The element that is the target of the tip or ID of the element.
     */
    cancelShow: function(el){
        var me = this,
            activeTarget = me.activeTarget;

        el = Ext.get(el).dom;
        if (me.isVisible()) {
            if (activeTarget && activeTarget.el == el) {
                me.hide();
            }
        } else if (activeTarget && activeTarget.el == el) {
            me.clearTimer('show');
        }
    },

    /**
     * @private
     * Reads the tip text from the closest node to the event target which contains the attribute we
     * are configured to look for. Returns an object containing the text from the attribute, and the target element from
     * which the text was read.
     */
    getTipCfg: function(e) {
        var t = e.getTarget(),
            titleText = t.title,
            cfg;

        if (this.interceptTitles && titleText && Ext.isString(titleText)) {
            t.qtip = titleText;
            t.removeAttribute("title");
            e.preventDefault();
            return {
                text: titleText
            };
        }
        else {
            cfg = this.tagConfig;
            t = e.getTarget('[' + cfg.namespace + cfg.attribute + ']');
            if (t) {
                return {
                    target: t,
                    text: t.getAttribute(cfg.namespace + cfg.attribute)
                };
            }
        }
    },

    // private
    onTargetOver : function(e){
        var me = this,
            target = e.getTarget(),
            elTarget,
            cfg,
            ns,
            tipConfig,
            autoHide;

        if (me.disabled) {
            return;
        }

        // TODO - this causes "e" to be recycled in IE6/7 (EXTJSIV-1608) so ToolTip#setTarget
        // was changed to include freezeEvent. The issue seems to be a nested 'resize' event
        // that smashed Ext.EventObject.
        me.targetXY = e.getXY();

        if(!target || target.nodeType !== 1 || target == document || target == document.body){
            return;
        }

        if (me.activeTarget && ((target == me.activeTarget.el) || Ext.fly(me.activeTarget.el).contains(target))) {
            me.clearTimer('hide');
            me.show();
            return;
        }

        if (target) {
            Ext.Object.each(me.targets, function(key, value) {
                var targetEl = Ext.fly(value.target);
                if (targetEl && (targetEl.dom === target || targetEl.contains(target))) {
                    elTarget = targetEl.dom;
                    return false;
                }
            });
            if (elTarget) {
                me.activeTarget = me.targets[elTarget.id];
                me.activeTarget.el = target;
                me.anchor = me.activeTarget.anchor;
                if (me.anchor) {
                    me.anchorTarget = target;
                }
                me.delayShow();
                return;
            }
        }

        elTarget = Ext.get(target);
        cfg = me.tagConfig;
        ns = cfg.namespace;
        tipConfig = me.getTipCfg(e);

        if (tipConfig) {

            // getTipCfg may look up the parentNode axis for a tip text attribute and will return the new target node.
            // Change our target element to match that from which the tip text attribute was read.
            if (tipConfig.target) {
                target = tipConfig.target;
                elTarget = Ext.get(target);
            }
            autoHide = elTarget.getAttribute(ns + cfg.hide);

            me.activeTarget = {
                el: target,
                text: tipConfig.text,
                width: +elTarget.getAttribute(ns + cfg.width) || null,
                autoHide: autoHide != "user" && autoHide !== 'false',
                title: elTarget.getAttribute(ns + cfg.title),
                cls: elTarget.getAttribute(ns + cfg.cls),
                align: elTarget.getAttribute(ns + cfg.align)

            };
            me.anchor = elTarget.getAttribute(ns + cfg.anchor);
            if (me.anchor) {
                me.anchorTarget = target;
            }
            me.delayShow();
        }
    },

    // private
    onTargetOut : function(e){
        var me = this;

        // If moving within the current target, and it does not have a new tip, ignore the mouseout
        if (me.activeTarget && e.within(me.activeTarget.el) && !me.getTipCfg(e)) {
            return;
        }

        me.clearTimer('show');
        if (me.autoHide !== false) {
            me.delayHide();
        }
    },

    // inherit docs
    showAt : function(xy){
        var me = this,
            target = me.activeTarget;

        if (target) {
            if (!me.rendered) {
                me.render(Ext.getBody());
                me.activeTarget = target;
            }
            if (target.title) {
                me.setTitle(target.title || '');
                me.header.show();
            } else {
                me.header.hide();
            }
            me.body.update(target.text);
            me.autoHide = target.autoHide;
            me.dismissDelay = target.dismissDelay || me.dismissDelay;
            if (me.lastCls) {
                me.el.removeCls(me.lastCls);
                delete me.lastCls;
            }
            if (target.cls) {
                me.el.addCls(target.cls);
                me.lastCls = target.cls;
            }

            me.setWidth(target.width);

            if (me.anchor) {
                me.constrainPosition = false;
            } else if (target.align) { // TODO: this doesn't seem to work consistently
                xy = me.el.getAlignToXY(target.el, target.align);
                me.constrainPosition = false;
            }else{
                me.constrainPosition = true;
            }
        }
        me.callParent([xy]);
    },

    // inherit docs
    hide: function(){
        delete this.activeTarget;
        this.callParent();
    }
});

