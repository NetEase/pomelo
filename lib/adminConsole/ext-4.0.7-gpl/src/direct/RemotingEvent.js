/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * @class Ext.direct.RemotingEvent
 * @extends Ext.direct.Event
 * An event that is fired when data is received from a 
 * {@link Ext.direct.RemotingProvider}. Contains a method to the
 * related transaction for the direct request, see {@link #getTransaction}
 */
Ext.define('Ext.direct.RemotingEvent', {
    
    /* Begin Definitions */
   
    extend: 'Ext.direct.Event',
    
    alias: 'direct.rpc',
    
    /* End Definitions */
    
    /**
     * Get the transaction associated with this event.
     * @return {Ext.direct.Transaction} The transaction
     */
    getTransaction: function(){
        return this.transaction || Ext.direct.Manager.getTransaction(this.tid);
    }
});

