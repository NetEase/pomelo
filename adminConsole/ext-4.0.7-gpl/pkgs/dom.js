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

/*
 * This is code is also distributed under MIT license for use
 * with jQuery and prototype JavaScript libraries.
 */
/**
 * @class Ext.DomQuery
Provides high performance selector/xpath processing by compiling queries into reusable functions. New pseudo classes and matchers can be plugged. It works on HTML and XML documents (if a content node is passed in).
<p>
DomQuery supports most of the <a href="http://www.w3.org/TR/2005/WD-css3-selectors-20051215/#selectors">CSS3 selectors spec</a>, along with some custom selectors and basic XPath.</p>

<p>
All selectors, attribute filters and pseudos below can be combined infinitely in any order. For example "div.foo:nth-child(odd)[@foo=bar].bar:first" would be a perfectly valid selector. Node filters are processed in the order in which they appear, which allows you to optimize your queries for your document structure.
</p>
<h4>Element Selectors:</h4>
<ul class="list">
    <li> <b>*</b> any element</li>
    <li> <b>E</b> an element with the tag E</li>
    <li> <b>E F</b> All descendent elements of E that have the tag F</li>
    <li> <b>E > F</b> or <b>E/F</b> all direct children elements of E that have the tag F</li>
    <li> <b>E + F</b> all elements with the tag F that are immediately preceded by an element with the tag E</li>
    <li> <b>E ~ F</b> all elements with the tag F that are preceded by a sibling element with the tag E</li>
</ul>
<h4>Attribute Selectors:</h4>
<p>The use of &#64; and quotes are optional. For example, div[&#64;foo='bar'] is also a valid attribute selector.</p>
<ul class="list">
    <li> <b>E[foo]</b> has an attribute "foo"</li>
    <li> <b>E[foo=bar]</b> has an attribute "foo" that equals "bar"</li>
    <li> <b>E[foo^=bar]</b> has an attribute "foo" that starts with "bar"</li>
    <li> <b>E[foo$=bar]</b> has an attribute "foo" that ends with "bar"</li>
    <li> <b>E[foo*=bar]</b> has an attribute "foo" that contains the substring "bar"</li>
    <li> <b>E[foo%=2]</b> has an attribute "foo" that is evenly divisible by 2</li>
    <li> <b>E[foo!=bar]</b> attribute "foo" does not equal "bar"</li>
</ul>
<h4>Pseudo Classes:</h4>
<ul class="list">
    <li> <b>E:first-child</b> E is the first child of its parent</li>
    <li> <b>E:last-child</b> E is the last child of its parent</li>
    <li> <b>E:nth-child(<i>n</i>)</b> E is the <i>n</i>th child of its parent (1 based as per the spec)</li>
    <li> <b>E:nth-child(odd)</b> E is an odd child of its parent</li>
    <li> <b>E:nth-child(even)</b> E is an even child of its parent</li>
    <li> <b>E:only-child</b> E is the only child of its parent</li>
    <li> <b>E:checked</b> E is an element that is has a checked attribute that is true (e.g. a radio or checkbox) </li>
    <li> <b>E:first</b> the first E in the resultset</li>
    <li> <b>E:last</b> the last E in the resultset</li>
    <li> <b>E:nth(<i>n</i>)</b> the <i>n</i>th E in the resultset (1 based)</li>
    <li> <b>E:odd</b> shortcut for :nth-child(odd)</li>
    <li> <b>E:even</b> shortcut for :nth-child(even)</li>
    <li> <b>E:contains(foo)</b> E's innerHTML contains the substring "foo"</li>
    <li> <b>E:nodeValue(foo)</b> E contains a textNode with a nodeValue that equals "foo"</li>
    <li> <b>E:not(S)</b> an E element that does not match simple selector S</li>
    <li> <b>E:has(S)</b> an E element that has a descendent that matches simple selector S</li>
    <li> <b>E:next(S)</b> an E element whose next sibling matches simple selector S</li>
    <li> <b>E:prev(S)</b> an E element whose previous sibling matches simple selector S</li>
    <li> <b>E:any(S1|S2|S2)</b> an E element which matches any of the simple selectors S1, S2 or S3//\\</li>
</ul>
<h4>CSS Value Selectors:</h4>
<ul class="list">
    <li> <b>E{display=none}</b> css value "display" that equals "none"</li>
    <li> <b>E{display^=none}</b> css value "display" that starts with "none"</li>
    <li> <b>E{display$=none}</b> css value "display" that ends with "none"</li>
    <li> <b>E{display*=none}</b> css value "display" that contains the substring "none"</li>
    <li> <b>E{display%=2}</b> css value "display" that is evenly divisible by 2</li>
    <li> <b>E{display!=none}</b> css value "display" that does not equal "none"</li>
</ul>
 * @singleton
 */
Ext.ns('Ext.core');

