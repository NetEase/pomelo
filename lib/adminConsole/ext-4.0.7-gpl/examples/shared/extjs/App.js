/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * Ext.App
 * @extends Ext.util.Observable
 * @author Chris Scott
 */
Ext.define('Ext.App', {
    extend: 'Ext.util.Observable',

    /***
     * response status codes.
     */
    STATUS_EXCEPTION :          'exception',
    STATUS_VALIDATION_ERROR :   "validation",
    STATUS_ERROR:               "error",
    STATUS_NOTICE:              "notice",
    STATUS_OK:                  "ok",
    STATUS_HELP:                "help",

    /**
     * @cfg {Object} api
     * remoting api.  should be defined in your own config js.
     */
    api: {
        url: null,
        type: null,
        actions: {}
    },

    // private, ref to message-box Element.
    msgCt : null,

    constructor: function(config) {
        this.views = [];

        this.initStateProvider();

        Ext.apply(this, config);

        if (!this.api.actions) {
            this.api.actions = {};
        }

        Ext.onReady(this.onReady, this);

        Ext.App.superclass.constructor.apply(this, arguments);
    },

    // @protected, onReady, executes when Ext.onReady fires.
    onReady : function() {
        // create the msgBox container.  used for App.setAlert
        this.msgCt = Ext.DomHelper.insertFirst(document.body, {id:'msg-div'}, true);
        this.msgCt.setStyle('position', 'absolute');
        this.msgCt.setStyle('z-index', 9999);
        this.msgCt.setWidth(300);
    },

    initStateProvider : function() {
        /*
         * set days to be however long you think cookies should last
         */
        var days = '';        // expires when browser closes
        if(days){
            var date = new Date();
            date.setTime(date.getTime()+(days*24*60*60*1000));
            var exptime = "; expires="+date.toGMTString();
        } else {
            var exptime = null;
        }

        // register provider with state manager.
        Ext.state.Manager.setProvider(Ext.create('Ext.state.CookieProvider', {
            path: '/',
            expires: exptime,
            domain: null,
            secure: false
        }));
    },

    /**
     * registerView
     * register an application view component.
     * @param {Object} view
     */
    registerView : function(view) {
        this.views.push(view);
    },

    /**
     * getViews
     * return list of registered views
     */
    getViews : function() {
        return this.views;
    },

    /**
     * registerActions
     * registers new actions for API
     * @param {Object} actions
     */
    registerActions : function(actions) {
        Ext.apply(this.api.actions, actions);
    },

    /**
     * getAPI
     * return Ext Remoting api
     */
    getAPI : function() {
        return this.api;
    },

    /***
     * setAlert
     * show the message box.  Aliased to addMessage
     * @param {String} msg
     * @param {Bool} status
     */
    setAlert : function(status, msg) {
        this.addMessage(status, msg);
    },

    /***
     * adds a message to queue.
     * @param {String} msg
     * @param {Bool} status
     */
    addMessage : function(status, msg) {
        var delay = 3;    // <-- default delay of msg box is 1 second.
        if (status == false) {
            delay = 5;    // <-- when status is error, msg box delay is 3 seconds.
        }
        // add some smarts to msg's duration (div by 13.3 between 3 & 9 seconds)
        delay = msg.length / 13.3;
        if (delay < 3) {
            delay = 3;
        }
        else if (delay > 9) {
            delay = 9;
        }

        this.msgCt.alignTo(document, 't-t');
        Ext.DomHelper.append(this.msgCt, {html:this.buildMessageBox(status, String.format.apply(String, Array.prototype.slice.call(arguments, 1)))}, true).slideIn('t').pause(delay).ghost("t", {remove:true});
    },

    /***
     * buildMessageBox
     */
    buildMessageBox : function(title, msg) {
        switch (title) {
            case true:
                title = this.STATUS_OK;
                break;
            case false:
                title = this.STATUS_ERROR;
                break;
        }
        return [
            '<div class="app-msg">',
            '<div class="x-box-tl"><div class="x-box-tr"><div class="x-box-tc"></div></div></div>',
            '<div class="x-box-ml"><div class="x-box-mr"><div class="x-box-mc"><h3 class="x-icon-text icon-status-' + title + '">', title, '</h3>', msg, '</div></div></div>',
            '<div class="x-box-bl"><div class="x-box-br"><div class="x-box-bc"></div></div></div>',
            '</div>'
        ].join('');
    },

    /**
     * decodeStatusIcon
     * @param {Object} status
     */
    decodeStatusIcon : function(status) {
        var iconCls = '';
        switch (status) {
            case true:
            case this.STATUS_OK:
                iconCls = this.ICON_OK;
                break;
            case this.STATUS_NOTICE:
                iconCls = this.ICON_NOTICE;
                break;
            case false:
            case this.STATUS_ERROR:
                iconCls = this.ICON_ERROR;
                break;
            case this.STATUS_HELP:
                iconCls = this.ICON_HELP;
                break;
        }
        return iconCls;
    },

    /***
     * setViewState, alias for Ext.state.Manager.set
     * @param {Object} key
     * @param {Object} value
     */
    setViewState : function(key, value) {
        Ext.state.Manager.set(key, value);
    },

    /***
     * getViewState, aliaz for Ext.state.Manager.get
     * @param {Object} cmd
     */
    getViewState : function(key) {
        return Ext.state.Manager.get(key);
    },

    /**
     * t
     * translation function.  needs to be implemented.  simply echos supplied word back currently.
     * @param {String} to translate
     * @return {String} translated.
     */
    t : function(words) {
        return words;
    },

    handleResponse : function(res) {
        if (res.type == this.STATUS_EXCEPTION) {
            return this.handleException(res);
        }
        if (res.message.length > 0) {
            this.setAlert(res.status, res.message);
        }
    },

    handleException : function(res) {
        Ext.MessageBox.alert(res.type.toUpperCase(), res.message);
    }
});

