/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * @class Ext.direct.ExceptionEvent
 * @extends Ext.direct.RemotingEvent
 * An event that is fired when an exception is received from a {@link Ext.direct.RemotingProvider}
 */
Ext.define('Ext.direct.ExceptionEvent', {
    
    /* Begin Definitions */
   
    extend: 'Ext.direct.RemotingEvent',
    
    alias: 'direct.exception',
    
    /* End Definitions */
   
   status: false
});