Ext.core.DomQuery = Ext.DomQuery = function(){
    var cache = {},
        simpleCache = {},
        valueCache = {},
        nonSpace = /\S/,
        trimRe = /^\s+|\s+$/g,
        tplRe = /\{(\d+)\}/g,
        modeRe = /^(\s?[\/>+~]\s?|\s|$)/,
        tagTokenRe = /^(#)?([\w-\*]+)/,
        nthRe = /(\d*)n\+?(\d*)/,
        nthRe2 = /\D/,
        startIdRe = /^\s*\#/,
        // This is for IE MSXML which does not support expandos.
    // IE runs the same speed using setAttribute, however FF slows way down
    // and Safari completely fails so they need to continue to use expandos.
    isIE = window.ActiveXObject ? true : false,
    key = 30803;

    // this eval is stop the compressor from
    // renaming the variable to something shorter
    eval("var batch = 30803;");

    // Retrieve the child node from a particular
    // parent at the specified index.
    function child(parent, index){
        var i = 0,
            n = parent.firstChild;
        while(n){
            if(n.nodeType == 1){
               if(++i == index){
                   return n;
               }
            }
            n = n.nextSibling;
        }
        return null;
    }

    // retrieve the next element node
    function next(n){
        while((n = n.nextSibling) && n.nodeType != 1);
        return n;
    }

    // retrieve the previous element node
    function prev(n){
        while((n = n.previousSibling) && n.nodeType != 1);
        return n;
    }

    // Mark each child node with a nodeIndex skipping and
    // removing empty text nodes.
    function children(parent){
        var n = parent.firstChild,
        nodeIndex = -1,
        nextNode;
        while(n){
            nextNode = n.nextSibling;
            // clean worthless empty nodes.
            if(n.nodeType == 3 && !nonSpace.test(n.nodeValue)){
            parent.removeChild(n);
            }else{
            // add an expando nodeIndex
            n.nodeIndex = ++nodeIndex;
            }
            n = nextNode;
        }
        return this;
    }


    // nodeSet - array of nodes
    // cls - CSS Class
    function byClassName(nodeSet, cls){
        if(!cls){
            return nodeSet;
        }
        var result = [], ri = -1;
        for(var i = 0, ci; ci = nodeSet[i]; i++){
            if((' '+ci.className+' ').indexOf(cls) != -1){
                result[++ri] = ci;
            }
        }
        return result;
    };

    function attrValue(n, attr){
        // if its an array, use the first node.
        if(!n.tagName && typeof n.length != "undefined"){
            n = n[0];
        }
        if(!n){
            return null;
        }

        if(attr == "for"){
            return n.htmlFor;
        }
        if(attr == "class" || attr == "className"){
            return n.className;
        }
        return n.getAttribute(attr) || n[attr];

    };


    // ns - nodes
    // mode - false, /, >, +, ~
    // tagName - defaults to "*"
    function getNodes(ns, mode, tagName){
        var result = [], ri = -1, cs;
        if(!ns){
            return result;
        }
        tagName = tagName || "*";
        // convert to array
        if(typeof ns.getElementsByTagName != "undefined"){
            ns = [ns];
        }

        // no mode specified, grab all elements by tagName
        // at any depth
        if(!mode){
            for(var i = 0, ni; ni = ns[i]; i++){
                cs = ni.getElementsByTagName(tagName);
                for(var j = 0, ci; ci = cs[j]; j++){
                    result[++ri] = ci;
                }
            }
        // Direct Child mode (/ or >)
        // E > F or E/F all direct children elements of E that have the tag
        } else if(mode == "/" || mode == ">"){
            var utag = tagName.toUpperCase();
            for(var i = 0, ni, cn; ni = ns[i]; i++){
                cn = ni.childNodes;
                for(var j = 0, cj; cj = cn[j]; j++){
                    if(cj.nodeName == utag || cj.nodeName == tagName  || tagName == '*'){
                        result[++ri] = cj;
                    }
                }
            }
        // Immediately Preceding mode (+)
        // E + F all elements with the tag F that are immediately preceded by an element with the tag E
        }else if(mode == "+"){
            var utag = tagName.toUpperCase();
            for(var i = 0, n; n = ns[i]; i++){
                while((n = n.nextSibling) && n.nodeType != 1);
                if(n && (n.nodeName == utag || n.nodeName == tagName || tagName == '*')){
                    result[++ri] = n;
                }
            }
        // Sibling mode (~)
        // E ~ F all elements with the tag F that are preceded by a sibling element with the tag E
        }else if(mode == "~"){
            var utag = tagName.toUpperCase();
            for(var i = 0, n; n = ns[i]; i++){
                while((n = n.nextSibling)){
                    if (n.nodeName == utag || n.nodeName == tagName || tagName == '*'){
                        result[++ri] = n;
                    }
                }
            }
        }
        return result;
    }

    function concat(a, b){
        if(b.slice){
            return a.concat(b);
        }
        for(var i = 0, l = b.length; i < l; i++){
            a[a.length] = b[i];
        }
        return a;
    }

    function byTag(cs, tagName){
        if(cs.tagName || cs == document){
            cs = [cs];
        }
        if(!tagName){
            return cs;
        }
        var result = [], ri = -1;
        tagName = tagName.toLowerCase();
        for(var i = 0, ci; ci = cs[i]; i++){
            if(ci.nodeType == 1 && ci.tagName.toLowerCase() == tagName){
                result[++ri] = ci;
            }
        }
        return result;
    }

    function byId(cs, id){
        if(cs.tagName || cs == document){
            cs = [cs];
        }
        if(!id){
            return cs;
        }
        var result = [], ri = -1;
        for(var i = 0, ci; ci = cs[i]; i++){
            if(ci && ci.id == id){
                result[++ri] = ci;
                return result;
            }
        }
        return result;
    }

    // operators are =, !=, ^=, $=, *=, %=, |= and ~=
    // custom can be "{"
    function byAttribute(cs, attr, value, op, custom){
        var result = [],
            ri = -1,
            useGetStyle = custom == "{",
            fn = Ext.DomQuery.operators[op],
            a,
            xml,
            hasXml;

        for(var i = 0, ci; ci = cs[i]; i++){
            // skip non-element nodes.
            if(ci.nodeType != 1){
                continue;
            }
            // only need to do this for the first node
            if(!hasXml){
                xml = Ext.DomQuery.isXml(ci);
                hasXml = true;
            }

            // we only need to change the property names if we're dealing with html nodes, not XML
            if(!xml){
                if(useGetStyle){
                    a = Ext.DomQuery.getStyle(ci, attr);
                } else if (attr == "class" || attr == "className"){
                    a = ci.className;
                } else if (attr == "for"){
                    a = ci.htmlFor;
                } else if (attr == "href"){
                    // getAttribute href bug
                    // http://www.glennjones.net/Post/809/getAttributehrefbug.htm
                    a = ci.getAttribute("href", 2);
                } else{
                    a = ci.getAttribute(attr);
                }
            }else{
                a = ci.getAttribute(attr);
            }
            if((fn && fn(a, value)) || (!fn && a)){
                result[++ri] = ci;
            }
        }
        return result;
    }

    function byPseudo(cs, name, value){
        return Ext.DomQuery.pseudos[name](cs, value);
    }

    function nodupIEXml(cs){
        var d = ++key,
            r;
        cs[0].setAttribute("_nodup", d);
        r = [cs[0]];
        for(var i = 1, len = cs.length; i < len; i++){
            var c = cs[i];
            if(!c.getAttribute("_nodup") != d){
                c.setAttribute("_nodup", d);
                r[r.length] = c;
            }
        }
        for(var i = 0, len = cs.length; i < len; i++){
            cs[i].removeAttribute("_nodup");
        }
        return r;
    }

    function nodup(cs){
        if(!cs){
            return [];
        }
        var len = cs.length, c, i, r = cs, cj, ri = -1;
        if(!len || typeof cs.nodeType != "undefined" || len == 1){
            return cs;
        }
        if(isIE && typeof cs[0].selectSingleNode != "undefined"){
            return nodupIEXml(cs);
        }
        var d = ++key;
        cs[0]._nodup = d;
        for(i = 1; c = cs[i]; i++){
            if(c._nodup != d){
                c._nodup = d;
            }else{
                r = [];
                for(var j = 0; j < i; j++){
                    r[++ri] = cs[j];
                }
                for(j = i+1; cj = cs[j]; j++){
                    if(cj._nodup != d){
                        cj._nodup = d;
                        r[++ri] = cj;
                    }
                }
                return r;
            }
        }
        return r;
    }

    function quickDiffIEXml(c1, c2){
        var d = ++key,
            r = [];
        for(var i = 0, len = c1.length; i < len; i++){
            c1[i].setAttribute("_qdiff", d);
        }
        for(var i = 0, len = c2.length; i < len; i++){
            if(c2[i].getAttribute("_qdiff") != d){
                r[r.length] = c2[i];
            }
        }
        for(var i = 0, len = c1.length; i < len; i++){
           c1[i].removeAttribute("_qdiff");
        }
        return r;
    }

    function quickDiff(c1, c2){
        var len1 = c1.length,
            d = ++key,
            r = [];
        if(!len1){
            return c2;
        }
        if(isIE && typeof c1[0].selectSingleNode != "undefined"){
            return quickDiffIEXml(c1, c2);
        }
        for(var i = 0; i < len1; i++){
            c1[i]._qdiff = d;
        }
        for(var i = 0, len = c2.length; i < len; i++){
            if(c2[i]._qdiff != d){
                r[r.length] = c2[i];
            }
        }
        return r;
    }

    function quickId(ns, mode, root, id){
        if(ns == root){
           var d = root.ownerDocument || root;
           return d.getElementById(id);
        }
        ns = getNodes(ns, mode, "*");
        return byId(ns, id);
    }

    return {
        getStyle : function(el, name){
            return Ext.fly(el).getStyle(name);
        },
        /**
         * Compiles a selector/xpath query into a reusable function. The returned function
         * takes one parameter "root" (optional), which is the context node from where the query should start.
         * @param {String} selector The selector/xpath query
         * @param {String} type (optional) Either "select" (the default) or "simple" for a simple selector match
         * @return {Function}
         */
        compile : function(path, type){
            type = type || "select";

            // setup fn preamble
            var fn = ["var f = function(root){\n var mode; ++batch; var n = root || document;\n"],
                mode,
                lastPath,
                matchers = Ext.DomQuery.matchers,
                matchersLn = matchers.length,
                modeMatch,
                // accept leading mode switch
                lmode = path.match(modeRe);

            if(lmode && lmode[1]){
                fn[fn.length] = 'mode="'+lmode[1].replace(trimRe, "")+'";';
                path = path.replace(lmode[1], "");
            }

            // strip leading slashes
            while(path.substr(0, 1)=="/"){
                path = path.substr(1);
            }

            while(path && lastPath != path){
                lastPath = path;
                var tokenMatch = path.match(tagTokenRe);
                if(type == "select"){
                    if(tokenMatch){
                        // ID Selector
                        if(tokenMatch[1] == "#"){
                            fn[fn.length] = 'n = quickId(n, mode, root, "'+tokenMatch[2]+'");';
                        }else{
                            fn[fn.length] = 'n = getNodes(n, mode, "'+tokenMatch[2]+'");';
                        }
                        path = path.replace(tokenMatch[0], "");
                    }else if(path.substr(0, 1) != '@'){
                        fn[fn.length] = 'n = getNodes(n, mode, "*");';
                    }
                // type of "simple"
                }else{
                    if(tokenMatch){
                        if(tokenMatch[1] == "#"){
                            fn[fn.length] = 'n = byId(n, "'+tokenMatch[2]+'");';
                        }else{
                            fn[fn.length] = 'n = byTag(n, "'+tokenMatch[2]+'");';
                        }
                        path = path.replace(tokenMatch[0], "");
                    }
                }
                while(!(modeMatch = path.match(modeRe))){
                    var matched = false;
                    for(var j = 0; j < matchersLn; j++){
                        var t = matchers[j];
                        var m = path.match(t.re);
                        if(m){
                            fn[fn.length] = t.select.replace(tplRe, function(x, i){
                                return m[i];
                            });
                            path = path.replace(m[0], "");
                            matched = true;
                            break;
                        }
                    }
                    // prevent infinite loop on bad selector
                    if(!matched){
                        //<debug>
                        Ext.Error.raise({
                            sourceClass: 'Ext.DomQuery',
                            sourceMethod: 'compile',
                            msg: 'Error parsing selector. Parsing failed at "' + path + '"'
                        });
                        //</debug>
                    }
                }
                if(modeMatch[1]){
                    fn[fn.length] = 'mode="'+modeMatch[1].replace(trimRe, "")+'";';
                    path = path.replace(modeMatch[1], "");
                }
            }
            // close fn out
            fn[fn.length] = "return nodup(n);\n}";

            // eval fn and return it
            eval(fn.join(""));
            return f;
        },

        /**
         * Selects an array of DOM nodes using JavaScript-only implementation.
         *
         * Use {@link #select} to take advantage of browsers built-in support for CSS selectors.
         *
         * @param {String} selector The selector/xpath query (can be a comma separated list of selectors)
         * @param {HTMLElement/String} root (optional) The start of the query (defaults to document).
         * @return {HTMLElement[]} An Array of DOM elements which match the selector. If there are
         * no matches, and empty Array is returned.
         */
        jsSelect: function(path, root, type){
            // set root to doc if not specified.
            root = root || document;

            if(typeof root == "string"){
                root = document.getElementById(root);
            }
            var paths = path.split(","),
                results = [];

            // loop over each selector
            for(var i = 0, len = paths.length; i < len; i++){
                var subPath = paths[i].replace(trimRe, "");
                // compile and place in cache
                if(!cache[subPath]){
                    cache[subPath] = Ext.DomQuery.compile(subPath);
                    if(!cache[subPath]){
                        //<debug>
                        Ext.Error.raise({
                            sourceClass: 'Ext.DomQuery',
                            sourceMethod: 'jsSelect',
                            msg: subPath + ' is not a valid selector'
                        });
                        //</debug>
                    }
                }
                var result = cache[subPath](root);
                if(result && result != document){
                    results = results.concat(result);
                }
            }

            // if there were multiple selectors, make sure dups
            // are eliminated
            if(paths.length > 1){
                return nodup(results);
            }
            return results;
        },

        isXml: function(el) {
            var docEl = (el ? el.ownerDocument || el : 0).documentElement;
            return docEl ? docEl.nodeName !== "HTML" : false;
        },

        /**
         * Selects an array of DOM nodes by CSS/XPath selector.
         *
         * Uses [document.querySelectorAll][0] if browser supports that, otherwise falls back to
         * {@link Ext.DomQuery#jsSelect} to do the work.
         *
         * Aliased as {@link Ext#query}.
         *
         * [0]: https://developer.mozilla.org/en/DOM/document.querySelectorAll
         *
         * @param {String} path The selector/xpath query
         * @param {HTMLElement} root (optional) The start of the query (defaults to document).
         * @return {HTMLElement[]} An array of DOM elements (not a NodeList as returned by `querySelectorAll`).
         * Empty array when no matches.
         * @method
         */
        select : document.querySelectorAll ? function(path, root, type) {
            root = root || document;
            /* 
             * Safari 3.x can't handle uppercase or unicode characters when in quirks mode.
             */
            if (!Ext.DomQuery.isXml(root) && !(Ext.isSafari3 && !Ext.isStrict)) { 
                try {
                    /*
                     * This checking here is to "fix" the behaviour of querySelectorAll
                     * for non root document queries. The way qsa works is intentional,
                     * however it's definitely not the expected way it should work.
                     * More info: http://ejohn.org/blog/thoughts-on-queryselectorall/
                     *
                     * We only modify the path for single selectors (ie, no multiples),
                     * without a full parser it makes it difficult to do this correctly.
                     */
                    var isDocumentRoot = root.nodeType === 9,
                        _path = path,
                        _root = root;

                    if (!isDocumentRoot && path.indexOf(',') === -1 && !startIdRe.test(path)) {
                        _path = '#' + Ext.id(root) + ' ' + path;
                        _root = root.parentNode;
                    }
                    return Ext.Array.toArray(_root.querySelectorAll(_path));
                }
                catch (e) {
                }
            }
            return Ext.DomQuery.jsSelect.call(this, path, root, type);
        } : function(path, root, type) {
            return Ext.DomQuery.jsSelect.call(this, path, root, type);
        },

        /**
         * Selects a single element.
         * @param {String} selector The selector/xpath query
         * @param {HTMLElement} root (optional) The start of the query (defaults to document).
         * @return {HTMLElement} The DOM element which matched the selector.
         */
        selectNode : function(path, root){
            return Ext.DomQuery.select(path, root)[0];
        },

        /**
         * Selects the value of a node, optionally replacing null with the defaultValue.
         * @param {String} selector The selector/xpath query
         * @param {HTMLElement} root (optional) The start of the query (defaults to document).
         * @param {String} defaultValue (optional) When specified, this is return as empty value.
         * @return {String}
         */
        selectValue : function(path, root, defaultValue){
            path = path.replace(trimRe, "");
            if(!valueCache[path]){
                valueCache[path] = Ext.DomQuery.compile(path, "select");
            }
            var n = valueCache[path](root), v;
            n = n[0] ? n[0] : n;

            // overcome a limitation of maximum textnode size
            // Rumored to potentially crash IE6 but has not been confirmed.
            // http://reference.sitepoint.com/javascript/Node/normalize
            // https://developer.mozilla.org/En/DOM/Node.normalize
            if (typeof n.normalize == 'function') n.normalize();

            v = (n && n.firstChild ? n.firstChild.nodeValue : null);
            return ((v === null||v === undefined||v==='') ? defaultValue : v);
        },

        /**
         * Selects the value of a node, parsing integers and floats. Returns the defaultValue, or 0 if none is specified.
         * @param {String} selector The selector/xpath query
         * @param {HTMLElement} root (optional) The start of the query (defaults to document).
         * @param {Number} defaultValue (optional) When specified, this is return as empty value.
         * @return {Number}
         */
        selectNumber : function(path, root, defaultValue){
            var v = Ext.DomQuery.selectValue(path, root, defaultValue || 0);
            return parseFloat(v);
        },

        /**
         * Returns true if the passed element(s) match the passed simple selector (e.g. div.some-class or span:first-child)
         * @param {String/HTMLElement/HTMLElement[]} el An element id, element or array of elements
         * @param {String} selector The simple selector to test
         * @return {Boolean}
         */
        is : function(el, ss){
            if(typeof el == "string"){
                el = document.getElementById(el);
            }
            var isArray = Ext.isArray(el),
                result = Ext.DomQuery.filter(isArray ? el : [el], ss);
            return isArray ? (result.length == el.length) : (result.length > 0);
        },

        /**
         * Filters an array of elements to only include matches of a simple selector (e.g. div.some-class or span:first-child)
         * @param {HTMLElement[]} el An array of elements to filter
         * @param {String} selector The simple selector to test
         * @param {Boolean} nonMatches If true, it returns the elements that DON'T match
         * the selector instead of the ones that match
         * @return {HTMLElement[]} An Array of DOM elements which match the selector. If there are
         * no matches, and empty Array is returned.
         */
        filter : function(els, ss, nonMatches){
            ss = ss.replace(trimRe, "");
            if(!simpleCache[ss]){
                simpleCache[ss] = Ext.DomQuery.compile(ss, "simple");
            }
            var result = simpleCache[ss](els);
            return nonMatches ? quickDiff(result, els) : result;
        },

        /**
         * Collection of matching regular expressions and code snippets.
         * Each capture group within () will be replace the {} in the select
         * statement as specified by their index.
         */
        matchers : [{
                re: /^\.([\w-]+)/,
                select: 'n = byClassName(n, " {1} ");'
            }, {
                re: /^\:([\w-]+)(?:\(((?:[^\s>\/]*|.*?))\))?/,
                select: 'n = byPseudo(n, "{1}", "{2}");'
            },{
                re: /^(?:([\[\{])(?:@)?([\w-]+)\s?(?:(=|.=)\s?['"]?(.*?)["']?)?[\]\}])/,
                select: 'n = byAttribute(n, "{2}", "{4}", "{3}", "{1}");'
            }, {
                re: /^#([\w-]+)/,
                select: 'n = byId(n, "{1}");'
            },{
                re: /^@([\w-]+)/,
                select: 'return {firstChild:{nodeValue:attrValue(n, "{1}")}};'
            }
        ],

        /**
         * Collection of operator comparison functions. The default operators are =, !=, ^=, $=, *=, %=, |= and ~=.
         * New operators can be added as long as the match the format <i>c</i>= where <i>c</i> is any character other than space, &gt; &lt;.
         */
        operators : {
            "=" : function(a, v){
                return a == v;
            },
            "!=" : function(a, v){
                return a != v;
            },
            "^=" : function(a, v){
                return a && a.substr(0, v.length) == v;
            },
            "$=" : function(a, v){
                return a && a.substr(a.length-v.length) == v;
            },
            "*=" : function(a, v){
                return a && a.indexOf(v) !== -1;
            },
            "%=" : function(a, v){
                return (a % v) == 0;
            },
            "|=" : function(a, v){
                return a && (a == v || a.substr(0, v.length+1) == v+'-');
            },
            "~=" : function(a, v){
                return a && (' '+a+' ').indexOf(' '+v+' ') != -1;
            }
        },

        /**
Object hash of "pseudo class" filter functions which are used when filtering selections.
Each function is passed two parameters:

- **c** : Array
    An Array of DOM elements to filter.

- **v** : String
    The argument (if any) supplied in the selector.

A filter function returns an Array of DOM elements which conform to the pseudo class.
In addition to the provided pseudo classes listed above such as `first-child` and `nth-child`,
developers may add additional, custom psuedo class filters to select elements according to application-specific requirements.

For example, to filter `a` elements to only return links to __external__ resources:

    Ext.DomQuery.pseudos.external = function(c, v){
        var r = [], ri = -1;
        for(var i = 0, ci; ci = c[i]; i++){
            // Include in result set only if it's a link to an external resource
            if(ci.hostname != location.hostname){
                r[++ri] = ci;
            }
        }
        return r;
    };

Then external links could be gathered with the following statement:

    var externalLinks = Ext.select("a:external");

        * @markdown
        */
        pseudos : {
            "first-child" : function(c){
                var r = [], ri = -1, n;
                for(var i = 0, ci; ci = n = c[i]; i++){
                    while((n = n.previousSibling) && n.nodeType != 1);
                    if(!n){
                        r[++ri] = ci;
                    }
                }
                return r;
            },

            "last-child" : function(c){
                var r = [], ri = -1, n;
                for(var i = 0, ci; ci = n = c[i]; i++){
                    while((n = n.nextSibling) && n.nodeType != 1);
                    if(!n){
                        r[++ri] = ci;
                    }
                }
                return r;
            },

            "nth-child" : function(c, a) {
                var r = [], ri = -1,
                    m = nthRe.exec(a == "even" && "2n" || a == "odd" && "2n+1" || !nthRe2.test(a) && "n+" + a || a),
                    f = (m[1] || 1) - 0, l = m[2] - 0;
                for(var i = 0, n; n = c[i]; i++){
                    var pn = n.parentNode;
                    if (batch != pn._batch) {
                        var j = 0;
                        for(var cn = pn.firstChild; cn; cn = cn.nextSibling){
                            if(cn.nodeType == 1){
                               cn.nodeIndex = ++j;
                            }
                        }
                        pn._batch = batch;
                    }
                    if (f == 1) {
                        if (l == 0 || n.nodeIndex == l){
                            r[++ri] = n;
                        }
                    } else if ((n.nodeIndex + l) % f == 0){
                        r[++ri] = n;
                    }
                }

                return r;
            },

            "only-child" : function(c){
                var r = [], ri = -1;;
                for(var i = 0, ci; ci = c[i]; i++){
                    if(!prev(ci) && !next(ci)){
                        r[++ri] = ci;
                    }
                }
                return r;
            },

            "empty" : function(c){
                var r = [], ri = -1;
                for(var i = 0, ci; ci = c[i]; i++){
                    var cns = ci.childNodes, j = 0, cn, empty = true;
                    while(cn = cns[j]){
                        ++j;
                        if(cn.nodeType == 1 || cn.nodeType == 3){
                            empty = false;
                            break;
                        }
                    }
                    if(empty){
                        r[++ri] = ci;
                    }
                }
                return r;
            },

            "contains" : function(c, v){
                var r = [], ri = -1;
                for(var i = 0, ci; ci = c[i]; i++){
                    if((ci.textContent||ci.innerText||'').indexOf(v) != -1){
                        r[++ri] = ci;
                    }
                }
                return r;
            },

            "nodeValue" : function(c, v){
                var r = [], ri = -1;
                for(var i = 0, ci; ci = c[i]; i++){
                    if(ci.firstChild && ci.firstChild.nodeValue == v){
                        r[++ri] = ci;
                    }
                }
                return r;
            },

            "checked" : function(c){
                var r = [], ri = -1;
                for(var i = 0, ci; ci = c[i]; i++){
                    if(ci.checked == true){
                        r[++ri] = ci;
                    }
                }
                return r;
            },

            "not" : function(c, ss){
                return Ext.DomQuery.filter(c, ss, true);
            },

            "any" : function(c, selectors){
                var ss = selectors.split('|'),
                    r = [], ri = -1, s;
                for(var i = 0, ci; ci = c[i]; i++){
                    for(var j = 0; s = ss[j]; j++){
                        if(Ext.DomQuery.is(ci, s)){
                            r[++ri] = ci;
                            break;
                        }
                    }
                }
                return r;
            },

            "odd" : function(c){
                return this["nth-child"](c, "odd");
            },

            "even" : function(c){
                return this["nth-child"](c, "even");
            },

            "nth" : function(c, a){
                return c[a-1] || [];
            },

            "first" : function(c){
                return c[0] || [];
            },

            "last" : function(c){
                return c[c.length-1] || [];
            },

            "has" : function(c, ss){
                var s = Ext.DomQuery.select,
                    r = [], ri = -1;
                for(var i = 0, ci; ci = c[i]; i++){
                    if(s(ss, ci).length > 0){
                        r[++ri] = ci;
                    }
                }
                return r;
            },

            "next" : function(c, ss){
                var is = Ext.DomQuery.is,
                    r = [], ri = -1;
                for(var i = 0, ci; ci = c[i]; i++){
                    var n = next(ci);
                    if(n && is(n, ss)){
                        r[++ri] = ci;
                    }
                }
                return r;
            },

            "prev" : function(c, ss){
                var is = Ext.DomQuery.is,
                    r = [], ri = -1;
                for(var i = 0, ci; ci = c[i]; i++){
                    var n = prev(ci);
                    if(n && is(n, ss)){
                        r[++ri] = ci;
                    }
                }
                return r;
            }
        }
    };
}();

/**
 * Shorthand of {@link Ext.DomQuery#select}
 * @member Ext
 * @method query
 * @alias Ext.DomQuery#select
 */
Ext.query = Ext.DomQuery.select;

/**
 * @class Ext.Element
 * @alternateClassName Ext.core.Element
 *
 * Encapsulates a DOM element, adding simple DOM manipulation facilities, normalizing for browser differences.
 *
 * All instances of this class inherit the methods of {@link Ext.fx.Anim} making visual effects easily available to all
 * DOM elements.
 *
 * Note that the events documented in this class are not Ext events, they encapsulate browser events. Some older browsers
 * may not support the full range of events. Which events are supported is beyond the control of Ext JS.
 *
 * Usage:
 *
 *     // by id
 *     var el = Ext.get("my-div");
 *
 *     // by DOM element reference
 *     var el = Ext.get(myDivElement);
 *
 * # Animations
 *
 * When an element is manipulated, by default there is no animation.
 *
 *     var el = Ext.get("my-div");
 *
 *     // no animation
 *     el.setWidth(100);
 *
 * Many of the functions for manipulating an element have an optional "animate" parameter. This parameter can be
 * specified as boolean (true) for default animation effects.
 *
 *     // default animation
 *     el.setWidth(100, true);
 *
 * To configure the effects, an object literal with animation options to use as the Element animation configuration
 * object can also be specified. Note that the supported Element animation configuration options are a subset of the
 * {@link Ext.fx.Anim} animation options specific to Fx effects. The supported Element animation configuration options
 * are:
 *
 *     Option    Default   Description
 *     --------- --------  ---------------------------------------------
 *     {@link Ext.fx.Anim#duration duration}  .35       The duration of the animation in seconds
 *     {@link Ext.fx.Anim#easing easing}    easeOut   The easing method
 *     {@link Ext.fx.Anim#callback callback}  none      A function to execute when the anim completes
 *     {@link Ext.fx.Anim#scope scope}     this      The scope (this) of the callback function
 *
 * Usage:
 *
 *     // Element animation options object
 *     var opt = {
 *         {@link Ext.fx.Anim#duration duration}: 1,
 *         {@link Ext.fx.Anim#easing easing}: 'elasticIn',
 *         {@link Ext.fx.Anim#callback callback}: this.foo,
 *         {@link Ext.fx.Anim#scope scope}: this
 *     };
 *     // animation with some options set
 *     el.setWidth(100, opt);
 *
 * The Element animation object being used for the animation will be set on the options object as "anim", which allows
 * you to stop or manipulate the animation. Here is an example:
 *
 *     // using the "anim" property to get the Anim object
 *     if(opt.anim.isAnimated()){
 *         opt.anim.stop();
 *     }
 *
 * # Composite (Collections of) Elements
 *
 * For working with collections of Elements, see {@link Ext.CompositeElement}
 *
 * @constructor
 * Creates new Element directly.
 * @param {String/HTMLElement} element
 * @param {Boolean} forceNew (optional) By default the constructor checks to see if there is already an instance of this
 * element in the cache and if there is it returns the same instance. This will skip that check (useful for extending
 * this class).
 * @return {Object}
 */
 (function() {
    var DOC = document,
        EC = Ext.cache;

    Ext.Element = Ext.core.Element = function(element, forceNew) {
        var dom = typeof element == "string" ? DOC.getElementById(element) : element,
        id;

        if (!dom) {
            return null;
        }

        id = dom.id;

        if (!forceNew && id && EC[id]) {
            // element object already exists
            return EC[id].el;
        }

        /**
         * @property {HTMLElement} dom
         * The DOM element
         */
        this.dom = dom;

        /**
         * @property {String} id
         * The DOM element ID
         */
        this.id = id || Ext.id(dom);
    };

    var DH = Ext.DomHelper,
    El = Ext.Element;


    El.prototype = {
        /**
         * Sets the passed attributes as attributes of this element (a style attribute can be a string, object or function)
         * @param {Object} o The object with the attributes
         * @param {Boolean} useSet (optional) false to override the default setAttribute to use expandos.
         * @return {Ext.Element} this
         */
        set: function(o, useSet) {
            var el = this.dom,
                attr,
                val;
            useSet = (useSet !== false) && !!el.setAttribute;

            for (attr in o) {
                if (o.hasOwnProperty(attr)) {
                    val = o[attr];
                    if (attr == 'style') {
                        DH.applyStyles(el, val);
                    } else if (attr == 'cls') {
                        el.className = val;
                    } else if (useSet) {
                        el.setAttribute(attr, val);
                    } else {
                        el[attr] = val;
                    }
                }
            }
            return this;
        },

        //  Mouse events
        /**
         * @event click
         * Fires when a mouse click is detected within the element.
         * @param {Ext.EventObject} e The {@link Ext.EventObject} encapsulating the DOM event.
         * @param {HTMLElement} t The target of the event.
         */
        /**
         * @event contextmenu
         * Fires when a right click is detected within the element.
         * @param {Ext.EventObject} e The {@link Ext.EventObject} encapsulating the DOM event.
         * @param {HTMLElement} t The target of the event.
         */
        /**
         * @event dblclick
         * Fires when a mouse double click is detected within the element.
         * @param {Ext.EventObject} e The {@link Ext.EventObject} encapsulating the DOM event.
         * @param {HTMLElement} t The target of the event.
         */
        /**
         * @event mousedown
         * Fires when a mousedown is detected within the element.
         * @param {Ext.EventObject} e The {@link Ext.EventObject} encapsulating the DOM event.
         * @param {HTMLElement} t The target of the event.
         */
        /**
         * @event mouseup
         * Fires when a mouseup is detected within the element.
         * @param {Ext.EventObject} e The {@link Ext.EventObject} encapsulating the DOM event.
         * @param {HTMLElement} t The target of the event.
         */
        /**
         * @event mouseover
         * Fires when a mouseover is detected within the element.
         * @param {Ext.EventObject} e The {@link Ext.EventObject} encapsulating the DOM event.
         * @param {HTMLElement} t The target of the event.
         */
        /**
         * @event mousemove
         * Fires when a mousemove is detected with the element.
         * @param {Ext.EventObject} e The {@link Ext.EventObject} encapsulating the DOM event.
         * @param {HTMLElement} t The target of the event.
         */
        /**
         * @event mouseout
         * Fires when a mouseout is detected with the element.
         * @param {Ext.EventObject} e The {@link Ext.EventObject} encapsulating the DOM event.
         * @param {HTMLElement} t The target of the event.
         */
        /**
         * @event mouseenter
         * Fires when the mouse enters the element.
         * @param {Ext.EventObject} e The {@link Ext.EventObject} encapsulating the DOM event.
         * @param {HTMLElement} t The target of the event.
         */
        /**
         * @event mouseleave
         * Fires when the mouse leaves the element.
         * @param {Ext.EventObject} e The {@link Ext.EventObject} encapsulating the DOM event.
         * @param {HTMLElement} t The target of the event.
         */

        //  Keyboard events
        /**
         * @event keypress
         * Fires when a keypress is detected within the element.
         * @param {Ext.EventObject} e The {@link Ext.EventObject} encapsulating the DOM event.
         * @param {HTMLElement} t The target of the event.
         */
        /**
         * @event keydown
         * Fires when a keydown is detected within the element.
         * @param {Ext.EventObject} e The {@link Ext.EventObject} encapsulating the DOM event.
         * @param {HTMLElement} t The target of the event.
         */
        /**
         * @event keyup
         * Fires when a keyup is detected within the element.
         * @param {Ext.EventObject} e The {@link Ext.EventObject} encapsulating the DOM event.
         * @param {HTMLElement} t The target of the event.
         */


        //  HTML frame/object events
        /**
         * @event load
         * Fires when the user agent finishes loading all content within the element. Only supported by window, frames,
         * objects and images.
         * @param {Ext.EventObject} e The {@link Ext.EventObject} encapsulating the DOM event.
         * @param {HTMLElement} t The target of the event.
         */
        /**
         * @event unload
         * Fires when the user agent removes all content from a window or frame. For elements, it fires when the target
         * element or any of its content has been removed.
         * @param {Ext.EventObject} e The {@link Ext.EventObject} encapsulating the DOM event.
         * @param {HTMLElement} t The target of the event.
         */
        /**
         * @event abort
         * Fires when an object/image is stopped from loading before completely loaded.
         * @param {Ext.EventObject} e The {@link Ext.EventObject} encapsulating the DOM event.
         * @param {HTMLElement} t The target of the event.
         */
        /**
         * @event error
         * Fires when an object/image/frame cannot be loaded properly.
         * @param {Ext.EventObject} e The {@link Ext.EventObject} encapsulating the DOM event.
         * @param {HTMLElement} t The target of the event.
         */
        /**
         * @event resize
         * Fires when a document view is resized.
         * @param {Ext.EventObject} e The {@link Ext.EventObject} encapsulating the DOM event.
         * @param {HTMLElement} t The target of the event.
         */
        /**
         * @event scroll
         * Fires when a document view is scrolled.
         * @param {Ext.EventObject} e The {@link Ext.EventObject} encapsulating the DOM event.
         * @param {HTMLElement} t The target of the event.
         */

        //  Form events
        /**
         * @event select
         * Fires when a user selects some text in a text field, including input and textarea.
         * @param {Ext.EventObject} e The {@link Ext.EventObject} encapsulating the DOM event.
         * @param {HTMLElement} t The target of the event.
         */
        /**
         * @event change
         * Fires when a control loses the input focus and its value has been modified since gaining focus.
         * @param {Ext.EventObject} e The {@link Ext.EventObject} encapsulating the DOM event.
         * @param {HTMLElement} t The target of the event.
         */
        /**
         * @event submit
         * Fires when a form is submitted.
         * @param {Ext.EventObject} e The {@link Ext.EventObject} encapsulating the DOM event.
         * @param {HTMLElement} t The target of the event.
         */
        /**
         * @event reset
         * Fires when a form is reset.
         * @param {Ext.EventObject} e The {@link Ext.EventObject} encapsulating the DOM event.
         * @param {HTMLElement} t The target of the event.
         */
        /**
         * @event focus
         * Fires when an element receives focus either via the pointing device or by tab navigation.
         * @param {Ext.EventObject} e The {@link Ext.EventObject} encapsulating the DOM event.
         * @param {HTMLElement} t The target of the event.
         */
        /**
         * @event blur
         * Fires when an element loses focus either via the pointing device or by tabbing navigation.
         * @param {Ext.EventObject} e The {@link Ext.EventObject} encapsulating the DOM event.
         * @param {HTMLElement} t The target of the event.
         */

        //  User Interface events
        /**
         * @event DOMFocusIn
         * Where supported. Similar to HTML focus event, but can be applied to any focusable element.
         * @param {Ext.EventObject} e The {@link Ext.EventObject} encapsulating the DOM event.
         * @param {HTMLElement} t The target of the event.
         */
        /**
         * @event DOMFocusOut
         * Where supported. Similar to HTML blur event, but can be applied to any focusable element.
         * @param {Ext.EventObject} e The {@link Ext.EventObject} encapsulating the DOM event.
         * @param {HTMLElement} t The target of the event.
         */
        /**
         * @event DOMActivate
         * Where supported. Fires when an element is activated, for instance, through a mouse click or a keypress.
         * @param {Ext.EventObject} e The {@link Ext.EventObject} encapsulating the DOM event.
         * @param {HTMLElement} t The target of the event.
         */

        //  DOM Mutation events
        /**
         * @event DOMSubtreeModified
         * Where supported. Fires when the subtree is modified.
         * @param {Ext.EventObject} e The {@link Ext.EventObject} encapsulating the DOM event.
         * @param {HTMLElement} t The target of the event.
         */
        /**
         * @event DOMNodeInserted
         * Where supported. Fires when a node has been added as a child of another node.
         * @param {Ext.EventObject} e The {@link Ext.EventObject} encapsulating the DOM event.
         * @param {HTMLElement} t The target of the event.
         */
        /**
         * @event DOMNodeRemoved
         * Where supported. Fires when a descendant node of the element is removed.
         * @param {Ext.EventObject} e The {@link Ext.EventObject} encapsulating the DOM event.
         * @param {HTMLElement} t The target of the event.
         */
        /**
         * @event DOMNodeRemovedFromDocument
         * Where supported. Fires when a node is being removed from a document.
         * @param {Ext.EventObject} e The {@link Ext.EventObject} encapsulating the DOM event.
         * @param {HTMLElement} t The target of the event.
         */
        /**
         * @event DOMNodeInsertedIntoDocument
         * Where supported. Fires when a node is being inserted into a document.
         * @param {Ext.EventObject} e The {@link Ext.EventObject} encapsulating the DOM event.
         * @param {HTMLElement} t The target of the event.
         */
        /**
         * @event DOMAttrModified
         * Where supported. Fires when an attribute has been modified.
         * @param {Ext.EventObject} e The {@link Ext.EventObject} encapsulating the DOM event.
         * @param {HTMLElement} t The target of the event.
         */
        /**
         * @event DOMCharacterDataModified
         * Where supported. Fires when the character data has been modified.
         * @param {Ext.EventObject} e The {@link Ext.EventObject} encapsulating the DOM event.
         * @param {HTMLElement} t The target of the event.
         */

        /**
         * @property {String} defaultUnit
         * The default unit to append to CSS values where a unit isn't provided.
         */
        defaultUnit: "px",

        /**
         * Returns true if this element matches the passed simple selector (e.g. div.some-class or span:first-child)
         * @param {String} selector The simple selector to test
         * @return {Boolean} True if this element matches the selector, else false
         */
        is: function(simpleSelector) {
            return Ext.DomQuery.is(this.dom, simpleSelector);
        },

        /**
         * Tries to focus the element. Any exceptions are caught and ignored.
         * @param {Number} defer (optional) Milliseconds to defer the focus
         * @return {Ext.Element} this
         */
        focus: function(defer,
                        /* private */
                        dom) {
            var me = this;
            dom = dom || me.dom;
            try {
                if (Number(defer)) {
                    Ext.defer(me.focus, defer, null, [null, dom]);
                } else {
                    dom.focus();
                }
            } catch(e) {}
            return me;
        },

        /**
         * Tries to blur the element. Any exceptions are caught and ignored.
         * @return {Ext.Element} this
         */
        blur: function() {
            try {
                this.dom.blur();
            } catch(e) {}
            return this;
        },

        /**
         * Returns the value of the "value" attribute
         * @param {Boolean} asNumber true to parse the value as a number
         * @return {String/Number}
         */
        getValue: function(asNumber) {
            var val = this.dom.value;
            return asNumber ? parseInt(val, 10) : val;
        },

        /**
         * Appends an event handler to this element.
         *
         * @param {String} eventName The name of event to handle.
         *
         * @param {Function} fn The handler function the event invokes. This function is passed the following parameters:
         *
         * - **evt** : EventObject
         *
         *   The {@link Ext.EventObject EventObject} describing the event.
         *
         * - **el** : HtmlElement
         *
         *   The DOM element which was the target of the event. Note that this may be filtered by using the delegate option.
         *
         * - **o** : Object
         *
         *   The options object from the addListener call.
         *
         * @param {Object} scope (optional) The scope (**this** reference) in which the handler function is executed. **If
         * omitted, defaults to this Element.**
         *
         * @param {Object} options (optional) An object containing handler configuration properties. This may contain any of
         * the following properties:
         *
         * - **scope** Object :
         *
         *   The scope (**this** reference) in which the handler function is executed. **If omitted, defaults to this
         *   Element.**
         *
         * - **delegate** String:
         *
         *   A simple selector to filter the target or look for a descendant of the target. See below for additional details.
         *
         * - **stopEvent** Boolean:
         *
         *   True to stop the event. That is stop propagation, and prevent the default action.
         *
         * - **preventDefault** Boolean:
         *
         *   True to prevent the default action
         *
         * - **stopPropagation** Boolean:
         *
         *   True to prevent event propagation
         *
         * - **normalized** Boolean:
         *
         *   False to pass a browser event to the handler function instead of an Ext.EventObject
         *
         * - **target** Ext.Element:
         *
         *   Only call the handler if the event was fired on the target Element, _not_ if the event was bubbled up from a
         *   child node.
         *
         * - **delay** Number:
         *
         *   The number of milliseconds to delay the invocation of the handler after the event fires.
         *
         * - **single** Boolean:
         *
         *   True to add a handler to handle just the next firing of the event, and then remove itself.
         *
         * - **buffer** Number:
         *
         *   Causes the handler to be scheduled to run in an {@link Ext.util.DelayedTask} delayed by the specified number of
         *   milliseconds. If the event fires again within that time, the original handler is _not_ invoked, but the new
         *   handler is scheduled in its place.
         *
         * **Combining Options**
         *
         * In the following examples, the shorthand form {@link #on} is used rather than the more verbose addListener. The
         * two are equivalent. Using the options argument, it is possible to combine different types of listeners:
         *
         * A delayed, one-time listener that auto stops the event and adds a custom argument (forumId) to the options
         * object. The options object is available as the third parameter in the handler function.
         *
         * Code:
         *
         *     el.on('click', this.onClick, this, {
         *         single: true,
         *         delay: 100,
         *         stopEvent : true,
         *         forumId: 4
         *     });
         *
         * **Attaching multiple handlers in 1 call**
         *
         * The method also allows for a single argument to be passed which is a config object containing properties which
         * specify multiple handlers.
         *
         * Code:
         *
         *     el.on({
         *         'click' : {
         *             fn: this.onClick,
         *             scope: this,
         *             delay: 100
         *         },
         *         'mouseover' : {
         *             fn: this.onMouseOver,
         *             scope: this
         *         },
         *         'mouseout' : {
         *             fn: this.onMouseOut,
         *             scope: this
         *         }
         *     });
         *
         * Or a shorthand syntax:
         *
         * Code:
         *
         *     el.on({
         *         'click' : this.onClick,
         *         'mouseover' : this.onMouseOver,
         *         'mouseout' : this.onMouseOut,
         *         scope: this
         *     });
         *
         * **delegate**
         *
         * This is a configuration option that you can pass along when registering a handler for an event to assist with
         * event delegation. Event delegation is a technique that is used to reduce memory consumption and prevent exposure
         * to memory-leaks. By registering an event for a container element as opposed to each element within a container.
         * By setting this configuration option to a simple selector, the target element will be filtered to look for a
         * descendant of the target. For example:
         *
         *     // using this markup:
         *     <div id='elId'>
         *         <p id='p1'>paragraph one</p>
         *         <p id='p2' class='clickable'>paragraph two</p>
         *         <p id='p3'>paragraph three</p>
         *     </div>
         *
         *     // utilize event delegation to registering just one handler on the container element:
         *     el = Ext.get('elId');
         *     el.on(
         *         'click',
         *         function(e,t) {
         *             // handle click
         *             console.info(t.id); // 'p2'
         *         },
         *         this,
         *         {
         *             // filter the target element to be a descendant with the class 'clickable'
         *             delegate: '.clickable'
         *         }
         *     );
         *
         * @return {Ext.Element} this
         */
        addListener: function(eventName, fn, scope, options) {
            Ext.EventManager.on(this.dom, eventName, fn, scope || this, options);
            return this;
        },

        /**
         * Removes an event handler from this element.
         *
         * **Note**: if a *scope* was explicitly specified when {@link #addListener adding} the listener,
         * the same scope must be specified here.
         *
         * Example:
         *
         *     el.removeListener('click', this.handlerFn);
         *     // or
         *     el.un('click', this.handlerFn);
         *
         * @param {String} eventName The name of the event from which to remove the handler.
         * @param {Function} fn The handler function to remove. **This must be a reference to the function passed into the
         * {@link #addListener} call.**
         * @param {Object} scope If a scope (**this** reference) was specified when the listener was added, then this must
         * refer to the same object.
         * @return {Ext.Element} this
         */
        removeListener: function(eventName, fn, scope) {
            Ext.EventManager.un(this.dom, eventName, fn, scope || this);
            return this;
        },

        /**
         * Removes all previous added listeners from this element
         * @return {Ext.Element} this
         */
        removeAllListeners: function() {
            Ext.EventManager.removeAll(this.dom);
            return this;
        },

        /**
         * Recursively removes all previous added listeners from this element and its children
         * @return {Ext.Element} this
         */
        purgeAllListeners: function() {
            Ext.EventManager.purgeElement(this);
            return this;
        },

        /**
         * Test if size has a unit, otherwise appends the passed unit string, or the default for this Element.
         * @param size {Mixed} The size to set
         * @param units {String} The units to append to a numeric size value
         * @private
         */
        addUnits: function(size, units) {

            // Most common case first: Size is set to a number
            if (Ext.isNumber(size)) {
                return size + (units || this.defaultUnit || 'px');
            }

            // Size set to a value which means "auto"
            if (size === "" || size == "auto" || size == null) {
                return size || '';
            }

            // Otherwise, warn if it's not a valid CSS measurement
            if (!unitPattern.test(size)) {
                //<debug>
                if (Ext.isDefined(Ext.global.console)) {
                    Ext.global.console.warn("Warning, size detected as NaN on Element.addUnits.");
                }
                //</debug>
                return size || '';
            }
            return size;
        },

        /**
         * Tests various css rules/browsers to determine if this element uses a border box
         * @return {Boolean}
         */
        isBorderBox: function() {
            return Ext.isBorderBox || noBoxAdjust[(this.dom.tagName || "").toLowerCase()];
        },

        /**
         * Removes this element's dom reference. Note that event and cache removal is handled at {@link Ext#removeNode
         * Ext.removeNode}
         */
        remove: function() {
            var me = this,
            dom = me.dom;

            if (dom) {
                delete me.dom;
                Ext.removeNode(dom);
            }
        },

        /**
         * Sets up event handlers to call the passed functions when the mouse is moved into and out of the Element.
         * @param {Function} overFn The function to call when the mouse enters the Element.
         * @param {Function} outFn The function to call when the mouse leaves the Element.
         * @param {Object} scope (optional) The scope (`this` reference) in which the functions are executed. Defaults
         * to the Element's DOM element.
         * @param {Object} options (optional) Options for the listener. See {@link Ext.util.Observable#addListener the
         * options parameter}.
         * @return {Ext.Element} this
         */
        hover: function(overFn, outFn, scope, options) {
            var me = this;
            me.on('mouseenter', overFn, scope || me.dom, options);
            me.on('mouseleave', outFn, scope || me.dom, options);
            return me;
        },

        /**
         * Returns true if this element is an ancestor of the passed element
         * @param {HTMLElement/String} el The element to check
         * @return {Boolean} True if this element is an ancestor of el, else false
         */
        contains: function(el) {
            return ! el ? false: Ext.Element.isAncestor(this.dom, el.dom ? el.dom: el);
        },

        /**
         * Returns the value of a namespaced attribute from the element's underlying DOM node.
         * @param {String} namespace The namespace in which to look for the attribute
         * @param {String} name The attribute name
         * @return {String} The attribute value
         */
        getAttributeNS: function(ns, name) {
            return this.getAttribute(name, ns);
        },

        /**
         * Returns the value of an attribute from the element's underlying DOM node.
         * @param {String} name The attribute name
         * @param {String} namespace (optional) The namespace in which to look for the attribute
         * @return {String} The attribute value
         * @method
         */
        getAttribute: (Ext.isIE && !(Ext.isIE9 && document.documentMode === 9)) ?
        function(name, ns) {
            var d = this.dom,
            type;
            if(ns) {
                type = typeof d[ns + ":" + name];
                if (type != 'undefined' && type != 'unknown') {
                    return d[ns + ":" + name] || null;
                }
                return null;
            }
            if (name === "for") {
                name = "htmlFor";
            }
            return d[name] || null;
        }: function(name, ns) {
            var d = this.dom;
            if (ns) {
               return d.getAttributeNS(ns, name) || d.getAttribute(ns + ":" + name);
            }
            return  d.getAttribute(name) || d[name] || null;
        },

        /**
         * Update the innerHTML of this element
         * @param {String} html The new HTML
         * @return {Ext.Element} this
         */
        update: function(html) {
            if (this.dom) {
                this.dom.innerHTML = html;
            }
            return this;
        }
    };

    var ep = El.prototype;

    El.addMethods = function(o) {
        Ext.apply(ep, o);
    };

    /**
     * @method
     * @alias Ext.Element#addListener
     * Shorthand for {@link #addListener}.
     */
    ep.on = ep.addListener;

    /**
     * @method
     * @alias Ext.Element#removeListener
     * Shorthand for {@link #removeListener}.
     */
    ep.un = ep.removeListener;

    /**
     * @method
     * @alias Ext.Element#removeAllListeners
     * Alias for {@link #removeAllListeners}.
     */
    ep.clearListeners = ep.removeAllListeners;

    /**
     * @method destroy
     * @member Ext.Element
     * Removes this element's dom reference. Note that event and cache removal is handled at {@link Ext#removeNode
     * Ext.removeNode}. Alias to {@link #remove}.
     */
    ep.destroy = ep.remove;

    /**
     * @property {Boolean} autoBoxAdjust
     * true to automatically adjust width and height settings for box-model issues (default to true)
     */
    ep.autoBoxAdjust = true;

    // private
    var unitPattern = /\d+(px|em|%|en|ex|pt|in|cm|mm|pc)$/i,
    docEl;

    /**
     * Retrieves Ext.Element objects. {@link Ext#get} is an alias for {@link Ext.Element#get}.
     *
     * **This method does not retrieve {@link Ext.Component Component}s.** This method retrieves Ext.Element
     * objects which encapsulate DOM elements. To retrieve a Component by its ID, use {@link Ext.ComponentManager#get}.
     *
     * Uses simple caching to consistently return the same object. Automatically fixes if an object was recreated with
     * the same id via AJAX or DOM.
     *
     * @param {String/HTMLElement/Ext.Element} el The id of the node, a DOM Node or an existing Element.
     * @return {Ext.Element} The Element object (or null if no matching element was found)
     * @static
     */
    El.get = function(el) {
        var ex,
        elm,
        id;
        if (!el) {
            return null;
        }
        if (typeof el == "string") {
            // element id
            if (! (elm = DOC.getElementById(el))) {
                return null;
            }
            if (EC[el] && EC[el].el) {
                ex = EC[el].el;
                ex.dom = elm;
            } else {
                ex = El.addToCache(new El(elm));
            }
            return ex;
        } else if (el.tagName) {
            // dom element
            if (! (id = el.id)) {
                id = Ext.id(el);
            }
            if (EC[id] && EC[id].el) {
                ex = EC[id].el;
                ex.dom = el;
            } else {
                ex = El.addToCache(new El(el));
            }
            return ex;
        } else if (el instanceof El) {
            if (el != docEl) {
                // refresh dom element in case no longer valid,
                // catch case where it hasn't been appended
                // If an el instance is passed, don't pass to getElementById without some kind of id
                if (Ext.isIE && (el.id == undefined || el.id == '')) {
                    el.dom = el.dom;
                } else {
                    el.dom = DOC.getElementById(el.id) || el.dom;
                }
            }
            return el;
        } else if (el.isComposite) {
            return el;
        } else if (Ext.isArray(el)) {
            return El.select(el);
        } else if (el == DOC) {
            // create a bogus element object representing the document object
            if (!docEl) {
                var f = function() {};
                f.prototype = El.prototype;
                docEl = new f();
                docEl.dom = DOC;
            }
            return docEl;
        }
        return null;
    };

    /**
     * Retrieves Ext.Element objects like {@link Ext#get} but is optimized for sub-elements.
     * This is helpful for performance, because in IE (prior to IE 9), `getElementById` uses
     * an non-optimized search. In those browsers, starting the search for an element with a
     * matching ID at a parent of that element will greatly speed up the process.
     *
     * Unlike {@link Ext#get}, this method only accepts ID's. If the ID is not a child of
     * this element, it will still be found if it exists in the document, but will be slower
     * than calling {@link Ext#get} directly.
     *
     * @param {String} id The id of the element to get.
     * @return {Ext.Element} The Element object (or null if no matching element was found)
     * @member Ext.Element
     * @method getById
     * @markdown
     */
    ep.getById = (!Ext.isIE6 && !Ext.isIE7 && !Ext.isIE8) ? El.get :
        function (id) {
            var dom = this.dom,
                cached, el, ret;

            if (dom) {
                el = dom.all[id];
                if (el) {
                    // calling El.get here is a real hit (2x slower) because it has to
                    // redetermine that we are giving it a dom el.
                    cached = EC[id];
                    if (cached && cached.el) {
                        ret = cached.el;
                        ret.dom = el;
                    } else {
                        ret = El.addToCache(new El(el));
                    }
                    return ret;
                }
            }

            return El.get(id);
        };

    El.addToCache = function(el, id) {
        if (el) {
            id = id || el.id;
            EC[id] = {
                el: el,
                data: {},
                events: {}
            };
        }
        return el;
    };

    // private method for getting and setting element data
    El.data = function(el, key, value) {
        el = El.get(el);
        if (!el) {
            return null;
        }
        var c = EC[el.id].data;
        if (arguments.length == 2) {
            return c[key];
        } else {
            return (c[key] = value);
        }
    };

    // private
    // Garbage collection - uncache elements/purge listeners on orphaned elements
    // so we don't hold a reference and cause the browser to retain them
    function garbageCollect() {
        if (!Ext.enableGarbageCollector) {
            clearInterval(El.collectorThreadId);
        } else {
            var eid,
            el,
            d,
            o;

            for (eid in EC) {
                if (!EC.hasOwnProperty(eid)) {
                    continue;
                }
                o = EC[eid];
                if (o.skipGarbageCollection) {
                    continue;
                }
                el = o.el;
                d = el.dom;
                // -------------------------------------------------------
                // Determining what is garbage:
                // -------------------------------------------------------
                // !d
                // dom node is null, definitely garbage
                // -------------------------------------------------------
                // !d.parentNode
                // no parentNode == direct orphan, definitely garbage
                // -------------------------------------------------------
                // !d.offsetParent && !document.getElementById(eid)
                // display none elements have no offsetParent so we will
                // also try to look it up by it's id. However, check
                // offsetParent first so we don't do unneeded lookups.
                // This enables collection of elements that are not orphans
                // directly, but somewhere up the line they have an orphan
                // parent.
                // -------------------------------------------------------
                if (!d || !d.parentNode || (!d.offsetParent && !DOC.getElementById(eid))) {
                    if (d && Ext.enableListenerCollection) {
                        Ext.EventManager.removeAll(d);
                    }
                    delete EC[eid];
                }
            }
            // Cleanup IE Object leaks
            if (Ext.isIE) {
                var t = {};
                for (eid in EC) {
                    if (!EC.hasOwnProperty(eid)) {
                        continue;
                    }
                    t[eid] = EC[eid];
                }
                EC = Ext.cache = t;
            }
        }
    }
    El.collectorThreadId = setInterval(garbageCollect, 30000);

    var flyFn = function() {};
    flyFn.prototype = El.prototype;

    // dom is optional
    El.Flyweight = function(dom) {
        this.dom = dom;
    };

    El.Flyweight.prototype = new flyFn();
    El.Flyweight.prototype.isFlyweight = true;
    El._flyweights = {};

    /**
     * Gets the globally shared flyweight Element, with the passed node as the active element. Do not store a reference
     * to this element - the dom node can be overwritten by other code. {@link Ext#fly} is alias for
     * {@link Ext.Element#fly}.
     *
     * Use this to make one-time references to DOM elements which are not going to be accessed again either by
     * application code, or by Ext's classes. If accessing an element which will be processed regularly, then {@link
     * Ext#get Ext.get} will be more appropriate to take advantage of the caching provided by the Ext.Element
     * class.
     *
     * @param {String/HTMLElement} el The dom node or id
     * @param {String} named (optional) Allows for creation of named reusable flyweights to prevent conflicts (e.g.
     * internally Ext uses "_global")
     * @return {Ext.Element} The shared Element object (or null if no matching element was found)
     * @static
     */
    El.fly = function(el, named) {
        var ret = null;
        named = named || '_global';
        el = Ext.getDom(el);
        if (el) {
            (El._flyweights[named] = El._flyweights[named] || new El.Flyweight()).dom = el;
            ret = El._flyweights[named];
        }
        return ret;
    };

    /**
     * @member Ext
     * @method get
     * @alias Ext.Element#get
     */
    Ext.get = El.get;

    /**
     * @member Ext
     * @method fly
     * @alias Ext.Element#fly
     */
    Ext.fly = El.fly;

    // speedy lookup for elements never to box adjust
    var noBoxAdjust = Ext.isStrict ? {
        select: 1
    }: {
        input: 1,
        select: 1,
        textarea: 1
    };
    if (Ext.isIE || Ext.isGecko) {
        noBoxAdjust['button'] = 1;
    }
})();

/**
 * @class Ext.Element
 */
Ext.Element.addMethods({
    /**
     * Looks at this node and then at parent nodes for a match of the passed simple selector (e.g. div.some-class or span:first-child)
     * @param {String} selector The simple selector to test
     * @param {Number/String/HTMLElement/Ext.Element} maxDepth (optional)
     * The max depth to search as a number or element (defaults to 50 || document.body)
     * @param {Boolean} returnEl (optional) True to return a Ext.Element object instead of DOM node
     * @return {HTMLElement} The matching DOM node (or null if no match was found)
     */
    findParent : function(simpleSelector, maxDepth, returnEl) {
        var p = this.dom,
            b = document.body,
            depth = 0,
            stopEl;

        maxDepth = maxDepth || 50;
        if (isNaN(maxDepth)) {
            stopEl = Ext.getDom(maxDepth);
            maxDepth = Number.MAX_VALUE;
        }
        while (p && p.nodeType == 1 && depth < maxDepth && p != b && p != stopEl) {
            if (Ext.DomQuery.is(p, simpleSelector)) {
                return returnEl ? Ext.get(p) : p;
            }
            depth++;
            p = p.parentNode;
        }
        return null;
    },

    /**
     * Looks at parent nodes for a match of the passed simple selector (e.g. div.some-class or span:first-child)
     * @param {String} selector The simple selector to test
     * @param {Number/String/HTMLElement/Ext.Element} maxDepth (optional)
     * The max depth to search as a number or element (defaults to 10 || document.body)
     * @param {Boolean} returnEl (optional) True to return a Ext.Element object instead of DOM node
     * @return {HTMLElement} The matching DOM node (or null if no match was found)
     */
    findParentNode : function(simpleSelector, maxDepth, returnEl) {
        var p = Ext.fly(this.dom.parentNode, '_internal');
        return p ? p.findParent(simpleSelector, maxDepth, returnEl) : null;
    },

    /**
     * Walks up the dom looking for a parent node that matches the passed simple selector (e.g. div.some-class or span:first-child).
     * This is a shortcut for findParentNode() that always returns an Ext.Element.
     * @param {String} selector The simple selector to test
     * @param {Number/String/HTMLElement/Ext.Element} maxDepth (optional)
     * The max depth to search as a number or element (defaults to 10 || document.body)
     * @return {Ext.Element} The matching DOM node (or null if no match was found)
     */
    up : function(simpleSelector, maxDepth) {
        return this.findParentNode(simpleSelector, maxDepth, true);
    },

    /**
     * Creates a {@link Ext.CompositeElement} for child nodes based on the passed CSS selector (the selector should not contain an id).
     * @param {String} selector The CSS selector
     * @return {Ext.CompositeElement/Ext.CompositeElement} The composite element
     */
    select : function(selector) {
        return Ext.Element.select(selector, false,  this.dom);
    },

    /**
     * Selects child nodes based on the passed CSS selector (the selector should not contain an id).
     * @param {String} selector The CSS selector
     * @return {HTMLElement[]} An array of the matched nodes
     */
    query : function(selector) {
        return Ext.DomQuery.select(selector, this.dom);
    },

    /**
     * Selects a single child at any depth below this element based on the passed CSS selector (the selector should not contain an id).
     * @param {String} selector The CSS selector
     * @param {Boolean} returnDom (optional) True to return the DOM node instead of Ext.Element (defaults to false)
     * @return {HTMLElement/Ext.Element} The child Ext.Element (or DOM node if returnDom = true)
     */
    down : function(selector, returnDom) {
        var n = Ext.DomQuery.selectNode(selector, this.dom);
        return returnDom ? n : Ext.get(n);
    },

    /**
     * Selects a single *direct* child based on the passed CSS selector (the selector should not contain an id).
     * @param {String} selector The CSS selector
     * @param {Boolean} returnDom (optional) True to return the DOM node instead of Ext.Element (defaults to false)
     * @return {HTMLElement/Ext.Element} The child Ext.Element (or DOM node if returnDom = true)
     */
    child : function(selector, returnDom) {
        var node,
            me = this,
            id;
        id = Ext.get(me).id;
        // Escape . or :
        id = id.replace(/[\.:]/g, "\\$0");
        node = Ext.DomQuery.selectNode('#' + id + " > " + selector, me.dom);
        return returnDom ? node : Ext.get(node);
    },

     /**
     * Gets the parent node for this element, optionally chaining up trying to match a selector
     * @param {String} selector (optional) Find a parent node that matches the passed simple selector
     * @param {Boolean} returnDom (optional) True to return a raw dom node instead of an Ext.Element
     * @return {Ext.Element/HTMLElement} The parent node or null
     */
    parent : function(selector, returnDom) {
        return this.matchNode('parentNode', 'parentNode', selector, returnDom);
    },

     /**
     * Gets the next sibling, skipping text nodes
     * @param {String} selector (optional) Find the next sibling that matches the passed simple selector
     * @param {Boolean} returnDom (optional) True to return a raw dom node instead of an Ext.Element
     * @return {Ext.Element/HTMLElement} The next sibling or null
     */
    next : function(selector, returnDom) {
        return this.matchNode('nextSibling', 'nextSibling', selector, returnDom);
    },

    /**
     * Gets the previous sibling, skipping text nodes
     * @param {String} selector (optional) Find the previous sibling that matches the passed simple selector
     * @param {Boolean} returnDom (optional) True to return a raw dom node instead of an Ext.Element
     * @return {Ext.Element/HTMLElement} The previous sibling or null
     */
    prev : function(selector, returnDom) {
        return this.matchNode('previousSibling', 'previousSibling', selector, returnDom);
    },


    /**
     * Gets the first child, skipping text nodes
     * @param {String} selector (optional) Find the next sibling that matches the passed simple selector
     * @param {Boolean} returnDom (optional) True to return a raw dom node instead of an Ext.Element
     * @return {Ext.Element/HTMLElement} The first child or null
     */
    first : function(selector, returnDom) {
        return this.matchNode('nextSibling', 'firstChild', selector, returnDom);
    },

    /**
     * Gets the last child, skipping text nodes
     * @param {String} selector (optional) Find the previous sibling that matches the passed simple selector
     * @param {Boolean} returnDom (optional) True to return a raw dom node instead of an Ext.Element
     * @return {Ext.Element/HTMLElement} The last child or null
     */
    last : function(selector, returnDom) {
        return this.matchNode('previousSibling', 'lastChild', selector, returnDom);
    },

    matchNode : function(dir, start, selector, returnDom) {
        if (!this.dom) {
            return null;
        }

        var n = this.dom[start];
        while (n) {
            if (n.nodeType == 1 && (!selector || Ext.DomQuery.is(n, selector))) {
                return !returnDom ? Ext.get(n) : n;
            }
            n = n[dir];
        }
        return null;
    }
});

/**
 * @class Ext.Element
 */
Ext.Element.addMethods({
    /**
     * Appends the passed element(s) to this element
     * @param {String/HTMLElement/Ext.Element} el
     * The id of the node, a DOM Node or an existing Element.
     * @return {Ext.Element} this
     */
    appendChild : function(el) {
        return Ext.get(el).appendTo(this);
    },

    /**
     * Appends this element to the passed element
     * @param {String/HTMLElement/Ext.Element} el The new parent element.
     * The id of the node, a DOM Node or an existing Element.
     * @return {Ext.Element} this
     */
    appendTo : function(el) {
        Ext.getDom(el).appendChild(this.dom);
        return this;
    },

    /**
     * Inserts this element before the passed element in the DOM
     * @param {String/HTMLElement/Ext.Element} el The element before which this element will be inserted.
     * The id of the node, a DOM Node or an existing Element.
     * @return {Ext.Element} this
     */
    insertBefore : function(el) {
        el = Ext.getDom(el);
        el.parentNode.insertBefore(this.dom, el);
        return this;
    },

    /**
     * Inserts this element after the passed element in the DOM
     * @param {String/HTMLElement/Ext.Element} el The element to insert after.
     * The id of the node, a DOM Node or an existing Element.
     * @return {Ext.Element} this
     */
    insertAfter : function(el) {
        el = Ext.getDom(el);
        el.parentNode.insertBefore(this.dom, el.nextSibling);
        return this;
    },

    /**
     * Inserts (or creates) an element (or DomHelper config) as the first child of this element
     * @param {String/HTMLElement/Ext.Element/Object} el The id or element to insert or a DomHelper config
     * to create and insert
     * @return {Ext.Element} The new child
     */
    insertFirst : function(el, returnDom) {
        el = el || {};
        if (el.nodeType || el.dom || typeof el == 'string') { // element
            el = Ext.getDom(el);
            this.dom.insertBefore(el, this.dom.firstChild);
            return !returnDom ? Ext.get(el) : el;
        }
        else { // dh config
            return this.createChild(el, this.dom.firstChild, returnDom);
        }
    },

    /**
     * Inserts (or creates) the passed element (or DomHelper config) as a sibling of this element
     * @param {String/HTMLElement/Ext.Element/Object/Array} el The id, element to insert or a DomHelper config
     * to create and insert *or* an array of any of those.
     * @param {String} where (optional) 'before' or 'after' defaults to before
     * @param {Boolean} returnDom (optional) True to return the .;ll;l,raw DOM element instead of Ext.Element
     * @return {Ext.Element} The inserted Element. If an array is passed, the last inserted element is returned.
     */
    insertSibling: function(el, where, returnDom){
        var me = this, rt,
        isAfter = (where || 'before').toLowerCase() == 'after',
        insertEl;

        if(Ext.isArray(el)){
            insertEl = me;
            Ext.each(el, function(e) {
                rt = Ext.fly(insertEl, '_internal').insertSibling(e, where, returnDom);
                if(isAfter){
                    insertEl = rt;
                }
            });
            return rt;
        }

        el = el || {};

        if(el.nodeType || el.dom){
            rt = me.dom.parentNode.insertBefore(Ext.getDom(el), isAfter ? me.dom.nextSibling : me.dom);
            if (!returnDom) {
                rt = Ext.get(rt);
            }
        }else{
            if (isAfter && !me.dom.nextSibling) {
                rt = Ext.DomHelper.append(me.dom.parentNode, el, !returnDom);
            } else {
                rt = Ext.DomHelper[isAfter ? 'insertAfter' : 'insertBefore'](me.dom, el, !returnDom);
            }
        }
        return rt;
    },

    /**
     * Replaces the passed element with this element
     * @param {String/HTMLElement/Ext.Element} el The element to replace.
     * The id of the node, a DOM Node or an existing Element.
     * @return {Ext.Element} this
     */
    replace : function(el) {
        el = Ext.get(el);
        this.insertBefore(el);
        el.remove();
        return this;
    },
    
    /**
     * Replaces this element with the passed element
     * @param {String/HTMLElement/Ext.Element/Object} el The new element (id of the node, a DOM Node
     * or an existing Element) or a DomHelper config of an element to create
     * @return {Ext.Element} this
     */
    replaceWith: function(el){
        var me = this;
            
        if(el.nodeType || el.dom || typeof el == 'string'){
            el = Ext.get(el);
            me.dom.parentNode.insertBefore(el, me.dom);
        }else{
            el = Ext.DomHelper.insertBefore(me.dom, el);
        }
        
        delete Ext.cache[me.id];
        Ext.removeNode(me.dom);      
        me.id = Ext.id(me.dom = el);
        Ext.Element.addToCache(me.isFlyweight ? new Ext.Element(me.dom) : me);     
        return me;
    },
    
    /**
     * Creates the passed DomHelper config and appends it to this element or optionally inserts it before the passed child element.
     * @param {Object} config DomHelper element config object.  If no tag is specified (e.g., {tag:'input'}) then a div will be
     * automatically generated with the specified attributes.
     * @param {HTMLElement} insertBefore (optional) a child element of this element
     * @param {Boolean} returnDom (optional) true to return the dom node instead of creating an Element
     * @return {Ext.Element} The new child element
     */
    createChild : function(config, insertBefore, returnDom) {
        config = config || {tag:'div'};
        if (insertBefore) {
            return Ext.DomHelper.insertBefore(insertBefore, config, returnDom !== true);
        }
        else {
            return Ext.DomHelper[!this.dom.firstChild ? 'insertFirst' : 'append'](this.dom, config,  returnDom !== true);
        }
    },

    /**
     * Creates and wraps this element with another element
     * @param {Object} config (optional) DomHelper element config object for the wrapper element or null for an empty div
     * @param {Boolean} returnDom (optional) True to return the raw DOM element instead of Ext.Element
     * @return {HTMLElement/Ext.Element} The newly created wrapper element
     */
    wrap : function(config, returnDom) {
        var newEl = Ext.DomHelper.insertBefore(this.dom, config || {tag: "div"}, !returnDom),
            d = newEl.dom || newEl;

        d.appendChild(this.dom);
        return newEl;
    },

    /**
     * Inserts an html fragment into this element
     * @param {String} where Where to insert the html in relation to this element - beforeBegin, afterBegin, beforeEnd, afterEnd.
     * See {@link Ext.DomHelper#insertHtml} for details.
     * @param {String} html The HTML fragment
     * @param {Boolean} returnEl (optional) True to return an Ext.Element (defaults to false)
     * @return {HTMLElement/Ext.Element} The inserted node (or nearest related if more than 1 inserted)
     */
    insertHtml : function(where, html, returnEl) {
        var el = Ext.DomHelper.insertHtml(where, this.dom, html);
        return returnEl ? Ext.get(el) : el;
    }
});

/**
 * @class Ext.Element
 */
(function(){
    // local style camelizing for speed
    var ELEMENT = Ext.Element,
        supports = Ext.supports,
        view = document.defaultView,
        opacityRe = /alpha\(opacity=(.*)\)/i,
        trimRe = /^\s+|\s+$/g,
        spacesRe = /\s+/,
        wordsRe = /\w/g,
        adjustDirect2DTableRe = /table-row|table-.*-group/,
        INTERNAL = '_internal',
        PADDING = 'padding',
        MARGIN = 'margin',
        BORDER = 'border',
        LEFT = '-left',
        RIGHT = '-right',
        TOP = '-top',
        BOTTOM = '-bottom',
        WIDTH = '-width',
        MATH = Math,
        HIDDEN = 'hidden',
        ISCLIPPED = 'isClipped',
        OVERFLOW = 'overflow',
        OVERFLOWX = 'overflow-x',
        OVERFLOWY = 'overflow-y',
        ORIGINALCLIP = 'originalClip',
        // special markup used throughout Ext when box wrapping elements
        borders = {l: BORDER + LEFT + WIDTH, r: BORDER + RIGHT + WIDTH, t: BORDER + TOP + WIDTH, b: BORDER + BOTTOM + WIDTH},
        paddings = {l: PADDING + LEFT, r: PADDING + RIGHT, t: PADDING + TOP, b: PADDING + BOTTOM},
        margins = {l: MARGIN + LEFT, r: MARGIN + RIGHT, t: MARGIN + TOP, b: MARGIN + BOTTOM},
        data = ELEMENT.data;

    ELEMENT.boxMarkup = '<div class="{0}-tl"><div class="{0}-tr"><div class="{0}-tc"></div></div></div><div class="{0}-ml"><div class="{0}-mr"><div class="{0}-mc"></div></div></div><div class="{0}-bl"><div class="{0}-br"><div class="{0}-bc"></div></div></div>';

    // These property values are read from the parentNode if they cannot be read
    // from the child:
    ELEMENT.inheritedProps = {
        fontSize: 1,
        fontStyle: 1,
        opacity: 1
    };

    Ext.override(ELEMENT, {

        /**
         * TODO: Look at this
         */
        // private  ==> used by Fx
        adjustWidth : function(width) {
            var me = this,
                isNum = (typeof width == 'number');

            if(isNum && me.autoBoxAdjust && !me.isBorderBox()){
               width -= (me.getBorderWidth("lr") + me.getPadding("lr"));
            }
            return (isNum && width < 0) ? 0 : width;
        },

        // private   ==> used by Fx
        adjustHeight : function(height) {
            var me = this,
                isNum = (typeof height == "number");

            if(isNum && me.autoBoxAdjust && !me.isBorderBox()){
               height -= (me.getBorderWidth("tb") + me.getPadding("tb"));
            }
            return (isNum && height < 0) ? 0 : height;
        },


        /**
         * Adds one or more CSS classes to the element. Duplicate classes are automatically filtered out.
         * @param {String/String[]} className The CSS classes to add separated by space, or an array of classes
         * @return {Ext.Element} this
         */
        addCls : function(className){
            var me = this,
                cls = [],
                space = ((me.dom.className.replace(trimRe, '') == '') ? "" : " "),
                i, len, v;
            if (className === undefined) {
                return me;
            }
            // Separate case is for speed
            if (Object.prototype.toString.call(className) !== '[object Array]') {
                if (typeof className === 'string') {
                    className = className.replace(trimRe, '').split(spacesRe);
                    if (className.length === 1) {
                        className = className[0];
                        if (!me.hasCls(className)) {
                            me.dom.className += space + className;
                        }
                    } else {
                        this.addCls(className);
                    }
                }
            } else {
                for (i = 0, len = className.length; i < len; i++) {
                    v = className[i];
                    if (typeof v == 'string' && (' ' + me.dom.className + ' ').indexOf(' ' + v + ' ') == -1) {
                        cls.push(v);
                    }
                }
                if (cls.length) {
                    me.dom.className += space + cls.join(" ");
                }
            }
            return me;
        },

        /**
         * Removes one or more CSS classes from the element.
         * @param {String/String[]} className The CSS classes to remove separated by space, or an array of classes
         * @return {Ext.Element} this
         */
        removeCls : function(className){
            var me = this,
                i, idx, len, cls, elClasses;
            if (className === undefined) {
                return me;
            }
            if (Object.prototype.toString.call(className) !== '[object Array]') {
                className = className.replace(trimRe, '').split(spacesRe);
            }
            if (me.dom && me.dom.className) {
                elClasses = me.dom.className.replace(trimRe, '').split(spacesRe);
                for (i = 0, len = className.length; i < len; i++) {
                    cls = className[i];
                    if (typeof cls == 'string') {
                        cls = cls.replace(trimRe, '');
                        idx = Ext.Array.indexOf(elClasses, cls);
                        if (idx != -1) {
                            Ext.Array.erase(elClasses, idx, 1);
                        }
                    }
                }
                me.dom.className = elClasses.join(" ");
            }
            return me;
        },

        /**
         * Adds one or more CSS classes to this element and removes the same class(es) from all siblings.
         * @param {String/String[]} className The CSS class to add, or an array of classes
         * @return {Ext.Element} this
         */
        radioCls : function(className){
            var cn = this.dom.parentNode.childNodes,
                v, i, len;
            className = Ext.isArray(className) ? className : [className];
            for (i = 0, len = cn.length; i < len; i++) {
                v = cn[i];
                if (v && v.nodeType == 1) {
                    Ext.fly(v, '_internal').removeCls(className);
                }
            }
            return this.addCls(className);
        },

        /**
         * Toggles the specified CSS class on this element (removes it if it already exists, otherwise adds it).
         * @param {String} className The CSS class to toggle
         * @return {Ext.Element} this
         * @method
         */
        toggleCls : Ext.supports.ClassList ?
            function(className) {
                this.dom.classList.toggle(Ext.String.trim(className));
                return this;
            } :
            function(className) {
                return this.hasCls(className) ? this.removeCls(className) : this.addCls(className);
            },

        /**
         * Checks if the specified CSS class exists on this element's DOM node.
         * @param {String} className The CSS class to check for
         * @return {Boolean} True if the class exists, else false
         * @method
         */
        hasCls : Ext.supports.ClassList ?
            function(className) {
                if (!className) {
                    return false;
                }
                className = className.split(spacesRe);
                var ln = className.length,
                    i = 0;
                for (; i < ln; i++) {
                    if (className[i] && this.dom.classList.contains(className[i])) {
                        return true;
                    }
                }
                return false;
            } :
            function(className){
                return className && (' ' + this.dom.className + ' ').indexOf(' ' + className + ' ') != -1;
            },

        /**
         * Replaces a CSS class on the element with another.  If the old name does not exist, the new name will simply be added.
         * @param {String} oldClassName The CSS class to replace
         * @param {String} newClassName The replacement CSS class
         * @return {Ext.Element} this
         */
        replaceCls : function(oldClassName, newClassName){
            return this.removeCls(oldClassName).addCls(newClassName);
        },

        isStyle : function(style, val) {
            return this.getStyle(style) == val;
        },

        /**
         * Normalizes currentStyle and computedStyle.
         * @param {String} property The style property whose value is returned.
         * @return {String} The current value of the style property for this element.
         * @method
         */
        getStyle : function() {
            return view && view.getComputedStyle ?
                function(prop){
                    var el = this.dom,
                        v, cs, out, display, cleaner;

                    if(el == document){
                        return null;
                    }
                    prop = ELEMENT.normalize(prop);
                    out = (v = el.style[prop]) ? v :
                           (cs = view.getComputedStyle(el, "")) ? cs[prop] : null;

                    // Ignore cases when the margin is correctly reported as 0, the bug only shows
                    // numbers larger.
                    if(prop == 'marginRight' && out != '0px' && !supports.RightMargin){
                        cleaner = ELEMENT.getRightMarginFixCleaner(el);
                        display = this.getStyle('display');
                        el.style.display = 'inline-block';
                        out = view.getComputedStyle(el, '').marginRight;
                        el.style.display = display;
                        cleaner();
                    }

                    if(prop == 'backgroundColor' && out == 'rgba(0, 0, 0, 0)' && !supports.TransparentColor){
                        out = 'transparent';
                    }
                    return out;
                } :
                function (prop) {
                    var el = this.dom,
                        m, cs;

                    if (el == document) {
                        return null;
                    }
                    prop = ELEMENT.normalize(prop);

                    do {
                        if (prop == 'opacity') {
                            if (el.style.filter.match) {
                                m = el.style.filter.match(opacityRe);
                                if(m){
                                    var fv = parseFloat(m[1]);
                                    if(!isNaN(fv)){
                                        return fv ? fv / 100 : 0;
                                    }
                                }
                            }
                            return 1;
                        }

                        // the try statement does have a cost, so we avoid it unless we are
                        // on IE6
                        if (!Ext.isIE6) {
                            return el.style[prop] || ((cs = el.currentStyle) ? cs[prop] : null);
                        }

                        try {
                            return el.style[prop] || ((cs = el.currentStyle) ? cs[prop] : null);
                        } catch (e) {
                            // in some cases, IE6 will throw Invalid Argument for properties
                            // like fontSize (see in /examples/tabs/tabs.html).
                        }

                        if (!ELEMENT.inheritedProps[prop]) {
                            break;
                        }

                        el = el.parentNode;
                        // this is _not_ perfect, but we can only hope that the style we
                        // need is inherited from a parentNode. If not and since IE won't
                        // give us the info we need, we are never going to be 100% right.
                    } while (el);

                    //<debug>
                    Ext.log({
                        level: 'warn',
                        msg: 'Failed to get ' + this.dom.id + '.currentStyle.' + prop
                    });
                    //</debug>
                    return null;
                }
        }(),

        /**
         * Return the CSS color for the specified CSS attribute. rgb, 3 digit (like #fff) and valid values
         * are convert to standard 6 digit hex color.
         * @param {String} attr The css attribute
         * @param {String} defaultValue The default value to use when a valid color isn't found
         * @param {String} prefix (optional) defaults to #. Use an empty string when working with
         * color anims.
         */
        getColor : function(attr, defaultValue, prefix){
            var v = this.getStyle(attr),
                color = prefix || prefix === '' ? prefix : '#',
                h;

            if(!v || (/transparent|inherit/.test(v))) {
                return defaultValue;
            }
            if(/^r/.test(v)){
                Ext.each(v.slice(4, v.length -1).split(','), function(s){
                    h = parseInt(s, 10);
                    color += (h < 16 ? '0' : '') + h.toString(16);
                });
            }else{
                v = v.replace('#', '');
                color += v.length == 3 ? v.replace(/^(\w)(\w)(\w)$/, '$1$1$2$2$3$3') : v;
            }
            return(color.length > 5 ? color.toLowerCase() : defaultValue);
        },

        /**
         * Wrapper for setting style properties, also takes single object parameter of multiple styles.
         * @param {String/Object} property The style property to be set, or an object of multiple styles.
         * @param {String} value (optional) The value to apply to the given property, or null if an object was passed.
         * @return {Ext.Element} this
         */
        setStyle : function(prop, value){
            var me = this,
                tmp, style;

            if (!me.dom) {
                return me;
            }
            if (typeof prop === 'string') {
                tmp = {};
                tmp[prop] = value;
                prop = tmp;
            }
            for (style in prop) {
                if (prop.hasOwnProperty(style)) {
                    value = Ext.value(prop[style], '');
                    if (style == 'opacity') {
                        me.setOpacity(value);
                    }
                    else {
                        me.dom.style[ELEMENT.normalize(style)] = value;
                    }
                }
            }
            return me;
        },

        /**
         * Set the opacity of the element
         * @param {Number} opacity The new opacity. 0 = transparent, .5 = 50% visibile, 1 = fully visible, etc
         * @param {Boolean/Object} animate (optional) a standard Element animation config object or <tt>true</tt> for
         * the default animation (<tt>{duration: .35, easing: 'easeIn'}</tt>)
         * @return {Ext.Element} this
         */
        setOpacity: function(opacity, animate) {
            var me = this,
                dom = me.dom,
                val,
                style;

            if (!me.dom) {
                return me;
            }

            style = me.dom.style;

            if (!animate || !me.anim) {
                if (!Ext.supports.Opacity) {
                    opacity = opacity < 1 ? 'alpha(opacity=' + opacity * 100 + ')': '';
                    val = style.filter.replace(opacityRe, '').replace(trimRe, '');

                    style.zoom = 1;
                    style.filter = val + (val.length > 0 ? ' ': '') + opacity;
                }
                else {
                    style.opacity = opacity;
                }
            }
            else {
                if (!Ext.isObject(animate)) {
                    animate = {
                        duration: 350,
                        easing: 'ease-in'
                    };
                }
                me.animate(Ext.applyIf({
                    to: {
                        opacity: opacity
                    }
                },
                animate));
            }
            return me;
        },


        /**
         * Clears any opacity settings from this element. Required in some cases for IE.
         * @return {Ext.Element} this
         */
        clearOpacity : function(){
            var style = this.dom.style;
            if(!Ext.supports.Opacity){
                if(!Ext.isEmpty(style.filter)){
                    style.filter = style.filter.replace(opacityRe, '').replace(trimRe, '');
                }
            }else{
                style.opacity = style['-moz-opacity'] = style['-khtml-opacity'] = '';
            }
            return this;
        },

        /**
         * @private
         * Returns 1 if the browser returns the subpixel dimension rounded to the lowest pixel.
         * @return {Number} 0 or 1
         */
        adjustDirect2DDimension: function(dimension) {
            var me = this,
                dom = me.dom,
                display = me.getStyle('display'),
                inlineDisplay = dom.style['display'],
                inlinePosition = dom.style['position'],
                originIndex = dimension === 'width' ? 0 : 1,
                floating;

            if (display === 'inline') {
                dom.style['display'] = 'inline-block';
            }

            dom.style['position'] = display.match(adjustDirect2DTableRe) ? 'absolute' : 'static';

            // floating will contain digits that appears after the decimal point
            // if height or width are set to auto we fallback to msTransformOrigin calculation
            floating = (parseFloat(me.getStyle(dimension)) || parseFloat(dom.currentStyle.msTransformOrigin.split(' ')[originIndex]) * 2) % 1;

            dom.style['position'] = inlinePosition;

            if (display === 'inline') {
                dom.style['display'] = inlineDisplay;
            }

            return floating;
        },

        /**
         * Returns the offset height of the element
         * @param {Boolean} contentHeight (optional) true to get the height minus borders and padding
         * @return {Number} The element's height
         */
        getHeight: function(contentHeight, preciseHeight) {
            var me = this,
                dom = me.dom,
                hidden = Ext.isIE && me.isStyle('display', 'none'),
                height, overflow, style, floating;

            // IE Quirks mode acts more like a max-size measurement unless overflow is hidden during measurement.
            // We will put the overflow back to it's original value when we are done measuring.
            if (Ext.isIEQuirks) {
                style = dom.style;
                overflow = style.overflow;
                me.setStyle({ overflow: 'hidden'});
            }

            height = dom.offsetHeight;

            height = MATH.max(height, hidden ? 0 : dom.clientHeight) || 0;

            // IE9 Direct2D dimension rounding bug
            if (!hidden && Ext.supports.Direct2DBug) {
                floating = me.adjustDirect2DDimension('height');
                if (preciseHeight) {
                    height += floating;
                }
                else if (floating > 0 && floating < 0.5) {
                    height++;
                }
            }

            if (contentHeight) {
                height -= (me.getBorderWidth("tb") + me.getPadding("tb"));
            }

            if (Ext.isIEQuirks) {
                me.setStyle({ overflow: overflow});
            }

            if (height < 0) {
                height = 0;
            }
            return height;
        },

        /**
         * Returns the offset width of the element
         * @param {Boolean} contentWidth (optional) true to get the width minus borders and padding
         * @return {Number} The element's width
         */
        getWidth: function(contentWidth, preciseWidth) {
            var me = this,
                dom = me.dom,
                hidden = Ext.isIE && me.isStyle('display', 'none'),
                rect, width, overflow, style, floating, parentPosition;

            // IE Quirks mode acts more like a max-size measurement unless overflow is hidden during measurement.
            // We will put the overflow back to it's original value when we are done measuring.
            if (Ext.isIEQuirks) {
                style = dom.style;
                overflow = style.overflow;
                me.setStyle({overflow: 'hidden'});
            }

            // Fix Opera 10.5x width calculation issues
            if (Ext.isOpera10_5) {
                if (dom.parentNode.currentStyle.position === 'relative') {
                    parentPosition = dom.parentNode.style.position;
                    dom.parentNode.style.position = 'static';
                    width = dom.offsetWidth;
                    dom.parentNode.style.position = parentPosition;
                }
                width = Math.max(width || 0, dom.offsetWidth);

            // Gecko will in some cases report an offsetWidth that is actually less than the width of the
            // text contents, because it measures fonts with sub-pixel precision but rounds the calculated
            // value down. Using getBoundingClientRect instead of offsetWidth allows us to get the precise
            // subpixel measurements so we can force them to always be rounded up. See
            // https://bugzilla.mozilla.org/show_bug.cgi?id=458617
            } else if (Ext.supports.BoundingClientRect) {
                rect = dom.getBoundingClientRect();
                width = rect.right - rect.left;
                width = preciseWidth ? width : Math.ceil(width);
            } else {
                width = dom.offsetWidth;
            }

            width = MATH.max(width, hidden ? 0 : dom.clientWidth) || 0;

            // IE9 Direct2D dimension rounding bug
            if (!hidden && Ext.supports.Direct2DBug) {
                floating = me.adjustDirect2DDimension('width');
                if (preciseWidth) {
                    width += floating;
                }
                else if (floating > 0 && floating < 0.5) {
                    width++;
                }
            }

            if (contentWidth) {
                width -= (me.getBorderWidth("lr") + me.getPadding("lr"));
            }

            if (Ext.isIEQuirks) {
                me.setStyle({ overflow: overflow});
            }

            if (width < 0) {
                width = 0;
            }
            return width;
        },

        /**
         * Set the width of this Element.
         * @param {Number/String} width The new width. This may be one of:<div class="mdetail-params"><ul>
         * <li>A Number specifying the new width in this Element's {@link #defaultUnit}s (by default, pixels).</li>
         * <li>A String used to set the CSS width style. Animation may <b>not</b> be used.
         * </ul></div>
         * @param {Boolean/Object} animate (optional) true for the default animation or a standard Element animation config object
         * @return {Ext.Element} this
         */
        setWidth : function(width, animate){
            var me = this;
            width = me.adjustWidth(width);
            if (!animate || !me.anim) {
                me.dom.style.width = me.addUnits(width);
            }
            else {
                if (!Ext.isObject(animate)) {
                    animate = {};
                }
                me.animate(Ext.applyIf({
                    to: {
                        width: width
                    }
                }, animate));
            }
            return me;
        },

        /**
         * Set the height of this Element.
         * <pre><code>
// change the height to 200px and animate with default configuration
Ext.fly('elementId').setHeight(200, true);

// change the height to 150px and animate with a custom configuration
Ext.fly('elId').setHeight(150, {
    duration : .5, // animation will have a duration of .5 seconds
    // will change the content to "finished"
    callback: function(){ this.{@link #update}("finished"); }
});
         * </code></pre>
         * @param {Number/String} height The new height. This may be one of:<div class="mdetail-params"><ul>
         * <li>A Number specifying the new height in this Element's {@link #defaultUnit}s (by default, pixels.)</li>
         * <li>A String used to set the CSS height style. Animation may <b>not</b> be used.</li>
         * </ul></div>
         * @param {Boolean/Object} animate (optional) true for the default animation or a standard Element animation config object
         * @return {Ext.Element} this
         */
         setHeight : function(height, animate){
            var me = this;
            height = me.adjustHeight(height);
            if (!animate || !me.anim) {
                me.dom.style.height = me.addUnits(height);
            }
            else {
                if (!Ext.isObject(animate)) {
                    animate = {};
                }
                me.animate(Ext.applyIf({
                    to: {
                        height: height
                    }
                }, animate));
            }
            return me;
        },

        /**
         * Gets the width of the border(s) for the specified side(s)
         * @param {String} side Can be t, l, r, b or any combination of those to add multiple values. For example,
         * passing <tt>'lr'</tt> would get the border <b><u>l</u></b>eft width + the border <b><u>r</u></b>ight width.
         * @return {Number} The width of the sides passed added together
         */
        getBorderWidth : function(side){
            return this.addStyles(side, borders);
        },

        /**
         * Gets the width of the padding(s) for the specified side(s)
         * @param {String} side Can be t, l, r, b or any combination of those to add multiple values. For example,
         * passing <tt>'lr'</tt> would get the padding <b><u>l</u></b>eft + the padding <b><u>r</u></b>ight.
         * @return {Number} The padding of the sides passed added together
         */
        getPadding : function(side){
            return this.addStyles(side, paddings);
        },

        /**
         *  Store the current overflow setting and clip overflow on the element - use <tt>{@link #unclip}</tt> to remove
         * @return {Ext.Element} this
         */
        clip : function(){
            var me = this,
                dom = me.dom;

            if(!data(dom, ISCLIPPED)){
                data(dom, ISCLIPPED, true);
                data(dom, ORIGINALCLIP, {
                    o: me.getStyle(OVERFLOW),
                    x: me.getStyle(OVERFLOWX),
                    y: me.getStyle(OVERFLOWY)
                });
                me.setStyle(OVERFLOW, HIDDEN);
                me.setStyle(OVERFLOWX, HIDDEN);
                me.setStyle(OVERFLOWY, HIDDEN);
            }
            return me;
        },

        /**
         *  Return clipping (overflow) to original clipping before <tt>{@link #clip}</tt> was called
         * @return {Ext.Element} this
         */
        unclip : function(){
            var me = this,
                dom = me.dom,
                clip;

            if(data(dom, ISCLIPPED)){
                data(dom, ISCLIPPED, false);
                clip = data(dom, ORIGINALCLIP);
                if(clip.o){
                    me.setStyle(OVERFLOW, clip.o);
                }
                if(clip.x){
                    me.setStyle(OVERFLOWX, clip.x);
                }
                if(clip.y){
                    me.setStyle(OVERFLOWY, clip.y);
                }
            }
            return me;
        },

        // private
        addStyles : function(sides, styles){
            var totalSize = 0,
                sidesArr = sides.match(wordsRe),
                i = 0,
                len = sidesArr.length,
                side, size;
            for (; i < len; i++) {
                side = sidesArr[i];
                size = side && parseInt(this.getStyle(styles[side]), 10);
                if (size) {
                    totalSize += MATH.abs(size);
                }
            }
            return totalSize;
        },

        margins : margins,

        /**
         * More flexible version of {@link #setStyle} for setting style properties.
         * @param {String/Object/Function} styles A style specification string, e.g. "width:100px", or object in the form {width:"100px"}, or
         * a function which returns such a specification.
         * @return {Ext.Element} this
         */
        applyStyles : function(style){
            Ext.DomHelper.applyStyles(this.dom, style);
            return this;
        },

        /**
         * Returns an object with properties matching the styles requested.
         * For example, el.getStyles('color', 'font-size', 'width') might return
         * {'color': '#FFFFFF', 'font-size': '13px', 'width': '100px'}.
         * @param {String} style1 A style name
         * @param {String} style2 A style name
         * @param {String} etc.
         * @return {Object} The style object
         */
        getStyles : function(){
            var styles = {},
                len = arguments.length,
                i = 0, style;

            for(; i < len; ++i) {
                style = arguments[i];
                styles[style] = this.getStyle(style);
            }
            return styles;
        },

       /**
        * <p>Wraps the specified element with a special 9 element markup/CSS block that renders by default as
        * a gray container with a gradient background, rounded corners and a 4-way shadow.</p>
        * <p>This special markup is used throughout Ext when box wrapping elements ({@link Ext.button.Button},
        * {@link Ext.panel.Panel} when <tt>{@link Ext.panel.Panel#frame frame=true}</tt>, {@link Ext.window.Window}).  The markup
        * is of this form:</p>
        * <pre><code>
    Ext.Element.boxMarkup =
    &#39;&lt;div class="{0}-tl">&lt;div class="{0}-tr">&lt;div class="{0}-tc">&lt;/div>&lt;/div>&lt;/div>
     &lt;div class="{0}-ml">&lt;div class="{0}-mr">&lt;div class="{0}-mc">&lt;/div>&lt;/div>&lt;/div>
     &lt;div class="{0}-bl">&lt;div class="{0}-br">&lt;div class="{0}-bc">&lt;/div>&lt;/div>&lt;/div>&#39;;
        * </code></pre>
        * <p>Example usage:</p>
        * <pre><code>
    // Basic box wrap
    Ext.get("foo").boxWrap();

    // You can also add a custom class and use CSS inheritance rules to customize the box look.
    // 'x-box-blue' is a built-in alternative -- look at the related CSS definitions as an example
    // for how to create a custom box wrap style.
    Ext.get("foo").boxWrap().addCls("x-box-blue");
        * </code></pre>
        * @param {String} class (optional) A base CSS class to apply to the containing wrapper element
        * (defaults to <tt>'x-box'</tt>). Note that there are a number of CSS rules that are dependent on
        * this name to make the overall effect work, so if you supply an alternate base class, make sure you
        * also supply all of the necessary rules.
        * @return {Ext.Element} The outermost wrapping element of the created box structure.
        */
        boxWrap : function(cls){
            cls = cls || Ext.baseCSSPrefix + 'box';
            var el = Ext.get(this.insertHtml("beforeBegin", "<div class='" + cls + "'>" + Ext.String.format(ELEMENT.boxMarkup, cls) + "</div>"));
            Ext.DomQuery.selectNode('.' + cls + '-mc', el.dom).appendChild(this.dom);
            return el;
        },

        /**
         * Set the size of this Element. If animation is true, both width and height will be animated concurrently.
         * @param {Number/String} width The new width. This may be one of:<div class="mdetail-params"><ul>
         * <li>A Number specifying the new width in this Element's {@link #defaultUnit}s (by default, pixels).</li>
         * <li>A String used to set the CSS width style. Animation may <b>not</b> be used.
         * <li>A size object in the format <code>{width: widthValue, height: heightValue}</code>.</li>
         * </ul></div>
         * @param {Number/String} height The new height. This may be one of:<div class="mdetail-params"><ul>
         * <li>A Number specifying the new height in this Element's {@link #defaultUnit}s (by default, pixels).</li>
         * <li>A String used to set the CSS height style. Animation may <b>not</b> be used.</li>
         * </ul></div>
         * @param {Boolean/Object} animate (optional) true for the default animation or a standard Element animation config object
         * @return {Ext.Element} this
         */
        setSize : function(width, height, animate){
            var me = this;
            if (Ext.isObject(width)) { // in case of object from getSize()
                animate = height;
                height = width.height;
                width = width.width;
            }
            width = me.adjustWidth(width);
            height = me.adjustHeight(height);
            if(!animate || !me.anim){
                // Must touch some property before setting style.width/height on non-quirk IE6,7, or the
                // properties will not reflect the changes on the style immediately
                if (!Ext.isIEQuirks && (Ext.isIE6 || Ext.isIE7)) {
                    me.dom.offsetTop;
                }
                me.dom.style.width = me.addUnits(width);
                me.dom.style.height = me.addUnits(height);
            }
            else {
                if (animate === true) {
                    animate = {};
                }
                me.animate(Ext.applyIf({
                    to: {
                        width: width,
                        height: height
                    }
                }, animate));
            }
            return me;
        },

        /**
         * Returns either the offsetHeight or the height of this element based on CSS height adjusted by padding or borders
         * when needed to simulate offsetHeight when offsets aren't available. This may not work on display:none elements
         * if a height has not been set using CSS.
         * @return {Number}
         */
        getComputedHeight : function(){
            var me = this,
                h = Math.max(me.dom.offsetHeight, me.dom.clientHeight);
            if(!h){
                h = parseFloat(me.getStyle('height')) || 0;
                if(!me.isBorderBox()){
                    h += me.getFrameWidth('tb');
                }
            }
            return h;
        },

        /**
         * Returns either the offsetWidth or the width of this element based on CSS width adjusted by padding or borders
         * when needed to simulate offsetWidth when offsets aren't available. This may not work on display:none elements
         * if a width has not been set using CSS.
         * @return {Number}
         */
        getComputedWidth : function(){
            var me = this,
                w = Math.max(me.dom.offsetWidth, me.dom.clientWidth);

            if(!w){
                w = parseFloat(me.getStyle('width')) || 0;
                if(!me.isBorderBox()){
                    w += me.getFrameWidth('lr');
                }
            }
            return w;
        },

        /**
         * Returns the sum width of the padding and borders for the passed "sides". See getBorderWidth()
         for more information about the sides.
         * @param {String} sides
         * @return {Number}
         */
        getFrameWidth : function(sides, onlyContentBox){
            return onlyContentBox && this.isBorderBox() ? 0 : (this.getPadding(sides) + this.getBorderWidth(sides));
        },

        /**
         * Sets up event handlers to add and remove a css class when the mouse is over this element
         * @param {String} className
         * @return {Ext.Element} this
         */
        addClsOnOver : function(className){
            var dom = this.dom;
            this.hover(
                function(){
                    Ext.fly(dom, INTERNAL).addCls(className);
                },
                function(){
                    Ext.fly(dom, INTERNAL).removeCls(className);
                }
            );
            return this;
        },

        /**
         * Sets up event handlers to add and remove a css class when this element has the focus
         * @param {String} className
         * @return {Ext.Element} this
         */
        addClsOnFocus : function(className){
            var me = this,
                dom = me.dom;
            me.on("focus", function(){
                Ext.fly(dom, INTERNAL).addCls(className);
            });
            me.on("blur", function(){
                Ext.fly(dom, INTERNAL).removeCls(className);
            });
            return me;
        },

        /**
         * Sets up event handlers to add and remove a css class when the mouse is down and then up on this element (a click effect)
         * @param {String} className
         * @return {Ext.Element} this
         */
        addClsOnClick : function(className){
            var dom = this.dom;
            this.on("mousedown", function(){
                Ext.fly(dom, INTERNAL).addCls(className);
                var d = Ext.getDoc(),
                    fn = function(){
                        Ext.fly(dom, INTERNAL).removeCls(className);
                        d.removeListener("mouseup", fn);
                    };
                d.on("mouseup", fn);
            });
            return this;
        },

        /**
         * <p>Returns the dimensions of the element available to lay content out in.<p>
         * <p>If the element (or any ancestor element) has CSS style <code>display : none</code>, the dimensions will be zero.</p>
         * example:<pre><code>
        var vpSize = Ext.getBody().getViewSize();

        // all Windows created afterwards will have a default value of 90% height and 95% width
        Ext.Window.override({
            width: vpSize.width * 0.9,
            height: vpSize.height * 0.95
        });
        // To handle window resizing you would have to hook onto onWindowResize.
        * </code></pre>
        *
        * getViewSize utilizes clientHeight/clientWidth which excludes sizing of scrollbars.
        * To obtain the size including scrollbars, use getStyleSize
        *
        * Sizing of the document body is handled at the adapter level which handles special cases for IE and strict modes, etc.
        */

        getViewSize : function(){
            var me = this,
                dom = me.dom,
                isDoc = (dom == Ext.getDoc().dom || dom == Ext.getBody().dom),
                style, overflow, ret;

            // If the body, use static methods
            if (isDoc) {
                ret = {
                    width : ELEMENT.getViewWidth(),
                    height : ELEMENT.getViewHeight()
                };

            // Else use clientHeight/clientWidth
            }
            else {
                // IE 6 & IE Quirks mode acts more like a max-size measurement unless overflow is hidden during measurement.
                // We will put the overflow back to it's original value when we are done measuring.
                if (Ext.isIE6 || Ext.isIEQuirks) {
                    style = dom.style;
                    overflow = style.overflow;
                    me.setStyle({ overflow: 'hidden'});
                }
                ret = {
                    width : dom.clientWidth,
                    height : dom.clientHeight
                };
                if (Ext.isIE6 || Ext.isIEQuirks) {
                    me.setStyle({ overflow: overflow });
                }
            }
            return ret;
        },

        /**
        * <p>Returns the dimensions of the element available to lay content out in.<p>
        *
        * getStyleSize utilizes prefers style sizing if present, otherwise it chooses the larger of offsetHeight/clientHeight and offsetWidth/clientWidth.
        * To obtain the size excluding scrollbars, use getViewSize
        *
        * Sizing of the document body is handled at the adapter level which handles special cases for IE and strict modes, etc.
        */

        getStyleSize : function(){
            var me = this,
                doc = document,
                d = this.dom,
                isDoc = (d == doc || d == doc.body),
                s = d.style,
                w, h;

            // If the body, use static methods
            if (isDoc) {
                return {
                    width : ELEMENT.getViewWidth(),
                    height : ELEMENT.getViewHeight()
                };
            }
            // Use Styles if they are set
            if(s.width && s.width != 'auto'){
                w = parseFloat(s.width);
                if(me.isBorderBox()){
                   w -= me.getFrameWidth('lr');
                }
            }
            // Use Styles if they are set
            if(s.height && s.height != 'auto'){
                h = parseFloat(s.height);
                if(me.isBorderBox()){
                   h -= me.getFrameWidth('tb');
                }
            }
            // Use getWidth/getHeight if style not set.
            return {width: w || me.getWidth(true), height: h || me.getHeight(true)};
        },

        /**
         * Returns the size of the element.
         * @param {Boolean} contentSize (optional) true to get the width/size minus borders and padding
         * @return {Object} An object containing the element's size {width: (element width), height: (element height)}
         */
        getSize : function(contentSize){
            return {width: this.getWidth(contentSize), height: this.getHeight(contentSize)};
        },

        /**
         * Forces the browser to repaint this element
         * @return {Ext.Element} this
         */
        repaint : function(){
            var dom = this.dom;
            this.addCls(Ext.baseCSSPrefix + 'repaint');
            setTimeout(function(){
                Ext.fly(dom).removeCls(Ext.baseCSSPrefix + 'repaint');
            }, 1);
            return this;
        },

        /**
         * Enable text selection for this element (normalized across browsers)
         * @return {Ext.Element} this
         */
        selectable : function() {
            var me = this;
            me.dom.unselectable = "off";
            // Prevent it from bubles up and enables it to be selectable
            me.on('selectstart', function (e) {
                e.stopPropagation();
                return true;
            });
            me.applyStyles("-moz-user-select: text; -khtml-user-select: text;");
            me.removeCls(Ext.baseCSSPrefix + 'unselectable');
            return me;
        },

        /**
         * Disables text selection for this element (normalized across browsers)
         * @return {Ext.Element} this
         */
        unselectable : function(){
            var me = this;
            me.dom.unselectable = "on";

            me.swallowEvent("selectstart", true);
            me.applyStyles("-moz-user-select:-moz-none;-khtml-user-select:none;");
            me.addCls(Ext.baseCSSPrefix + 'unselectable');

            return me;
        },

        /**
         * Returns an object with properties top, left, right and bottom representing the margins of this element unless sides is passed,
         * then it returns the calculated width of the sides (see getPadding)
         * @param {String} sides (optional) Any combination of l, r, t, b to get the sum of those sides
         * @return {Object/Number}
         */
        getMargin : function(side){
            var me = this,
                hash = {t:"top", l:"left", r:"right", b: "bottom"},
                o = {},
                key;

            if (!side) {
                for (key in me.margins){
                    o[hash[key]] = parseFloat(me.getStyle(me.margins[key])) || 0;
                }
                return o;
            } else {
                return me.addStyles.call(me, side, me.margins);
            }
        }
    });
})();
/**
 * @class Ext.Element
 */
/**
 * Visibility mode constant for use with {@link #setVisibilityMode}. Use visibility to hide element
 * @static
 * @type Number
 */
Ext.Element.VISIBILITY = 1;
/**
 * Visibility mode constant for use with {@link #setVisibilityMode}. Use display to hide element
 * @static
 * @type Number
 */
Ext.Element.DISPLAY = 2;

/**
 * Visibility mode constant for use with {@link #setVisibilityMode}. Use offsets (x and y positioning offscreen)
 * to hide element.
 * @static
 * @type Number
 */
Ext.Element.OFFSETS = 3;


Ext.Element.ASCLASS = 4;

/**
 * Defaults to 'x-hide-nosize'
 * @static
 * @type String
 */
Ext.Element.visibilityCls = Ext.baseCSSPrefix + 'hide-nosize';

Ext.Element.addMethods(function(){
    var El = Ext.Element,
        OPACITY = "opacity",
        VISIBILITY = "visibility",
        DISPLAY = "display",
        HIDDEN = "hidden",
        OFFSETS = "offsets",
        ASCLASS = "asclass",
        NONE = "none",
        NOSIZE = 'nosize',
        ORIGINALDISPLAY = 'originalDisplay',
        VISMODE = 'visibilityMode',
        ISVISIBLE = 'isVisible',
        data = El.data,
        getDisplay = function(dom){
            var d = data(dom, ORIGINALDISPLAY);
            if(d === undefined){
                data(dom, ORIGINALDISPLAY, d = '');
            }
            return d;
        },
        getVisMode = function(dom){
            var m = data(dom, VISMODE);
            if(m === undefined){
                data(dom, VISMODE, m = 1);
            }
            return m;
        };

    return {
        /**
         * @property {String} originalDisplay
         * The element's default display mode
         */
        originalDisplay : "",
        visibilityMode : 1,

        /**
         * Sets the element's visibility mode. When setVisible() is called it
         * will use this to determine whether to set the visibility or the display property.
         * @param {Number} visMode Ext.Element.VISIBILITY or Ext.Element.DISPLAY
         * @return {Ext.Element} this
         */
        setVisibilityMode : function(visMode){
            data(this.dom, VISMODE, visMode);
            return this;
        },

        /**
         * Checks whether the element is currently visible using both visibility and display properties.
         * @return {Boolean} True if the element is currently visible, else false
         */
        isVisible : function() {
            var me = this,
                dom = me.dom,
                visible = data(dom, ISVISIBLE);

            if(typeof visible == 'boolean'){ //return the cached value if registered
                return visible;
            }
            //Determine the current state based on display states
            visible = !me.isStyle(VISIBILITY, HIDDEN) &&
                      !me.isStyle(DISPLAY, NONE) &&
                      !((getVisMode(dom) == El.ASCLASS) && me.hasCls(me.visibilityCls || El.visibilityCls));

            data(dom, ISVISIBLE, visible);
            return visible;
        },

        /**
         * Sets the visibility of the element (see details). If the visibilityMode is set to Element.DISPLAY, it will use
         * the display property to hide the element, otherwise it uses visibility. The default is to hide and show using the visibility property.
         * @param {Boolean} visible Whether the element is visible
         * @param {Boolean/Object} animate (optional) True for the default animation, or a standard Element animation config object
         * @return {Ext.Element} this
         */
        setVisible : function(visible, animate){
            var me = this, isDisplay, isVisibility, isOffsets, isNosize,
                dom = me.dom,
                visMode = getVisMode(dom);


            // hideMode string override
            if (typeof animate == 'string'){
                switch (animate) {
                    case DISPLAY:
                        visMode = El.DISPLAY;
                        break;
                    case VISIBILITY:
                        visMode = El.VISIBILITY;
                        break;
                    case OFFSETS:
                        visMode = El.OFFSETS;
                        break;
                    case NOSIZE:
                    case ASCLASS:
                        visMode = El.ASCLASS;
                        break;
                }
                me.setVisibilityMode(visMode);
                animate = false;
            }

            if (!animate || !me.anim) {
                if(visMode == El.ASCLASS ){

                    me[visible?'removeCls':'addCls'](me.visibilityCls || El.visibilityCls);

                } else if (visMode == El.DISPLAY){

                    return me.setDisplayed(visible);

                } else if (visMode == El.OFFSETS){

                    if (!visible){
                        // Remember position for restoring, if we are not already hidden by offsets.
                        if (!me.hideModeStyles) {
                            me.hideModeStyles = {
                                position: me.getStyle('position'),
                                top: me.getStyle('top'),
                                left: me.getStyle('left')
                            };
                        }
                        me.applyStyles({position: 'absolute', top: '-10000px', left: '-10000px'});
                    }

                    // Only "restore" as position if we have actually been hidden using offsets.
                    // Calling setVisible(true) on a positioned element should not reposition it.
                    else if (me.hideModeStyles) {
                        me.applyStyles(me.hideModeStyles || {position: '', top: '', left: ''});
                        delete me.hideModeStyles;
                    }

                }else{
                    me.fixDisplay();
                    // Show by clearing visibility style. Explicitly setting to "visible" overrides parent visibility setting.
                    dom.style.visibility = visible ? '' : HIDDEN;
                }
            }else{
                // closure for composites
                if(visible){
                    me.setOpacity(0.01);
                    me.setVisible(true);
                }
                if (!Ext.isObject(animate)) {
                    animate = {
                        duration: 350,
                        easing: 'ease-in'
                    };
                }
                me.animate(Ext.applyIf({
                    callback: function() {
                        visible || me.setVisible(false).setOpacity(1);
                    },
                    to: {
                        opacity: (visible) ? 1 : 0
                    }
                }, animate));
            }
            data(dom, ISVISIBLE, visible);  //set logical visibility state
            return me;
        },


        /**
         * @private
         * Determine if the Element has a relevant height and width available based
         * upon current logical visibility state
         */
        hasMetrics  : function(){
            var dom = this.dom;
            return this.isVisible() || (getVisMode(dom) == El.OFFSETS) || (getVisMode(dom) == El.VISIBILITY);
        },

        /**
         * Toggles the element's visibility or display, depending on visibility mode.
         * @param {Boolean/Object} animate (optional) True for the default animation, or a standard Element animation config object
         * @return {Ext.Element} this
         */
        toggle : function(animate){
            var me = this;
            me.setVisible(!me.isVisible(), me.anim(animate));
            return me;
        },

        /**
         * Sets the CSS display property. Uses originalDisplay if the specified value is a boolean true.
         * @param {Boolean/String} value Boolean value to display the element using its default display, or a string to set the display directly.
         * @return {Ext.Element} this
         */
        setDisplayed : function(value) {
            if(typeof value == "boolean"){
               value = value ? getDisplay(this.dom) : NONE;
            }
            this.setStyle(DISPLAY, value);
            return this;
        },

        // private
        fixDisplay : function(){
            var me = this;
            if (me.isStyle(DISPLAY, NONE)) {
                me.setStyle(VISIBILITY, HIDDEN);
                me.setStyle(DISPLAY, getDisplay(this.dom)); // first try reverting to default
                if (me.isStyle(DISPLAY, NONE)) { // if that fails, default to block
                    me.setStyle(DISPLAY, "block");
                }
            }
        },

        /**
         * Hide this element - Uses display mode to determine whether to use "display" or "visibility". See {@link #setVisible}.
         * @param {Boolean/Object} animate (optional) true for the default animation or a standard Element animation config object
         * @return {Ext.Element} this
         */
        hide : function(animate){
            // hideMode override
            if (typeof animate == 'string'){
                this.setVisible(false, animate);
                return this;
            }
            this.setVisible(false, this.anim(animate));
            return this;
        },

        /**
        * Show this element - Uses display mode to determine whether to use "display" or "visibility". See {@link #setVisible}.
        * @param {Boolean/Object} animate (optional) true for the default animation or a standard Element animation config object
         * @return {Ext.Element} this
         */
        show : function(animate){
            // hideMode override
            if (typeof animate == 'string'){
                this.setVisible(true, animate);
                return this;
            }
            this.setVisible(true, this.anim(animate));
            return this;
        }
    };
}());
/**
 * @class Ext.Element
 */
Ext.applyIf(Ext.Element.prototype, {
    // @private override base Ext.util.Animate mixin for animate for backwards compatibility
    animate: function(config) {
        var me = this;
        if (!me.id) {
            me = Ext.get(me.dom);
        }
        if (Ext.fx.Manager.hasFxBlock(me.id)) {
            return me;
        }
        Ext.fx.Manager.queueFx(Ext.create('Ext.fx.Anim', me.anim(config)));
        return this;
    },

    // @private override base Ext.util.Animate mixin for animate for backwards compatibility
    anim: function(config) {
        if (!Ext.isObject(config)) {
            return (config) ? {} : false;
        }

        var me = this,
            duration = config.duration || Ext.fx.Anim.prototype.duration,
            easing = config.easing || 'ease',
            animConfig;

        if (config.stopAnimation) {
            me.stopAnimation();
        }

        Ext.applyIf(config, Ext.fx.Manager.getFxDefaults(me.id));

        // Clear any 'paused' defaults.
        Ext.fx.Manager.setFxDefaults(me.id, {
            delay: 0
        });

        animConfig = {
            target: me,
            remove: config.remove,
            alternate: config.alternate || false,
            duration: duration,
            easing: easing,
            callback: config.callback,
            listeners: config.listeners,
            iterations: config.iterations || 1,
            scope: config.scope,
            block: config.block,
            concurrent: config.concurrent,
            delay: config.delay || 0,
            paused: true,
            keyframes: config.keyframes,
            from: config.from || {},
            to: Ext.apply({}, config)
        };
        Ext.apply(animConfig.to, config.to);

        // Anim API properties - backward compat
        delete animConfig.to.to;
        delete animConfig.to.from;
        delete animConfig.to.remove;
        delete animConfig.to.alternate;
        delete animConfig.to.keyframes;
        delete animConfig.to.iterations;
        delete animConfig.to.listeners;
        delete animConfig.to.target;
        delete animConfig.to.paused;
        delete animConfig.to.callback;
        delete animConfig.to.scope;
        delete animConfig.to.duration;
        delete animConfig.to.easing;
        delete animConfig.to.concurrent;
        delete animConfig.to.block;
        delete animConfig.to.stopAnimation;
        delete animConfig.to.delay;
        return animConfig;
    },

    /**
     * Slides the element into view. An anchor point can be optionally passed to set the point of origin for the slide
     * effect. This function automatically handles wrapping the element with a fixed-size container if needed. See the
     * Fx class overview for valid anchor point options. Usage:
     *
     *     // default: slide the element in from the top
     *     el.slideIn();
     *
     *     // custom: slide the element in from the right with a 2-second duration
     *     el.slideIn('r', { duration: 2000 });
     *
     *     // common config options shown with default values
     *     el.slideIn('t', {
     *         easing: 'easeOut',
     *         duration: 500
     *     });
     *
     * @param {String} [anchor='t'] One of the valid Fx anchor positions
     * @param {Object} [options] Object literal with any of the Fx config options
     * @return {Ext.Element} The Element
     */
    slideIn: function(anchor, obj, slideOut) {
        var me = this,
            elStyle = me.dom.style,
            beforeAnim, wrapAnim;

        anchor = anchor || "t";
        obj = obj || {};

        beforeAnim = function() {
            var animScope = this,
                listeners = obj.listeners,
                box, position, restoreSize, wrap, anim;

            if (!slideOut) {
                me.fixDisplay();
            }

            box = me.getBox();
            if ((anchor == 't' || anchor == 'b') && box.height === 0) {
                box.height = me.dom.scrollHeight;
            }
            else if ((anchor == 'l' || anchor == 'r') && box.width === 0) {
                box.width = me.dom.scrollWidth;
            }

            position = me.getPositioning();
            me.setSize(box.width, box.height);

            wrap = me.wrap({
                style: {
                    visibility: slideOut ? 'visible' : 'hidden'
                }
            });
            wrap.setPositioning(position);
            if (wrap.isStyle('position', 'static')) {
                wrap.position('relative');
            }
            me.clearPositioning('auto');
            wrap.clip();

            // This element is temporarily positioned absolute within its wrapper.
            // Restore to its default, CSS-inherited visibility setting.
            // We cannot explicitly poke visibility:visible into its style because that overrides the visibility of the wrap.
            me.setStyle({
                visibility: '',
                position: 'absolute'
            });
            if (slideOut) {
                wrap.setSize(box.width, box.height);
            }

            switch (anchor) {
                case 't':
                    anim = {
                        from: {
                            width: box.width + 'px',
                            height: '0px'
                        },
                        to: {
                            width: box.width + 'px',
                            height: box.height + 'px'
                        }
                    };
                    elStyle.bottom = '0px';
                    break;
                case 'l':
                    anim = {
                        from: {
                            width: '0px',
                            height: box.height + 'px'
                        },
                        to: {
                            width: box.width + 'px',
                            height: box.height + 'px'
                        }
                    };
                    elStyle.right = '0px';
                    break;
                case 'r':
                    anim = {
                        from: {
                            x: box.x + box.width,
                            width: '0px',
                            height: box.height + 'px'
                        },
                        to: {
                            x: box.x,
                            width: box.width + 'px',
                            height: box.height + 'px'
                        }
                    };
                    break;
                case 'b':
                    anim = {
                        from: {
                            y: box.y + box.height,
                            width: box.width + 'px',
                            height: '0px'
                        },
                        to: {
                            y: box.y,
                            width: box.width + 'px',
                            height: box.height + 'px'
                        }
                    };
                    break;
                case 'tl':
                    anim = {
                        from: {
                            x: box.x,
                            y: box.y,
                            width: '0px',
                            height: '0px'
                        },
                        to: {
                            width: box.width + 'px',
                            height: box.height + 'px'
                        }
                    };
                    elStyle.bottom = '0px';
                    elStyle.right = '0px';
                    break;
                case 'bl':
                    anim = {
                        from: {
                            x: box.x + box.width,
                            width: '0px',
                            height: '0px'
                        },
                        to: {
                            x: box.x,
                            width: box.width + 'px',
                            height: box.height + 'px'
                        }
                    };
                    elStyle.right = '0px';
                    break;
                case 'br':
                    anim = {
                        from: {
                            x: box.x + box.width,
                            y: box.y + box.height,
                            width: '0px',
                            height: '0px'
                        },
                        to: {
                            x: box.x,
                            y: box.y,
                            width: box.width + 'px',
                            height: box.height + 'px'
                        }
                    };
                    break;
                case 'tr':
                    anim = {
                        from: {
                            y: box.y + box.height,
                            width: '0px',
                            height: '0px'
                        },
                        to: {
                            y: box.y,
                            width: box.width + 'px',
                            height: box.height + 'px'
                        }
                    };
                    elStyle.bottom = '0px';
                    break;
            }

            wrap.show();
            wrapAnim = Ext.apply({}, obj);
            delete wrapAnim.listeners;
            wrapAnim = Ext.create('Ext.fx.Anim', Ext.applyIf(wrapAnim, {
                target: wrap,
                duration: 500,
                easing: 'ease-out',
                from: slideOut ? anim.to : anim.from,
                to: slideOut ? anim.from : anim.to
            }));

            // In the absence of a callback, this listener MUST be added first
            wrapAnim.on('afteranimate', function() {
                if (slideOut) {
                    me.setPositioning(position);
                    if (obj.useDisplay) {
                        me.setDisplayed(false);
                    } else {
                        me.hide();
                    }
                }
                else {
                    me.clearPositioning();
                    me.setPositioning(position);
                }
                if (wrap.dom) {
                    wrap.dom.parentNode.insertBefore(me.dom, wrap.dom);
                    wrap.remove();
                }
                me.setSize(box.width, box.height);
                animScope.end();
            });
            // Add configured listeners after
            if (listeners) {
                wrapAnim.on(listeners);
            }
        };

        me.animate({
            duration: obj.duration ? obj.duration * 2 : 1000,
            listeners: {
                beforeanimate: {
                    fn: beforeAnim
                },
                afteranimate: {
                    fn: function() {
                        if (wrapAnim && wrapAnim.running) {
                            wrapAnim.end();
                        }
                    }
                }
            }
        });
        return me;
    },


    /**
     * Slides the element out of view. An anchor point can be optionally passed to set the end point for the slide
     * effect. When the effect is completed, the element will be hidden (visibility = 'hidden') but block elements will
     * still take up space in the document. The element must be removed from the DOM using the 'remove' config option if
     * desired. This function automatically handles wrapping the element with a fixed-size container if needed. See the
     * Fx class overview for valid anchor point options. Usage:
     *
     *     // default: slide the element out to the top
     *     el.slideOut();
     *
     *     // custom: slide the element out to the right with a 2-second duration
     *     el.slideOut('r', { duration: 2000 });
     *
     *     // common config options shown with default values
     *     el.slideOut('t', {
     *         easing: 'easeOut',
     *         duration: 500,
     *         remove: false,
     *         useDisplay: false
     *     });
     *
     * @param {String} [anchor='t'] One of the valid Fx anchor positions
     * @param {Object} [options] Object literal with any of the Fx config options
     * @return {Ext.Element} The Element
     */
    slideOut: function(anchor, o) {
        return this.slideIn(anchor, o, true);
    },

    /**
     * Fades the element out while slowly expanding it in all directions. When the effect is completed, the element will
     * be hidden (visibility = 'hidden') but block elements will still take up space in the document. Usage:
     *
     *     // default
     *     el.puff();
     *
     *     // common config options shown with default values
     *     el.puff({
     *         easing: 'easeOut',
     *         duration: 500,
     *         useDisplay: false
     *     });
     *
     * @param {Object} options (optional) Object literal with any of the Fx config options
     * @return {Ext.Element} The Element
     */
    puff: function(obj) {
        var me = this,
            beforeAnim;
        obj = Ext.applyIf(obj || {}, {
            easing: 'ease-out',
            duration: 500,
            useDisplay: false
        });

        beforeAnim = function() {
            me.clearOpacity();
            me.show();

            var box = me.getBox(),
                fontSize = me.getStyle('fontSize'),
                position = me.getPositioning();
            this.to = {
                width: box.width * 2,
                height: box.height * 2,
                x: box.x - (box.width / 2),
                y: box.y - (box.height /2),
                opacity: 0,
                fontSize: '200%'
            };
            this.on('afteranimate',function() {
                if (me.dom) {
                    if (obj.useDisplay) {
                        me.setDisplayed(false);
                    } else {
                        me.hide();
                    }
                    me.clearOpacity();
                    me.setPositioning(position);
                    me.setStyle({fontSize: fontSize});
                }
            });
        };

        me.animate({
            duration: obj.duration,
            easing: obj.easing,
            listeners: {
                beforeanimate: {
                    fn: beforeAnim
                }
            }
        });
        return me;
    },

    /**
     * Blinks the element as if it was clicked and then collapses on its center (similar to switching off a television).
     * When the effect is completed, the element will be hidden (visibility = 'hidden') but block elements will still
     * take up space in the document. The element must be removed from the DOM using the 'remove' config option if
     * desired. Usage:
     *
     *     // default
     *     el.switchOff();
     *
     *     // all config options shown with default values
     *     el.switchOff({
     *         easing: 'easeIn',
     *         duration: .3,
     *         remove: false,
     *         useDisplay: false
     *     });
     *
     * @param {Object} options (optional) Object literal with any of the Fx config options
     * @return {Ext.Element} The Element
     */
    switchOff: function(obj) {
        var me = this,
            beforeAnim;

        obj = Ext.applyIf(obj || {}, {
            easing: 'ease-in',
            duration: 500,
            remove: false,
            useDisplay: false
        });

        beforeAnim = function() {
            var animScope = this,
                size = me.getSize(),
                xy = me.getXY(),
                keyframe, position;
            me.clearOpacity();
            me.clip();
            position = me.getPositioning();

            keyframe = Ext.create('Ext.fx.Animator', {
                target: me,
                duration: obj.duration,
                easing: obj.easing,
                keyframes: {
                    33: {
                        opacity: 0.3
                    },
                    66: {
                        height: 1,
                        y: xy[1] + size.height / 2
                    },
                    100: {
                        width: 1,
                        x: xy[0] + size.width / 2
                    }
                }
            });
            keyframe.on('afteranimate', function() {
                if (obj.useDisplay) {
                    me.setDisplayed(false);
                } else {
                    me.hide();
                }
                me.clearOpacity();
                me.setPositioning(position);
                me.setSize(size);
                animScope.end();
            });
        };
        me.animate({
            duration: (obj.duration * 2),
            listeners: {
                beforeanimate: {
                    fn: beforeAnim
                }
            }
        });
        return me;
    },

    /**
     * Shows a ripple of exploding, attenuating borders to draw attention to an Element. Usage:
     *
     *     // default: a single light blue ripple
     *     el.frame();
     *
     *     // custom: 3 red ripples lasting 3 seconds total
     *     el.frame("#ff0000", 3, { duration: 3 });
     *
     *     // common config options shown with default values
     *     el.frame("#C3DAF9", 1, {
     *         duration: 1 //duration of each individual ripple.
     *         // Note: Easing is not configurable and will be ignored if included
     *     });
     *
     * @param {String} [color='C3DAF9'] The color of the border. Should be a 6 char hex color without the leading #
     * (defaults to light blue).
     * @param {Number} [count=1] The number of ripples to display
     * @param {Object} [options] Object literal with any of the Fx config options
     * @return {Ext.Element} The Element
     */
    frame : function(color, count, obj){
        var me = this,
            beforeAnim;

        color = color || '#C3DAF9';
        count = count || 1;
        obj = obj || {};

        beforeAnim = function() {
            me.show();
            var animScope = this,
                box = me.getBox(),
                proxy = Ext.getBody().createChild({
                    style: {
                        position : 'absolute',
                        'pointer-events': 'none',
                        'z-index': 35000,
                        border : '0px solid ' + color
                    }
                }),
                proxyAnim;
            proxyAnim = Ext.create('Ext.fx.Anim', {
                target: proxy,
                duration: obj.duration || 1000,
                iterations: count,
                from: {
                    top: box.y,
                    left: box.x,
                    borderWidth: 0,
                    opacity: 1,
                    height: box.height,
                    width: box.width
                },
                to: {
                    top: box.y - 20,
                    left: box.x - 20,
                    borderWidth: 10,
                    opacity: 0,
                    height: box.height + 40,
                    width: box.width + 40
                }
            });
            proxyAnim.on('afteranimate', function() {
                proxy.remove();
                animScope.end();
            });
        };

        me.animate({
            duration: (obj.duration * 2) || 2000,
            listeners: {
                beforeanimate: {
                    fn: beforeAnim
                }
            }
        });
        return me;
    },

    /**
     * Slides the element while fading it out of view. An anchor point can be optionally passed to set the ending point
     * of the effect. Usage:
     *
     *     // default: slide the element downward while fading out
     *     el.ghost();
     *
     *     // custom: slide the element out to the right with a 2-second duration
     *     el.ghost('r', { duration: 2000 });
     *
     *     // common config options shown with default values
     *     el.ghost('b', {
     *         easing: 'easeOut',
     *         duration: 500
     *     });
     *
     * @param {String} [anchor='b'] One of the valid Fx anchor positions
     * @param {Object} [options] Object literal with any of the Fx config options
     * @return {Ext.Element} The Element
     */
    ghost: function(anchor, obj) {
        var me = this,
            beforeAnim;

        anchor = anchor || "b";
        beforeAnim = function() {
            var width = me.getWidth(),
                height = me.getHeight(),
                xy = me.getXY(),
                position = me.getPositioning(),
                to = {
                    opacity: 0
                };
            switch (anchor) {
                case 't':
                    to.y = xy[1] - height;
                    break;
                case 'l':
                    to.x = xy[0] - width;
                    break;
                case 'r':
                    to.x = xy[0] + width;
                    break;
                case 'b':
                    to.y = xy[1] + height;
                    break;
                case 'tl':
                    to.x = xy[0] - width;
                    to.y = xy[1] - height;
                    break;
                case 'bl':
                    to.x = xy[0] - width;
                    to.y = xy[1] + height;
                    break;
                case 'br':
                    to.x = xy[0] + width;
                    to.y = xy[1] + height;
                    break;
                case 'tr':
                    to.x = xy[0] + width;
                    to.y = xy[1] - height;
                    break;
            }
            this.to = to;
            this.on('afteranimate', function () {
                if (me.dom) {
                    me.hide();
                    me.clearOpacity();
                    me.setPositioning(position);
                }
            });
        };

        me.animate(Ext.applyIf(obj || {}, {
            duration: 500,
            easing: 'ease-out',
            listeners: {
                beforeanimate: {
                    fn: beforeAnim
                }
            }
        }));
        return me;
    },

    /**
     * Highlights the Element by setting a color (applies to the background-color by default, but can be changed using
     * the "attr" config option) and then fading back to the original color. If no original color is available, you
     * should provide the "endColor" config option which will be cleared after the animation. Usage:
     *
     *     // default: highlight background to yellow
     *     el.highlight();
     *
     *     // custom: highlight foreground text to blue for 2 seconds
     *     el.highlight("0000ff", { attr: 'color', duration: 2000 });
     *
     *     // common config options shown with default values
     *     el.highlight("ffff9c", {
     *         attr: "backgroundColor", //can be any valid CSS property (attribute) that supports a color value
     *         endColor: (current color) or "ffffff",
     *         easing: 'easeIn',
     *         duration: 1000
     *     });
     *
     * @param {String} [color='ffff9c'] The highlight color. Should be a 6 char hex color without the leading #
     * @param {Object} [options] Object literal with any of the Fx config options
     * @return {Ext.Element} The Element
     */
    highlight: function(color, o) {
        var me = this,
            dom = me.dom,
            from = {},
            restore, to, attr, lns, event, fn;

        o = o || {};
        lns = o.listeners || {};
        attr = o.attr || 'backgroundColor';
        from[attr] = color || 'ffff9c';

        if (!o.to) {
            to = {};
            to[attr] = o.endColor || me.getColor(attr, 'ffffff', '');
        }
        else {
            to = o.to;
        }

        // Don't apply directly on lns, since we reference it in our own callbacks below
        o.listeners = Ext.apply(Ext.apply({}, lns), {
            beforeanimate: function() {
                restore = dom.style[attr];
                me.clearOpacity();
                me.show();

                event = lns.beforeanimate;
                if (event) {
                    fn = event.fn || event;
                    return fn.apply(event.scope || lns.scope || window, arguments);
                }
            },
            afteranimate: function() {
                if (dom) {
                    dom.style[attr] = restore;
                }

                event = lns.afteranimate;
                if (event) {
                    fn = event.fn || event;
                    fn.apply(event.scope || lns.scope || window, arguments);
                }
            }
        });

        me.animate(Ext.apply({}, o, {
            duration: 1000,
            easing: 'ease-in',
            from: from,
            to: to
        }));
        return me;
    },

   /**
    * @deprecated 4.0
    * Creates a pause before any subsequent queued effects begin. If there are no effects queued after the pause it will
    * have no effect. Usage:
    *
    *     el.pause(1);
    *
    * @param {Number} seconds The length of time to pause (in seconds)
    * @return {Ext.Element} The Element
    */
    pause: function(ms) {
        var me = this;
        Ext.fx.Manager.setFxDefaults(me.id, {
            delay: ms
        });
        return me;
    },

    /**
     * Fade an element in (from transparent to opaque). The ending opacity can be specified using the `opacity`
     * config option. Usage:
     *
     *     // default: fade in from opacity 0 to 100%
     *     el.fadeIn();
     *
     *     // custom: fade in from opacity 0 to 75% over 2 seconds
     *     el.fadeIn({ opacity: .75, duration: 2000});
     *
     *     // common config options shown with default values
     *     el.fadeIn({
     *         opacity: 1, //can be any value between 0 and 1 (e.g. .5)
     *         easing: 'easeOut',
     *         duration: 500
     *     });
     *
     * @param {Object} options (optional) Object literal with any of the Fx config options
     * @return {Ext.Element} The Element
     */
    fadeIn: function(o) {
        this.animate(Ext.apply({}, o, {
            opacity: 1
        }));
        return this;
    },

    /**
     * Fade an element out (from opaque to transparent). The ending opacity can be specified using the `opacity`
     * config option. Note that IE may require `useDisplay:true` in order to redisplay correctly.
     * Usage:
     *
     *     // default: fade out from the element's current opacity to 0
     *     el.fadeOut();
     *
     *     // custom: fade out from the element's current opacity to 25% over 2 seconds
     *     el.fadeOut({ opacity: .25, duration: 2000});
     *
     *     // common config options shown with default values
     *     el.fadeOut({
     *         opacity: 0, //can be any value between 0 and 1 (e.g. .5)
     *         easing: 'easeOut',
     *         duration: 500,
     *         remove: false,
     *         useDisplay: false
     *     });
     *
     * @param {Object} options (optional) Object literal with any of the Fx config options
     * @return {Ext.Element} The Element
     */
    fadeOut: function(o) {
        this.animate(Ext.apply({}, o, {
            opacity: 0
        }));
        return this;
    },

    /**
     * @deprecated 4.0
     * Animates the transition of an element's dimensions from a starting height/width to an ending height/width. This
     * method is a convenience implementation of {@link #shift}. Usage:
     *
     *     // change height and width to 100x100 pixels
     *     el.scale(100, 100);
     *
     *     // common config options shown with default values.  The height and width will default to
     *     // the element's existing values if passed as null.
     *     el.scale(
     *         [element's width],
     *         [element's height], {
     *             easing: 'easeOut',
     *             duration: .35
     *         }
     *     );
     *
     * @param {Number} width The new width (pass undefined to keep the original width)
     * @param {Number} height The new height (pass undefined to keep the original height)
     * @param {Object} options (optional) Object literal with any of the Fx config options
     * @return {Ext.Element} The Element
     */
    scale: function(w, h, o) {
        this.animate(Ext.apply({}, o, {
            width: w,
            height: h
        }));
        return this;
    },

    /**
     * @deprecated 4.0
     * Animates the transition of any combination of an element's dimensions, xy position and/or opacity. Any of these
     * properties not specified in the config object will not be changed. This effect requires that at least one new
     * dimension, position or opacity setting must be passed in on the config object in order for the function to have
     * any effect. Usage:
     *
     *     // slide the element horizontally to x position 200 while changing the height and opacity
     *     el.shift({ x: 200, height: 50, opacity: .8 });
     *
     *     // common config options shown with default values.
     *     el.shift({
     *         width: [element's width],
     *         height: [element's height],
     *         x: [element's x position],
     *         y: [element's y position],
     *         opacity: [element's opacity],
     *         easing: 'easeOut',
     *         duration: .35
     *     });
     *
     * @param {Object} options Object literal with any of the Fx config options
     * @return {Ext.Element} The Element
     */
    shift: function(config) {
        this.animate(config);
        return this;
    }
});

/**
 * @class Ext.Element
 */
Ext.applyIf(Ext.Element, {
    unitRe: /\d+(px|em|%|en|ex|pt|in|cm|mm|pc)$/i,
    camelRe: /(-[a-z])/gi,
    opacityRe: /alpha\(opacity=(.*)\)/i,
    cssRe: /([a-z0-9-]+)\s*:\s*([^;\s]+(?:\s*[^;\s]+)*);?/gi,
    propertyCache: {},
    defaultUnit : "px",
    borders: {l: 'border-left-width', r: 'border-right-width', t: 'border-top-width', b: 'border-bottom-width'},
    paddings: {l: 'padding-left', r: 'padding-right', t: 'padding-top', b: 'padding-bottom'},
    margins: {l: 'margin-left', r: 'margin-right', t: 'margin-top', b: 'margin-bottom'},

    // Reference the prototype's version of the method. Signatures are identical.
    addUnits : Ext.Element.prototype.addUnits,

    /**
     * Parses a number or string representing margin sizes into an object. Supports CSS-style margin declarations
     * (e.g. 10, "10", "10 10", "10 10 10" and "10 10 10 10" are all valid options and would return the same result)
     * @static
     * @param {Number/String} box The encoded margins
     * @return {Object} An object with margin sizes for top, right, bottom and left
     */
    parseBox : function(box) {
        if (Ext.isObject(box)) {
            return {
                top: box.top || 0,
                right: box.right || 0,
                bottom: box.bottom || 0,
                left: box.left || 0
            };
        } else {
            if (typeof box != 'string') {
                box = box.toString();
            }
            var parts  = box.split(' '),
                ln = parts.length;
    
            if (ln == 1) {
                parts[1] = parts[2] = parts[3] = parts[0];
            }
            else if (ln == 2) {
                parts[2] = parts[0];
                parts[3] = parts[1];
            }
            else if (ln == 3) {
                parts[3] = parts[1];
            }
    
            return {
                top   :parseFloat(parts[0]) || 0,
                right :parseFloat(parts[1]) || 0,
                bottom:parseFloat(parts[2]) || 0,
                left  :parseFloat(parts[3]) || 0
            };
        }
        
    },
    
    /**
     * Parses a number or string representing margin sizes into an object. Supports CSS-style margin declarations
     * (e.g. 10, "10", "10 10", "10 10 10" and "10 10 10 10" are all valid options and would return the same result)
     * @static
     * @param {Number/String} box The encoded margins
     * @param {String} units The type of units to add
     * @return {String} An string with unitized (px if units is not specified) metrics for top, right, bottom and left
     */
    unitizeBox : function(box, units) {
        var A = this.addUnits,
            B = this.parseBox(box);
            
        return A(B.top, units) + ' ' +
               A(B.right, units) + ' ' +
               A(B.bottom, units) + ' ' +
               A(B.left, units);
        
    },

    // private
    camelReplaceFn : function(m, a) {
        return a.charAt(1).toUpperCase();
    },

    /**
     * Normalizes CSS property keys from dash delimited to camel case JavaScript Syntax.
     * For example:
     * <ul>
     *  <li>border-width -> borderWidth</li>
     *  <li>padding-top -> paddingTop</li>
     * </ul>
     * @static
     * @param {String} prop The property to normalize
     * @return {String} The normalized string
     */
    normalize : function(prop) {
        if (prop == 'float') {
            prop = Ext.supports.Float ? 'cssFloat' : 'styleFloat';
        }
        return this.propertyCache[prop] || (this.propertyCache[prop] = prop.replace(this.camelRe, this.camelReplaceFn));
    },

    /**
     * Retrieves the document height
     * @static
     * @return {Number} documentHeight
     */
    getDocumentHeight: function() {
        return Math.max(!Ext.isStrict ? document.body.scrollHeight : document.documentElement.scrollHeight, this.getViewportHeight());
    },

    /**
     * Retrieves the document width
     * @static
     * @return {Number} documentWidth
     */
    getDocumentWidth: function() {
        return Math.max(!Ext.isStrict ? document.body.scrollWidth : document.documentElement.scrollWidth, this.getViewportWidth());
    },

    /**
     * Retrieves the viewport height of the window.
     * @static
     * @return {Number} viewportHeight
     */
    getViewportHeight: function(){
        return window.innerHeight;
    },

    /**
     * Retrieves the viewport width of the window.
     * @static
     * @return {Number} viewportWidth
     */
    getViewportWidth : function() {
        return window.innerWidth;
    },

    /**
     * Retrieves the viewport size of the window.
     * @static
     * @return {Object} object containing width and height properties
     */
    getViewSize : function() {
        return {
            width: window.innerWidth,
            height: window.innerHeight
        };
    },

    /**
     * Retrieves the current orientation of the window. This is calculated by
     * determing if the height is greater than the width.
     * @static
     * @return {String} Orientation of window: 'portrait' or 'landscape'
     */
    getOrientation : function() {
        if (Ext.supports.OrientationChange) {
            return (window.orientation == 0) ? 'portrait' : 'landscape';
        }
        
        return (window.innerHeight > window.innerWidth) ? 'portrait' : 'landscape';
    },

    /** 
     * Returns the top Element that is located at the passed coordinates
     * @static
     * @param {Number} x The x coordinate
     * @param {Number} y The y coordinate
     * @return {String} The found Element
     */
    fromPoint: function(x, y) {
        return Ext.get(document.elementFromPoint(x, y));
    },
    
    /**
     * Converts a CSS string into an object with a property for each style.
     * <p>
     * The sample code below would return an object with 2 properties, one
     * for background-color and one for color.</p>
     * <pre><code>
var css = 'background-color: red;color: blue; ';
console.log(Ext.Element.parseStyles(css));
     * </code></pre>
     * @static
     * @param {String} styles A CSS string
     * @return {Object} styles
     */
    parseStyles: function(styles){
        var out = {},
            cssRe = this.cssRe,
            matches;
            
        if (styles) {
            // Since we're using the g flag on the regex, we need to set the lastIndex.
            // This automatically happens on some implementations, but not others, see:
            // http://stackoverflow.com/questions/2645273/javascript-regular-expression-literal-persists-between-function-calls
            // http://blog.stevenlevithan.com/archives/fixing-javascript-regexp
            cssRe.lastIndex = 0;
            while ((matches = cssRe.exec(styles))) {
                out[matches[1]] = matches[2];
            }
        }
        return out;
    }
});

/**
 * @class Ext.CompositeElementLite
 * <p>This class encapsulates a <i>collection</i> of DOM elements, providing methods to filter
 * members, or to perform collective actions upon the whole set.</p>
 * <p>Although they are not listed, this class supports all of the methods of {@link Ext.Element} and
 * {@link Ext.fx.Anim}. The methods from these classes will be performed on all the elements in this collection.</p>
 * Example:<pre><code>
var els = Ext.select("#some-el div.some-class");
// or select directly from an existing element
var el = Ext.get('some-el');
el.select('div.some-class');

els.setWidth(100); // all elements become 100 width
els.hide(true); // all elements fade out and hide
// or
els.setWidth(100).hide(true);
</code></pre>
 */
Ext.CompositeElementLite = function(els, root){
    /**
     * <p>The Array of DOM elements which this CompositeElement encapsulates. Read-only.</p>
     * <p>This will not <i>usually</i> be accessed in developers' code, but developers wishing
     * to augment the capabilities of the CompositeElementLite class may use it when adding
     * methods to the class.</p>
     * <p>For example to add the <code>nextAll</code> method to the class to <b>add</b> all
     * following siblings of selected elements, the code would be</p><code><pre>
Ext.override(Ext.CompositeElementLite, {
    nextAll: function() {
        var els = this.elements, i, l = els.length, n, r = [], ri = -1;

//      Loop through all elements in this Composite, accumulating
//      an Array of all siblings.
        for (i = 0; i < l; i++) {
            for (n = els[i].nextSibling; n; n = n.nextSibling) {
                r[++ri] = n;
            }
        }

//      Add all found siblings to this Composite
        return this.add(r);
    }
});</pre></code>
     * @property {HTMLElement} elements
     */
    this.elements = [];
    this.add(els, root);
    this.el = new Ext.Element.Flyweight();
};

Ext.CompositeElementLite.prototype = {
    isComposite: true,

    // private
    getElement : function(el){
        // Set the shared flyweight dom property to the current element
        var e = this.el;
        e.dom = el;
        e.id = el.id;
        return e;
    },

    // private
    transformElement : function(el){
        return Ext.getDom(el);
    },

    /**
     * Returns the number of elements in this Composite.
     * @return Number
     */
    getCount : function(){
        return this.elements.length;
    },
    /**
     * Adds elements to this Composite object.
     * @param {HTMLElement[]/Ext.CompositeElement} els Either an Array of DOM elements to add, or another Composite object who's elements should be added.
     * @return {Ext.CompositeElement} This Composite object.
     */
    add : function(els, root){
        var me = this,
            elements = me.elements;
        if(!els){
            return this;
        }
        if(typeof els == "string"){
            els = Ext.Element.selectorFunction(els, root);
        }else if(els.isComposite){
            els = els.elements;
        }else if(!Ext.isIterable(els)){
            els = [els];
        }

        for(var i = 0, len = els.length; i < len; ++i){
            elements.push(me.transformElement(els[i]));
        }
        return me;
    },

    invoke : function(fn, args){
        var me = this,
            els = me.elements,
            len = els.length,
            e,
            i;

        for(i = 0; i < len; i++) {
            e = els[i];
            if(e){
                Ext.Element.prototype[fn].apply(me.getElement(e), args);
            }
        }
        return me;
    },
    /**
     * Returns a flyweight Element of the dom element object at the specified index
     * @param {Number} index
     * @return {Ext.Element}
     */
    item : function(index){
        var me = this,
            el = me.elements[index],
            out = null;

        if(el){
            out = me.getElement(el);
        }
        return out;
    },

    // fixes scope with flyweight
    addListener : function(eventName, handler, scope, opt){
        var els = this.elements,
            len = els.length,
            i, e;

        for(i = 0; i<len; i++) {
            e = els[i];
            if(e) {
                Ext.EventManager.on(e, eventName, handler, scope || e, opt);
            }
        }
        return this;
    },
    /**
     * <p>Calls the passed function for each element in this composite.</p>
     * @param {Function} fn The function to call. The function is passed the following parameters:<ul>
     * <li><b>el</b> : Element<div class="sub-desc">The current Element in the iteration.
     * <b>This is the flyweight (shared) Ext.Element instance, so if you require a
     * a reference to the dom node, use el.dom.</b></div></li>
     * <li><b>c</b> : Composite<div class="sub-desc">This Composite object.</div></li>
     * <li><b>idx</b> : Number<div class="sub-desc">The zero-based index in the iteration.</div></li>
     * </ul>
     * @param {Object} [scope] The scope (<i>this</i> reference) in which the function is executed. (defaults to the Element)
     * @return {Ext.CompositeElement} this
     */
    each : function(fn, scope){
        var me = this,
            els = me.elements,
            len = els.length,
            i, e;

        for(i = 0; i<len; i++) {
            e = els[i];
            if(e){
                e = this.getElement(e);
                if(fn.call(scope || e, e, me, i) === false){
                    break;
                }
            }
        }
        return me;
    },

    /**
    * Clears this Composite and adds the elements passed.
    * @param {HTMLElement[]/Ext.CompositeElement} els Either an array of DOM elements, or another Composite from which to fill this Composite.
    * @return {Ext.CompositeElement} this
    */
    fill : function(els){
        var me = this;
        me.elements = [];
        me.add(els);
        return me;
    },

    /**
     * Filters this composite to only elements that match the passed selector.
     * @param {String/Function} selector A string CSS selector or a comparison function.
     * The comparison function will be called with the following arguments:<ul>
     * <li><code>el</code> : Ext.Element<div class="sub-desc">The current DOM element.</div></li>
     * <li><code>index</code> : Number<div class="sub-desc">The current index within the collection.</div></li>
     * </ul>
     * @return {Ext.CompositeElement} this
     */
    filter : function(selector){
        var els = [],
            me = this,
            fn = Ext.isFunction(selector) ? selector
                : function(el){
                    return el.is(selector);
                };

        me.each(function(el, self, i) {
            if (fn(el, i) !== false) {
                els[els.length] = me.transformElement(el);
            }
        });

        me.elements = els;
        return me;
    },

    /**
     * Find the index of the passed element within the composite collection.
     * @param el {Mixed} The id of an element, or an Ext.Element, or an HtmlElement to find within the composite collection.
     * @return Number The index of the passed Ext.Element in the composite collection, or -1 if not found.
     */
    indexOf : function(el){
        return Ext.Array.indexOf(this.elements, this.transformElement(el));
    },

    /**
    * Replaces the specified element with the passed element.
    * @param {String/HTMLElement/Ext.Element/Number} el The id of an element, the Element itself, the index of the element in this composite
    * to replace.
    * @param {String/Ext.Element} replacement The id of an element or the Element itself.
    * @param {Boolean} domReplace (Optional) True to remove and replace the element in the document too.
    * @return {Ext.CompositeElement} this
    */
    replaceElement : function(el, replacement, domReplace){
        var index = !isNaN(el) ? el : this.indexOf(el),
            d;
        if(index > -1){
            replacement = Ext.getDom(replacement);
            if(domReplace){
                d = this.elements[index];
                d.parentNode.insertBefore(replacement, d);
                Ext.removeNode(d);
            }
            Ext.Array.splice(this.elements, index, 1, replacement);
        }
        return this;
    },

    /**
     * Removes all elements.
     */
    clear : function(){
        this.elements = [];
    }
};

Ext.CompositeElementLite.prototype.on = Ext.CompositeElementLite.prototype.addListener;

/**
 * @private
 * Copies all of the functions from Ext.Element's prototype onto CompositeElementLite's prototype.
 * This is called twice - once immediately below, and once again after additional Ext.Element
 * are added in Ext JS
 */
Ext.CompositeElementLite.importElementMethods = function() {
    var fnName,
        ElProto = Ext.Element.prototype,
        CelProto = Ext.CompositeElementLite.prototype;

    for (fnName in ElProto) {
        if (typeof ElProto[fnName] == 'function'){
            (function(fnName) {
                CelProto[fnName] = CelProto[fnName] || function() {
                    return this.invoke(fnName, arguments);
                };
            }).call(CelProto, fnName);

        }
    }
};

Ext.CompositeElementLite.importElementMethods();

if(Ext.DomQuery){
    Ext.Element.selectorFunction = Ext.DomQuery.select;
}

/**
 * Selects elements based on the passed CSS selector to enable {@link Ext.Element Element} methods
 * to be applied to many related elements in one statement through the returned {@link Ext.CompositeElement CompositeElement} or
 * {@link Ext.CompositeElementLite CompositeElementLite} object.
 * @param {String/HTMLElement[]} selector The CSS selector or an array of elements
 * @param {HTMLElement/String} root (optional) The root element of the query or id of the root
 * @return {Ext.CompositeElementLite/Ext.CompositeElement}
 * @member Ext.Element
 * @method select
 */
Ext.Element.select = function(selector, root){
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
            root: root,
            msg: "Invalid selector specified: " + selector
        });
        //</debug>
    }
    return new Ext.CompositeElementLite(els);
};
/**
 * Selects elements based on the passed CSS selector to enable {@link Ext.Element Element} methods
 * to be applied to many related elements in one statement through the returned {@link Ext.CompositeElement CompositeElement} or
 * {@link Ext.CompositeElementLite CompositeElementLite} object.
 * @param {String/HTMLElement[]} selector The CSS selector or an array of elements
 * @param {HTMLElement/String} root (optional) The root element of the query or id of the root
 * @return {Ext.CompositeElementLite/Ext.CompositeElement}
 * @member Ext
 * @method select
 */
