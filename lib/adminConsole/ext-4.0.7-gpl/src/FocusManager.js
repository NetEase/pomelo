/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * @class Ext.FocusManager

The FocusManager is responsible for globally:

1. Managing component focus
2. Providing basic keyboard navigation
3. (optional) Provide a visual cue for focused components, in the form of a focus ring/frame.

To activate the FocusManager, simply call `Ext.FocusManager.enable();`. In turn, you may
deactivate the FocusManager by subsequently calling `Ext.FocusManager.disable();.  The
FocusManager is disabled by default.

To enable the optional focus frame, pass `true` or `{focusFrame: true}` to {@link #enable}.

Another feature of the FocusManager is to provide basic keyboard focus navigation scoped to any {@link Ext.container.Container}
that would like to have navigation between its child {@link Ext.Component}'s. The {@link Ext.container.Container} can simply
call {@link #subscribe Ext.FocusManager.subscribe} to take advantage of this feature, and can at any time call
{@link #unsubscribe Ext.FocusManager.unsubscribe} to turn the navigation off.

 * @singleton
 * @author Jarred Nicholls <jarred@sencha.com>
 * @docauthor Jarred Nicholls <jarred@sencha.com>
 */
Ext.define('Ext.FocusManager', {
    singleton: true,
    alternateClassName: 'Ext.FocusMgr',

    mixins: {
        observable: 'Ext.util.Observable'
    },

    requires: [
        'Ext.ComponentManager',
        'Ext.ComponentQuery',
        'Ext.util.HashMap',
        'Ext.util.KeyNav'
    ],

    /**
     * @property {Boolean} enabled
     * Whether or not the FocusManager is currently enabled
     */
    enabled: false,

    /**
     * @property {Ext.Component} focusedCmp
     * The currently focused component. Defaults to `undefined`.
     */

    focusElementCls: Ext.baseCSSPrefix + 'focus-element',

    focusFrameCls: Ext.baseCSSPrefix + 'focus-frame',

    /**
     * @property {String[]} whitelist
     * A list of xtypes that should ignore certain navigation input keys and
     * allow for the default browser event/behavior. These input keys include:
     *
     * 1. Backspace
     * 2. Delete
     * 3. Left
     * 4. Right
     * 5. Up
     * 6. Down
     *
     * The FocusManager will not attempt to navigate when a component is an xtype (or descendents thereof)
     * that belongs to this whitelist. E.g., an {@link Ext.form.field.Text} should allow
     * the user to move the input cursor left and right, and to delete characters, etc.
     */
    whitelist: [
        'textfield'
    ],

    tabIndexWhitelist: [
        'a',
        'button',
        'embed',
        'frame',
        'iframe',
        'img',
        'input',
        'object',
        'select',
        'textarea'
    ],

    constructor: function() {
        var me = this,
            CQ = Ext.ComponentQuery;

        me.addEvents(
            /**
             * @event beforecomponentfocus
             * Fires before a component becomes focused. Return `false` to prevent
             * the component from gaining focus.
             * @param {Ext.FocusManager} fm A reference to the FocusManager singleton
             * @param {Ext.Component} cmp The component that is being focused
             * @param {Ext.Component} previousCmp The component that was previously focused,
             * or `undefined` if there was no previously focused component.
             */
            'beforecomponentfocus',

            /**
             * @event componentfocus
             * Fires after a component becomes focused.
             * @param {Ext.FocusManager} fm A reference to the FocusManager singleton
             * @param {Ext.Component} cmp The component that has been focused
             * @param {Ext.Component} previousCmp The component that was previously focused,
             * or `undefined` if there was no previously focused component.
             */
            'componentfocus',

            /**
             * @event disable
             * Fires when the FocusManager is disabled
             * @param {Ext.FocusManager} fm A reference to the FocusManager singleton
             */
            'disable',

            /**
             * @event enable
             * Fires when the FocusManager is enabled
             * @param {Ext.FocusManager} fm A reference to the FocusManager singleton
             */
            'enable'
        );

        // Setup KeyNav that's bound to document to catch all
        // unhandled/bubbled key events for navigation
        me.keyNav = Ext.create('Ext.util.KeyNav', Ext.getDoc(), {
            disabled: true,
            scope: me,

            backspace: me.focusLast,
            enter: me.navigateIn,
            esc: me.navigateOut,
            tab: me.navigateSiblings

            //space: me.navigateIn,
            //del: me.focusLast,
            //left: me.navigateSiblings,
            //right: me.navigateSiblings,
            //down: me.navigateSiblings,
            //up: me.navigateSiblings
        });

        me.focusData = {};
        me.subscribers = Ext.create('Ext.util.HashMap');
        me.focusChain = {};

        // Setup some ComponentQuery pseudos
        Ext.apply(CQ.pseudos, {
            focusable: function(cmps) {
                var len = cmps.length,
                    results = [],
                    i = 0,
                    c,

                    isFocusable = function(x) {
                        return x && x.focusable !== false && CQ.is(x, '[rendered]:not([destroying]):not([isDestroyed]):not([disabled]){isVisible(true)}{el && c.el.dom && c.el.isVisible()}');
                    };

                for (; i < len; i++) {
                    c = cmps[i];
                    if (isFocusable(c)) {
                        results.push(c);
                    }
                }

                return results;
            },

            nextFocus: function(cmps, idx, step) {
                step = step || 1;
                idx = parseInt(idx, 10);

                var len = cmps.length,
                    i = idx + step,
                    c;

                for (; i != idx; i += step) {
                    if (i >= len) {
                        i = 0;
                    } else if (i < 0) {
                        i = len - 1;
                    }

                    c = cmps[i];
                    if (CQ.is(c, ':focusable')) {
                        return [c];
                    } else if (c.placeholder && CQ.is(c.placeholder, ':focusable')) {
                        return [c.placeholder];
                    }
                }

                return [];
            },

            prevFocus: function(cmps, idx) {
                return this.nextFocus(cmps, idx, -1);
            },

            root: function(cmps) {
                var len = cmps.length,
                    results = [],
                    i = 0,
                    c;

                for (; i < len; i++) {
                    c = cmps[i];
                    if (!c.ownerCt) {
                        results.push(c);
                    }
                }

                return results;
            }
        });
    },

    /**
     * Adds the specified xtype to the {@link #whitelist}.
     * @param {String/String[]} xtype Adds the xtype(s) to the {@link #whitelist}.
     */
    addXTypeToWhitelist: function(xtype) {
        var me = this;

        if (Ext.isArray(xtype)) {
            Ext.Array.forEach(xtype, me.addXTypeToWhitelist, me);
            return;
        }

        if (!Ext.Array.contains(me.whitelist, xtype)) {
            me.whitelist.push(xtype);
        }
    },

    clearComponent: function(cmp) {
        clearTimeout(this.cmpFocusDelay);
        if (!cmp.isDestroyed) {
            cmp.blur();
        }
    },

    /**
     * Disables the FocusManager by turning of all automatic focus management and keyboard navigation
     */
    disable: function() {
        var me = this;

        if (!me.enabled) {
            return;
        }

        delete me.options;
        me.enabled = false;

        Ext.ComponentManager.all.un('add', me.onComponentCreated, me);

        me.removeDOM();

        // Stop handling key navigation
        me.keyNav.disable();

        // disable focus for all components
        me.setFocusAll(false);

        me.fireEvent('disable', me);
    },

    /**
     * Enables the FocusManager by turning on all automatic focus management and keyboard navigation
     * @param {Boolean/Object} options Either `true`/`false` to turn on the focus frame, or an object of the following options:
        - focusFrame : Boolean
            `true` to show the focus frame around a component when it is focused. Defaults to `false`.
     * @markdown
     */
    enable: function(options) {
        var me = this;

        if (options === true) {
            options = { focusFrame: true };
        }
        me.options = options = options || {};

        if (me.enabled) {
            return;
        }

        // Handle components that are newly added after we are enabled
        Ext.ComponentManager.all.on('add', me.onComponentCreated, me);

        me.initDOM(options);

        // Start handling key navigation
        me.keyNav.enable();

        // enable focus for all components
        me.setFocusAll(true, options);

        // Finally, let's focus our global focus el so we start fresh
        me.focusEl.focus();
        delete me.focusedCmp;

        me.enabled = true;
        me.fireEvent('enable', me);
    },

    focusLast: function(e) {
        var me = this;

        if (me.isWhitelisted(me.focusedCmp)) {
            return true;
        }

        // Go back to last focused item
        if (me.previousFocusedCmp) {
            me.previousFocusedCmp.focus();
        }
    },

    getRootComponents: function() {
        var me = this,
            CQ = Ext.ComponentQuery,
            inline = CQ.query(':focusable:root:not([floating])'),
            floating = CQ.query(':focusable:root[floating]');

        // Floating items should go to the top of our root stack, and be ordered
        // by their z-index (highest first)
        floating.sort(function(a, b) {
            return a.el.getZIndex() > b.el.getZIndex();
        });

        return floating.concat(inline);
    },

    initDOM: function(options) {
        var me = this,
            sp = '&#160',
            cls = me.focusFrameCls;

        if (!Ext.isReady) {
            Ext.onReady(me.initDOM, me);
            return;
        }

        // Create global focus element
        if (!me.focusEl) {
            me.focusEl = Ext.getBody().createChild({
                tabIndex: '-1',
                cls: me.focusElementCls,
                html: sp
            });
        }

        // Create global focus frame
        if (!me.focusFrame && options.focusFrame) {
            me.focusFrame = Ext.getBody().createChild({
                cls: cls,
                children: [
                    { cls: cls + '-top' },
                    { cls: cls + '-bottom' },
                    { cls: cls + '-left' },
                    { cls: cls + '-right' }
                ],
                style: 'top: -100px; left: -100px;'
            });
            me.focusFrame.setVisibilityMode(Ext.Element.DISPLAY);
            me.focusFrameWidth = 2;
            me.focusFrame.hide().setLeftTop(0, 0);
        }
    },

    isWhitelisted: function(cmp) {
        return cmp && Ext.Array.some(this.whitelist, function(x) {
            return cmp.isXType(x);
        });
    },

    navigateIn: function(e) {
        var me = this,
            focusedCmp = me.focusedCmp,
            rootCmps,
            firstChild;

        if (!focusedCmp) {
            // No focus yet, so focus the first root cmp on the page
            rootCmps = me.getRootComponents();
            if (rootCmps.length) {
                rootCmps[0].focus();
            }
        } else {
            // Drill into child ref items of the focused cmp, if applicable.
            // This works for any Component with a getRefItems implementation.
            firstChild = Ext.ComponentQuery.query('>:focusable', focusedCmp)[0];
            if (firstChild) {
                firstChild.focus();
            } else {
                // Let's try to fire a click event, as if it came from the mouse
                if (Ext.isFunction(focusedCmp.onClick)) {
                    e.button = 0;
                    focusedCmp.onClick(e);
                    focusedCmp.focus();
                }
            }
        }
    },

    navigateOut: function(e) {
        var me = this,
            parent;

        if (!me.focusedCmp || !(parent = me.focusedCmp.up(':focusable'))) {
            me.focusEl.focus();
        } else {
            parent.focus();
        }

        // In some browsers (Chrome) FocusManager can handle this before other
        // handlers. Ext Windows have their own Esc key handling, so we need to
        // return true here to allow the event to bubble.
        return true;
    },

    navigateSiblings: function(e, source, parent) {
        var me = this,
            src = source || me,
            key = e.getKey(),
            EO = Ext.EventObject,
            goBack = e.shiftKey || key == EO.LEFT || key == EO.UP,
            checkWhitelist = key == EO.LEFT || key == EO.RIGHT || key == EO.UP || key == EO.DOWN,
            nextSelector = goBack ? 'prev' : 'next',
            idx, next, focusedCmp;

        focusedCmp = (src.focusedCmp && src.focusedCmp.comp) || src.focusedCmp;
        if (!focusedCmp && !parent) {
            return;
        }

        if (checkWhitelist && me.isWhitelisted(focusedCmp)) {
            return true;
        }

        parent = parent || focusedCmp.up();
        if (parent) {
            idx = focusedCmp ? Ext.Array.indexOf(parent.getRefItems(), focusedCmp) : -1;
            next = Ext.ComponentQuery.query('>:' + nextSelector + 'Focus(' + idx + ')', parent)[0];
            if (next && focusedCmp !== next) {
                next.focus();
                return next;
            }
        }
    },

    onComponentBlur: function(cmp, e) {
        var me = this;

        if (me.focusedCmp === cmp) {
            me.previousFocusedCmp = cmp;
            delete me.focusedCmp;
        }

        if (me.focusFrame) {
            me.focusFrame.hide();
        }
    },

    onComponentCreated: function(hash, id, cmp) {
        this.setFocus(cmp, true, this.options);
    },

    onComponentDestroy: function(cmp) {
        this.setFocus(cmp, false);
    },

    onComponentFocus: function(cmp, e) {
        var me = this,
            chain = me.focusChain;

        if (!Ext.ComponentQuery.is(cmp, ':focusable')) {
            me.clearComponent(cmp);

            // Check our focus chain, so we don't run into a never ending recursion
            // If we've attempted (unsuccessfully) to focus this component before,
            // then we're caught in a loop of child->parent->...->child and we
            // need to cut the loop off rather than feed into it.
            if (chain[cmp.id]) {
                return;
            }

            // Try to focus the parent instead
            var parent = cmp.up();
            if (parent) {
                // Add component to our focus chain to detect infinite focus loop
                // before we fire off an attempt to focus our parent.
                // See the comments above.
                chain[cmp.id] = true;
                parent.focus();
            }

            return;
        }

        // Clear our focus chain when we have a focusable component
        me.focusChain = {};

        // Defer focusing for 90ms so components can do a layout/positioning
        // and give us an ability to buffer focuses
        clearTimeout(me.cmpFocusDelay);
        if (arguments.length !== 2) {
            me.cmpFocusDelay = Ext.defer(me.onComponentFocus, 90, me, [cmp, e]);
            return;
        }

        if (me.fireEvent('beforecomponentfocus', me, cmp, me.previousFocusedCmp) === false) {
            me.clearComponent(cmp);
            return;
        }

        me.focusedCmp = cmp;

        // If we have a focus frame, show it around the focused component
        if (me.shouldShowFocusFrame(cmp)) {
            var cls = '.' + me.focusFrameCls + '-',
                ff = me.focusFrame,
                fw = me.focusFrameWidth,
                box = cmp.el.getPageBox(),

            // Size the focus frame's t/b/l/r according to the box
            // This leaves a hole in the middle of the frame so user
            // interaction w/ the mouse can continue
                bt = box.top,
                bl = box.left,
                bw = box.width,
                bh = box.height,
                ft = ff.child(cls + 'top'),
                fb = ff.child(cls + 'bottom'),
                fl = ff.child(cls + 'left'),
                fr = ff.child(cls + 'right');

            ft.setWidth(bw).setLeftTop(bl, bt);
            fb.setWidth(bw).setLeftTop(bl, bt + bh - fw);
            fl.setHeight(bh - fw - fw).setLeftTop(bl, bt + fw);
            fr.setHeight(bh - fw - fw).setLeftTop(bl + bw - fw, bt + fw);

            ff.show();
        }

        me.fireEvent('componentfocus', me, cmp, me.previousFocusedCmp);
    },

    onComponentHide: function(cmp) {
        var me = this,
            CQ = Ext.ComponentQuery,
            cmpHadFocus = false,
            focusedCmp,
            parent;

        if (me.focusedCmp) {
            focusedCmp = CQ.query('[id=' + me.focusedCmp.id + ']', cmp)[0];
            cmpHadFocus = me.focusedCmp.id === cmp.id || focusedCmp;

            if (focusedCmp) {
                me.clearComponent(focusedCmp);
            }
        }

        me.clearComponent(cmp);

        if (cmpHadFocus) {
            parent = CQ.query('^:focusable', cmp)[0];
            if (parent) {
                parent.focus();
            }
        }
    },

    removeDOM: function() {
        var me = this;

        // If we are still enabled globally, or there are still subscribers
        // then we will halt here, since our DOM stuff is still being used
        if (me.enabled || me.subscribers.length) {
            return;
        }

        Ext.destroy(
            me.focusEl,
            me.focusFrame
        );
        delete me.focusEl;
        delete me.focusFrame;
        delete me.focusFrameWidth;
    },

    /**
     * Removes the specified xtype from the {@link #whitelist}.
     * @param {String/String[]} xtype Removes the xtype(s) from the {@link #whitelist}.
     */
    removeXTypeFromWhitelist: function(xtype) {
        var me = this;

        if (Ext.isArray(xtype)) {
            Ext.Array.forEach(xtype, me.removeXTypeFromWhitelist, me);
            return;
        }

        Ext.Array.remove(me.whitelist, xtype);
    },

    setFocus: function(cmp, focusable, options) {
        var me = this,
            el, dom, data,

            needsTabIndex = function(n) {
                return !Ext.Array.contains(me.tabIndexWhitelist, n.tagName.toLowerCase())
                    && n.tabIndex <= 0;
            };

        options = options || {};

        // Come back and do this after the component is rendered
        if (!cmp.rendered) {
            cmp.on('afterrender', Ext.pass(me.setFocus, arguments, me), me, { single: true });
            return;
        }

        el = cmp.getFocusEl();
        dom = el.dom;

        // Decorate the component's focus el for focus-ability
        if ((focusable && !me.focusData[cmp.id]) || (!focusable && me.focusData[cmp.id])) {
            if (focusable) {
                data = {
                    focusFrame: options.focusFrame
                };

                // Only set -1 tabIndex if we need it
                // inputs, buttons, and anchor tags do not need it,
                // and neither does any DOM that has it set already
                // programmatically or in markup.
                if (needsTabIndex(dom)) {
                    data.tabIndex = dom.tabIndex;
                    dom.tabIndex = -1;
                }

                el.on({
                    focus: data.focusFn = Ext.bind(me.onComponentFocus, me, [cmp], 0),
                    blur: data.blurFn = Ext.bind(me.onComponentBlur, me, [cmp], 0),
                    scope: me
                });
                cmp.on({
                    hide: me.onComponentHide,
                    close: me.onComponentHide,
                    beforedestroy: me.onComponentDestroy,
                    scope: me
                });

                me.focusData[cmp.id] = data;
            } else {
                data = me.focusData[cmp.id];
                if ('tabIndex' in data) {
                    dom.tabIndex = data.tabIndex;
                }
                el.un('focus', data.focusFn, me);
                el.un('blur', data.blurFn, me);
                cmp.un('hide', me.onComponentHide, me);
                cmp.un('close', me.onComponentHide, me);
                cmp.un('beforedestroy', me.onComponentDestroy, me);

                delete me.focusData[cmp.id];
            }
        }
    },

    setFocusAll: function(focusable, options) {
        var me = this,
            cmps = Ext.ComponentManager.all.getArray(),
            len = cmps.length,
            cmp,
            i = 0;

        for (; i < len; i++) {
            me.setFocus(cmps[i], focusable, options);
        }
    },

    setupSubscriberKeys: function(container, keys) {
        var me = this,
            el = container.getFocusEl(),
            scope = keys.scope,
            handlers = {
                backspace: me.focusLast,
                enter: me.navigateIn,
                esc: me.navigateOut,
                scope: me
            },

            navSiblings = function(e) {
                if (me.focusedCmp === container) {
                    // Root the sibling navigation to this container, so that we
                    // can automatically dive into the container, rather than forcing
                    // the user to hit the enter key to dive in.
                    return me.navigateSiblings(e, me, container);
                } else {
                    return me.navigateSiblings(e);
                }
            };

        Ext.iterate(keys, function(key, cb) {
            handlers[key] = function(e) {
                var ret = navSiblings(e);

                if (Ext.isFunction(cb) && cb.call(scope || container, e, ret) === true) {
                    return true;
                }

                return ret;
            };
        }, me);

        return Ext.create('Ext.util.KeyNav', el, handlers);
    },

    shouldShowFocusFrame: function(cmp) {
        var me = this,
            opts = me.options || {};

        if (!me.focusFrame || !cmp) {
            return false;
        }

        // Global trumps
        if (opts.focusFrame) {
            return true;
        }

        if (me.focusData[cmp.id].focusFrame) {
            return true;
        }

        return false;
    },

    /**
     * Subscribes an {@link Ext.container.Container} to provide basic keyboard focus navigation between its child {@link Ext.Component}'s.
     * @param {Ext.container.Container} container A reference to the {@link Ext.container.Container} on which to enable keyboard functionality and focus management.
     * @param {Boolean/Object} options An object of the following options
     * @param {Array/Object} options.keys
     * An array containing the string names of navigation keys to be supported. The allowed values are:
     *
     *   - 'left'
     *   - 'right'
     *   - 'up'
     *   - 'down'
     *
     * Or, an object containing those key names as keys with `true` or a callback function as their value. A scope may also be passed. E.g.:
     *
     *     {
     *         left: this.onLeftKey,
     *         right: this.onRightKey,
     *         scope: this
     *     }
     *
     * @param {Boolean} options.focusFrame
     * `true` to show the focus frame around a component when it is focused. Defaults to `false`.
     */
    subscribe: function(container, options) {
        var me = this,
            EA = Ext.Array,
            data = {},
            subs = me.subscribers,

            // Recursively add focus ability as long as a descendent container isn't
            // itself subscribed to the FocusManager, or else we'd have unwanted side
            // effects for subscribing a descendent container twice.
            safeSetFocus = function(cmp) {
                if (cmp.isContainer && !subs.containsKey(cmp.id)) {
                    EA.forEach(cmp.query('>'), safeSetFocus);
                    me.setFocus(cmp, true, options);
                    cmp.on('add', data.onAdd, me);
                } else if (!cmp.isContainer) {
                    me.setFocus(cmp, true, options);
                }
            };

        // We only accept containers
        if (!container || !container.isContainer) {
            return;
        }

        if (!container.rendered) {
            container.on('afterrender', Ext.pass(me.subscribe, arguments, me), me, { single: true });
            return;
        }

        // Init the DOM, incase this is the first time it will be used
        me.initDOM(options);

        // Create key navigation for subscriber based on keys option
        data.keyNav = me.setupSubscriberKeys(container, options.keys);

        // We need to keep track of components being added to our subscriber
        // and any containers nested deeply within it (omg), so let's do that.
        // Components that are removed are globally handled.
        // Also keep track of destruction of our container for auto-unsubscribe.
        data.onAdd = function(ct, cmp, idx) {
            safeSetFocus(cmp);
        };
        container.on('beforedestroy', me.unsubscribe, me);

        // Now we setup focusing abilities for the container and all its components
        safeSetFocus(container);

        // Add to our subscribers list
        subs.add(container.id, data);
    },

    /**
     * Unsubscribes an {@link Ext.container.Container} from keyboard focus management.
     * @param {Ext.container.Container} container A reference to the {@link Ext.container.Container} to unsubscribe from the FocusManager.
     */
    unsubscribe: function(container) {
        var me = this,
            EA = Ext.Array,
            subs = me.subscribers,
            data,

            // Recursively remove focus ability as long as a descendent container isn't
            // itself subscribed to the FocusManager, or else we'd have unwanted side
            // effects for unsubscribing an ancestor container.
            safeSetFocus = function(cmp) {
                if (cmp.isContainer && !subs.containsKey(cmp.id)) {
                    EA.forEach(cmp.query('>'), safeSetFocus);
                    me.setFocus(cmp, false);
                    cmp.un('add', data.onAdd, me);
                } else if (!cmp.isContainer) {
                    me.setFocus(cmp, false);
                }
            };

        if (!container || !subs.containsKey(container.id)) {
            return;
        }

        data = subs.get(container.id);
        data.keyNav.destroy();
        container.un('beforedestroy', me.unsubscribe, me);
        subs.removeAtKey(container.id);
        safeSetFocus(container);
        me.removeDOM();
    }
});
