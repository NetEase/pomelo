/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * @class Ext.CompositeElement
 * @extends Ext.CompositeElementLite
 * <p>This class encapsulates a <i>collection</i> of DOM elements, providing methods to filter
 * members, or to perform collective actions upon the whole set.</p>
 * <p>Although they are not listed, this class supports all of the methods of {@link Ext.Element} and
 * {@link Ext.fx.Anim}. The methods from these classes will be performed on all the elements in this collection.</p>
 * <p>All methods return <i>this</i> and can be chained.</p>
 * Usage:
<pre><code>
var els = Ext.select("#some-el div.some-class", true);
// or select directly from an existing element
var el = Ext.get('some-el');
el.select('div.some-class', true);

els.setWidth(100); // all elements become 100 width
els.hide(true); // all elements fade out and hide
// or
els.setWidth(100).hide(true);
</code></pre>
 */
Ext.CompositeElement = Ext.extend(Ext.CompositeElementLite, {

    constructor : function(els, root){
        this.elements = [];
        this.add(els, root);
    },

    // private
    getElement : function(el){
        // In this case just return it, since we already have a reference to it
        return el;
    },

    // private
    transformElement : function(el){
        return Ext.get(el);
    }
});

/**
 * Selects elements based on the passed CSS selector to enable {@link Ext.Element Element} methods
 * to be applied to many related elements in one statement through the returned {@link Ext.CompositeElement CompositeElement} or
 * {@link Ext.CompositeElementLite CompositeElementLite} object.
 * @param {String/HTMLElement[]} selector The CSS selector or an array of elements
 * @param {Boolean} [unique] true to create a unique Ext.Element for each element (defaults to a shared flyweight object)
 * @param {HTMLElement/String} [root] The root element of the query or id of the root
 * @return {Ext.CompositeElementLite/Ext.CompositeElement}
 * @member Ext.Element
 * @method select
 */
Ext.Element.select = function(selector, unique, root){
    var els;
    if(typeof selector == "string"){
        els = Ext.Element.selectorFunction(selector, root);
    }else if(selector.length !== undefined){
        els = selector;
    }else{
        //<debug>
        Ext.Error.raise({
            sourceClass: "Ext.Element",
            sourceMethod: "select",
            selector: selector,
            unique: unique,
            root: root,
            msg: "Invalid selector specified: " + selector
        });
        //</debug>
    }
    return (unique === true) ? new Ext.CompositeElement(els) : new Ext.CompositeElementLite(els);
};

/**
 * Shorthand of {@link Ext.Element#select}.
 * @member Ext
 * @method select
 * @alias Ext.Element#select
 */
Ext.select = Ext.Element.select;