Ext.select = Ext.Element.select;

/**
 * @class Ext.util.DelayedTask
 * 
 * The DelayedTask class provides a convenient way to "buffer" the execution of a method,
 * performing setTimeout where a new timeout cancels the old timeout. When called, the
 * task will wait the specified time period before executing. If durng that time period,
 * the task is called again, the original call will be cancelled. This continues so that
 * the function is only called a single time for each iteration.
 * 
 * This method is especially useful for things like detecting whether a user has finished
 * typing in a text field. An example would be performing validation on a keypress. You can
 * use this class to buffer the keypress events for a certain number of milliseconds, and
 * perform only if they stop for that amount of time.  
 * 
 * ## Usage
 * 
 *     var task = new Ext.util.DelayedTask(function(){
 *         alert(Ext.getDom('myInputField').value.length);
 *     });
 *     
 *     // Wait 500ms before calling our function. If the user presses another key
 *     // during that 500ms, it will be cancelled and we'll wait another 500ms.
 *     Ext.get('myInputField').on('keypress', function(){
 *         task.{@link #delay}(500);
 *     });
 * 
 * Note that we are using a DelayedTask here to illustrate a point. The configuration
 * option `buffer` for {@link Ext.util.Observable#addListener addListener/on} will
 * also setup a delayed task for you to buffer events.
 * 
 * @constructor The parameters to this constructor serve as defaults and are not required.
 * @param {Function} fn (optional) The default function to call. If not specified here, it must be specified during the {@link #delay} call.
 * @param {Object} scope (optional) The default scope (The <code><b>this</b></code> reference) in which the
 * function is called. If not specified, <code>this</code> will refer to the browser window.
 * @param {Array} args (optional) The default Array of arguments.
 */
