/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * @class Ext.DomHelper
 * @alternateClassName Ext.core.DomHelper
 *
 * <p>The DomHelper class provides a layer of abstraction from DOM and transparently supports creating
 * elements via DOM or using HTML fragments. It also has the ability to create HTML fragment templates
 * from your DOM building code.</p>
 *
 * <p><b><u>DomHelper element specification object</u></b></p>
 * <p>A specification object is used when creating elements. Attributes of this object
 * are assumed to be element attributes, except for 4 special attributes:
 * <div class="mdetail-params"><ul>
 * <li><b><tt>tag</tt></b> : <div class="sub-desc">The tag name of the element</div></li>
 * <li><b><tt>children</tt></b> : or <tt>cn</tt><div class="sub-desc">An array of the
 * same kind of element definition objects to be created and appended. These can be nested
 * as deep as you want.</div></li>
 * <li><b><tt>cls</tt></b> : <div class="sub-desc">The class attribute of the element.
 * This will end up being either the "class" attribute on a HTML fragment or className
 * for a DOM node, depending on whether DomHelper is using fragments or DOM.</div></li>
 * <li><b><tt>html</tt></b> : <div class="sub-desc">The innerHTML for the element</div></li>
 * </ul></div></p>
 * <p><b>NOTE:</b> For other arbitrary attributes, the value will currently <b>not</b> be automatically
 * HTML-escaped prior to building the element's HTML string. This means that if your attribute value
 * contains special characters that would not normally be allowed in a double-quoted attribute value,
 * you <b>must</b> manually HTML-encode it beforehand (see {@link Ext.String#htmlEncode}) or risk
 * malformed HTML being created. This behavior may change in a future release.</p>
 *
 * <p><b><u>Insertion methods</u></b></p>
 * <p>Commonly used insertion methods:
 * <div class="mdetail-params"><ul>
 * <li><tt>{@link #append}</tt> : <div class="sub-desc"></div></li>
 * <li><tt>{@link #insertBefore}</tt> : <div class="sub-desc"></div></li>
 * <li><tt>{@link #insertAfter}</tt> : <div class="sub-desc"></div></li>
 * <li><tt>{@link #overwrite}</tt> : <div class="sub-desc"></div></li>
 * <li><tt>{@link #createTemplate}</tt> : <div class="sub-desc"></div></li>
 * <li><tt>{@link #insertHtml}</tt> : <div class="sub-desc"></div></li>
 * </ul></div></p>
 *
 * <p><b><u>Example</u></b></p>
 * <p>This is an example, where an unordered list with 3 children items is appended to an existing
 * element with id <tt>'my-div'</tt>:<br>
 <pre><code>
var dh = Ext.DomHelper; // create shorthand alias
// specification object
var spec = {
    id: 'my-ul',
    tag: 'ul',
    cls: 'my-list',
    // append children after creating
    children: [     // may also specify 'cn' instead of 'children'
        {tag: 'li', id: 'item0', html: 'List Item 0'},
        {tag: 'li', id: 'item1', html: 'List Item 1'},
        {tag: 'li', id: 'item2', html: 'List Item 2'}
    ]
};
var list = dh.append(
    'my-div', // the context element 'my-div' can either be the id or the actual node
    spec      // the specification object
);
 </code></pre></p>
 * <p>Element creation specification parameters in this class may also be passed as an Array of
 * specification objects. This can be used to insert multiple sibling nodes into an existing
 * container very efficiently. For example, to add more list items to the example above:<pre><code>
dh.append('my-ul', [
    {tag: 'li', id: 'item3', html: 'List Item 3'},
    {tag: 'li', id: 'item4', html: 'List Item 4'}
]);
 * </code></pre></p>
 *
 * <p><b><u>Templating</u></b></p>
 * <p>The real power is in the built-in templating. Instead of creating or appending any elements,
 * <tt>{@link #createTemplate}</tt> returns a Template object which can be used over and over to
 * insert new elements. Revisiting the example above, we could utilize templating this time:
 * <pre><code>
// create the node
var list = dh.append('my-div', {tag: 'ul', cls: 'my-list'});
// get template
var tpl = dh.createTemplate({tag: 'li', id: 'item{0}', html: 'List Item {0}'});

for(var i = 0; i < 5, i++){
    tpl.append(list, [i]); // use template to append to the actual node
}
 * </code></pre></p>
 * <p>An example using a template:<pre><code>
var html = '<a id="{0}" href="{1}" class="nav">{2}</a>';

var tpl = new Ext.DomHelper.createTemplate(html);
tpl.append('blog-roll', ['link1', 'http://www.edspencer.net/', "Ed&#39;s Site"]);
tpl.append('blog-roll', ['link2', 'http://www.dustindiaz.com/', "Dustin&#39;s Site"]);
 * </code></pre></p>
 *
 * <p>The same example using named parameters:<pre><code>
var html = '<a id="{id}" href="{url}" class="nav">{text}</a>';

var tpl = new Ext.DomHelper.createTemplate(html);
tpl.append('blog-roll', {
    id: 'link1',
    url: 'http://www.edspencer.net/',
    text: "Ed&#39;s Site"
});
tpl.append('blog-roll', {
    id: 'link2',
    url: 'http://www.dustindiaz.com/',
    text: "Dustin&#39;s Site"
});
 * </code></pre></p>
 *
 * <p><b><u>Compiling Templates</u></b></p>
 * <p>Templates are applied using regular expressions. The performance is great, but if
 * you are adding a bunch of DOM elements using the same template, you can increase
 * performance even further by {@link Ext.Template#compile "compiling"} the template.
 * The way "{@link Ext.Template#compile compile()}" works is the template is parsed and
 * broken up at the different variable points and a dynamic function is created and eval'ed.
 * The generated function performs string concatenation of these parts and the passed
 * variables instead of using regular expressions.
 * <pre><code>
var html = '<a id="{id}" href="{url}" class="nav">{text}</a>';

var tpl = new Ext.DomHelper.createTemplate(html);
tpl.compile();

//... use template like normal
 * </code></pre></p>
 *
 * <p><b><u>Performance Boost</u></b></p>
 * <p>DomHelper will transparently create HTML fragments when it can. Using HTML fragments instead
 * of DOM can significantly boost performance.</p>
 * <p>Element creation specification parameters may also be strings. If {@link #useDom} is <tt>false</tt>,
 * then the string is used as innerHTML. If {@link #useDom} is <tt>true</tt>, a string specification
 * results in the creation of a text node. Usage:</p>
 * <pre><code>
Ext.DomHelper.useDom = true; // force it to use DOM; reduces performance
 * </code></pre>
 * @singleton
 */
Ext.ns('Ext.core');
Ext.core.DomHelper = Ext.DomHelper = function(){
    var tempTableEl = null,
        emptyTags = /^(?:br|frame|hr|img|input|link|meta|range|spacer|wbr|area|param|col)$/i,
        tableRe = /^table|tbody|tr|td$/i,
        confRe = /tag|children|cn|html$/i,
        tableElRe = /td|tr|tbody/i,
        endRe = /end/i,
        pub,
        // kill repeat to save bytes
        afterbegin = 'afterbegin',
        afterend = 'afterend',
        beforebegin = 'beforebegin',
        beforeend = 'beforeend',
        ts = '<table>',
        te = '</table>',
        tbs = ts+'<tbody>',
        tbe = '</tbody>'+te,
        trs = tbs + '<tr>',
        tre = '</tr>'+tbe;

    // private
    function doInsert(el, o, returnElement, pos, sibling, append){
        el = Ext.getDom(el);
        var newNode;
        if (pub.useDom) {
            newNode = createDom(o, null);
            if (append) {
                el.appendChild(newNode);
            } else {
                (sibling == 'firstChild' ? el : el.parentNode).insertBefore(newNode, el[sibling] || el);
            }
        } else {
            newNode = Ext.DomHelper.insertHtml(pos, el, Ext.DomHelper.createHtml(o));
        }
        return returnElement ? Ext.get(newNode, true) : newNode;
    }

    function createDom(o, parentNode){
        var el,
            doc = document,
            useSet,
            attr,
            val,
            cn;

        if (Ext.isArray(o)) {                       // Allow Arrays of siblings to be inserted
            el = doc.createDocumentFragment(); // in one shot using a DocumentFragment
            for (var i = 0, l = o.length; i < l; i++) {
                createDom(o[i], el);
            }
        } else if (typeof o == 'string') {         // Allow a string as a child spec.
            el = doc.createTextNode(o);
        } else {
            el = doc.createElement( o.tag || 'div' );
            useSet = !!el.setAttribute; // In IE some elements don't have setAttribute
            for (attr in o) {
                if(!confRe.test(attr)){
                    val = o[attr];
                    if(attr == 'cls'){
                        el.className = val;
                    }else{
                        if(useSet){
                            el.setAttribute(attr, val);
                        }else{
                            el[attr] = val;
                        }
                    }
                }
            }
            Ext.DomHelper.applyStyles(el, o.style);

            if ((cn = o.children || o.cn)) {
                createDom(cn, el);
            } else if (o.html) {
                el.innerHTML = o.html;
            }
        }
        if(parentNode){
           parentNode.appendChild(el);
        }
        return el;
    }

    // build as innerHTML where available
    function createHtml(o){
        var b = '',
            attr,
            val,
            key,
            cn,
            i;

        if(typeof o == "string"){
            b = o;
        } else if (Ext.isArray(o)) {
            for (i=0; i < o.length; i++) {
                if(o[i]) {
                    b += createHtml(o[i]);
                }
            }
        } else {
            b += '<' + (o.tag = o.tag || 'div');
            for (attr in o) {
                val = o[attr];
                if(!confRe.test(attr)){
                    if (typeof val == "object") {
                        b += ' ' + attr + '="';
                        for (key in val) {
                            b += key + ':' + val[key] + ';';
                        }
                        b += '"';
                    }else{
                        b += ' ' + ({cls : 'class', htmlFor : 'for'}[attr] || attr) + '="' + val + '"';
                    }
                }
            }
            // Now either just close the tag or try to add children and close the tag.
            if (emptyTags.test(o.tag)) {
                b += '/>';
            } else {
                b += '>';
                if ((cn = o.children || o.cn)) {
                    b += createHtml(cn);
                } else if(o.html){
                    b += o.html;
                }
                b += '</' + o.tag + '>';
            }
        }
        return b;
    }

    function ieTable(depth, s, h, e){
        tempTableEl.innerHTML = [s, h, e].join('');
        var i = -1,
            el = tempTableEl,
            ns;
        while(++i < depth){
            el = el.firstChild;
        }
//      If the result is multiple siblings, then encapsulate them into one fragment.
        ns = el.nextSibling;
        if (ns){
            var df = document.createDocumentFragment();
            while(el){
                ns = el.nextSibling;
                df.appendChild(el);
                el = ns;
            }
            el = df;
        }
        return el;
    }

    /**
     * @ignore
     * Nasty code for IE's broken table implementation
     */
    function insertIntoTable(tag, where, el, html) {
        var node,
            before;

        tempTableEl = tempTableEl || document.createElement('div');

        if(tag == 'td' && (where == afterbegin || where == beforeend) ||
           !tableElRe.test(tag) && (where == beforebegin || where == afterend)) {
            return null;
        }
        before = where == beforebegin ? el :
                 where == afterend ? el.nextSibling :
                 where == afterbegin ? el.firstChild : null;

        if (where == beforebegin || where == afterend) {
            el = el.parentNode;
        }

        if (tag == 'td' || (tag == 'tr' && (where == beforeend || where == afterbegin))) {
            node = ieTable(4, trs, html, tre);
        } else if ((tag == 'tbody' && (where == beforeend || where == afterbegin)) ||
                   (tag == 'tr' && (where == beforebegin || where == afterend))) {
            node = ieTable(3, tbs, html, tbe);
        } else {
            node = ieTable(2, ts, html, te);
        }
        el.insertBefore(node, before);
        return node;
    }

    /**
     * @ignore
     * Fix for IE9 createContextualFragment missing method
     */
    function createContextualFragment(html){
        var div = document.createElement("div"),
            fragment = document.createDocumentFragment(),
            i = 0,
            length, childNodes;

        div.innerHTML = html;
        childNodes = div.childNodes;
        length = childNodes.length;

        for (; i < length; i++) {
            fragment.appendChild(childNodes[i].cloneNode(true));
        }

        return fragment;
    }

    pub = {
        /**
         * Returns the markup for the passed Element(s) config.
         * @param {Object} o The DOM object spec (and children)
         * @return {String}
         */
        markup : function(o){
            return createHtml(o);
        },

        /**
         * Applies a style specification to an element.
         * @param {String/HTMLElement} el The element to apply styles to
         * @param {String/Object/Function} styles A style specification string e.g. 'width:100px', or object in the form {width:'100px'}, or
         * a function which returns such a specification.
         */
        applyStyles : function(el, styles){
            if (styles) {
                el = Ext.fly(el);
                if (typeof styles == "function") {
                    styles = styles.call();
                }
                if (typeof styles == "string") {
                    styles = Ext.Element.parseStyles(styles);
                }
                if (typeof styles == "object") {
                    el.setStyle(styles);
                }
            }
        },

        /**
         * Inserts an HTML fragment into the DOM.
         * @param {String} where Where to insert the html in relation to el - beforeBegin, afterBegin, beforeEnd, afterEnd.
         *
         * For example take the following HTML: `<div>Contents</div>`
         *
         * Using different `where` values inserts element to the following places:
         *
         * - beforeBegin: `<HERE><div>Contents</div>`
         * - afterBegin: `<div><HERE>Contents</div>`
         * - beforeEnd: `<div>Contents<HERE></div>`
         * - afterEnd: `<div>Contents</div><HERE>`
         *
         * @param {HTMLElement/TextNode} el The context element
         * @param {String} html The HTML fragment
         * @return {HTMLElement} The new node
         */
        insertHtml : function(where, el, html){
            var hash = {},
                hashVal,
                range,
                rangeEl,
                setStart,
                frag,
                rs;

            where = where.toLowerCase();
            // add these here because they are used in both branches of the condition.
            hash[beforebegin] = ['BeforeBegin', 'previousSibling'];
            hash[afterend] = ['AfterEnd', 'nextSibling'];

            // if IE and context element is an HTMLElement
            if (el.insertAdjacentHTML) {
                if(tableRe.test(el.tagName) && (rs = insertIntoTable(el.tagName.toLowerCase(), where, el, html))){
                    return rs;
                }

                // add these two to the hash.
                hash[afterbegin] = ['AfterBegin', 'firstChild'];
                hash[beforeend] = ['BeforeEnd', 'lastChild'];
                if ((hashVal = hash[where])) {
                    el.insertAdjacentHTML(hashVal[0], html);
                    return el[hashVal[1]];
                }
            // if (not IE and context element is an HTMLElement) or TextNode
            } else {
                // we cannot insert anything inside a textnode so...
                if (Ext.isTextNode(el)) {
                    where = where === 'afterbegin' ? 'beforebegin' : where;
                    where = where === 'beforeend' ? 'afterend' : where;
                }
                range = Ext.supports.CreateContextualFragment ? el.ownerDocument.createRange() : undefined;
                setStart = 'setStart' + (endRe.test(where) ? 'After' : 'Before');
                if (hash[where]) {
                    if (range) {
                        range[setStart](el);
                        frag = range.createContextualFragment(html);
                    } else {
                        frag = createContextualFragment(html);
                    }
                    el.parentNode.insertBefore(frag, where == beforebegin ? el : el.nextSibling);
                    return el[(where == beforebegin ? 'previous' : 'next') + 'Sibling'];
                } else {
                    rangeEl = (where == afterbegin ? 'first' : 'last') + 'Child';
                    if (el.firstChild) {
                        if (range) {
                            range[setStart](el[rangeEl]);
                            frag = range.createContextualFragment(html);
                        } else {
                            frag = createContextualFragment(html);
                        }

                        if(where == afterbegin){
                            el.insertBefore(frag, el.firstChild);
                        }else{
                            el.appendChild(frag);
                        }
                    } else {
                        el.innerHTML = html;
                    }
                    return el[rangeEl];
                }
            }
            //<debug>
            Ext.Error.raise({
                sourceClass: 'Ext.DomHelper',
                sourceMethod: 'insertHtml',
                htmlToInsert: html,
                targetElement: el,
                msg: 'Illegal insertion point reached: "' + where + '"'
            });
            //</debug>
        },

        /**
         * Creates new DOM element(s) and inserts them before el.
         * @param {String/HTMLElement/Ext.Element} el The context element
         * @param {Object/String} o The DOM object spec (and children) or raw HTML blob
         * @param {Boolean} returnElement (optional) true to return a Ext.Element
         * @return {HTMLElement/Ext.Element} The new node
         */
        insertBefore : function(el, o, returnElement){
            return doInsert(el, o, returnElement, beforebegin);
        },

        /**
         * Creates new DOM element(s) and inserts them after el.
         * @param {String/HTMLElement/Ext.Element} el The context element
         * @param {Object} o The DOM object spec (and children)
         * @param {Boolean} returnElement (optional) true to return a Ext.Element
         * @return {HTMLElement/Ext.Element} The new node
         */
        insertAfter : function(el, o, returnElement){
            return doInsert(el, o, returnElement, afterend, 'nextSibling');
        },

        /**
         * Creates new DOM element(s) and inserts them as the first child of el.
         * @param {String/HTMLElement/Ext.Element} el The context element
         * @param {Object/String} o The DOM object spec (and children) or raw HTML blob
         * @param {Boolean} returnElement (optional) true to return a Ext.Element
         * @return {HTMLElement/Ext.Element} The new node
         */
        insertFirst : function(el, o, returnElement){
            return doInsert(el, o, returnElement, afterbegin, 'firstChild');
        },

        /**
         * Creates new DOM element(s) and appends them to el.
         * @param {String/HTMLElement/Ext.Element} el The context element
         * @param {Object/String} o The DOM object spec (and children) or raw HTML blob
         * @param {Boolean} returnElement (optional) true to return a Ext.Element
         * @return {HTMLElement/Ext.Element} The new node
         */
        append : function(el, o, returnElement){
            return doInsert(el, o, returnElement, beforeend, '', true);
        },

        /**
         * Creates new DOM element(s) and overwrites the contents of el with them.
         * @param {String/HTMLElement/Ext.Element} el The context element
         * @param {Object/String} o The DOM object spec (and children) or raw HTML blob
         * @param {Boolean} returnElement (optional) true to return a Ext.Element
         * @return {HTMLElement/Ext.Element} The new node
         */
        overwrite : function(el, o, returnElement){
            el = Ext.getDom(el);
            el.innerHTML = createHtml(o);
            return returnElement ? Ext.get(el.firstChild) : el.firstChild;
        },

        createHtml : createHtml,

        /**
         * Creates new DOM element(s) without inserting them to the document.
         * @param {Object/String} o The DOM object spec (and children) or raw HTML blob
         * @return {HTMLElement} The new uninserted node
         * @method
         */
        createDom: createDom,

        /** True to force the use of DOM instead of html fragments @type Boolean */
        useDom : false,

        /**
         * Creates a new Ext.Template from the DOM object spec.
         * @param {Object} o The DOM object spec (and children)
         * @return {Ext.Template} The new template
         */
        createTemplate : function(o){
            var html = Ext.DomHelper.createHtml(o);
            return Ext.create('Ext.Template', html);
        }
    };
    return pub;
}();

