/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * This layout manages multiple child Components, each fitted to the Container, where only a single child Component can be
 * visible at any given time.  This layout style is most commonly used for wizards, tab implementations, etc.
 * This class is intended to be extended or created via the layout:'card' {@link Ext.container.Container#layout} config,
 * and should generally not need to be created directly via the new keyword.
 *
 * The CardLayout's focal method is {@link #setActiveItem}.  Since only one panel is displayed at a time,
 * the only way to move from one Component to the next is by calling setActiveItem, passing the next panel to display
 * (or its id or index).  The layout itself does not provide a user interface for handling this navigation,
 * so that functionality must be provided by the developer.
 *
 * To change the active card of a container, call the setActiveItem method of its layout:
 *
 *     Ext.create('Ext.panel.Panel', {
 *         layout: 'card',
 *         items: [
 *             { html: 'Card 1' },
 *             { html: 'Card 2' }
 *         ],
 *         renderTo: Ext.getBody()
 *     });
 *
 *     p.getLayout().setActiveItem(1);
 *
 * In the following example, a simplistic wizard setup is demonstrated.  A button bar is added
 * to the footer of the containing panel to provide navigation buttons.  The buttons will be handled by a
 * common navigation routine.  Note that other uses of a CardLayout (like a tab control) would require a
 * completely different implementation.  For serious implementations, a better approach would be to extend
 * CardLayout to provide the custom functionality needed.
 *
 *     @example
 *     var navigate = function(panel, direction){
 *         // This routine could contain business logic required to manage the navigation steps.
 *         // It would call setActiveItem as needed, manage navigation button state, handle any
 *         // branching logic that might be required, handle alternate actions like cancellation
 *         // or finalization, etc.  A complete wizard implementation could get pretty
 *         // sophisticated depending on the complexity required, and should probably be
 *         // done as a subclass of CardLayout in a real-world implementation.
 *         var layout = panel.getLayout();
 *         layout[direction]();
 *         Ext.getCmp('move-prev').setDisabled(!layout.getPrev());
 *         Ext.getCmp('move-next').setDisabled(!layout.getNext());
 *     };
 *
 *     Ext.create('Ext.panel.Panel', {
 *         title: 'Example Wizard',
 *         width: 300,
 *         height: 200,
 *         layout: 'card',
 *         bodyStyle: 'padding:15px',
 *         defaults: {
 *             // applied to each contained panel
 *             border: false
 *         },
 *         // just an example of one possible navigation scheme, using buttons
 *         bbar: [
 *             {
 *                 id: 'move-prev',
 *                 text: 'Back',
 *                 handler: function(btn) {
 *                     navigate(btn.up("panel"), "prev");
 *                 },
 *                 disabled: true
 *             },
 *             '->', // greedy spacer so that the buttons are aligned to each side
 *             {
 *                 id: 'move-next',
 *                 text: 'Next',
 *                 handler: function(btn) {
 *                     navigate(btn.up("panel"), "next");
 *                 }
 *             }
 *         ],
 *         // the panels (or "cards") within the layout
 *         items: [{
 *             id: 'card-0',
 *             html: '<h1>Welcome to the Wizard!</h1><p>Step 1 of 3</p>'
 *         },{
 *             id: 'card-1',
 *             html: '<p>Step 2 of 3</p>'
 *         },{
 *             id: 'card-2',
 *             html: '<h1>Congratulations!</h1><p>Step 3 of 3 - Complete</p>'
 *         }],
 *         renderTo: Ext.getBody()
 *     });
 */
Ext.define('Ext.layout.container.Card', {

    /* Begin Definitions */

    alias: ['layout.card'],
    alternateClassName: 'Ext.layout.CardLayout',

    extend: 'Ext.layout.container.AbstractCard',

    /* End Definitions */

    /**
     * Makes the given card active.
     *
     *     var card1 = Ext.create('Ext.panel.Panel', {itemId: 'card-1'});
     *     var card2 = Ext.create('Ext.panel.Panel', {itemId: 'card-2'});
     *     var panel = Ext.create('Ext.panel.Panel', {
     *         layout: 'card',
     *         activeItem: 0,
     *         items: [card1, card2]
     *     });
     *     // These are all equivalent
     *     panel.getLayout().setActiveItem(card2);
     *     panel.getLayout().setActiveItem('card-2');
     *     panel.getLayout().setActiveItem(1);
     *
     * @param {Ext.Component/Number/String} newCard  The component, component {@link Ext.Component#id id},
     * {@link Ext.Component#itemId itemId}, or index of component.
     * @return {Ext.Component} the activated component or false when nothing activated.
     * False is returned also when trying to activate an already active card.
     */
    setActiveItem: function(newCard) {
        var me = this,
            owner = me.owner,
            oldCard = me.activeItem,
            newIndex;

        newCard = me.parseActiveItem(newCard);
        newIndex = owner.items.indexOf(newCard);

        // If the card is not a child of the owner, then add it
        if (newIndex == -1) {
            newIndex = owner.items.items.length;
            owner.add(newCard);
        }

        // Is this a valid, different card?
        if (newCard && oldCard != newCard) {
            // If the card has not been rendered yet, now is the time to do so.
            if (!newCard.rendered) {
                me.renderItem(newCard, me.getRenderTarget(), owner.items.length);
                me.configureItem(newCard, 0);
            }

            me.activeItem = newCard;

            // Fire the beforeactivate and beforedeactivate events on the cards
            if (newCard.fireEvent('beforeactivate', newCard, oldCard) === false) {
                return false;
            }
            if (oldCard && oldCard.fireEvent('beforedeactivate', oldCard, newCard) === false) {
                return false;
            }

            // If the card hasnt been sized yet, do it now
            if (me.sizeAllCards) {
                // onLayout calls setItemBox
                me.onLayout();
            }
            else {
                me.setItemBox(newCard, me.getTargetBox());
            }

            me.owner.suspendLayout = true;

            if (oldCard) {
                if (me.hideInactive) {
                    oldCard.hide();
                }
                oldCard.fireEvent('deactivate', oldCard, newCard);
            }

            // Make sure the new card is shown
            me.owner.suspendLayout = false;
            if (newCard.hidden) {
                newCard.show();
            } else {
                me.onLayout();
            }

            newCard.fireEvent('activate', newCard, oldCard);

            return newCard;
        }
        return false;
    },

    configureItem: function(item) {
        // Card layout only controls dimensions which IT has controlled.
        // That calculation has to be determined at run time by examining the ownerCt's isFixedWidth()/isFixedHeight() methods
        item.layoutManagedHeight = 0;
        item.layoutManagedWidth = 0;

        this.callParent(arguments);
    }});