Ext.util.DelayedTask = function(fn, scope, args) {
    var me = this,
        id,
        call = function() {
            clearInterval(id);
            id = null;
            fn.apply(scope, args || []);
        };

    /**
     * Cancels any pending timeout and queues a new one
     * @param {Number} delay The milliseconds to delay
     * @param {Function} newFn (optional) Overrides function passed to constructor
     * @param {Object} newScope (optional) Overrides scope passed to constructor. Remember that if no scope
     * is specified, <code>this</code> will refer to the browser window.
     * @param {Array} newArgs (optional) Overrides args passed to constructor
     */
    this.delay = function(delay, newFn, newScope, newArgs) {
        me.cancel();
        fn = newFn || fn;
        scope = newScope || scope;
        args = newArgs || args;
        id = setInterval(call, delay);
    };

    /**
     * Cancel the last queued timeout
     */
    this.cancel = function(){
        if (id) {
            clearInterval(id);
            id = null;
        }
    };
};
Ext.require('Ext.util.DelayedTask', function() {

    Ext.util.Event = Ext.extend(Object, (function() {
        function createBuffered(handler, listener, o, scope) {
            listener.task = new Ext.util.DelayedTask();
            return function() {
                listener.task.delay(o.buffer, handler, scope, Ext.Array.toArray(arguments));
            };
        }

        function createDelayed(handler, listener, o, scope) {
            return function() {
                var task = new Ext.util.DelayedTask();
                if (!listener.tasks) {
                    listener.tasks = [];
                }
                listener.tasks.push(task);
                task.delay(o.delay || 10, handler, scope, Ext.Array.toArray(arguments));
            };
        }

        function createSingle(handler, listener, o, scope) {
            return function() {
                listener.ev.removeListener(listener.fn, scope);
                return handler.apply(scope, arguments);
            };
        }

        return {
            isEvent: true,

            constructor: function(observable, name) {
                this.name = name;
                this.observable = observable;
                this.listeners = [];
            },

            addListener: function(fn, scope, options) {
                var me = this,
                    listener;
                    scope = scope || me.observable;

                //<debug error>
                if (!fn) {
                    Ext.Error.raise({
                        sourceClass: Ext.getClassName(this.observable),
                        sourceMethod: "addListener",
                        msg: "The specified callback function is undefined"
                    });
                }
                //</debug>

                if (!me.isListening(fn, scope)) {
                    listener = me.createListener(fn, scope, options);
                    if (me.firing) {
                        // if we are currently firing this event, don't disturb the listener loop
                        me.listeners = me.listeners.slice(0);
                    }
                    me.listeners.push(listener);
                }
            },

            createListener: function(fn, scope, o) {
                o = o || {};
                scope = scope || this.observable;

                var listener = {
                        fn: fn,
                        scope: scope,
                        o: o,
                        ev: this
                    },
                    handler = fn;

                // The order is important. The 'single' wrapper must be wrapped by the 'buffer' and 'delayed' wrapper
                // because the event removal that the single listener does destroys the listener's DelayedTask(s)
                if (o.single) {
                    handler = createSingle(handler, listener, o, scope);
                }
                if (o.delay) {
                    handler = createDelayed(handler, listener, o, scope);
                }
                if (o.buffer) {
                    handler = createBuffered(handler, listener, o, scope);
                }

                listener.fireFn = handler;
                return listener;
            },

            findListener: function(fn, scope) {
                var listeners = this.listeners,
                i = listeners.length,
                listener,
                s;

                while (i--) {
                    listener = listeners[i];
                    if (listener) {
                        s = listener.scope;
                        if (listener.fn == fn && (s == scope || s == this.observable)) {
                            return i;
                        }
                    }
                }

                return - 1;
            },

            isListening: function(fn, scope) {
                return this.findListener(fn, scope) !== -1;
            },

            removeListener: function(fn, scope) {
                var me = this,
                    index,
                    listener,
                    k;
                index = me.findListener(fn, scope);
                if (index != -1) {
                    listener = me.listeners[index];

                    if (me.firing) {
                        me.listeners = me.listeners.slice(0);
                    }

                    // cancel and remove a buffered handler that hasn't fired yet
                    if (listener.task) {
                        listener.task.cancel();
                        delete listener.task;
                    }

                    // cancel and remove all delayed handlers that haven't fired yet
                    k = listener.tasks && listener.tasks.length;
                    if (k) {
                        while (k--) {
                            listener.tasks[k].cancel();
                        }
                        delete listener.tasks;
                    }

                    // remove this listener from the listeners array
                    Ext.Array.erase(me.listeners, index, 1);
                    return true;
                }

                return false;
            },

            // Iterate to stop any buffered/delayed events
            clearListeners: function() {
                var listeners = this.listeners,
                    i = listeners.length;

                while (i--) {
                    this.removeListener(listeners[i].fn, listeners[i].scope);
                }
            },

            fire: function() {
                var me = this,
                    listeners = me.listeners,
                    count = listeners.length,
                    i,
                    args,
                    listener;

                if (count > 0) {
                    me.firing = true;
                    for (i = 0; i < count; i++) {
                        listener = listeners[i];
                        args = arguments.length ? Array.prototype.slice.call(arguments, 0) : [];
                        if (listener.o) {
                            args.push(listener.o);
                        }
                        if (listener && listener.fireFn.apply(listener.scope || me.observable, args) === false) {
                            return (me.firing = false);
                        }
                    }
                }
                me.firing = false;
                return true;
            }
        };
    })());
});

