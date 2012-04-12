/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * @class Ext.Element
 */
Ext.Element.addMethods(
    function() {
        var VISIBILITY      = "visibility",
            DISPLAY         = "display",
            HIDDEN          = "hidden",
            NONE            = "none",
            XMASKED         = Ext.baseCSSPrefix + "masked",
            XMASKEDRELATIVE = Ext.baseCSSPrefix + "masked-relative",
            data            = Ext.Element.data;

        return {
            /**
             * Checks whether the element is currently visible using both visibility and display properties.
             * @param {Boolean} [deep=false] True to walk the dom and see if parent elements are hidden
             * @return {Boolean} True if the element is currently visible, else false
             */
            isVisible : function(deep) {
                var vis = !this.isStyle(VISIBILITY, HIDDEN) && !this.isStyle(DISPLAY, NONE),
                    p   = this.dom.parentNode;

                if (deep !== true || !vis) {
                    return vis;
                }

                while (p && !(/^body/i.test(p.tagName))) {
                    if (!Ext.fly(p, '_isVisible').isVisible()) {
                        return false;
                    }
                    p = p.parentNode;
                }
                return true;
            },

            /**
             * Returns true if display is not "none"
             * @return {Boolean}
             */
            isDisplayed : function() {
                return !this.isStyle(DISPLAY, NONE);
            },

            /**
             * Convenience method for setVisibilityMode(Element.DISPLAY)
             * @param {String} display (optional) What to set display to when visible
             * @return {Ext.Element} this
             */
            enableDisplayMode : function(display) {
                this.setVisibilityMode(Ext.Element.DISPLAY);

                if (!Ext.isEmpty(display)) {
                    data(this.dom, 'originalDisplay', display);
                }

                return this;
            },

            /**
             * Puts a mask over this element to disable user interaction. Requires core.css.
             * This method can only be applied to elements which accept child nodes.
             * @param {String} msg (optional) A message to display in the mask
             * @param {String} msgCls (optional) A css class to apply to the msg element
             * @return {Ext.Element} The mask element
             */
            mask : function(msg, msgCls) {
                var me  = this,
                    dom = me.dom,
                    setExpression = dom.style.setExpression,
                    dh  = Ext.DomHelper,
                    EXTELMASKMSG = Ext.baseCSSPrefix + "mask-msg",
                    el,
                    mask;

                if (!(/^body/i.test(dom.tagName) && me.getStyle('position') == 'static')) {
                    me.addCls(XMASKEDRELATIVE);
                }
                el = data(dom, 'maskMsg');
                if (el) {
                    el.remove();
                }
                el = data(dom, 'mask');
                if (el) {
                    el.remove();
                }

                mask = dh.append(dom, {cls : Ext.baseCSSPrefix + "mask"}, true);
                data(dom, 'mask', mask);

                me.addCls(XMASKED);
                mask.setDisplayed(true);

                if (typeof msg == 'string') {
                    var mm = dh.append(dom, {cls : EXTELMASKMSG, cn:{tag:'div'}}, true);
                    data(dom, 'maskMsg', mm);
                    mm.dom.className = msgCls ? EXTELMASKMSG + " " + msgCls : EXTELMASKMSG;
                    mm.dom.firstChild.innerHTML = msg;
                    mm.setDisplayed(true);
                    mm.center(me);
                }
                // NOTE: CSS expressions are resource intensive and to be used only as a last resort
                // These expressions are removed as soon as they are no longer necessary - in the unmask method.
                // In normal use cases an element will be masked for a limited period of time.
                // Fix for https://sencha.jira.com/browse/EXTJSIV-19.
                // IE6 strict mode and IE6-9 quirks mode takes off left+right padding when calculating width!
                if (!Ext.supports.IncludePaddingInWidthCalculation && setExpression) {
                    mask.dom.style.setExpression('width', 'this.parentNode.offsetWidth + "px"');
                }

                // Some versions and modes of IE subtract top+bottom padding when calculating height.
                // Different versions from those which make the same error for width!
                if (!Ext.supports.IncludePaddingInHeightCalculation && setExpression) {
                    mask.dom.style.setExpression('height', 'this.parentNode.offsetHeight + "px"');
                }
                // ie will not expand full height automatically
                else if (Ext.isIE && !(Ext.isIE7 && Ext.isStrict) && me.getStyle('height') == 'auto') {
                    mask.setSize(undefined, me.getHeight());
                }
                return mask;
            },

            /**
             * Removes a previously applied mask.
             */
            unmask : function() {
                var me      = this,
                    dom     = me.dom,
                    mask    = data(dom, 'mask'),
                    maskMsg = data(dom, 'maskMsg');

                if (mask) {
                    // Remove resource-intensive CSS expressions as soon as they are not required.
                    if (mask.dom.style.clearExpression) {
                        mask.dom.style.clearExpression('width');
                        mask.dom.style.clearExpression('height');
                    }
                    if (maskMsg) {
                        maskMsg.remove();
                        data(dom, 'maskMsg', undefined);
                    }

                    mask.remove();
                    data(dom, 'mask', undefined);
                    me.removeCls([XMASKED, XMASKEDRELATIVE]);
                }
            },
            /**
             * Returns true if this element is masked. Also re-centers any displayed message within the mask.
             * @return {Boolean}
             */
            isMasked : function() {
                var me = this,
                    mask = data(me.dom, 'mask'),
                    maskMsg = data(me.dom, 'maskMsg');

                if (mask && mask.isVisible()) {
                    if (maskMsg) {
                        maskMsg.center(me);
                    }
                    return true;
                }
                return false;
            },

            /**
             * Creates an iframe shim for this element to keep selects and other windowed objects from
             * showing through.
             * @return {Ext.Element} The new shim element
             */
            createShim : function() {
                var el = document.createElement('iframe'),
                    shim;

                el.frameBorder = '0';
                el.className = Ext.baseCSSPrefix + 'shim';
                el.src = Ext.SSL_SECURE_URL;
                shim = Ext.get(this.dom.parentNode.insertBefore(el, this.dom));
                shim.autoBoxAdjust = false;
                return shim;
            }
        };
    }()
);
