/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
Ext.define('FV.lib.FeedValidator', {
    singleton: true,
    
    /**
     * @cfg {String} url The url to validate feeds on
     */
    url: 'feed-proxy.php',
    
    /**
     * Validates a given feed's formating by fetching it and ensuring it is well formed
     * @param {FV.model.Feed} feed The feed to validate
     */
    validate: function(feed, options) {
        options = options || {};
        
        Ext.applyIf(options, {
            scope: this,
            success: Ext.emptyFn,
            failure: Ext.emptyFn
        });
        
        Ext.Ajax.request({
            url: this.url,
            params: {
                feed: feed.get('url')
            },
            scope: this,
            success: function(response) {
                if (this.checkResponse(response, feed)) {
                    options.success.call(options.scope, feed);
                }
            },
            failure: function() {
                options.failure.call(options.scope);
            }
        });
    },
    
    /**
     * @private
     * Validates that a response contains a well-formed feed
     * @param {Object} response The response object
     */
    checkResponse: function(response, feed) {
        var dq  = Ext.DomQuery,
            url = feed.get('url'),
            xml, channel, title;

        try {
            xml = response.responseXML;
            channel = xml.getElementsByTagName('channel')[0];
            
            if (channel) {
                title = dq.selectValue('title', channel, url);
                return true;
            }
        } catch(e) {
        }
        return false;
    }
});