/**
 * @class Ext.EventManager
 * Registers event handlers that want to receive a normalized EventObject instead of the standard browser event and provides
 * several useful events directly.
 * See {@link Ext.EventObject} for more details on normalized event objects.
 * @singleton
 */
Ext.EventManager = {

    // --------------------- onReady ---------------------

    /**
     * Check if we have bound our global onReady listener
     * @private
     */
    hasBoundOnReady: false,

    /**
     * Check if fireDocReady has been called
     * @private
     */
    hasFiredReady: false,

    /**
     * Timer for the document ready event in old IE versions
     * @private
     */
    readyTimeout: null,

    /**
     * Checks if we have bound an onreadystatechange event
     * @private
     */
    hasOnReadyStateChange: false,

    /**
     * Holds references to any onReady functions
     * @private
     */
    readyEvent: new Ext.util.Event(),

    /**
     * Check the ready state for old IE versions
     * @private
     * @return {Boolean} True if the document is ready
     */
    checkReadyState: function(){
        var me = Ext.EventManager;

        if(window.attachEvent){
            // See here for reference: http://javascript.nwbox.com/IEContentLoaded/
            // licensed courtesy of http://developer.yahoo.com/yui/license.html
            if (window != top) {
                return false;
            }
            try{
                document.documentElement.doScroll('left');
            }catch(e){
                return false;
            }
            me.fireDocReady();
            return true;
        }
        if (document.readyState == 'complete') {
            me.fireDocReady();
            return true;
        }
        me.readyTimeout = setTimeout(arguments.callee, 2);
        return false;
    },

    /**
     * Binds the appropriate browser event for checking if the DOM has loaded.
     * @private
     */
    bindReadyEvent: function(){
        var me = Ext.EventManager;
        if (me.hasBoundOnReady) {
            return;
        }

        if (document.addEventListener) {
            document.addEventListener('DOMContentLoaded', me.fireDocReady, false);
            // fallback, load will ~always~ fire
            window.addEventListener('load', me.fireDocReady, false);
        } else {
            // check if the document is ready, this will also kick off the scroll checking timer
            if (!me.checkReadyState()) {
                document.attachEvent('onreadystatechange', me.checkReadyState);
                me.hasOnReadyStateChange = true;
            }
            // fallback, onload will ~always~ fire
            window.attachEvent('onload', me.fireDocReady, false);
        }
        me.hasBoundOnReady = true;
    },

    /**
     * We know the document is loaded, so trigger any onReady events.
     * @private
     */
    fireDocReady: function(){
        var me = Ext.EventManager;

        // only unbind these events once
        if (!me.hasFiredReady) {
            me.hasFiredReady = true;

            if (document.addEventListener) {
                document.removeEventListener('DOMContentLoaded', me.fireDocReady, false);
                window.removeEventListener('load', me.fireDocReady, false);
            } else {
                if (me.readyTimeout !== null) {
                    clearTimeout(me.readyTimeout);
                }
                if (me.hasOnReadyStateChange) {
                    document.detachEvent('onreadystatechange', me.checkReadyState);
                }
                window.detachEvent('onload', me.fireDocReady);
            }
            Ext.supports.init();
        }
        if (!Ext.isReady) {
            Ext.isReady = true;
            me.onWindowUnload();
            me.readyEvent.fire();
        }
    },

    /**
     * Adds a listener to be notified when the document is ready (before onload and before images are loaded). Can be
     * accessed shorthanded as Ext.onReady().
     * @param {Function} fn The method the event invokes.
     * @param {Object} scope (optional) The scope (<code>this</code> reference) in which the handler function executes. Defaults to the browser window.
     * @param {Boolean} options (optional) Options object as passed to {@link Ext.Element#addListener}.
     */
    onDocumentReady: function(fn, scope, options){
        options = options || {};
        var me = Ext.EventManager,
            readyEvent = me.readyEvent;

        // force single to be true so our event is only ever fired once.
        options.single = true;

        // Document already loaded, let's just fire it
        if (Ext.isReady) {
            readyEvent.addListener(fn, scope, options);
            readyEvent.fire();
        } else {
            options.delay = options.delay || 1;
            readyEvent.addListener(fn, scope, options);
            me.bindReadyEvent();
        }
    },


    // --------------------- event binding ---------------------

    /**
     * Contains a list of all document mouse downs, so we can ensure they fire even when stopEvent is called.
     * @private
     */
    stoppedMouseDownEvent: new Ext.util.Event(),

    /**
     * Options to parse for the 4th argument to addListener.
     * @private
     */
    propRe: /^(?:scope|delay|buffer|single|stopEvent|preventDefault|stopPropagation|normalized|args|delegate|freezeEvent)$/,

    /**
     * Get the id of the element. If one has not been assigned, automatically assign it.
     * @param {HTMLElement/Ext.Element} element The element to get the id for.
     * @return {String} id
     */
    getId : function(element) {
        var skipGarbageCollection = false,
            id;

        element = Ext.getDom(element);

        if (element === document || element === window) {
            id = element === document ? Ext.documentId : Ext.windowId;
        }
        else {
            id = Ext.id(element);
        }
        // skip garbage collection for special elements (window, document, iframes)
        if (element && (element.getElementById || element.navigator)) {
            skipGarbageCollection = true;
        }

        if (!Ext.cache[id]){
            Ext.Element.addToCache(new Ext.Element(element), id);
            if (skipGarbageCollection) {
                Ext.cache[id].skipGarbageCollection = true;
            }
        }
        return id;
    },

    /**
     * Convert a "config style" listener into a set of flat arguments so they can be passed to addListener
     * @private
     * @param {Object} element The element the event is for
     * @param {Object} event The event configuration
     * @param {Object} isRemove True if a removal should be performed, otherwise an add will be done.
     */
    prepareListenerConfig: function(element, config, isRemove){
        var me = this,
            propRe = me.propRe,
            key, value, args;

        // loop over all the keys in the object
        for (key in config) {
            if (config.hasOwnProperty(key)) {
                // if the key is something else then an event option
                if (!propRe.test(key)) {
                    value = config[key];
                    // if the value is a function it must be something like click: function(){}, scope: this
                    // which means that there might be multiple event listeners with shared options
                    if (Ext.isFunction(value)) {
                        // shared options
                        args = [element, key, value, config.scope, config];
                    } else {
                        // if its not a function, it must be an object like click: {fn: function(){}, scope: this}
                        args = [element, key, value.fn, value.scope, value];
                    }

                    if (isRemove === true) {
                        me.removeListener.apply(this, args);
                    } else {
                        me.addListener.apply(me, args);
                    }
                }
            }
        }
    },

    /**
     * Normalize cross browser event differences
     * @private
     * @param {Object} eventName The event name
     * @param {Object} fn The function to execute
     * @return {Object} The new event name/function
     */
    normalizeEvent: function(eventName, fn){
        if (/mouseenter|mouseleave/.test(eventName) && !Ext.supports.MouseEnterLeave) {
            if (fn) {
                fn = Ext.Function.createInterceptor(fn, this.contains, this);
            }
            eventName = eventName == 'mouseenter' ? 'mouseover' : 'mouseout';
        } else if (eventName == 'mousewheel' && !Ext.supports.MouseWheel && !Ext.isOpera){
            eventName = 'DOMMouseScroll';
        }
        return {
            eventName: eventName,
            fn: fn
        };
    },

    /**
     * Checks whether the event's relatedTarget is contained inside (or <b>is</b>) the element.
     * @private
     * @param {Object} event
     */
    contains: function(event){
        var parent = event.browserEvent.currentTarget,
            child = this.getRelatedTarget(event);

        if (parent && parent.firstChild) {
            while (child) {
                if (child === parent) {
                    return false;
                }
                child = child.parentNode;
                if (child && (child.nodeType != 1)) {
                    child = null;
                }
            }
        }
        return true;
    },

    /**
    * Appends an event handler to an element.  The shorthand version {@link #on} is equivalent.  Typically you will
    * use {@link Ext.Element#addListener} directly on an Element in favor of calling this version.
    * @param {String/HTMLElement} el The html element or id to assign the event handler to.
    * @param {String} eventName The name of the event to listen for.
    * @param {Function} handler The handler function the event invokes. This function is passed
    * the following parameters:<ul>
    * <li>evt : EventObject<div class="sub-desc">The {@link Ext.EventObject EventObject} describing the event.</div></li>
    * <li>t : Element<div class="sub-desc">The {@link Ext.Element Element} which was the target of the event.
    * Note that this may be filtered by using the <tt>delegate</tt> option.</div></li>
    * <li>o : Object<div class="sub-desc">The options object from the addListener call.</div></li>
    * </ul>
    * @param {Object} scope (optional) The scope (<b><code>this</code></b> reference) in which the handler function is executed. <b>Defaults to the Element</b>.
    * @param {Object} options (optional) An object containing handler configuration properties.
    * This may contain any of the following properties:<ul>
    * <li>scope : Object<div class="sub-desc">The scope (<b><code>this</code></b> reference) in which the handler function is executed. <b>Defaults to the Element</b>.</div></li>
    * <li>delegate : String<div class="sub-desc">A simple selector to filter the target or look for a descendant of the target</div></li>
    * <li>stopEvent : Boolean<div class="sub-desc">True to stop the event. That is stop propagation, and prevent the default action.</div></li>
    * <li>preventDefault : Boolean<div class="sub-desc">True to prevent the default action</div></li>
    * <li>stopPropagation : Boolean<div class="sub-desc">True to prevent event propagation</div></li>
    * <li>normalized : Boolean<div class="sub-desc">False to pass a browser event to the handler function instead of an Ext.EventObject</div></li>
    * <li>delay : Number<div class="sub-desc">The number of milliseconds to delay the invocation of the handler after te event fires.</div></li>
    * <li>single : Boolean<div class="sub-desc">True to add a handler to handle just the next firing of the event, and then remove itself.</div></li>
    * <li>buffer : Number<div class="sub-desc">Causes the handler to be scheduled to run in an {@link Ext.util.DelayedTask} delayed
    * by the specified number of milliseconds. If the event fires again within that time, the original
    * handler is <em>not</em> invoked, but the new handler is scheduled in its place.</div></li>
    * <li>target : Element<div class="sub-desc">Only call the handler if the event was fired on the target Element, <i>not</i> if the event was bubbled up from a child node.</div></li>
    * </ul><br>
    * <p>See {@link Ext.Element#addListener} for examples of how to use these options.</p>
    */
    addListener: function(element, eventName, fn, scope, options){
        // Check if we've been passed a "config style" event.
        if (typeof eventName !== 'string') {
            this.prepareListenerConfig(element, eventName);
            return;
        }

        var dom = Ext.getDom(element),
            bind,
            wrap;

        //<debug>
        if (!dom){
            Ext.Error.raise({
                sourceClass: 'Ext.EventManager',
                sourceMethod: 'addListener',
                targetElement: element,
                eventName: eventName,
                msg: 'Error adding "' + eventName + '\" listener for nonexistent element "' + element + '"'
            });
        }
        if (!fn) {
            Ext.Error.raise({
                sourceClass: 'Ext.EventManager',
                sourceMethod: 'addListener',
                targetElement: element,
                eventName: eventName,
                msg: 'Error adding "' + eventName + '\" listener. The handler function is undefined.'
            });
        }
        //</debug>

        // create the wrapper function
        options = options || {};

        bind = this.normalizeEvent(eventName, fn);
        wrap = this.createListenerWrap(dom, eventName, bind.fn, scope, options);


        if (dom.attachEvent) {
            dom.attachEvent('on' + bind.eventName, wrap);
        } else {
            dom.addEventListener(bind.eventName, wrap, options.capture || false);
        }

        if (dom == document && eventName == 'mousedown') {
            this.stoppedMouseDownEvent.addListener(wrap);
        }

        // add all required data into the event cache
        this.getEventListenerCache(dom, eventName).push({
            fn: fn,
            wrap: wrap,
            scope: scope
        });
    },

    /**
    * Removes an event handler from an element.  The shorthand version {@link #un} is equivalent.  Typically
    * you will use {@link Ext.Element#removeListener} directly on an Element in favor of calling this version.
    * @param {String/HTMLElement} el The id or html element from which to remove the listener.
    * @param {String} eventName The name of the event.
    * @param {Function} fn The handler function to remove. <b>This must be a reference to the function passed into the {@link #addListener} call.</b>
    * @param {Object} scope If a scope (<b><code>this</code></b> reference) was specified when the listener was added,
    * then this must refer to the same object.
    */
    removeListener : function(element, eventName, fn, scope) {
        // handle our listener config object syntax
        if (typeof eventName !== 'string') {
            this.prepareListenerConfig(element, eventName, true);
            return;
        }

        var dom = Ext.getDom(element),
            cache = this.getEventListenerCache(dom, eventName),
            bindName = this.normalizeEvent(eventName).eventName,
            i = cache.length, j,
            listener, wrap, tasks;


        while (i--) {
            listener = cache[i];

            if (listener && (!fn || listener.fn == fn) && (!scope || listener.scope === scope)) {
                wrap = listener.wrap;

                // clear buffered calls
                if (wrap.task) {
                    clearTimeout(wrap.task);
                    delete wrap.task;
                }

                // clear delayed calls
                j = wrap.tasks && wrap.tasks.length;
                if (j) {
                    while (j--) {
                        clearTimeout(wrap.tasks[j]);
                    }
                    delete wrap.tasks;
                }

                if (dom.detachEvent) {
                    dom.detachEvent('on' + bindName, wrap);
                } else {
                    dom.removeEventListener(bindName, wrap, false);
                }

                if (wrap && dom == document && eventName == 'mousedown') {
                    this.stoppedMouseDownEvent.removeListener(wrap);
                }

                // remove listener from cache
                Ext.Array.erase(cache, i, 1);
            }
        }
    },

    /**
    * Removes all event handers from an element.  Typically you will use {@link Ext.Element#removeAllListeners}
    * directly on an Element in favor of calling this version.
    * @param {String/HTMLElement} el The id or html element from which to remove all event handlers.
    */
    removeAll : function(element){
        var dom = Ext.getDom(element),
            cache, ev;
        if (!dom) {
            return;
        }
        cache = this.getElementEventCache(dom);

        for (ev in cache) {
            if (cache.hasOwnProperty(ev)) {
                this.removeListener(dom, ev);
            }
        }
        Ext.cache[dom.id].events = {};
    },

    /**
     * Recursively removes all previous added listeners from an element and its children. Typically you will use {@link Ext.Element#purgeAllListeners}
     * directly on an Element in favor of calling this version.
     * @param {String/HTMLElement} el The id or html element from which to remove all event handlers.
     * @param {String} eventName (optional) The name of the event.
     */
    purgeElement : function(element, eventName) {
        var dom = Ext.getDom(element),
            i = 0, len;

        if(eventName) {
            this.removeListener(dom, eventName);
        }
        else {
            this.removeAll(dom);
        }

        if(dom && dom.childNodes) {
            for(len = element.childNodes.length; i < len; i++) {
                this.purgeElement(element.childNodes[i], eventName);
            }
        }
    },

    /**
     * Create the wrapper function for the event
     * @private
     * @param {HTMLElement} dom The dom element
     * @param {String} ename The event name
     * @param {Function} fn The function to execute
     * @param {Object} scope The scope to execute callback in
     * @param {Object} options The options
     * @return {Function} the wrapper function
     */
    createListenerWrap : function(dom, ename, fn, scope, options) {
        options = options || {};

        var f, gen;

        return function wrap(e, args) {
            // Compile the implementation upon first firing
            if (!gen) {
                f = ['if(!Ext) {return;}'];

                if(options.buffer || options.delay || options.freezeEvent) {
                    f.push('e = new Ext.EventObjectImpl(e, ' + (options.freezeEvent ? 'true' : 'false' ) + ');');
                } else {
                    f.push('e = Ext.EventObject.setEvent(e);');
                }

                if (options.delegate) {
                    f.push('var t = e.getTarget("' + options.delegate + '", this);');
                    f.push('if(!t) {return;}');
                } else {
                    f.push('var t = e.target;');
                }

                if (options.target) {
                    f.push('if(e.target !== options.target) {return;}');
                }

                if(options.stopEvent) {
                    f.push('e.stopEvent();');
                } else {
                    if(options.preventDefault) {
                        f.push('e.preventDefault();');
                    }
                    if(options.stopPropagation) {
                        f.push('e.stopPropagation();');
                    }
                }

                if(options.normalized === false) {
                    f.push('e = e.browserEvent;');
                }

                if(options.buffer) {
                    f.push('(wrap.task && clearTimeout(wrap.task));');
                    f.push('wrap.task = setTimeout(function(){');
                }

                if(options.delay) {
                    f.push('wrap.tasks = wrap.tasks || [];');
                    f.push('wrap.tasks.push(setTimeout(function(){');
                }

                // finally call the actual handler fn
                f.push('fn.call(scope || dom, e, t, options);');

                if(options.single) {
                    f.push('Ext.EventManager.removeListener(dom, ename, fn, scope);');
                }

                if(options.delay) {
                    f.push('}, ' + options.delay + '));');
                }

                if(options.buffer) {
                    f.push('}, ' + options.buffer + ');');
                }

                gen = Ext.functionFactory('e', 'options', 'fn', 'scope', 'ename', 'dom', 'wrap', 'args', f.join('\n'));
            }

            gen.call(dom, e, options, fn, scope, ename, dom, wrap, args);
        };
    },

    /**
     * Get the event cache for a particular element for a particular event
     * @private
     * @param {HTMLElement} element The element
     * @param {Object} eventName The event name
     * @return {Array} The events for the element
     */
    getEventListenerCache : function(element, eventName) {
        if (!element) {
            return [];
        }

        var eventCache = this.getElementEventCache(element);
        return eventCache[eventName] || (eventCache[eventName] = []);
    },

    /**
     * Gets the event cache for the object
     * @private
     * @param {HTMLElement} element The element
     * @return {Object} The event cache for the object
     */
    getElementEventCache : function(element) {
        if (!element) {
            return {};
        }
        var elementCache = Ext.cache[this.getId(element)];
        return elementCache.events || (elementCache.events = {});
    },

    // --------------------- utility methods ---------------------
    mouseLeaveRe: /(mouseout|mouseleave)/,
    mouseEnterRe: /(mouseover|mouseenter)/,

    /**
     * Stop the event (preventDefault and stopPropagation)
     * @param {Event} The event to stop
     */
    stopEvent: function(event) {
        this.stopPropagation(event);
        this.preventDefault(event);
    },

    /**
     * Cancels bubbling of the event.
     * @param {Event} The event to stop bubbling.
     */
    stopPropagation: function(event) {
        event = event.browserEvent || event;
        if (event.stopPropagation) {
            event.stopPropagation();
        } else {
            event.cancelBubble = true;
        }
    },

    /**
     * Prevents the browsers default handling of the event.
     * @param {Event} The event to prevent the default
     */
    preventDefault: function(event) {
        event = event.browserEvent || event;
        if (event.preventDefault) {
            event.preventDefault();
        } else {
            event.returnValue = false;
            // Some keys events require setting the keyCode to -1 to be prevented
            try {
              // all ctrl + X and F1 -> F12
              if (event.ctrlKey || event.keyCode > 111 && event.keyCode < 124) {
                  event.keyCode = -1;
              }
            } catch (e) {
                // see this outdated document http://support.microsoft.com/kb/934364/en-us for more info
            }
        }
    },

    /**
     * Gets the related target from the event.
     * @param {Object} event The event
     * @return {HTMLElement} The related target.
     */
    getRelatedTarget: function(event) {
        event = event.browserEvent || event;
        var target = event.relatedTarget;
        if (!target) {
            if (this.mouseLeaveRe.test(event.type)) {
                target = event.toElement;
            } else if (this.mouseEnterRe.test(event.type)) {
                target = event.fromElement;
            }
        }
        return this.resolveTextNode(target);
    },

    /**
     * Gets the x coordinate from the event
     * @param {Object} event The event
     * @return {Number} The x coordinate
     */
    getPageX: function(event) {
        return this.getXY(event)[0];
    },

    /**
     * Gets the y coordinate from the event
     * @param {Object} event The event
     * @return {Number} The y coordinate
     */
    getPageY: function(event) {
        return this.getXY(event)[1];
    },

    /**
     * Gets the x & y coordinate from the event
     * @param {Object} event The event
     * @return {Number[]} The x/y coordinate
     */
    getPageXY: function(event) {
        event = event.browserEvent || event;
        var x = event.pageX,
            y = event.pageY,
            doc = document.documentElement,
            body = document.body;

        // pageX/pageY not available (undefined, not null), use clientX/clientY instead
        if (!x && x !== 0) {
            x = event.clientX + (doc && doc.scrollLeft || body && body.scrollLeft || 0) - (doc && doc.clientLeft || body && body.clientLeft || 0);
            y = event.clientY + (doc && doc.scrollTop  || body && body.scrollTop  || 0) - (doc && doc.clientTop  || body && body.clientTop  || 0);
        }
        return [x, y];
    },

    /**
     * Gets the target of the event.
     * @param {Object} event The event
     * @return {HTMLElement} target
     */
    getTarget: function(event) {
        event = event.browserEvent || event;
        return this.resolveTextNode(event.target || event.srcElement);
    },

    /**
     * Resolve any text nodes accounting for browser differences.
     * @private
     * @param {HTMLElement} node The node
     * @return {HTMLElement} The resolved node
     */
    // technically no need to browser sniff this, however it makes no sense to check this every time, for every event, whether the string is equal.
    resolveTextNode: Ext.isGecko ?
        function(node) {
            if (!node) {
                return;
            }
            // work around firefox bug, https://bugzilla.mozilla.org/show_bug.cgi?id=101197
            var s = HTMLElement.prototype.toString.call(node);
            if (s == '[xpconnect wrapped native prototype]' || s == '[object XULElement]') {
                return;
            }
                return node.nodeType == 3 ? node.parentNode: node;
            }: function(node) {
                return node && node.nodeType == 3 ? node.parentNode: node;
            },

    // --------------------- custom event binding ---------------------

    // Keep track of the current width/height
    curWidth: 0,
    curHeight: 0,

    /**
     * Adds a listener to be notified when the browser window is resized and provides resize event buffering (100 milliseconds),
     * passes new viewport width and height to handlers.
     * @param {Function} fn      The handler function the window resize event invokes.
     * @param {Object}   scope   The scope (<code>this</code> reference) in which the handler function executes. Defaults to the browser window.
     * @param {Boolean}  options Options object as passed to {@link Ext.Element#addListener}
     */
    onWindowResize: function(fn, scope, options){
        var resize = this.resizeEvent;
        if(!resize){
            this.resizeEvent = resize = new Ext.util.Event();
            this.on(window, 'resize', this.fireResize, this, {buffer: 100});
        }
        resize.addListener(fn, scope, options);
    },

    /**
     * Fire the resize event.
     * @private
     */
    fireResize: function(){
        var me = this,
            w = Ext.Element.getViewWidth(),
            h = Ext.Element.getViewHeight();

         //whacky problem in IE where the resize event will sometimes fire even though the w/h are the same.
         if(me.curHeight != h || me.curWidth != w){
             me.curHeight = h;
             me.curWidth = w;
             me.resizeEvent.fire(w, h);
         }
    },

    /**
     * Removes the passed window resize listener.
     * @param {Function} fn        The method the event invokes
     * @param {Object}   scope    The scope of handler
     */
    removeResizeListener: function(fn, scope){
        if (this.resizeEvent) {
            this.resizeEvent.removeListener(fn, scope);
        }
    },

    onWindowUnload: function() {
        var unload = this.unloadEvent;
        if (!unload) {
            this.unloadEvent = unload = new Ext.util.Event();
            this.addListener(window, 'unload', this.fireUnload, this);
        }
    },

    /**
     * Fires the unload event for items bound with onWindowUnload
     * @private
     */
    fireUnload: function() {
        // wrap in a try catch, could have some problems during unload
        try {
            this.removeUnloadListener();
            // Work around FF3 remembering the last scroll position when refreshing the grid and then losing grid view
            if (Ext.isGecko3) {
                var gridviews = Ext.ComponentQuery.query('gridview'),
                    i = 0,
                    ln = gridviews.length;
                for (; i < ln; i++) {
                    gridviews[i].scrollToTop();
                }
            }
            // Purge all elements in the cache
            var el,
                cache = Ext.cache;
            for (el in cache) {
                if (cache.hasOwnProperty(el)) {
                    Ext.EventManager.removeAll(el);
                }
            }
        } catch(e) {
        }
    },

    /**
     * Removes the passed window unload listener.
     * @param {Function} fn        The method the event invokes
     * @param {Object}   scope    The scope of handler
     */
    removeUnloadListener: function(){
        if (this.unloadEvent) {
            this.removeListener(window, 'unload', this.fireUnload);
        }
    },

    /**
     * note 1: IE fires ONLY the keydown event on specialkey autorepeat
     * note 2: Safari < 3.1, Gecko (Mac/Linux) & Opera fire only the keypress event on specialkey autorepeat
     * (research done by Jan Wolter at http://unixpapa.com/js/key.html)
     * @private
     */
    useKeyDown: Ext.isWebKit ?
                   parseInt(navigator.userAgent.match(/AppleWebKit\/(\d+)/)[1], 10) >= 525 :
                   !((Ext.isGecko && !Ext.isWindows) || Ext.isOpera),

    /**
     * Indicates which event to use for getting key presses.
     * @return {String} The appropriate event name.
     */
    getKeyEvent: function(){
        return this.useKeyDown ? 'keydown' : 'keypress';
    }
};

