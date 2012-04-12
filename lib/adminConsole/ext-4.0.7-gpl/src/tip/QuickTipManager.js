/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * @class Ext.tip.QuickTipManager
 *
 * Provides attractive and customizable tooltips for any element. The QuickTips
 * singleton is used to configure and manage tooltips globally for multiple elements
 * in a generic manner.  To create individual tooltips with maximum customizability,
 * you should consider either {@link Ext.tip.Tip} or {@link Ext.tip.ToolTip}.
 *
 * Quicktips can be configured via tag attributes directly in markup, or by
 * registering quick tips programmatically via the {@link #register} method.
 *
 * The singleton's instance of {@link Ext.tip.QuickTip} is available via
 * {@link #getQuickTip}, and supports all the methods, and all the all the
 * configuration properties of Ext.tip.QuickTip. These settings will apply to all
 * tooltips shown by the singleton.
 *
 * Below is the summary of the configuration properties which can be used.
 * For detailed descriptions see the config options for the {@link Ext.tip.QuickTip QuickTip} class
 *
 * ## QuickTips singleton configs (all are optional)
 *
 *  - `dismissDelay`
 *  - `hideDelay`
 *  - `maxWidth`
 *  - `minWidth`
 *  - `showDelay`
 *  - `trackMouse`
 *
 * ## Target element configs (optional unless otherwise noted)
 *
 *  - `autoHide`
 *  - `cls`
 *  - `dismissDelay` (overrides singleton value)
 *  - `target` (required)
 *  - `text` (required)
 *  - `title`
 *  - `width`
 *
 * Here is an example showing how some of these config options could be used:
 *
 *     @example
 *     // Init the singleton.  Any tag-based quick tips will start working.
 *     Ext.tip.QuickTipManager.init();
 *
 *     // Apply a set of config properties to the singleton
 *     Ext.apply(Ext.tip.QuickTipManager.getQuickTip(), {
 *         maxWidth: 200,
 *         minWidth: 100,
 *         showDelay: 50      // Show 50ms after entering target
 *     });
 *
 *     // Create a small panel to add a quick tip to
 *     Ext.create('Ext.container.Container', {
 *         id: 'quickTipContainer',
 *         width: 200,
 *         height: 150,
 *         style: {
 *             backgroundColor:'#000000'
 *         },
 *         renderTo: Ext.getBody()
 *     });
 *
 *
 *     // Manually register a quick tip for a specific element
 *     Ext.tip.QuickTipManager.register({
 *         target: 'quickTipContainer',
 *         title: 'My Tooltip',
 *         text: 'This tooltip was added in code',
 *         width: 100,
 *         dismissDelay: 10000 // Hide after 10 seconds hover
 *     });
 *
 * To register a quick tip in markup, you simply add one or more of the valid QuickTip attributes prefixed with
 * the **data-** namespace.  The HTML element itself is automatically set as the quick tip target. Here is the summary
 * of supported attributes (optional unless otherwise noted):
 *
 *  - `hide`: Specifying "user" is equivalent to setting autoHide = false.  Any other value will be the same as autoHide = true.
 *  - `qclass`: A CSS class to be applied to the quick tip (equivalent to the 'cls' target element config).
 *  - `qtip (required)`: The quick tip text (equivalent to the 'text' target element config).
 *  - `qtitle`: The quick tip title (equivalent to the 'title' target element config).
 *  - `qwidth`: The quick tip width (equivalent to the 'width' target element config).
 *
 * Here is an example of configuring an HTML element to display a tooltip from markup:
 *
 *     // Add a quick tip to an HTML button
 *     <input type="button" value="OK" data-qtitle="OK Button" data-qwidth="100"
 *          data-qtip="This is a quick tip from markup!"></input>
 *
 * @singleton
 */
Ext.define('Ext.tip.QuickTipManager', function() {
    var tip,
        disabled = false;

    return {
        requires: ['Ext.tip.QuickTip'],
        singleton: true,
        alternateClassName: 'Ext.QuickTips',

        /**
         * Initialize the global QuickTips instance and prepare any quick tips.
         * @param {Boolean} autoRender (optional) True to render the QuickTips container immediately to
         * preload images. (Defaults to true)
         * @param {Object} config (optional) config object for the created QuickTip. By
         * default, the {@link Ext.tip.QuickTip QuickTip} class is instantiated, but this can
         * be changed by supplying an xtype property or a className property in this object.
         * All other properties on this object are configuration for the created component.
         */
        init : function (autoRender, config) {
            if (!tip) {
                if (!Ext.isReady) {
                    Ext.onReady(function(){
                        Ext.tip.QuickTipManager.init(autoRender);
                    });
                    return;
                }

                var tipConfig = Ext.apply({ disabled: disabled }, config),
                    className = tipConfig.className,
                    xtype = tipConfig.xtype;

                if (className) {
                    delete tipConfig.className;
                } else if (xtype) {
                    className = 'widget.' + xtype;
                    delete tipConfig.xtype;
                }

                if (autoRender !== false) {
                    tipConfig.renderTo = document.body;

                    //<debug>
                    if (tipConfig.renderTo.tagName != 'BODY') { // e.g., == 'FRAMESET'
                        Ext.Error.raise({
                            sourceClass: 'Ext.tip.QuickTipManager',
                            sourceMethod: 'init',
                            msg: 'Cannot init QuickTipManager: no document body'
                        });
                    }
                    //</debug>
                }

                tip = Ext.create(className || 'Ext.tip.QuickTip', tipConfig);
            }
        },

        /**
         * Destroy the QuickTips instance.
         */
        destroy: function() {
            if (tip) {
                var undef;
                tip.destroy();
                tip = undef;
            }
        },

        // Protected method called by the dd classes
        ddDisable : function(){
            // don't disable it if we don't need to
            if(tip && !disabled){
                tip.disable();
            }
        },

        // Protected method called by the dd classes
        ddEnable : function(){
            // only enable it if it hasn't been disabled
            if(tip && !disabled){
                tip.enable();
            }
        },

        /**
         * Enable quick tips globally.
         */
        enable : function(){
            if(tip){
                tip.enable();
            }
            disabled = false;
        },

        /**
         * Disable quick tips globally.
         */
        disable : function(){
            if(tip){
                tip.disable();
            }
            disabled = true;
        },

        /**
         * Returns true if quick tips are enabled, else false.
         * @return {Boolean}
         */
        isEnabled : function(){
            return tip !== undefined && !tip.disabled;
        },

        /**
         * Gets the single {@link Ext.tip.QuickTip QuickTip} instance used to show tips from all registered elements.
         * @return {Ext.tip.QuickTip}
         */
        getQuickTip : function(){
            return tip;
        },

        /**
         * Configures a new quick tip instance and assigns it to a target element.  See
         * {@link Ext.tip.QuickTip#register} for details.
         * @param {Object} config The config object
         */
        register : function(){
            tip.register.apply(tip, arguments);
        },

        /**
         * Removes any registered quick tip from the target element and destroys it.
         * @param {String/HTMLElement/Ext.Element} el The element from which the quick tip is to be removed or ID of the element.
         */
        unregister : function(){
            tip.unregister.apply(tip, arguments);
        },

        /**
         * Alias of {@link #register}.
         * @param {Object} config The config object
         */
        tips : function(){
            tip.register.apply(tip, arguments);
        }
    };
}());
