/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * @class Ext.util.Cookies

Utility class for setting/reading values from browser cookies.
Values can be written using the {@link #set} method.
Values can be read using the {@link #get} method.
A cookie can be invalidated on the client machine using the {@link #clear} method.

 * @markdown
 * @singleton
 */
Ext.define('Ext.util.Cookies', {
    singleton: true,
    
    /**
     * Create a cookie with the specified name and value. Additional settings
     * for the cookie may be optionally specified (for example: expiration,
     * access restriction, SSL).
     * @param {String} name The name of the cookie to set. 
     * @param {Object} value The value to set for the cookie.
     * @param {Object} expires (Optional) Specify an expiration date the
     * cookie is to persist until.  Note that the specified Date object will
     * be converted to Greenwich Mean Time (GMT). 
     * @param {String} path (Optional) Setting a path on the cookie restricts
     * access to pages that match that path. Defaults to all pages (<tt>'/'</tt>). 
     * @param {String} domain (Optional) Setting a domain restricts access to
     * pages on a given domain (typically used to allow cookie access across
     * subdomains). For example, "sencha.com" will create a cookie that can be
     * accessed from any subdomain of sencha.com, including www.sencha.com,
     * support.sencha.com, etc.
     * @param {Boolean} secure (Optional) Specify true to indicate that the cookie
     * should only be accessible via SSL on a page using the HTTPS protocol.
     * Defaults to <tt>false</tt>. Note that this will only work if the page
     * calling this code uses the HTTPS protocol, otherwise the cookie will be
     * created with default options.
     */
    set : function(name, value){
        var argv = arguments,
            argc = arguments.length,
            expires = (argc > 2) ? argv[2] : null,
            path = (argc > 3) ? argv[3] : '/',
            domain = (argc > 4) ? argv[4] : null,
            secure = (argc > 5) ? argv[5] : false;
            
        document.cookie = name + "=" + escape(value) + ((expires === null) ? "" : ("; expires=" + expires.toGMTString())) + ((path === null) ? "" : ("; path=" + path)) + ((domain === null) ? "" : ("; domain=" + domain)) + ((secure === true) ? "; secure" : "");
    },

    /**
     * Retrieves cookies that are accessible by the current page. If a cookie
     * does not exist, <code>get()</code> returns <tt>null</tt>.  The following
     * example retrieves the cookie called "valid" and stores the String value
     * in the variable <tt>validStatus</tt>.
     * <pre><code>
     * var validStatus = Ext.util.Cookies.get("valid");
     * </code></pre>
     * @param {String} name The name of the cookie to get
     * @return {Object} Returns the cookie value for the specified name;
     * null if the cookie name does not exist.
     */
    get : function(name){
        var arg = name + "=",
            alen = arg.length,
            clen = document.cookie.length,
            i = 0,
            j = 0;
            
        while(i < clen){
            j = i + alen;
            if(document.cookie.substring(i, j) == arg){
                return this.getCookieVal(j);
            }
            i = document.cookie.indexOf(" ", i) + 1;
            if(i === 0){
                break;
            }
        }
        return null;
    },

    /**
     * Removes a cookie with the provided name from the browser
     * if found by setting its expiration date to sometime in the past. 
     * @param {String} name The name of the cookie to remove
     * @param {String} path (optional) The path for the cookie. This must be included if you included a path while setting the cookie.
     */
    clear : function(name, path){
        if(this.get(name)){
            path = path || '/';
            document.cookie = name + '=' + '; expires=Thu, 01-Jan-70 00:00:01 GMT; path=' + path;
        }
    },
    
    /**
     * @private
     */
    getCookieVal : function(offset){
        var endstr = document.cookie.indexOf(";", offset);
        if(endstr == -1){
            endstr = document.cookie.length;
        }
        return unescape(document.cookie.substring(offset, endstr));
    }
});