/**
 * Alias for {@link Ext.Loader#onReady Ext.Loader.onReady} with withDomReady set to true
 * @member Ext
 * @method onReady
 */
Ext.onReady = function(fn, scope, options) {
    Ext.Loader.onReady(fn, scope, true, options);
};

/**
 * Alias for {@link Ext.EventManager#onDocumentReady Ext.EventManager.onDocumentReady}
 * @member Ext
 * @method onDocumentReady
 */
Ext.onDocumentReady = Ext.EventManager.onDocumentReady;

/**
 * Alias for {@link Ext.EventManager#addListener Ext.EventManager.addListener}
 * @member Ext.EventManager
 * @method on
 */
Ext.EventManager.on = Ext.EventManager.addListener;

/**
 * Alias for {@link Ext.EventManager#removeListener Ext.EventManager.removeListener}
 * @member Ext.EventManager
 * @method un
 */
Ext.EventManager.un = Ext.EventManager.removeListener;

(function(){
    var initExtCss = function() {
        // find the body element
        var bd = document.body || document.getElementsByTagName('body')[0],
            baseCSSPrefix = Ext.baseCSSPrefix,
            cls = [baseCSSPrefix + 'body'],
            htmlCls = [],
            html;

        if (!bd) {
            return false;
        }

        html = bd.parentNode;

        function add (c) {
            cls.push(baseCSSPrefix + c);
        }

        //Let's keep this human readable!
        if (Ext.isIE) {
            add('ie');

            // very often CSS needs to do checks like "IE7+" or "IE6 or 7". To help
            // reduce the clutter (since CSS/SCSS cannot do these tests), we add some
            // additional classes:
            //
            //      x-ie7p      : IE7+      :  7 <= ieVer
            //      x-ie7m      : IE7-      :  ieVer <= 7
            //      x-ie8p      : IE8+      :  8 <= ieVer
            //      x-ie8m      : IE8-      :  ieVer <= 8
            //      x-ie9p      : IE9+      :  9 <= ieVer
            //      x-ie78      : IE7 or 8  :  7 <= ieVer <= 8
            //
            if (Ext.isIE6) {
                add('ie6');
            } else { // ignore pre-IE6 :)
                add('ie7p');

                if (Ext.isIE7) {
                    add('ie7');
                } else {
                    add('ie8p');

                    if (Ext.isIE8) {
                        add('ie8');
                    } else {
                        add('ie9p');

                        if (Ext.isIE9) {
                            add('ie9');
                        }
                    }
                }
            }

            if (Ext.isIE6 || Ext.isIE7) {
                add('ie7m');
            }
            if (Ext.isIE6 || Ext.isIE7 || Ext.isIE8) {
                add('ie8m');
            }
            if (Ext.isIE7 || Ext.isIE8) {
                add('ie78');
            }
        }
        if (Ext.isGecko) {
            add('gecko');
            if (Ext.isGecko3) {
                add('gecko3');
            }
            if (Ext.isGecko4) {
                add('gecko4');
            }
            if (Ext.isGecko5) {
                add('gecko5');
            }
        }
        if (Ext.isOpera) {
            add('opera');
        }
        if (Ext.isWebKit) {
            add('webkit');
        }
        if (Ext.isSafari) {
            add('safari');
            if (Ext.isSafari2) {
                add('safari2');
            }
            if (Ext.isSafari3) {
                add('safari3');
            }
            if (Ext.isSafari4) {
                add('safari4');
            }
            if (Ext.isSafari5) {
                add('safari5');
            }
        }
        if (Ext.isChrome) {
            add('chrome');
        }
        if (Ext.isMac) {
            add('mac');
        }
        if (Ext.isLinux) {
            add('linux');
        }
        if (!Ext.supports.CSS3BorderRadius) {
            add('nbr');
        }
        if (!Ext.supports.CSS3LinearGradient) {
            add('nlg');
        }
        if (!Ext.scopeResetCSS) {
            add('reset');
        }

        // add to the parent to allow for selectors x-strict x-border-box, also set the isBorderBox property correctly
        if (html) {
            if (Ext.isStrict && (Ext.isIE6 || Ext.isIE7)) {
                Ext.isBorderBox = false;
            }
            else {
                Ext.isBorderBox = true;
            }

            htmlCls.push(baseCSSPrefix + (Ext.isBorderBox ? 'border-box' : 'strict'));
            if (!Ext.isStrict) {
                htmlCls.push(baseCSSPrefix + 'quirks');
            }
            Ext.fly(html, '_internal').addCls(htmlCls);
        }

        Ext.fly(bd, '_internal').addCls(cls);
        return true;
    };

    Ext.onReady(initExtCss);
})();

/**
 * @class Ext.EventObject

Just as {@link Ext.Element} wraps around a native DOM node, Ext.EventObject
wraps the browser's native event-object normalizing cross-browser differences,
such as which mouse button is clicked, keys pressed, mechanisms to stop
event-propagation along with a method to prevent default actions from taking place.

For example:

    function handleClick(e, t){ // e is not a standard event object, it is a Ext.EventObject
        e.preventDefault();
        var target = e.getTarget(); // same as t (the target HTMLElement)
        ...
    }

    var myDiv = {@link Ext#get Ext.get}("myDiv");  // get reference to an {@link Ext.Element}
    myDiv.on(         // 'on' is shorthand for addListener
        "click",      // perform an action on click of myDiv
        handleClick   // reference to the action handler
    );

    // other methods to do the same:
    Ext.EventManager.on("myDiv", 'click', handleClick);
    Ext.EventManager.addListener("myDiv", 'click', handleClick);

 * @singleton
 * @markdown
 */
Ext.define('Ext.EventObjectImpl', {
    uses: ['Ext.util.Point'],

    /** Key constant @type Number */
    BACKSPACE: 8,
    /** Key constant @type Number */
    TAB: 9,
    /** Key constant @type Number */
    NUM_CENTER: 12,
    /** Key constant @type Number */
    ENTER: 13,
    /** Key constant @type Number */
    RETURN: 13,
    /** Key constant @type Number */
    SHIFT: 16,
    /** Key constant @type Number */
    CTRL: 17,
    /** Key constant @type Number */
    ALT: 18,
    /** Key constant @type Number */
    PAUSE: 19,
    /** Key constant @type Number */
    CAPS_LOCK: 20,
    /** Key constant @type Number */
    ESC: 27,
    /** Key constant @type Number */
    SPACE: 32,
    /** Key constant @type Number */
    PAGE_UP: 33,
    /** Key constant @type Number */
    PAGE_DOWN: 34,
    /** Key constant @type Number */
    END: 35,
    /** Key constant @type Number */
    HOME: 36,
    /** Key constant @type Number */
    LEFT: 37,
    /** Key constant @type Number */
    UP: 38,
    /** Key constant @type Number */
    RIGHT: 39,
    /** Key constant @type Number */
    DOWN: 40,
    /** Key constant @type Number */
    PRINT_SCREEN: 44,
    /** Key constant @type Number */
    INSERT: 45,
    /** Key constant @type Number */
    DELETE: 46,
    /** Key constant @type Number */
    ZERO: 48,
    /** Key constant @type Number */
    ONE: 49,
    /** Key constant @type Number */
    TWO: 50,
    /** Key constant @type Number */
    THREE: 51,
    /** Key constant @type Number */
    FOUR: 52,
    /** Key constant @type Number */
    FIVE: 53,
    /** Key constant @type Number */
    SIX: 54,
    /** Key constant @type Number */
    SEVEN: 55,
    /** Key constant @type Number */
    EIGHT: 56,
    /** Key constant @type Number */
    NINE: 57,
    /** Key constant @type Number */
    A: 65,
    /** Key constant @type Number */
    B: 66,
    /** Key constant @type Number */
    C: 67,
    /** Key constant @type Number */
    D: 68,
    /** Key constant @type Number */
    E: 69,
    /** Key constant @type Number */
    F: 70,
    /** Key constant @type Number */
    G: 71,
    /** Key constant @type Number */
    H: 72,
    /** Key constant @type Number */
    I: 73,
    /** Key constant @type Number */
    J: 74,
    /** Key constant @type Number */
    K: 75,
    /** Key constant @type Number */
    L: 76,
    /** Key constant @type Number */
    M: 77,
    /** Key constant @type Number */
    N: 78,
    /** Key constant @type Number */
    O: 79,
    /** Key constant @type Number */
    P: 80,
    /** Key constant @type Number */
    Q: 81,
    /** Key constant @type Number */
    R: 82,
    /** Key constant @type Number */
    S: 83,
    /** Key constant @type Number */
    T: 84,
    /** Key constant @type Number */
    U: 85,
    /** Key constant @type Number */
    V: 86,
    /** Key constant @type Number */
    W: 87,
    /** Key constant @type Number */
    X: 88,
    /** Key constant @type Number */
    Y: 89,
    /** Key constant @type Number */
    Z: 90,
    /** Key constant @type Number */
    CONTEXT_MENU: 93,
    /** Key constant @type Number */
    NUM_ZERO: 96,
    /** Key constant @type Number */
    NUM_ONE: 97,
    /** Key constant @type Number */
    NUM_TWO: 98,
    /** Key constant @type Number */
    NUM_THREE: 99,
    /** Key constant @type Number */
    NUM_FOUR: 100,
    /** Key constant @type Number */
    NUM_FIVE: 101,
    /** Key constant @type Number */
    NUM_SIX: 102,
    /** Key constant @type Number */
    NUM_SEVEN: 103,
    /** Key constant @type Number */
    NUM_EIGHT: 104,
    /** Key constant @type Number */
    NUM_NINE: 105,
    /** Key constant @type Number */
    NUM_MULTIPLY: 106,
    /** Key constant @type Number */
    NUM_PLUS: 107,
    /** Key constant @type Number */
    NUM_MINUS: 109,
    /** Key constant @type Number */
    NUM_PERIOD: 110,
    /** Key constant @type Number */
    NUM_DIVISION: 111,
    /** Key constant @type Number */
    F1: 112,
    /** Key constant @type Number */
    F2: 113,
    /** Key constant @type Number */
    F3: 114,
    /** Key constant @type Number */
    F4: 115,
    /** Key constant @type Number */
    F5: 116,
    /** Key constant @type Number */
    F6: 117,
    /** Key constant @type Number */
    F7: 118,
    /** Key constant @type Number */
    F8: 119,
    /** Key constant @type Number */
    F9: 120,
    /** Key constant @type Number */
    F10: 121,
    /** Key constant @type Number */
    F11: 122,
    /** Key constant @type Number */
    F12: 123,
    /**
     * The mouse wheel delta scaling factor. This value depends on browser version and OS and
     * attempts to produce a similar scrolling experience across all platforms and browsers.
     *
     * To change this value:
     *
     *      Ext.EventObjectImpl.prototype.WHEEL_SCALE = 72;
     *
     * @type Number
     * @markdown
     */
    WHEEL_SCALE: (function () {
        var scale;

        if (Ext.isGecko) {
            // Firefox uses 3 on all platforms
            scale = 3;
        } else if (Ext.isMac) {
            // Continuous scrolling devices have momentum and produce much more scroll than
            // discrete devices on the same OS and browser. To make things exciting, Safari
            // (and not Chrome) changed from small values to 120 (like IE).

            if (Ext.isSafari && Ext.webKitVersion >= 532.0) {
                // Safari changed the scrolling factor to match IE (for details see
                // https://bugs.webkit.org/show_bug.cgi?id=24368). The WebKit version where this
                // change was introduced was 532.0
                //      Detailed discussion:
                //      https://bugs.webkit.org/show_bug.cgi?id=29601
                //      http://trac.webkit.org/browser/trunk/WebKit/chromium/src/mac/WebInputEventFactory.mm#L1063
                scale = 120;
            } else {
                // MS optical wheel mouse produces multiples of 12 which is close enough
                // to help tame the speed of the continuous mice...
                scale = 12;
            }

            // Momentum scrolling produces very fast scrolling, so increase the scale factor
            // to help produce similar results cross platform. This could be even larger and
            // it would help those mice, but other mice would become almost unusable as a
            // result (since we cannot tell which device type is in use).
            scale *= 3;
        } else {
            // IE, Opera and other Windows browsers use 120.
            scale = 120;
        }

        return scale;
    })(),

    /**
     * Simple click regex
     * @private
     */
    clickRe: /(dbl)?click/,
    // safari keypress events for special keys return bad keycodes
    safariKeys: {
        3: 13, // enter
        63234: 37, // left
        63235: 39, // right
        63232: 38, // up
        63233: 40, // down
        63276: 33, // page up
        63277: 34, // page down
        63272: 46, // delete
        63273: 36, // home
        63275: 35 // end
    },
    // normalize button clicks, don't see any way to feature detect this.
    btnMap: Ext.isIE ? {
        1: 0,
        4: 1,
        2: 2
    } : {
        0: 0,
        1: 1,
        2: 2
    },

    constructor: function(event, freezeEvent){
        if (event) {
            this.setEvent(event.browserEvent || event, freezeEvent);
        }
    },

    setEvent: function(event, freezeEvent){
        var me = this, button, options;

        if (event == me || (event && event.browserEvent)) { // already wrapped
            return event;
        }
        me.browserEvent = event;
        if (event) {
            // normalize buttons
            button = event.button ? me.btnMap[event.button] : (event.which ? event.which - 1 : -1);
            if (me.clickRe.test(event.type) && button == -1) {
                button = 0;
            }
            options = {
                type: event.type,
                button: button,
                shiftKey: event.shiftKey,
                // mac metaKey behaves like ctrlKey
                ctrlKey: event.ctrlKey || event.metaKey || false,
                altKey: event.altKey,
                // in getKey these will be normalized for the mac
                keyCode: event.keyCode,
                charCode: event.charCode,
                // cache the targets for the delayed and or buffered events
                target: Ext.EventManager.getTarget(event),
                relatedTarget: Ext.EventManager.getRelatedTarget(event),
                currentTarget: event.currentTarget,
                xy: (freezeEvent ? me.getXY() : null)
            };
        } else {
            options = {
                button: -1,
                shiftKey: false,
                ctrlKey: false,
                altKey: false,
                keyCode: 0,
                charCode: 0,
                target: null,
                xy: [0, 0]
            };
        }
        Ext.apply(me, options);
        return me;
    },

    /**
     * Stop the event (preventDefault and stopPropagation)
     */
    stopEvent: function(){
        this.stopPropagation();
        this.preventDefault();
    },

    /**
     * Prevents the browsers default handling of the event.
     */
    preventDefault: function(){
        if (this.browserEvent) {
            Ext.EventManager.preventDefault(this.browserEvent);
        }
    },

    /**
     * Cancels bubbling of the event.
     */
    stopPropagation: function(){
        var browserEvent = this.browserEvent;

        if (browserEvent) {
            if (browserEvent.type == 'mousedown') {
                Ext.EventManager.stoppedMouseDownEvent.fire(this);
            }
            Ext.EventManager.stopPropagation(browserEvent);
        }
    },

    /**
     * Gets the character code for the event.
     * @return {Number}
     */
    getCharCode: function(){
        return this.charCode || this.keyCode;
    },

    /**
     * Returns a normalized keyCode for the event.
     * @return {Number} The key code
     */
    getKey: function(){
        return this.normalizeKey(this.keyCode || this.charCode);
    },

    /**
     * Normalize key codes across browsers
     * @private
     * @param {Number} key The key code
     * @return {Number} The normalized code
     */
    normalizeKey: function(key){
        // can't feature detect this
        return Ext.isWebKit ? (this.safariKeys[key] || key) : key;
    },

    /**
     * Gets the x coordinate of the event.
     * @return {Number}
     * @deprecated 4.0 Replaced by {@link #getX}
     */
    getPageX: function(){
        return this.getX();
    },

    /**
     * Gets the y coordinate of the event.
     * @return {Number}
     * @deprecated 4.0 Replaced by {@link #getY}
     */
    getPageY: function(){
        return this.getY();
    },

    /**
     * Gets the x coordinate of the event.
     * @return {Number}
     */
    getX: function() {
        return this.getXY()[0];
    },

    /**
     * Gets the y coordinate of the event.
     * @return {Number}
     */
    getY: function() {
        return this.getXY()[1];
    },

    /**
     * Gets the page coordinates of the event.
     * @return {Number[]} The xy values like [x, y]
     */
    getXY: function() {
        if (!this.xy) {
            // same for XY
            this.xy = Ext.EventManager.getPageXY(this.browserEvent);
        }
        return this.xy;
    },

    /**
     * Gets the target for the event.
     * @param {String} selector (optional) A simple selector to filter the target or look for an ancestor of the target
     * @param {Number/HTMLElement} maxDepth (optional) The max depth to search as a number or element (defaults to 10 || document.body)
     * @param {Boolean} returnEl (optional) True to return a Ext.Element object instead of DOM node
     * @return {HTMLElement}
     */
    getTarget : function(selector, maxDepth, returnEl){
        if (selector) {
            return Ext.fly(this.target).findParent(selector, maxDepth, returnEl);
        }
        return returnEl ? Ext.get(this.target) : this.target;
    },

    /**
     * Gets the related target.
     * @param {String} selector (optional) A simple selector to filter the target or look for an ancestor of the target
     * @param {Number/HTMLElement} maxDepth (optional) The max depth to search as a number or element (defaults to 10 || document.body)
     * @param {Boolean} returnEl (optional) True to return a Ext.Element object instead of DOM node
     * @return {HTMLElement}
     */
    getRelatedTarget : function(selector, maxDepth, returnEl){
        if (selector) {
            return Ext.fly(this.relatedTarget).findParent(selector, maxDepth, returnEl);
        }
        return returnEl ? Ext.get(this.relatedTarget) : this.relatedTarget;
    },

    /**
     * Correctly scales a given wheel delta.
     * @param {Number} delta The delta value.
     */
    correctWheelDelta : function (delta) {
        var scale = this.WHEEL_SCALE,
            ret = Math.round(delta / scale);

        if (!ret && delta) {
            ret = (delta < 0) ? -1 : 1; // don't allow non-zero deltas to go to zero!
        }

        return ret;
    },

    /**
     * Returns the mouse wheel deltas for this event.
     * @return {Object} An object with "x" and "y" properties holding the mouse wheel deltas.
     */
    getWheelDeltas : function () {
        var me = this,
            event = me.browserEvent,
            dx = 0, dy = 0; // the deltas

        if (Ext.isDefined(event.wheelDeltaX)) { // WebKit has both dimensions
            dx = event.wheelDeltaX;
            dy = event.wheelDeltaY;
        } else if (event.wheelDelta) { // old WebKit and IE
            dy = event.wheelDelta;
        } else if (event.detail) { // Gecko
            dy = -event.detail; // gecko is backwards

            // Gecko sometimes returns really big values if the user changes settings to
            // scroll a whole page per scroll
            if (dy > 100) {
                dy = 3;
            } else if (dy < -100) {
                dy = -3;
            }

            // Firefox 3.1 adds an axis field to the event to indicate direction of
            // scroll.  See https://developer.mozilla.org/en/Gecko-Specific_DOM_Events
            if (Ext.isDefined(event.axis) && event.axis === event.HORIZONTAL_AXIS) {
                dx = dy;
                dy = 0;
            }
        }

        return {
            x: me.correctWheelDelta(dx),
            y: me.correctWheelDelta(dy)
        };
    },

    /**
     * Normalizes mouse wheel y-delta across browsers. To get x-delta information, use
     * {@link #getWheelDeltas} instead.
     * @return {Number} The mouse wheel y-delta
     */
    getWheelDelta : function(){
        var deltas = this.getWheelDeltas();

        return deltas.y;
    },

    /**
     * Returns true if the target of this event is a child of el.  Unless the allowEl parameter is set, it will return false if if the target is el.
     * Example usage:<pre><code>
// Handle click on any child of an element
Ext.getBody().on('click', function(e){
    if(e.within('some-el')){
        alert('Clicked on a child of some-el!');
    }
});

// Handle click directly on an element, ignoring clicks on child nodes
Ext.getBody().on('click', function(e,t){
    if((t.id == 'some-el') && !e.within(t, true)){
        alert('Clicked directly on some-el!');
    }
});
</code></pre>
     * @param {String/HTMLElement/Ext.Element} el The id, DOM element or Ext.Element to check
     * @param {Boolean} related (optional) true to test if the related target is within el instead of the target
     * @param {Boolean} allowEl (optional) true to also check if the passed element is the target or related target
     * @return {Boolean}
     */
    within : function(el, related, allowEl){
        if(el){
            var t = related ? this.getRelatedTarget() : this.getTarget(),
                result;

            if (t) {
                result = Ext.fly(el).contains(t);
                if (!result && allowEl) {
                    result = t == Ext.getDom(el);
                }
                return result;
            }
        }
        return false;
    },

    /**
     * Checks if the key pressed was a "navigation" key
     * @return {Boolean} True if the press is a navigation keypress
     */
    isNavKeyPress : function(){
        var me = this,
            k = this.normalizeKey(me.keyCode);

       return (k >= 33 && k <= 40) ||  // Page Up/Down, End, Home, Left, Up, Right, Down
       k == me.RETURN ||
       k == me.TAB ||
       k == me.ESC;
    },

    /**
     * Checks if the key pressed was a "special" key
     * @return {Boolean} True if the press is a special keypress
     */
    isSpecialKey : function(){
        var k = this.normalizeKey(this.keyCode);
        return (this.type == 'keypress' && this.ctrlKey) ||
        this.isNavKeyPress() ||
        (k == this.BACKSPACE) || // Backspace
        (k >= 16 && k <= 20) || // Shift, Ctrl, Alt, Pause, Caps Lock
        (k >= 44 && k <= 46);   // Print Screen, Insert, Delete
    },

    /**
     * Returns a point object that consists of the object coordinates.
     * @return {Ext.util.Point} point
     */
    getPoint : function(){
        var xy = this.getXY();
        return Ext.create('Ext.util.Point', xy[0], xy[1]);
    },

   /**
    * Returns true if the control, meta, shift or alt key was pressed during this event.
    * @return {Boolean}
    */
    hasModifier : function(){
        return this.ctrlKey || this.altKey || this.shiftKey || this.metaKey;
    },

    /**
     * Injects a DOM event using the data in this object and (optionally) a new target.
     * This is a low-level technique and not likely to be used by application code. The
     * currently supported event types are:
     * <p><b>HTMLEvents</b></p>
     * <ul>
     * <li>load</li>
     * <li>unload</li>
     * <li>select</li>
     * <li>change</li>
     * <li>submit</li>
     * <li>reset</li>
     * <li>resize</li>
     * <li>scroll</li>
     * </ul>
     * <p><b>MouseEvents</b></p>
     * <ul>
     * <li>click</li>
     * <li>dblclick</li>
     * <li>mousedown</li>
     * <li>mouseup</li>
     * <li>mouseover</li>
     * <li>mousemove</li>
     * <li>mouseout</li>
     * </ul>
     * <p><b>UIEvents</b></p>
     * <ul>
     * <li>focusin</li>
     * <li>focusout</li>
     * <li>activate</li>
     * <li>focus</li>
     * <li>blur</li>
     * </ul>
     * @param {Ext.Element/HTMLElement} target (optional) If specified, the target for the event. This
     * is likely to be used when relaying a DOM event. If not specified, {@link #getTarget}
     * is used to determine the target.
     */
    injectEvent: function () {
        var API,
            dispatchers = {}; // keyed by event type (e.g., 'mousedown')

        // Good reference: http://developer.yahoo.com/yui/docs/UserAction.js.html

        // IE9 has createEvent, but this code causes major problems with htmleditor (it
        // blocks all mouse events and maybe more). TODO

        if (!Ext.isIE && document.createEvent) { // if (DOM compliant)
            API = {
                createHtmlEvent: function (doc, type, bubbles, cancelable) {
                    var event = doc.createEvent('HTMLEvents');

                    event.initEvent(type, bubbles, cancelable);
                    return event;
                },

                createMouseEvent: function (doc, type, bubbles, cancelable, detail,
                                            clientX, clientY, ctrlKey, altKey, shiftKey, metaKey,
                                            button, relatedTarget) {
                    var event = doc.createEvent('MouseEvents'),
                        view = doc.defaultView || window;

                    if (event.initMouseEvent) {
                        event.initMouseEvent(type, bubbles, cancelable, view, detail,
                                    clientX, clientY, clientX, clientY, ctrlKey, altKey,
                                    shiftKey, metaKey, button, relatedTarget);
                    } else { // old Safari
                        event = doc.createEvent('UIEvents');
                        event.initEvent(type, bubbles, cancelable);
                        event.view = view;
                        event.detail = detail;
                        event.screenX = clientX;
                        event.screenY = clientY;
                        event.clientX = clientX;
                        event.clientY = clientY;
                        event.ctrlKey = ctrlKey;
                        event.altKey = altKey;
                        event.metaKey = metaKey;
                        event.shiftKey = shiftKey;
                        event.button = button;
                        event.relatedTarget = relatedTarget;
                    }

                    return event;
                },

                createUIEvent: function (doc, type, bubbles, cancelable, detail) {
                    var event = doc.createEvent('UIEvents'),
                        view = doc.defaultView || window;

                    event.initUIEvent(type, bubbles, cancelable, view, detail);
                    return event;
                },

                fireEvent: function (target, type, event) {
                    target.dispatchEvent(event);
                },

                fixTarget: function (target) {
                    // Safari3 doesn't have window.dispatchEvent()
                    if (target == window && !target.dispatchEvent) {
                        return document;
                    }

                    return target;
                }
            };
        } else if (document.createEventObject) { // else if (IE)
            var crazyIEButtons = { 0: 1, 1: 4, 2: 2 };

            API = {
                createHtmlEvent: function (doc, type, bubbles, cancelable) {
                    var event = doc.createEventObject();
                    event.bubbles = bubbles;
                    event.cancelable = cancelable;
                    return event;
                },

                createMouseEvent: function (doc, type, bubbles, cancelable, detail,
                                            clientX, clientY, ctrlKey, altKey, shiftKey, metaKey,
                                            button, relatedTarget) {
                    var event = doc.createEventObject();
                    event.bubbles = bubbles;
                    event.cancelable = cancelable;
                    event.detail = detail;
                    event.screenX = clientX;
                    event.screenY = clientY;
                    event.clientX = clientX;
                    event.clientY = clientY;
                    event.ctrlKey = ctrlKey;
                    event.altKey = altKey;
                    event.shiftKey = shiftKey;
                    event.metaKey = metaKey;
                    event.button = crazyIEButtons[button] || button;
                    event.relatedTarget = relatedTarget; // cannot assign to/fromElement
                    return event;
                },

                createUIEvent: function (doc, type, bubbles, cancelable, detail) {
                    var event = doc.createEventObject();
                    event.bubbles = bubbles;
                    event.cancelable = cancelable;
                    return event;
                },

                fireEvent: function (target, type, event) {
                    target.fireEvent('on' + type, event);
                },

                fixTarget: function (target) {
                    if (target == document) {
                        // IE6,IE7 thinks window==document and doesn't have window.fireEvent()
                        // IE6,IE7 cannot properly call document.fireEvent()
                        return document.documentElement;
                    }

                    return target;
                }
            };
        }

        //----------------
        // HTMLEvents

        Ext.Object.each({
                load:   [false, false],
                unload: [false, false],
                select: [true, false],
                change: [true, false],
                submit: [true, true],
                reset:  [true, false],
                resize: [true, false],
                scroll: [true, false]
            },
            function (name, value) {
                var bubbles = value[0], cancelable = value[1];
                dispatchers[name] = function (targetEl, srcEvent) {
                    var e = API.createHtmlEvent(name, bubbles, cancelable);
                    API.fireEvent(targetEl, name, e);
                };
            });

        //----------------
        // MouseEvents

        function createMouseEventDispatcher (type, detail) {
            var cancelable = (type != 'mousemove');
            return function (targetEl, srcEvent) {
                var xy = srcEvent.getXY(),
                    e = API.createMouseEvent(targetEl.ownerDocument, type, true, cancelable,
                                detail, xy[0], xy[1], srcEvent.ctrlKey, srcEvent.altKey,
                                srcEvent.shiftKey, srcEvent.metaKey, srcEvent.button,
                                srcEvent.relatedTarget);
                API.fireEvent(targetEl, type, e);
            };
        }

        Ext.each(['click', 'dblclick', 'mousedown', 'mouseup', 'mouseover', 'mousemove', 'mouseout'],
            function (eventName) {
                dispatchers[eventName] = createMouseEventDispatcher(eventName, 1);
            });

        //----------------
        // UIEvents

        Ext.Object.each({
                focusin:  [true, false],
                focusout: [true, false],
                activate: [true, true],
                focus:    [false, false],
                blur:     [false, false]
            },
            function (name, value) {
                var bubbles = value[0], cancelable = value[1];
                dispatchers[name] = function (targetEl, srcEvent) {
                    var e = API.createUIEvent(targetEl.ownerDocument, name, bubbles, cancelable, 1);
                    API.fireEvent(targetEl, name, e);
                };
            });

        //---------
        if (!API) {
            // not even sure what ancient browsers fall into this category...

            dispatchers = {}; // never mind all those we just built :P

            API = {
                fixTarget: function (t) {
                    return t;
                }
            };
        }

        function cannotInject (target, srcEvent) {
            //<debug>
            // TODO log something
            //</debug>
        }

        return function (target) {
            var me = this,
                dispatcher = dispatchers[me.type] || cannotInject,
                t = target ? (target.dom || target) : me.getTarget();

            t = API.fixTarget(t);
            dispatcher(t, me);
        };
    }() // call to produce method

}, function() {

Ext.EventObject = new Ext.EventObjectImpl();

});


