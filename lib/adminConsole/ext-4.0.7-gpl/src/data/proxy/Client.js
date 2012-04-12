/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * @author Ed Spencer
 *
 * Base class for any client-side storage. Used as a superclass for {@link Ext.data.proxy.Memory Memory} and
 * {@link Ext.data.proxy.WebStorage Web Storage} proxies. Do not use directly, use one of the subclasses instead.
 * @private
 */
Ext.define('Ext.data.proxy.Client', {
    extend: 'Ext.data.proxy.Proxy',
    alternateClassName: 'Ext.data.ClientProxy',

    /**
     * Abstract function that must be implemented by each ClientProxy subclass. This should purge all record data
     * from the client side storage, as well as removing any supporting data (such as lists of record IDs)
     */
    clear: function() {
        //<debug>
        Ext.Error.raise("The Ext.data.proxy.Client subclass that you are using has not defined a 'clear' function. See src/data/ClientProxy.js for details.");
        //</debug>
    }
});
