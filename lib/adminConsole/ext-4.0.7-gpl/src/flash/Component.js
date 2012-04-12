/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * @class Ext.flash.Component
 * @extends Ext.Component
 *
 * A simple Component for displaying an Adobe Flash SWF movie. The movie will be sized and can participate
 * in layout like any other Component.
 *
 * This component requires the third-party SWFObject library version 2.2 or above. It is not included within
 * the ExtJS distribution, so you will have to include it into your page manually in order to use this component.
 * The SWFObject library can be downloaded from the [SWFObject project page](http://code.google.com/p/swfobject)
 * and then simply import it into the head of your HTML document:
 *
 *     <script type="text/javascript" src="path/to/local/swfobject.js"></script>
 *
 * ## Configuration
 *
 * This component allows several options for configuring how the target Flash movie is embedded. The most
 * important is the required {@link #url} which points to the location of the Flash movie to load. Other
 * configurations include:
 *
 * - {@link #backgroundColor}
 * - {@link #wmode}
 * - {@link #flashVars}
 * - {@link #flashParams}
 * - {@link #flashAttributes}
 *
 * ## Example usage:
 *
 *     var win = Ext.widget('window', {
 *         title: "It's a tiger!",
 *         layout: 'fit',
 *         width: 300,
 *         height: 300,
 *         x: 20,
 *         y: 20,
 *         resizable: true,
 *         items: {
 *             xtype: 'flash',
 *             url: 'tiger.swf'
 *         }
 *     });
 *     win.show();
 *
 * ## Express Install
 *
 * Adobe provides a tool called [Express Install](http://www.adobe.com/devnet/flashplayer/articles/express_install.html)
 * that offers users an easy way to upgrade their Flash player. If you wish to make use of this, you should set
 * the static EXPRESS\_INSTALL\_URL property to the location of your Express Install SWF file:
 *
 *     Ext.flash.Component.EXPRESS_INSTALL_URL = 'path/to/local/expressInstall.swf';
 *
 * @docauthor Jason Johnston <jason@sencha.com>
 */
Ext.define('Ext.flash.Component', {
    extend: 'Ext.Component',
    alternateClassName: 'Ext.FlashComponent',
    alias: 'widget.flash',

    /**
     * @cfg {String} flashVersion
     * Indicates the version the flash content was published for. Defaults to <tt>'9.0.115'</tt>.
     */
    flashVersion : '9.0.115',

    /**
     * @cfg {String} backgroundColor
     * The background color of the SWF movie. Defaults to <tt>'#ffffff'</tt>.
     */
    backgroundColor: '#ffffff',

    /**
     * @cfg {String} wmode
     * The wmode of the flash object. This can be used to control layering. Defaults to <tt>'opaque'</tt>.
     * Set to 'transparent' to ignore the {@link #backgroundColor} and make the background of the Flash
     * movie transparent.
     */
    wmode: 'opaque',

    /**
     * @cfg {Object} flashVars
     * A set of key value pairs to be passed to the flash object as flash variables. Defaults to <tt>undefined</tt>.
     */

    /**
     * @cfg {Object} flashParams
     * A set of key value pairs to be passed to the flash object as parameters. Possible parameters can be found here:
     * http://kb2.adobe.com/cps/127/tn_12701.html Defaults to <tt>undefined</tt>.
     */

    /**
     * @cfg {Object} flashAttributes
     * A set of key value pairs to be passed to the flash object as attributes. Defaults to <tt>undefined</tt>.
     */

    /**
     * @cfg {String} url
     * The URL of the SWF file to include. Required.
     */

    /**
     * @cfg {String/Number} swfWidth The width of the embedded SWF movie inside the component. Defaults to "100%"
     * so that the movie matches the width of the component.
     */
    swfWidth: '100%',

    /**
     * @cfg {String/Number} swfHeight The height of the embedded SWF movie inside the component. Defaults to "100%"
     * so that the movie matches the height of the component.
     */
    swfHeight: '100%',

    /**
     * @cfg {Boolean} expressInstall
     * True to prompt the user to install flash if not installed. Note that this uses
     * Ext.FlashComponent.EXPRESS_INSTALL_URL, which should be set to the local resource. Defaults to <tt>false</tt>.
     */
    expressInstall: false,

    /**
     * @property swf
     * @type {Ext.Element}
     * A reference to the object or embed element into which the SWF file is loaded. Only
     * populated after the component is rendered and the SWF has been successfully embedded.
     */

    // Have to create a placeholder div with the swfId, which SWFObject will replace with the object/embed element.
    renderTpl: ['<div id="{swfId}"></div>'],

    initComponent: function() {
        // <debug>
        if (!('swfobject' in window)) {
            Ext.Error.raise('The SWFObject library is not loaded. Ext.flash.Component requires SWFObject version 2.2 or later: http://code.google.com/p/swfobject/');
        }
        if (!this.url) {
            Ext.Error.raise('The "url" config is required for Ext.flash.Component');
        }
        // </debug>

        this.callParent();
        this.addEvents(
            /**
             * @event success
             * Fired when the Flash movie has been successfully embedded
             * @param {Ext.flash.Component} this
             */
            'success',

            /**
             * @event failure
             * Fired when the Flash movie embedding fails
             * @param {Ext.flash.Component} this
             */
            'failure'
        );
    },

    onRender: function() {
        var me = this,
            params, vars, undef,
            swfId = me.getSwfId();

        me.renderData.swfId = swfId;

        me.callParent(arguments);

        params = Ext.apply({
            allowScriptAccess: 'always',
            bgcolor: me.backgroundColor,
            wmode: me.wmode
        }, me.flashParams);

        vars = Ext.apply({
            allowedDomain: document.location.hostname
        }, me.flashVars);

        new swfobject.embedSWF(
            me.url,
            swfId,
            me.swfWidth,
            me.swfHeight,
            me.flashVersion,
            me.expressInstall ? me.statics.EXPRESS_INSTALL_URL : undef,
            vars,
            params,
            me.flashAttributes,
            Ext.bind(me.swfCallback, me)
        );
    },

    /**
     * @private
     * The callback method for handling an embedding success or failure by SWFObject
     * @param {Object} e The event object passed by SWFObject - see http://code.google.com/p/swfobject/wiki/api
     */
    swfCallback: function(e) {
        var me = this;
        if (e.success) {
            me.swf = Ext.get(e.ref);
            me.onSuccess();
            me.fireEvent('success', me);
        } else {
            me.onFailure();
            me.fireEvent('failure', me);
        }
    },

    /**
     * Retrieve the id of the SWF object/embed element
     */
    getSwfId: function() {
        return this.swfId || (this.swfId = "extswf" + this.getAutoId());
    },

    onSuccess: function() {
        // swfobject forces visiblity:visible on the swf element, which prevents it 
        // from getting hidden when an ancestor is given visibility:hidden.
        this.swf.setStyle('visibility', 'inherit');
    },

    onFailure: Ext.emptyFn,

    beforeDestroy: function() {
        var me = this,
            swf = me.swf;
        if (swf) {
            swfobject.removeSWF(me.getSwfId());
            Ext.destroy(swf);
            delete me.swf;
        }
        me.callParent();
    },

    statics: {
        /**
         * Sets the url for installing flash if it doesn't exist. This should be set to a local resource.
         * See http://www.adobe.com/devnet/flashplayer/articles/express_install.html for details.
         * @static
         * @type String
         */
        EXPRESS_INSTALL_URL: 'http:/' + '/swfobject.googlecode.com/svn/trunk/swfobject/expressInstall.swf'
    }
});