/**
 * @class Ext.Element
 */
(function(){
    var doc = document,
        activeElement = null,
        isCSS1 = doc.compatMode == "CSS1Compat",
        ELEMENT = Ext.Element,
        fly = function(el){
            if (!_fly) {
                _fly = new Ext.Element.Flyweight();
            }
            _fly.dom = el;
            return _fly;
        }, _fly;

    // If the browser does not support document.activeElement we need some assistance.
    // This covers old Safari 3.2 (4.0 added activeElement along with just about all
    // other browsers). We need this support to handle issues with old Safari.
    if (!('activeElement' in doc) && doc.addEventListener) {
        doc.addEventListener('focus',
            function (ev) {
                if (ev && ev.target) {
                    activeElement = (ev.target == doc) ? null : ev.target;
                }
            }, true);
    }

    /*
     * Helper function to create the function that will restore the selection.
     */
    function makeSelectionRestoreFn (activeEl, start, end) {
        return function () {
            activeEl.selectionStart = start;
            activeEl.selectionEnd = end;
        };
    }

    Ext.apply(ELEMENT, {
        isAncestor : function(p, c) {
            var ret = false;

            p = Ext.getDom(p);
            c = Ext.getDom(c);
            if (p && c) {
                if (p.contains) {
                    return p.contains(c);
                } else if (p.compareDocumentPosition) {
                    return !!(p.compareDocumentPosition(c) & 16);
                } else {
                    while ((c = c.parentNode)) {
                        ret = c == p || ret;
                    }
                }
            }
            return ret;
        },

        /**
         * Returns the active element in the DOM. If the browser supports activeElement
         * on the document, this is returned. If not, the focus is tracked and the active
         * element is maintained internally.
         * @return {HTMLElement} The active (focused) element in the document.
         */
        getActiveElement: function () {
            return doc.activeElement || activeElement;
        },

        /**
         * Creates a function to call to clean up problems with the work-around for the
         * WebKit RightMargin bug. The work-around is to add "display: 'inline-block'" to
         * the element before calling getComputedStyle and then to restore its original
         * display value. The problem with this is that it corrupts the selection of an
         * INPUT or TEXTAREA element (as in the "I-beam" goes away but ths focus remains).
         * To cleanup after this, we need to capture the selection of any such element and
         * then restore it after we have restored the display style.
         *
         * @param target {Element} The top-most element being adjusted.
         * @private
         */
        getRightMarginFixCleaner: function (target) {
            var supports = Ext.supports,
                hasInputBug = supports.DisplayChangeInputSelectionBug,
                hasTextAreaBug = supports.DisplayChangeTextAreaSelectionBug;

            if (hasInputBug || hasTextAreaBug) {
                var activeEl = doc.activeElement || activeElement, // save a call
                    tag = activeEl && activeEl.tagName,
                    start,
                    end;

                if ((hasTextAreaBug && tag == 'TEXTAREA') ||
                    (hasInputBug && tag == 'INPUT' && activeEl.type == 'text')) {
                    if (ELEMENT.isAncestor(target, activeEl)) {
                        start = activeEl.selectionStart;
                        end = activeEl.selectionEnd;

                        if (Ext.isNumber(start) && Ext.isNumber(end)) { // to be safe...
                            // We don't create the raw closure here inline because that
                            // will be costly even if we don't want to return it (nested
                            // function decls and exprs are often instantiated on entry
                            // regardless of whether execution ever reaches them):
                            return makeSelectionRestoreFn(activeEl, start, end);
                        }
                    }
                }
            }

            return Ext.emptyFn; // avoid special cases, just return a nop
        },

        getViewWidth : function(full) {
            return full ? ELEMENT.getDocumentWidth() : ELEMENT.getViewportWidth();
        },

        getViewHeight : function(full) {
            return full ? ELEMENT.getDocumentHeight() : ELEMENT.getViewportHeight();
        },

        getDocumentHeight: function() {
            return Math.max(!isCSS1 ? doc.body.scrollHeight : doc.documentElement.scrollHeight, ELEMENT.getViewportHeight());
        },

        getDocumentWidth: function() {
            return Math.max(!isCSS1 ? doc.body.scrollWidth : doc.documentElement.scrollWidth, ELEMENT.getViewportWidth());
        },

        getViewportHeight: function(){
            return Ext.isIE ?
                   (Ext.isStrict ? doc.documentElement.clientHeight : doc.body.clientHeight) :
                   self.innerHeight;
        },

        getViewportWidth : function() {
            return (!Ext.isStrict && !Ext.isOpera) ? doc.body.clientWidth :
                   Ext.isIE ? doc.documentElement.clientWidth : self.innerWidth;
        },

        getY : function(el) {
            return ELEMENT.getXY(el)[1];
        },

        getX : function(el) {
            return ELEMENT.getXY(el)[0];
        },

        getOffsetParent: function (el) {
            el = Ext.getDom(el);
            try {
                // accessing offsetParent can throw "Unspecified Error" in IE6-8 (not 9)
                return el.offsetParent;
            } catch (e) {
                var body = document.body; // safe bet, unless...
                return (el == body) ? null : body;
            }
        },

        getXY : function(el) {
            var p,
                pe,
                b,
                bt,
                bl,
                dbd,
                x = 0,
                y = 0,
                scroll,
                hasAbsolute,
                bd = (doc.body || doc.documentElement),
                ret;

            el = Ext.getDom(el);

            if(el != bd){
                hasAbsolute = fly(el).isStyle("position", "absolute");

                if (el.getBoundingClientRect) {
                    try {
                        b = el.getBoundingClientRect();
                        scroll = fly(document).getScroll();
                        ret = [ Math.round(b.left + scroll.left), Math.round(b.top + scroll.top) ];
                    } catch (e) {
                        // IE6-8 can also throw from getBoundingClientRect...
                    }
                }

                if (!ret) {
                    for (p = el; p; p = ELEMENT.getOffsetParent(p)) {
                        pe = fly(p);
                        x += p.offsetLeft;
                        y += p.offsetTop;

                        hasAbsolute = hasAbsolute || pe.isStyle("position", "absolute");

                        if (Ext.isGecko) {
                            y += bt = parseInt(pe.getStyle("borderTopWidth"), 10) || 0;
                            x += bl = parseInt(pe.getStyle("borderLeftWidth"), 10) || 0;

                            if (p != el && !pe.isStyle('overflow','visible')) {
                                x += bl;
                                y += bt;
                            }
                        }
                    }

                    if (Ext.isSafari && hasAbsolute) {
                        x -= bd.offsetLeft;
                        y -= bd.offsetTop;
                    }

                    if (Ext.isGecko && !hasAbsolute) {
                        dbd = fly(bd);
                        x += parseInt(dbd.getStyle("borderLeftWidth"), 10) || 0;
                        y += parseInt(dbd.getStyle("borderTopWidth"), 10) || 0;
                    }

                    p = el.parentNode;
                    while (p && p != bd) {
                        if (!Ext.isOpera || (p.tagName != 'TR' && !fly(p).isStyle("display", "inline"))) {
                            x -= p.scrollLeft;
                            y -= p.scrollTop;
                        }
                        p = p.parentNode;
                    }
                    ret = [x,y];
                }
            }
            return ret || [0,0];
        },

        setXY : function(el, xy) {
            (el = Ext.fly(el, '_setXY')).position();

            var pts = el.translatePoints(xy),
                style = el.dom.style,
                pos;

            for (pos in pts) {
                if (!isNaN(pts[pos])) {
                    style[pos] = pts[pos] + "px";
                }
            }
        },

        setX : function(el, x) {
            ELEMENT.setXY(el, [x, false]);
        },

        setY : function(el, y) {
            ELEMENT.setXY(el, [false, y]);
        },

        /**
         * Serializes a DOM form into a url encoded string
         * @param {Object} form The form
         * @return {String} The url encoded form
         */
        serializeForm: function(form) {
            var fElements = form.elements || (document.forms[form] || Ext.getDom(form)).elements,
                hasSubmit = false,
                encoder = encodeURIComponent,
                name,
                data = '',
                type,
                hasValue;

            Ext.each(fElements, function(element){
                name = element.name;
                type = element.type;

                if (!element.disabled && name) {
                    if (/select-(one|multiple)/i.test(type)) {
                        Ext.each(element.options, function(opt){
                            if (opt.selected) {
                                hasValue = opt.hasAttribute ? opt.hasAttribute('value') : opt.getAttributeNode('value').specified;
                                data += Ext.String.format("{0}={1}&", encoder(name), encoder(hasValue ? opt.value : opt.text));
                            }
                        });
                    } else if (!(/file|undefined|reset|button/i.test(type))) {
                        if (!(/radio|checkbox/i.test(type) && !element.checked) && !(type == 'submit' && hasSubmit)) {
                            data += encoder(name) + '=' + encoder(element.value) + '&';
                            hasSubmit = /submit/i.test(type);
                        }
                    }
                }
            });
            return data.substr(0, data.length - 1);
        }
    });
})();

/**
 * @class Ext.Element
 */

Ext.Element.addMethods((function(){
    var focusRe = /button|input|textarea|select|object/;
    return {
        /**
         * Monitors this Element for the mouse leaving. Calls the function after the specified delay only if
         * the mouse was not moved back into the Element within the delay. If the mouse <i>was</i> moved
         * back in, the function is not called.
         * @param {Number} delay The delay <b>in milliseconds</b> to wait for possible mouse re-entry before calling the handler function.
         * @param {Function} handler The function to call if the mouse remains outside of this Element for the specified time.
         * @param {Object} scope The scope (<code>this</code> reference) in which the handler function executes. Defaults to this Element.
         * @return {Object} The listeners object which was added to this element so that monitoring can be stopped. Example usage:<pre><code>
// Hide the menu if the mouse moves out for 250ms or more
this.mouseLeaveMonitor = this.menuEl.monitorMouseLeave(250, this.hideMenu, this);

...
// Remove mouseleave monitor on menu destroy
this.menuEl.un(this.mouseLeaveMonitor);
    </code></pre>
         */
        monitorMouseLeave: function(delay, handler, scope) {
            var me = this,
                timer,
                listeners = {
                    mouseleave: function(e) {
                        timer = setTimeout(Ext.Function.bind(handler, scope||me, [e]), delay);
                    },
                    mouseenter: function() {
                        clearTimeout(timer);
                    },
                    freezeEvent: true
                };

            me.on(listeners);
            return listeners;
        },

        /**
         * Stops the specified event(s) from bubbling and optionally prevents the default action
         * @param {String/String[]} eventName an event / array of events to stop from bubbling
         * @param {Boolean} preventDefault (optional) true to prevent the default action too
         * @return {Ext.Element} this
         */
        swallowEvent : function(eventName, preventDefault) {
            var me = this;
            function fn(e) {
                e.stopPropagation();
                if (preventDefault) {
                    e.preventDefault();
                }
            }

            if (Ext.isArray(eventName)) {
                Ext.each(eventName, function(e) {
                     me.on(e, fn);
                });
                return me;
            }
            me.on(eventName, fn);
            return me;
        },

        /**
         * Create an event handler on this element such that when the event fires and is handled by this element,
         * it will be relayed to another object (i.e., fired again as if it originated from that object instead).
         * @param {String} eventName The type of event to relay
         * @param {Object} object Any object that extends {@link Ext.util.Observable} that will provide the context
         * for firing the relayed event
         */
        relayEvent : function(eventName, observable) {
            this.on(eventName, function(e) {
                observable.fireEvent(eventName, e);
            });
        },

        /**
         * Removes Empty, or whitespace filled text nodes. Combines adjacent text nodes.
         * @param {Boolean} forceReclean (optional) By default the element
         * keeps track if it has been cleaned already so
         * you can call this over and over. However, if you update the element and
         * need to force a reclean, you can pass true.
         */
        clean : function(forceReclean) {
            var me  = this,
                dom = me.dom,
                n   = dom.firstChild,
                nx,
                ni  = -1;
    
            if (Ext.Element.data(dom, 'isCleaned') && forceReclean !== true) {
                return me;
            }

            while (n) {
                nx = n.nextSibling;
                if (n.nodeType == 3) {
                    // Remove empty/whitespace text nodes
                    if (!(/\S/.test(n.nodeValue))) {
                        dom.removeChild(n);
                    // Combine adjacent text nodes
                    } else if (nx && nx.nodeType == 3) {
                        n.appendData(Ext.String.trim(nx.data));
                        dom.removeChild(nx);
                        nx = n.nextSibling;
                        n.nodeIndex = ++ni;
                    }
                } else {
                    // Recursively clean
                    Ext.fly(n).clean();
                    n.nodeIndex = ++ni;
                }
                n = nx;
            }

            Ext.Element.data(dom, 'isCleaned', true);
            return me;
        },

        /**
         * Direct access to the Ext.ElementLoader {@link Ext.ElementLoader#load} method. The method takes the same object
         * parameter as {@link Ext.ElementLoader#load}
         * @return {Ext.Element} this
         */
        load : function(options) {
            this.getLoader().load(options);
            return this;
        },

        /**
        * Gets this element's {@link Ext.ElementLoader ElementLoader}
        * @return {Ext.ElementLoader} The loader
        */
        getLoader : function() {
            var dom = this.dom,
                data = Ext.Element.data,
                loader = data(dom, 'loader');
    
            if (!loader) {
                loader = Ext.create('Ext.ElementLoader', {
                    target: this
                });
                data(dom, 'loader', loader);
            }
            return loader;
        },

        /**
        * Update the innerHTML of this element, optionally searching for and processing scripts
        * @param {String} html The new HTML
        * @param {Boolean} [loadScripts=false] True to look for and process scripts
        * @param {Function} [callback] For async script loading you can be notified when the update completes
        * @return {Ext.Element} this
         */
        update : function(html, loadScripts, callback) {
            var me = this,
                id,
                dom,
                interval;

            if (!me.dom) {
                return me;
            }
            html = html || '';
            dom = me.dom;

            if (loadScripts !== true) {
                dom.innerHTML = html;
                Ext.callback(callback, me);
                return me;
            }

            id  = Ext.id();
            html += '<span id="' + id + '"></span>';

            interval = setInterval(function(){
                if (!document.getElementById(id)) {
                    return false;
                }
                clearInterval(interval);
                var DOC    = document,
                    hd     = DOC.getElementsByTagName("head")[0],
                    re     = /(?:<script([^>]*)?>)((\n|\r|.)*?)(?:<\/script>)/ig,
                    srcRe  = /\ssrc=([\'\"])(.*?)\1/i,
                    typeRe = /\stype=([\'\"])(.*?)\1/i,
                    match,
                    attrs,
                    srcMatch,
                    typeMatch,
                    el,
                    s;

                while ((match = re.exec(html))) {
                    attrs = match[1];
                    srcMatch = attrs ? attrs.match(srcRe) : false;
                    if (srcMatch && srcMatch[2]) {
                       s = DOC.createElement("script");
                       s.src = srcMatch[2];
                       typeMatch = attrs.match(typeRe);
                       if (typeMatch && typeMatch[2]) {
                           s.type = typeMatch[2];
                       }
                       hd.appendChild(s);
                    } else if (match[2] && match[2].length > 0) {
                        if (window.execScript) {
                           window.execScript(match[2]);
                        } else {
                           window.eval(match[2]);
                        }
                    }
                }

                el = DOC.getElementById(id);
                if (el) {
                    Ext.removeNode(el);
                }
                Ext.callback(callback, me);
            }, 20);
            dom.innerHTML = html.replace(/(?:<script.*?>)((\n|\r|.)*?)(?:<\/script>)/ig, '');
            return me;
        },

        // inherit docs, overridden so we can add removeAnchor
        removeAllListeners : function() {
            this.removeAnchor();
            Ext.EventManager.removeAll(this.dom);
            return this;
        },
    
        /**
         * Gets the parent node of the current element taking into account Ext.scopeResetCSS
         * @protected
         * @return {HTMLElement} The parent element
         */
        getScopeParent: function(){
            var parent = this.dom.parentNode;
            return Ext.scopeResetCSS ? parent.parentNode : parent;
        },

        /**
         * Creates a proxy element of this element
         * @param {String/Object} config The class name of the proxy element or a DomHelper config object
         * @param {String/HTMLElement} [renderTo] The element or element id to render the proxy to (defaults to document.body)
         * @param {Boolean} [matchBox=false] True to align and size the proxy to this element now.
         * @return {Ext.Element} The new proxy element
         */
        createProxy : function(config, renderTo, matchBox) {
            config = (typeof config == 'object') ? config : {tag : "div", cls: config};

            var me = this,
                proxy = renderTo ? Ext.DomHelper.append(renderTo, config, true) :
                                   Ext.DomHelper.insertBefore(me.dom, config, true);

            proxy.setVisibilityMode(Ext.Element.DISPLAY);
            proxy.hide();
            if (matchBox && me.setBox && me.getBox) { // check to make sure Element.position.js is loaded
               proxy.setBox(me.getBox());
            }
            return proxy;
        },
    
        /**
         * Checks whether this element can be focused.
         * @return {Boolean} True if the element is focusable
         */
        focusable: function(){
            var dom = this.dom,
                nodeName = dom.nodeName.toLowerCase(),
                canFocus = false,
                hasTabIndex = !isNaN(dom.tabIndex);
            
            if (!dom.disabled) {
                if (focusRe.test(nodeName)) {
                    canFocus = true;
                } else {
                    canFocus = nodeName == 'a' ? dom.href || hasTabIndex : hasTabIndex;
                }
            }
            return canFocus && this.isVisible(true);
        }    
    };
})());
Ext.Element.prototype.clearListeners = Ext.Element.prototype.removeAllListeners;

/**
 * @class Ext.Element
 */
Ext.Element.addMethods({
    /**
     * Gets the x,y coordinates specified by the anchor position on the element.
     * @param {String} [anchor='c'] The specified anchor position.  See {@link #alignTo}
     * for details on supported anchor positions.
     * @param {Boolean} [local] True to get the local (element top/left-relative) anchor position instead
     * of page coordinates
     * @param {Object} [size] An object containing the size to use for calculating anchor position
     * {width: (target width), height: (target height)} (defaults to the element's current size)
     * @return {Number[]} [x, y] An array containing the element's x and y coordinates
     */
    getAnchorXY : function(anchor, local, s){
        //Passing a different size is useful for pre-calculating anchors,
        //especially for anchored animations that change the el size.
        anchor = (anchor || "tl").toLowerCase();
        s = s || {};

        var me = this,
            vp = me.dom == document.body || me.dom == document,
            w = s.width || vp ? Ext.Element.getViewWidth() : me.getWidth(),
            h = s.height || vp ? Ext.Element.getViewHeight() : me.getHeight(),
            xy,
            r = Math.round,
            o = me.getXY(),
            scroll = me.getScroll(),
            extraX = vp ? scroll.left : !local ? o[0] : 0,
            extraY = vp ? scroll.top : !local ? o[1] : 0,
            hash = {
                c  : [r(w * 0.5), r(h * 0.5)],
                t  : [r(w * 0.5), 0],
                l  : [0, r(h * 0.5)],
                r  : [w, r(h * 0.5)],
                b  : [r(w * 0.5), h],
                tl : [0, 0],
                bl : [0, h],
                br : [w, h],
                tr : [w, 0]
            };

        xy = hash[anchor];
        return [xy[0] + extraX, xy[1] + extraY];
    },

    /**
     * Anchors an element to another element and realigns it when the window is resized.
     * @param {String/HTMLElement/Ext.Element} element The element to align to.
     * @param {String} position The position to align to.
     * @param {Number[]} [offsets] Offset the positioning by [x, y]
     * @param {Boolean/Object} [animate] True for the default animation or a standard Element animation config object
     * @param {Boolean/Number} [monitorScroll] True to monitor body scroll and reposition. If this parameter
     * is a number, it is used as the buffer delay (defaults to 50ms).
     * @param {Function} [callback] The function to call after the animation finishes
     * @return {Ext.Element} this
     */
    anchorTo : function(el, alignment, offsets, animate, monitorScroll, callback){
        var me = this,
            dom = me.dom,
            scroll = !Ext.isEmpty(monitorScroll),
            action = function(){
                Ext.fly(dom).alignTo(el, alignment, offsets, animate);
                Ext.callback(callback, Ext.fly(dom));
            },
            anchor = this.getAnchor();

        // previous listener anchor, remove it
        this.removeAnchor();
        Ext.apply(anchor, {
            fn: action,
            scroll: scroll
        });

        Ext.EventManager.onWindowResize(action, null);

        if(scroll){
            Ext.EventManager.on(window, 'scroll', action, null,
                {buffer: !isNaN(monitorScroll) ? monitorScroll : 50});
        }
        action.call(me); // align immediately
        return me;
    },

    /**
     * Remove any anchor to this element. See {@link #anchorTo}.
     * @return {Ext.Element} this
     */
    removeAnchor : function(){
        var me = this,
            anchor = this.getAnchor();

        if(anchor && anchor.fn){
            Ext.EventManager.removeResizeListener(anchor.fn);
            if(anchor.scroll){
                Ext.EventManager.un(window, 'scroll', anchor.fn);
            }
            delete anchor.fn;
        }
        return me;
    },

    // private
    getAnchor : function(){
        var data = Ext.Element.data,
            dom = this.dom;
            if (!dom) {
                return;
            }
            var anchor = data(dom, '_anchor');

        if(!anchor){
            anchor = data(dom, '_anchor', {});
        }
        return anchor;
    },

    getAlignVector: function(el, spec, offset) {
        var me = this,
            side = {t:"top", l:"left", r:"right", b: "bottom"},
            thisRegion = me.getRegion(),
            elRegion;

        el = Ext.get(el);
        if(!el || !el.dom){
            //<debug>
            Ext.Error.raise({
                sourceClass: 'Ext.Element',
                sourceMethod: 'getAlignVector',
                msg: 'Attempted to align an element that doesn\'t exist'
            });
            //</debug>
        }

        elRegion = el.getRegion();
    },

    /**
     * Gets the x,y coordinates to align this element with another element. See {@link #alignTo} for more info on the
     * supported position values.
     * @param {String/HTMLElement/Ext.Element} element The element to align to.
     * @param {String} [position="tl-bl?"] The position to align to (defaults to )
     * @param {Number[]} [offsets] Offset the positioning by [x, y]
     * @return {Number[]} [x, y]
     */
    getAlignToXY : function(el, p, o){
        el = Ext.get(el);

        if(!el || !el.dom){
            //<debug>
            Ext.Error.raise({
                sourceClass: 'Ext.Element',
                sourceMethod: 'getAlignToXY',
                msg: 'Attempted to align an element that doesn\'t exist'
            });
            //</debug>
        }

        o = o || [0,0];
        p = (!p || p == "?" ? "tl-bl?" : (!(/-/).test(p) && p !== "" ? "tl-" + p : p || "tl-bl")).toLowerCase();

        var me = this,
            d = me.dom,
            a1,
            a2,
            x,
            y,
            //constrain the aligned el to viewport if necessary
            w,
            h,
            r,
            dw = Ext.Element.getViewWidth() -10, // 10px of margin for ie
            dh = Ext.Element.getViewHeight()-10, // 10px of margin for ie
            p1y,
            p1x,
            p2y,
            p2x,
            swapY,
            swapX,
            doc = document,
            docElement = doc.documentElement,
            docBody = doc.body,
            scrollX = (docElement.scrollLeft || docBody.scrollLeft || 0)+5,
            scrollY = (docElement.scrollTop || docBody.scrollTop || 0)+5,
            c = false, //constrain to viewport
            p1 = "",
            p2 = "",
            m = p.match(/^([a-z]+)-([a-z]+)(\?)?$/);

        if(!m){
            //<debug>
            Ext.Error.raise({
                sourceClass: 'Ext.Element',
                sourceMethod: 'getAlignToXY',
                el: el,
                position: p,
                offset: o,
                msg: 'Attemmpted to align an element with an invalid position: "' + p + '"'
            });
            //</debug>
        }

        p1 = m[1];
        p2 = m[2];
        c = !!m[3];

        //Subtract the aligned el's internal xy from the target's offset xy
        //plus custom offset to get the aligned el's new offset xy
        a1 = me.getAnchorXY(p1, true);
        a2 = el.getAnchorXY(p2, false);

        x = a2[0] - a1[0] + o[0];
        y = a2[1] - a1[1] + o[1];

        if(c){
           w = me.getWidth();
           h = me.getHeight();
           r = el.getRegion();
           //If we are at a viewport boundary and the aligned el is anchored on a target border that is
           //perpendicular to the vp border, allow the aligned el to slide on that border,
           //otherwise swap the aligned el to the opposite border of the target.
           p1y = p1.charAt(0);
           p1x = p1.charAt(p1.length-1);
           p2y = p2.charAt(0);
           p2x = p2.charAt(p2.length-1);
           swapY = ((p1y=="t" && p2y=="b") || (p1y=="b" && p2y=="t"));
           swapX = ((p1x=="r" && p2x=="l") || (p1x=="l" && p2x=="r"));


           if (x + w > dw + scrollX) {
                x = swapX ? r.left-w : dw+scrollX-w;
           }
           if (x < scrollX) {
               x = swapX ? r.right : scrollX;
           }
           if (y + h > dh + scrollY) {
                y = swapY ? r.top-h : dh+scrollY-h;
            }
           if (y < scrollY){
               y = swapY ? r.bottom : scrollY;
           }
        }
        return [x,y];
    },

    /**
     * Aligns this element with another element relative to the specified anchor points. If the other element is the
     * document it aligns it to the viewport.
     * The position parameter is optional, and can be specified in any one of the following formats:
     * <ul>
     *   <li><b>Blank</b>: Defaults to aligning the element's top-left corner to the target's bottom-left corner ("tl-bl").</li>
     *   <li><b>One anchor (deprecated)</b>: The passed anchor position is used as the target element's anchor point.
     *       The element being aligned will position its top-left corner (tl) to that point.  <i>This method has been
     *       deprecated in favor of the newer two anchor syntax below</i>.</li>
     *   <li><b>Two anchors</b>: If two values from the table below are passed separated by a dash, the first value is used as the
     *       element's anchor point, and the second value is used as the target's anchor point.</li>
     * </ul>
     * In addition to the anchor points, the position parameter also supports the "?" character.  If "?" is passed at the end of
     * the position string, the element will attempt to align as specified, but the position will be adjusted to constrain to
     * the viewport if necessary.  Note that the element being aligned might be swapped to align to a different position than
     * that specified in order to enforce the viewport constraints.
     * Following are all of the supported anchor positions:
<pre>
Value  Description
-----  -----------------------------
tl     The top left corner (default)
t      The center of the top edge
tr     The top right corner
l      The center of the left edge
c      In the center of the element
r      The center of the right edge
bl     The bottom left corner
b      The center of the bottom edge
br     The bottom right corner
</pre>
Example Usage:
<pre><code>
// align el to other-el using the default positioning ("tl-bl", non-constrained)
el.alignTo("other-el");

// align the top left corner of el with the top right corner of other-el (constrained to viewport)
el.alignTo("other-el", "tr?");

// align the bottom right corner of el with the center left edge of other-el
el.alignTo("other-el", "br-l?");

// align the center of el with the bottom left corner of other-el and
// adjust the x position by -6 pixels (and the y position by 0)
el.alignTo("other-el", "c-bl", [-6, 0]);
</code></pre>
     * @param {String/HTMLElement/Ext.Element} element The element to align to.
     * @param {String} [position="tl-bl?"] The position to align to
     * @param {Number[]} [offsets] Offset the positioning by [x, y]
     * @param {Boolean/Object} [animate] true for the default animation or a standard Element animation config object
     * @return {Ext.Element} this
     */
    alignTo : function(element, position, offsets, animate){
        var me = this;
        return me.setXY(me.getAlignToXY(element, position, offsets),
                        me.anim && !!animate ? me.anim(animate) : false);
    },

    // private ==>  used outside of core
    adjustForConstraints : function(xy, parent) {
        var vector = this.getConstrainVector(parent, xy);
        if (vector) {
            xy[0] += vector[0];
            xy[1] += vector[1];
        }
        return xy;
    },

    /**
     * <p>Returns the <code>[X, Y]</code> vector by which this element must be translated to make a best attempt
     * to constrain within the passed constraint. Returns <code>false</code> is this element does not need to be moved.</p>
     * <p>Priority is given to constraining the top and left within the constraint.</p>
     * <p>The constraint may either be an existing element into which this element is to be constrained, or
     * an {@link Ext.util.Region Region} into which this element is to be constrained.</p>
     * @param constrainTo {Mixed} The Element or {@link Ext.util.Region Region} into which this element is to be constrained.
     * @param proposedPosition {Array} A proposed <code>[X, Y]</code> position to test for validity and to produce a vector for instead
     * of using this Element's current position;
     * @returns {Number[]/Boolean} <b>If</b> this element <i>needs</i> to be translated, an <code>[X, Y]</code>
     * vector by which this element must be translated. Otherwise, <code>false</code>.
     */
    getConstrainVector: function(constrainTo, proposedPosition) {
        if (!(constrainTo instanceof Ext.util.Region)) {
            constrainTo = Ext.get(constrainTo).getViewRegion();
        }
        var thisRegion = this.getRegion(),
            vector = [0, 0],
            shadowSize = this.shadow && this.shadow.offset,
            overflowed = false;

        // Shift this region to occupy the proposed position
        if (proposedPosition) {
            thisRegion.translateBy(proposedPosition[0] - thisRegion.x, proposedPosition[1] - thisRegion.y);
        }

        // Reduce the constrain region to allow for shadow
        // TODO: Rewrite the Shadow class. When that's done, get the extra for each side from the Shadow.
        if (shadowSize) {
            constrainTo.adjust(0, -shadowSize, -shadowSize, shadowSize);
        }

        // Constrain the X coordinate by however much this Element overflows
        if (thisRegion.right > constrainTo.right) {
            overflowed = true;
            vector[0] = (constrainTo.right - thisRegion.right);    // overflowed the right
        }
        if (thisRegion.left + vector[0] < constrainTo.left) {
            overflowed = true;
            vector[0] = (constrainTo.left - thisRegion.left);      // overflowed the left
        }

        // Constrain the Y coordinate by however much this Element overflows
        if (thisRegion.bottom > constrainTo.bottom) {
            overflowed = true;
            vector[1] = (constrainTo.bottom - thisRegion.bottom);  // overflowed the bottom
        }
        if (thisRegion.top + vector[1] < constrainTo.top) {
            overflowed = true;
            vector[1] = (constrainTo.top - thisRegion.top);        // overflowed the top
        }
        return overflowed ? vector : false;
    },

    /**
    * Calculates the x, y to center this element on the screen
    * @return {Number[]} The x, y values [x, y]
    */
    getCenterXY : function(){
        return this.getAlignToXY(document, 'c-c');
    },

    /**
    * Centers the Element in either the viewport, or another Element.
    * @param {String/HTMLElement/Ext.Element} centerIn (optional) The element in which to center the element.
    */
    center : function(centerIn){
        return this.alignTo(centerIn || document, 'c-c');
    }
});

/**
 * @class Ext.Element
 */
(function(){

var ELEMENT = Ext.Element,
    LEFT = "left",
    RIGHT = "right",
    TOP = "top",
    BOTTOM = "bottom",
    POSITION = "position",
    STATIC = "static",
    RELATIVE = "relative",
    AUTO = "auto",
    ZINDEX = "z-index";

Ext.override(Ext.Element, {
    /**
      * Gets the current X position of the element based on page coordinates.  Element must be part of the DOM tree to have page coordinates (display:none or elements not appended return false).
      * @return {Number} The X position of the element
      */
    getX : function(){
        return ELEMENT.getX(this.dom);
    },

    /**
      * Gets the current Y position of the element based on page coordinates.  Element must be part of the DOM tree to have page coordinates (display:none or elements not appended return false).
      * @return {Number} The Y position of the element
      */
    getY : function(){
        return ELEMENT.getY(this.dom);
    },

    /**
      * Gets the current position of the element based on page coordinates.  Element must be part of the DOM tree to have page coordinates (display:none or elements not appended return false).
      * @return {Number[]} The XY position of the element
      */
    getXY : function(){
        return ELEMENT.getXY(this.dom);
    },

    /**
      * Returns the offsets of this element from the passed element. Both element must be part of the DOM tree and not have display:none to have page coordinates.
      * @param {String/HTMLElement/Ext.Element} element The element to get the offsets from.
      * @return {Number[]} The XY page offsets (e.g. [100, -200])
      */
    getOffsetsTo : function(el){
        var o = this.getXY(),
            e = Ext.fly(el, '_internal').getXY();
        return [o[0]-e[0],o[1]-e[1]];
    },

    /**
     * Sets the X position of the element based on page coordinates.  Element must be part of the DOM tree to have page coordinates (display:none or elements not appended return false).
     * @param {Number} The X position of the element
     * @param {Boolean/Object} animate (optional) True for the default animation, or a standard Element animation config object
     * @return {Ext.Element} this
     */
    setX : function(x, animate){
        return this.setXY([x, this.getY()], animate);
    },

    /**
     * Sets the Y position of the element based on page coordinates.  Element must be part of the DOM tree to have page coordinates (display:none or elements not appended return false).
     * @param {Number} The Y position of the element
     * @param {Boolean/Object} animate (optional) True for the default animation, or a standard Element animation config object
     * @return {Ext.Element} this
     */
    setY : function(y, animate){
        return this.setXY([this.getX(), y], animate);
    },

    /**
     * Sets the element's left position directly using CSS style (instead of {@link #setX}).
     * @param {String} left The left CSS property value
     * @return {Ext.Element} this
     */
    setLeft : function(left){
        this.setStyle(LEFT, this.addUnits(left));
        return this;
    },

    /**
     * Sets the element's top position directly using CSS style (instead of {@link #setY}).
     * @param {String} top The top CSS property value
     * @return {Ext.Element} this
     */
    setTop : function(top){
        this.setStyle(TOP, this.addUnits(top));
        return this;
    },

    /**
     * Sets the element's CSS right style.
     * @param {String} right The right CSS property value
     * @return {Ext.Element} this
     */
    setRight : function(right){
        this.setStyle(RIGHT, this.addUnits(right));
        return this;
    },

    /**
     * Sets the element's CSS bottom style.
     * @param {String} bottom The bottom CSS property value
     * @return {Ext.Element} this
     */
    setBottom : function(bottom){
        this.setStyle(BOTTOM, this.addUnits(bottom));
        return this;
    },

    /**
     * Sets the position of the element in page coordinates, regardless of how the element is positioned.
     * The element must be part of the DOM tree to have page coordinates (display:none or elements not appended return false).
     * @param {Number[]} pos Contains X & Y [x, y] values for new position (coordinates are page-based)
     * @param {Boolean/Object} animate (optional) True for the default animation, or a standard Element animation config object
     * @return {Ext.Element} this
     */
    setXY: function(pos, animate) {
        var me = this;
        if (!animate || !me.anim) {
            ELEMENT.setXY(me.dom, pos);
        }
        else {
            if (!Ext.isObject(animate)) {
                animate = {};
            }
            me.animate(Ext.applyIf({ to: { x: pos[0], y: pos[1] } }, animate));
        }
        return me;
    },

    /**
     * Sets the position of the element in page coordinates, regardless of how the element is positioned.
     * The element must be part of the DOM tree to have page coordinates (display:none or elements not appended return false).
     * @param {Number} x X value for new position (coordinates are page-based)
     * @param {Number} y Y value for new position (coordinates are page-based)
     * @param {Boolean/Object} animate (optional) True for the default animation, or a standard Element animation config object
     * @return {Ext.Element} this
     */
    setLocation : function(x, y, animate){
        return this.setXY([x, y], animate);
    },

    /**
     * Sets the position of the element in page coordinates, regardless of how the element is positioned.
     * The element must be part of the DOM tree to have page coordinates (display:none or elements not appended return false).
     * @param {Number} x X value for new position (coordinates are page-based)
     * @param {Number} y Y value for new position (coordinates are page-based)
     * @param {Boolean/Object} animate (optional) True for the default animation, or a standard Element animation config object
     * @return {Ext.Element} this
     */
    moveTo : function(x, y, animate){
        return this.setXY([x, y], animate);
    },

    /**
     * Gets the left X coordinate
     * @param {Boolean} local True to get the local css position instead of page coordinate
     * @return {Number}
     */
    getLeft : function(local){
        return !local ? this.getX() : parseInt(this.getStyle(LEFT), 10) || 0;
    },

    /**
     * Gets the right X coordinate of the element (element X position + element width)
     * @param {Boolean} local True to get the local css position instead of page coordinate
     * @return {Number}
     */
    getRight : function(local){
        var me = this;
        return !local ? me.getX() + me.getWidth() : (me.getLeft(true) + me.getWidth()) || 0;
    },

    /**
     * Gets the top Y coordinate
     * @param {Boolean} local True to get the local css position instead of page coordinate
     * @return {Number}
     */
    getTop : function(local) {
        return !local ? this.getY() : parseInt(this.getStyle(TOP), 10) || 0;
    },

    /**
     * Gets the bottom Y coordinate of the element (element Y position + element height)
     * @param {Boolean} local True to get the local css position instead of page coordinate
     * @return {Number}
     */
    getBottom : function(local){
        var me = this;
        return !local ? me.getY() + me.getHeight() : (me.getTop(true) + me.getHeight()) || 0;
    },

    /**
    * Initializes positioning on this element. If a desired position is not passed, it will make the
    * the element positioned relative IF it is not already positioned.
    * @param {String} pos (optional) Positioning to use "relative", "absolute" or "fixed"
    * @param {Number} zIndex (optional) The zIndex to apply
    * @param {Number} x (optional) Set the page X position
    * @param {Number} y (optional) Set the page Y position
    */
    position : function(pos, zIndex, x, y) {
        var me = this;

        if (!pos && me.isStyle(POSITION, STATIC)){
            me.setStyle(POSITION, RELATIVE);
        } else if(pos) {
            me.setStyle(POSITION, pos);
        }
        if (zIndex){
            me.setStyle(ZINDEX, zIndex);
        }
        if (x || y) {
            me.setXY([x || false, y || false]);
        }
    },

    /**
    * Clear positioning back to the default when the document was loaded
    * @param {String} value (optional) The value to use for the left,right,top,bottom, defaults to '' (empty string). You could use 'auto'.
    * @return {Ext.Element} this
     */
    clearPositioning : function(value){
        value = value || '';
        this.setStyle({
            left : value,
            right : value,
            top : value,
            bottom : value,
            "z-index" : "",
            position : STATIC
        });
        return this;
    },

    /**
    * Gets an object with all CSS positioning properties. Useful along with setPostioning to get
    * snapshot before performing an update and then restoring the element.
    * @return {Object}
    */
    getPositioning : function(){
        var l = this.getStyle(LEFT);
        var t = this.getStyle(TOP);
        return {
            "position" : this.getStyle(POSITION),
            "left" : l,
            "right" : l ? "" : this.getStyle(RIGHT),
            "top" : t,
            "bottom" : t ? "" : this.getStyle(BOTTOM),
            "z-index" : this.getStyle(ZINDEX)
        };
    },

    /**
    * Set positioning with an object returned by getPositioning().
    * @param {Object} posCfg
    * @return {Ext.Element} this
     */
    setPositioning : function(pc){
        var me = this,
            style = me.dom.style;

        me.setStyle(pc);

        if(pc.right == AUTO){
            style.right = "";
        }
        if(pc.bottom == AUTO){
            style.bottom = "";
        }

        return me;
    },

    /**
     * Translates the passed page coordinates into left/top css values for this element
     * @param {Number/Number[]} x The page x or an array containing [x, y]
     * @param {Number} y (optional) The page y, required if x is not an array
     * @return {Object} An object with left and top properties. e.g. {left: (value), top: (value)}
     */
    translatePoints: function(x, y) {
        if (Ext.isArray(x)) {
             y = x[1];
             x = x[0];
        }
        var me = this,
            relative = me.isStyle(POSITION, RELATIVE),
            o = me.getXY(),
            left = parseInt(me.getStyle(LEFT), 10),
            top = parseInt(me.getStyle(TOP), 10);

        if (!Ext.isNumber(left)) {
            left = relative ? 0 : me.dom.offsetLeft;
        }
        if (!Ext.isNumber(top)) {
            top = relative ? 0 : me.dom.offsetTop;
        }
        left = (Ext.isNumber(x)) ? x - o[0] + left : undefined;
        top = (Ext.isNumber(y)) ? y - o[1] + top : undefined;
        return {
            left: left,
            top: top
        };
    },

    /**
     * Sets the element's box. Use getBox() on another element to get a box obj. If animate is true then width, height, x and y will be animated concurrently.
     * @param {Object} box The box to fill {x, y, width, height}
     * @param {Boolean} adjust (optional) Whether to adjust for box-model issues automatically
     * @param {Boolean/Object} animate (optional) true for the default animation or a standard Element animation config object
     * @return {Ext.Element} this
     */
    setBox: function(box, adjust, animate) {
        var me = this,
            w = box.width,
            h = box.height;
        if ((adjust && !me.autoBoxAdjust) && !me.isBorderBox()) {
            w -= (me.getBorderWidth("lr") + me.getPadding("lr"));
            h -= (me.getBorderWidth("tb") + me.getPadding("tb"));
        }
        me.setBounds(box.x, box.y, w, h, animate);
        return me;
    },

    /**
     * Return an object defining the area of this Element which can be passed to {@link #setBox} to
     * set another Element's size/location to match this element.
     * @param {Boolean} contentBox (optional) If true a box for the content of the element is returned.
     * @param {Boolean} local (optional) If true the element's left and top are returned instead of page x/y.
     * @return {Object} box An object in the format<pre><code>
{
    x: &lt;Element's X position>,
    y: &lt;Element's Y position>,
    width: &lt;Element's width>,
    height: &lt;Element's height>,
    bottom: &lt;Element's lower bound>,
    right: &lt;Element's rightmost bound>
}
</code></pre>
     * The returned object may also be addressed as an Array where index 0 contains the X position
     * and index 1 contains the Y position. So the result may also be used for {@link #setXY}
     */
    getBox: function(contentBox, local) {
        var me = this,
            xy,
            left,
            top,
            getBorderWidth = me.getBorderWidth,
            getPadding = me.getPadding,
            l, r, t, b, w, h, bx;
        if (!local) {
            xy = me.getXY();
        } else {
            left = parseInt(me.getStyle("left"), 10) || 0;
            top = parseInt(me.getStyle("top"), 10) || 0;
            xy = [left, top];
        }
        w = me.getWidth();
        h = me.getHeight();
        if (!contentBox) {
            bx = {
                x: xy[0],
                y: xy[1],
                0: xy[0],
                1: xy[1],
                width: w,
                height: h
            };
        } else {
            l = getBorderWidth.call(me, "l") + getPadding.call(me, "l");
            r = getBorderWidth.call(me, "r") + getPadding.call(me, "r");
            t = getBorderWidth.call(me, "t") + getPadding.call(me, "t");
            b = getBorderWidth.call(me, "b") + getPadding.call(me, "b");
            bx = {
                x: xy[0] + l,
                y: xy[1] + t,
                0: xy[0] + l,
                1: xy[1] + t,
                width: w - (l + r),
                height: h - (t + b)
            };
        }
        bx.right = bx.x + bx.width;
        bx.bottom = bx.y + bx.height;
        return bx;
    },

    /**
     * Move this element relative to its current position.
     * @param {String} direction Possible values are: "l" (or "left"), "r" (or "right"), "t" (or "top", or "up"), "b" (or "bottom", or "down").
     * @param {Number} distance How far to move the element in pixels
     * @param {Boolean/Object} animate (optional) true for the default animation or a standard Element animation config object
     */
    move: function(direction, distance, animate) {
        var me = this,
            xy = me.getXY(),
            x = xy[0],
            y = xy[1],
            left = [x - distance, y],
            right = [x + distance, y],
            top = [x, y - distance],
            bottom = [x, y + distance],
            hash = {
                l: left,
                left: left,
                r: right,
                right: right,
                t: top,
                top: top,
                up: top,
                b: bottom,
                bottom: bottom,
                down: bottom
            };

        direction = direction.toLowerCase();
        me.moveTo(hash[direction][0], hash[direction][1], animate);
    },

    /**
     * Quick set left and top adding default units
     * @param {String} left The left CSS property value
     * @param {String} top The top CSS property value
     * @return {Ext.Element} this
     */
    setLeftTop: function(left, top) {
        var me = this,
            style = me.dom.style;
        style.left = me.addUnits(left);
        style.top = me.addUnits(top);
        return me;
    },

    /**
     * Returns the region of this element.
     * The element must be part of the DOM tree to have a region (display:none or elements not appended return false).
     * @return {Ext.util.Region} A Region containing "top, left, bottom, right" member data.
     */
    getRegion: function() {
        return this.getPageBox(true);
    },

    /**
     * Returns the <b>content</b> region of this element. That is the region within the borders and padding.
     * @return {Ext.util.Region} A Region containing "top, left, bottom, right" member data.
     */
    getViewRegion: function() {
        var me = this,
            isBody = me.dom === document.body,
            scroll, pos, top, left, width, height;

        // For the body we want to do some special logic
        if (isBody) {
            scroll = me.getScroll();
            left = scroll.left;
            top = scroll.top;
            width = Ext.Element.getViewportWidth();
            height = Ext.Element.getViewportHeight();
        }
        else {
            pos = me.getXY();
            left = pos[0] + me.getBorderWidth('l') + me.getPadding('l');
            top = pos[1] + me.getBorderWidth('t') + me.getPadding('t');
            width = me.getWidth(true);
            height = me.getHeight(true);
        }

        return Ext.create('Ext.util.Region', top, left + width, top + height, left);
    },

    /**
     * Return an object defining the area of this Element which can be passed to {@link #setBox} to
     * set another Element's size/location to match this element.
     * @param {Boolean} asRegion(optional) If true an Ext.util.Region will be returned
     * @return {Object} box An object in the format<pre><code>
{
    x: &lt;Element's X position>,
    y: &lt;Element's Y position>,
    width: &lt;Element's width>,
    height: &lt;Element's height>,
    bottom: &lt;Element's lower bound>,
    right: &lt;Element's rightmost bound>
}
</code></pre>
     * The returned object may also be addressed as an Array where index 0 contains the X position
     * and index 1 contains the Y position. So the result may also be used for {@link #setXY}
     */
    getPageBox : function(getRegion) {
        var me = this,
            el = me.dom,
            isDoc = el === document.body,
            w = isDoc ? Ext.Element.getViewWidth()  : el.offsetWidth,
            h = isDoc ? Ext.Element.getViewHeight() : el.offsetHeight,
            xy = me.getXY(),
            t = xy[1],
            r = xy[0] + w,
            b = xy[1] + h,
            l = xy[0];

        if (getRegion) {
            return Ext.create('Ext.util.Region', t, r, b, l);
        }
        else {
            return {
                left: l,
                top: t,
                width: w,
                height: h,
                right: r,
                bottom: b
            };
        }
    },

    /**
     * Sets the element's position and size in one shot. If animation is true then width, height, x and y will be animated concurrently.
     * @param {Number} x X value for new position (coordinates are page-based)
     * @param {Number} y Y value for new position (coordinates are page-based)
     * @param {Number/String} width The new width. This may be one of:<div class="mdetail-params"><ul>
     * <li>A Number specifying the new width in this Element's {@link #defaultUnit}s (by default, pixels)</li>
     * <li>A String used to set the CSS width style. Animation may <b>not</b> be used.
     * </ul></div>
     * @param {Number/String} height The new height. This may be one of:<div class="mdetail-params"><ul>
     * <li>A Number specifying the new height in this Element's {@link #defaultUnit}s (by default, pixels)</li>
     * <li>A String used to set the CSS height style. Animation may <b>not</b> be used.</li>
     * </ul></div>
     * @param {Boolean/Object} animate (optional) true for the default animation or a standard Element animation config object
     * @return {Ext.Element} this
     */
    setBounds: function(x, y, width, height, animate) {
        var me = this;
        if (!animate || !me.anim) {
            me.setSize(width, height);
            me.setLocation(x, y);
        } else {
            if (!Ext.isObject(animate)) {
                animate = {};
            }
            me.animate(Ext.applyIf({
                to: {
                    x: x,
                    y: y,
                    width: me.adjustWidth(width),
                    height: me.adjustHeight(height)
                }
            }, animate));
        }
        return me;
    },

    /**
     * Sets the element's position and size the specified region. If animation is true then width, height, x and y will be animated concurrently.
     * @param {Ext.util.Region} region The region to fill
     * @param {Boolean/Object} animate (optional) true for the default animation or a standard Element animation config object
     * @return {Ext.Element} this
     */
    setRegion: function(region, animate) {
        return this.setBounds(region.left, region.top, region.right - region.left, region.bottom - region.top, animate);
    }
});
})();

/**
 * @class Ext.Element
 */
Ext.override(Ext.Element, {
    /**
     * Returns true if this element is scrollable.
     * @return {Boolean}
     */
    isScrollable : function(){
        var dom = this.dom;
        return dom.scrollHeight > dom.clientHeight || dom.scrollWidth > dom.clientWidth;
    },

    /**
     * Returns the current scroll position of the element.
     * @return {Object} An object containing the scroll position in the format {left: (scrollLeft), top: (scrollTop)}
     */
    getScroll : function() {
        var d = this.dom, 
            doc = document,
            body = doc.body,
            docElement = doc.documentElement,
            l,
            t,
            ret;

        if (d == doc || d == body) {
            if (Ext.isIE && Ext.isStrict) {
                l = docElement.scrollLeft; 
                t = docElement.scrollTop;
            } else {
                l = window.pageXOffset;
                t = window.pageYOffset;
            }
            ret = {
                left: l || (body ? body.scrollLeft : 0), 
                top : t || (body ? body.scrollTop : 0)
            };
        } else {
            ret = {
                left: d.scrollLeft, 
                top : d.scrollTop
            };
        }
        
        return ret;
    },
    
    /**
     * Scrolls this element the specified scroll point. It does NOT do bounds checking so if you scroll to a weird value it will try to do it. For auto bounds checking, use scroll().
     * @param {String} side Either "left" for scrollLeft values or "top" for scrollTop values.
     * @param {Number} value The new scroll value
     * @param {Boolean/Object} animate (optional) true for the default animation or a standard Element animation config object
     * @return {Ext.Element} this
     */
    scrollTo : function(side, value, animate) {
        //check if we're scrolling top or left
        var top = /top/i.test(side),
            me = this,
            dom = me.dom,
            obj = {},
            prop;
        if (!animate || !me.anim) {
            // just setting the value, so grab the direction
            prop = 'scroll' + (top ? 'Top' : 'Left');
            dom[prop] = value;
        }
        else {
            if (!Ext.isObject(animate)) {
                animate = {};
            }
            obj['scroll' + (top ? 'Top' : 'Left')] = value;
            me.animate(Ext.applyIf({
                to: obj
            }, animate));
        }
        return me;
    },

    /**
     * Scrolls this element into view within the passed container.
     * @param {String/HTMLElement/Ext.Element} container (optional) The container element to scroll (defaults to document.body).  Should be a
     * string (id), dom node, or Ext.Element.
     * @param {Boolean} hscroll (optional) False to disable horizontal scroll (defaults to true)
     * @return {Ext.Element} this
     */
    scrollIntoView : function(container, hscroll) {
        container = Ext.getDom(container) || Ext.getBody().dom;
        var el = this.dom,
            offsets = this.getOffsetsTo(container),
            // el's box
            left = offsets[0] + container.scrollLeft,
            top = offsets[1] + container.scrollTop,
            bottom = top + el.offsetHeight,
            right = left + el.offsetWidth,
            // ct's box
            ctClientHeight = container.clientHeight,
            ctScrollTop = parseInt(container.scrollTop, 10),
            ctScrollLeft = parseInt(container.scrollLeft, 10),
            ctBottom = ctScrollTop + ctClientHeight,
            ctRight = ctScrollLeft + container.clientWidth;

        if (el.offsetHeight > ctClientHeight || top < ctScrollTop) {
            container.scrollTop = top;
        } else if (bottom > ctBottom) {
            container.scrollTop = bottom - ctClientHeight;
        }
        // corrects IE, other browsers will ignore
        container.scrollTop = container.scrollTop;

        if (hscroll !== false) {
            if (el.offsetWidth > container.clientWidth || left < ctScrollLeft) {
                container.scrollLeft = left;
            }
            else if (right > ctRight) {
                container.scrollLeft = right - container.clientWidth;
            }
            container.scrollLeft = container.scrollLeft;
        }
        return this;
    },

    // private
    scrollChildIntoView : function(child, hscroll) {
        Ext.fly(child, '_scrollChildIntoView').scrollIntoView(this, hscroll);
    },

    /**
     * Scrolls this element the specified direction. Does bounds checking to make sure the scroll is
     * within this element's scrollable range.
     * @param {String} direction Possible values are: "l" (or "left"), "r" (or "right"), "t" (or "top", or "up"), "b" (or "bottom", or "down").
     * @param {Number} distance How far to scroll the element in pixels
     * @param {Boolean/Object} animate (optional) true for the default animation or a standard Element animation config object
     * @return {Boolean} Returns true if a scroll was triggered or false if the element
     * was scrolled as far as it could go.
     */
     scroll : function(direction, distance, animate) {
        if (!this.isScrollable()) {
            return false;
        }
        var el = this.dom,
            l = el.scrollLeft, t = el.scrollTop,
            w = el.scrollWidth, h = el.scrollHeight,
            cw = el.clientWidth, ch = el.clientHeight,
            scrolled = false, v,
            hash = {
                l: Math.min(l + distance, w-cw),
                r: v = Math.max(l - distance, 0),
                t: Math.max(t - distance, 0),
                b: Math.min(t + distance, h-ch)
            };
            hash.d = hash.b;
            hash.u = hash.t;

        direction = direction.substr(0, 1);
        if ((v = hash[direction]) > -1) {
            scrolled = true;
            this.scrollTo(direction == 'l' || direction == 'r' ? 'left' : 'top', v, this.anim(animate));
        }
        return scrolled;
    }
});
/**
 * @class Ext.Element
 */
Ext.Element.addMethods(
    function() {
        var VISIBILITY      = "visibility",
            DISPLAY         = "display",
            HIDDEN          = "hidden",
            NONE            = "none",
            XMASKED         = Ext.baseCSSPrefix + "masked",
            XMASKEDRELATIVE = Ext.baseCSSPrefix + "masked-relative",
            data            = Ext.Element.data;

        return {
            /**
             * Checks whether the element is currently visible using both visibility and display properties.
             * @param {Boolean} [deep=false] True to walk the dom and see if parent elements are hidden
             * @return {Boolean} True if the element is currently visible, else false
             */
            isVisible : function(deep) {
                var vis = !this.isStyle(VISIBILITY, HIDDEN) && !this.isStyle(DISPLAY, NONE),
                    p   = this.dom.parentNode;

                if (deep !== true || !vis) {
                    return vis;
                }

                while (p && !(/^body/i.test(p.tagName))) {
                    if (!Ext.fly(p, '_isVisible').isVisible()) {
                        return false;
                    }
                    p = p.parentNode;
                }
                return true;
            },

            /**
             * Returns true if display is not "none"
             * @return {Boolean}
             */
            isDisplayed : function() {
                return !this.isStyle(DISPLAY, NONE);
            },

            /**
             * Convenience method for setVisibilityMode(Element.DISPLAY)
             * @param {String} display (optional) What to set display to when visible
             * @return {Ext.Element} this
             */
            enableDisplayMode : function(display) {
                this.setVisibilityMode(Ext.Element.DISPLAY);

                if (!Ext.isEmpty(display)) {
                    data(this.dom, 'originalDisplay', display);
                }

                return this;
            },

            /**
             * Puts a mask over this element to disable user interaction. Requires core.css.
             * This method can only be applied to elements which accept child nodes.
             * @param {String} msg (optional) A message to display in the mask
             * @param {String} msgCls (optional) A css class to apply to the msg element
             * @return {Ext.Element} The mask element
             */
            mask : function(msg, msgCls) {
                var me  = this,
                    dom = me.dom,
                    setExpression = dom.style.setExpression,
                    dh  = Ext.DomHelper,
                    EXTELMASKMSG = Ext.baseCSSPrefix + "mask-msg",
                    el,
                    mask;

                if (!(/^body/i.test(dom.tagName) && me.getStyle('position') == 'static')) {
                    me.addCls(XMASKEDRELATIVE);
                }
                el = data(dom, 'maskMsg');
                if (el) {
                    el.remove();
                }
                el = data(dom, 'mask');
                if (el) {
                    el.remove();
                }

                mask = dh.append(dom, {cls : Ext.baseCSSPrefix + "mask"}, true);
                data(dom, 'mask', mask);

                me.addCls(XMASKED);
                mask.setDisplayed(true);

                if (typeof msg == 'string') {
                    var mm = dh.append(dom, {cls : EXTELMASKMSG, cn:{tag:'div'}}, true);
                    data(dom, 'maskMsg', mm);
                    mm.dom.className = msgCls ? EXTELMASKMSG + " " + msgCls : EXTELMASKMSG;
                    mm.dom.firstChild.innerHTML = msg;
                    mm.setDisplayed(true);
                    mm.center(me);
                }
                // NOTE: CSS expressions are resource intensive and to be used only as a last resort
                // These expressions are removed as soon as they are no longer necessary - in the unmask method.
                // In normal use cases an element will be masked for a limited period of time.
                // Fix for https://sencha.jira.com/browse/EXTJSIV-19.
                // IE6 strict mode and IE6-9 quirks mode takes off left+right padding when calculating width!
                if (!Ext.supports.IncludePaddingInWidthCalculation && setExpression) {
                    mask.dom.style.setExpression('width', 'this.parentNode.offsetWidth + "px"');
                }

                // Some versions and modes of IE subtract top+bottom padding when calculating height.
                // Different versions from those which make the same error for width!
                if (!Ext.supports.IncludePaddingInHeightCalculation && setExpression) {
                    mask.dom.style.setExpression('height', 'this.parentNode.offsetHeight + "px"');
                }
                // ie will not expand full height automatically
                else if (Ext.isIE && !(Ext.isIE7 && Ext.isStrict) && me.getStyle('height') == 'auto') {
                    mask.setSize(undefined, me.getHeight());
                }
                return mask;
            },

            /**
             * Removes a previously applied mask.
             */
            unmask : function() {
                var me      = this,
                    dom     = me.dom,
                    mask    = data(dom, 'mask'),
                    maskMsg = data(dom, 'maskMsg');

                if (mask) {
                    // Remove resource-intensive CSS expressions as soon as they are not required.
                    if (mask.dom.style.clearExpression) {
                        mask.dom.style.clearExpression('width');
                        mask.dom.style.clearExpression('height');
                    }
                    if (maskMsg) {
                        maskMsg.remove();
                        data(dom, 'maskMsg', undefined);
                    }

                    mask.remove();
                    data(dom, 'mask', undefined);
                    me.removeCls([XMASKED, XMASKEDRELATIVE]);
                }
            },
            /**
             * Returns true if this element is masked. Also re-centers any displayed message within the mask.
             * @return {Boolean}
             */
            isMasked : function() {
                var me = this,
                    mask = data(me.dom, 'mask'),
                    maskMsg = data(me.dom, 'maskMsg');

                if (mask && mask.isVisible()) {
                    if (maskMsg) {
                        maskMsg.center(me);
                    }
                    return true;
                }
                return false;
            },

            /**
             * Creates an iframe shim for this element to keep selects and other windowed objects from
             * showing through.
             * @return {Ext.Element} The new shim element
             */
            createShim : function() {
                var el = document.createElement('iframe'),
                    shim;

                el.frameBorder = '0';
                el.className = Ext.baseCSSPrefix + 'shim';
                el.src = Ext.SSL_SECURE_URL;
                shim = Ext.get(this.dom.parentNode.insertBefore(el, this.dom));
                shim.autoBoxAdjust = false;
                return shim;
            }
        };
    }()
);
/**
 * @class Ext.Element
 */
Ext.Element.addMethods({
    /**
     * Convenience method for constructing a KeyMap
     * @param {String/Number/Number[]/Object} key Either a string with the keys to listen for, the numeric key code, array of key codes or an object with the following options:
     * <code>{key: (number or array), shift: (true/false), ctrl: (true/false), alt: (true/false)}</code>
     * @param {Function} fn The function to call
     * @param {Object} scope (optional) The scope (<code>this</code> reference) in which the specified function is executed. Defaults to this Element.
     * @return {Ext.util.KeyMap} The KeyMap created
     */
    addKeyListener : function(key, fn, scope){
        var config;
        if(typeof key != 'object' || Ext.isArray(key)){
            config = {
                key: key,
                fn: fn,
                scope: scope
            };
        }else{
            config = {
                key : key.key,
                shift : key.shift,
                ctrl : key.ctrl,
                alt : key.alt,
                fn: fn,
                scope: scope
            };
        }
        return Ext.create('Ext.util.KeyMap', this, config);
    },

    /**
     * Creates a KeyMap for this element
     * @param {Object} config The KeyMap config. See {@link Ext.util.KeyMap} for more details
     * @return {Ext.util.KeyMap} The KeyMap created
     */
    addKeyMap : function(config){
        return Ext.create('Ext.util.KeyMap', this, config);
    }
});

//Import the newly-added Ext.Element functions into CompositeElementLite. We call this here because
//Element.keys.js is the last extra Ext.Element include in the ext-all.js build
Ext.CompositeElementLite.importElementMethods();

/**
 * @class Ext.CompositeElementLite
 */
Ext.apply(Ext.CompositeElementLite.prototype, {
    addElements : function(els, root){
        if(!els){
            return this;
        }
        if(typeof els == "string"){
            els = Ext.Element.selectorFunction(els, root);
        }
        var yels = this.elements;
        Ext.each(els, function(e) {
            yels.push(Ext.get(e));
        });
        return this;
    },

    /**
     * Returns the first Element
     * @return {Ext.Element}
     */
    first : function(){
        return this.item(0);
    },

    /**
     * Returns the last Element
     * @return {Ext.Element}
     */
    last : function(){
        return this.item(this.getCount()-1);
    },

    /**
     * Returns true if this composite contains the passed element
     * @param el {String/HTMLElement/Ext.Element/Number} The id of an element, or an Ext.Element, or an HtmlElement to find within the composite collection.
     * @return Boolean
     */
    contains : function(el){
        return this.indexOf(el) != -1;
    },

    /**
    * Removes the specified element(s).
    * @param {String/HTMLElement/Ext.Element/Number} el The id of an element, the Element itself, the index of the element in this composite
    * or an array of any of those.
    * @param {Boolean} removeDom (optional) True to also remove the element from the document
    * @return {Ext.CompositeElement} this
    */
    removeElement : function(keys, removeDom){
        var me = this,
            els = this.elements,
            el;
        Ext.each(keys, function(val){
            if ((el = (els[val] || els[val = me.indexOf(val)]))) {
                if(removeDom){
                    if(el.dom){
                        el.remove();
                    }else{
                        Ext.removeNode(el);
                    }
                }
                Ext.Array.erase(els, val, 1);
            }
        });
        return this;
    }
});

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

