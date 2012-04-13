/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * Represents an HTML fragment template. Templates may be {@link #compile precompiled} for greater performance.
 *
 * An instance of this class may be created by passing to the constructor either a single argument, or multiple
 * arguments:
 *
 * # Single argument: String/Array
 *
 * The single argument may be either a String or an Array:
 *
 * - String:
 *
 *       var t = new Ext.Template("<div>Hello {0}.</div>");
 *       t.{@link #append}('some-element', ['foo']);
 *
 * - Array:
 *
 *   An Array will be combined with `join('')`.
 *
 *       var t = new Ext.Template([
 *           '<div name="{id}">',
 *               '<span class="{cls}">{name:trim} {value:ellipsis(10)}</span>',
 *           '</div>',
 *       ]);
 *       t.{@link #compile}();
 *       t.{@link #append}('some-element', {id: 'myid', cls: 'myclass', name: 'foo', value: 'bar'});
 *
 * # Multiple arguments: String, Object, Array, ...
 *
 * Multiple arguments will be combined with `join('')`.
 *
 *     var t = new Ext.Template(
 *         '<div name="{id}">',
 *             '<span class="{cls}">{name} {value}</span>',
 *         '</div>',
 *         // a configuration object:
 *         {
 *             compiled: true,      // {@link #compile} immediately
 *         }
 *     );
 *
 * # Notes
 *
 * - For a list of available format functions, see {@link Ext.util.Format}.
 * - `disableFormats` reduces `{@link #apply}` time when no formatting is required.
 */
Ext.define('Ext.Template', {

    /* Begin Definitions */

    requires: ['Ext.DomHelper', 'Ext.util.Format'],

    inheritableStatics: {
        /**
         * Creates a template from the passed element's value (_display:none_ textarea, preferred) or innerHTML.
         * @param {String/HTMLElement} el A DOM element or its id
         * @param {Object} config (optional) Config object
         * @return {Ext.Template} The created template
         * @static
         * @inheritable
         */
        from: function(el, config) {
            el = Ext.getDom(el);
            return new this(el.value || el.innerHTML, config || '');
        }
    },

    /* End Definitions */

    /**
     * Creates new template.
     * 
     * @param {String...} html List of strings to be concatenated into template.
     * Alternatively an array of strings can be given, but then no config object may be passed.
     * @param {Object} config (optional) Config object
     */
    constructor: function(html) {
        var me = this,
            args = arguments,
            buffer = [],
            i = 0,
            length = args.length,
            value;

        me.initialConfig = {};

        if (length > 1) {
            for (; i < length; i++) {
                value = args[i];
                if (typeof value == 'object') {
                    Ext.apply(me.initialConfig, value);
                    Ext.apply(me, value);
                } else {
                    buffer.push(value);
                }
            }
            html = buffer.join('');
        } else {
            if (Ext.isArray(html)) {
                buffer.push(html.join(''));
            } else {
                buffer.push(html);
            }
        }

        // @private
        me.html = buffer.join('');

        if (me.compiled) {
            me.compile();
        }
    },

    isTemplate: true,

    /**
     * @cfg {Boolean} compiled
     * True to immediately compile the template. Defaults to false.
     */

    /**
     * @cfg {Boolean} disableFormats
     * True to disable format functions in the template. If the template doesn't contain
     * format functions, setting disableFormats to true will reduce apply time. Defaults to false.
     */
    disableFormats: false,

    re: /\{([\w\-]+)(?:\:([\w\.]*)(?:\((.*?)?\))?)?\}/g,

    /**
     * Returns an HTML fragment of this template with the specified values applied.
     *
     * @param {Object/Array} values The template values. Can be an array if your params are numeric:
     *
     *     var tpl = new Ext.Template('Name: {0}, Age: {1}');
     *     tpl.applyTemplate(['John', 25]);
     *
     * or an object:
     *
     *     var tpl = new Ext.Template('Name: {name}, Age: {age}');
     *     tpl.applyTemplate({name: 'John', age: 25});
     *
     * @return {String} The HTML fragment
     */
    applyTemplate: function(values) {
        var me = this,
            useFormat = me.disableFormats !== true,
            fm = Ext.util.Format,
            tpl = me;

        if (me.compiled) {
            return me.compiled(values);
        }
        function fn(m, name, format, args) {
            if (format && useFormat) {
                if (args) {
                    args = [values[name]].concat(Ext.functionFactory('return ['+ args +'];')());
                } else {
                    args = [values[name]];
                }
                if (format.substr(0, 5) == "this.") {
                    return tpl[format.substr(5)].apply(tpl, args);
                }
                else {
                    return fm[format].apply(fm, args);
                }
            }
            else {
                return values[name] !== undefined ? values[name] : "";
            }
        }
        return me.html.replace(me.re, fn);
    },

    /**
     * Sets the HTML used as the template and optionally compiles it.
     * @param {String} html
     * @param {Boolean} compile (optional) True to compile the template.
     * @return {Ext.Template} this
     */
    set: function(html, compile) {
        var me = this;
        me.html = html;
        me.compiled = null;
        return compile ? me.compile() : me;
    },

    compileARe: /\\/g,
    compileBRe: /(\r\n|\n)/g,
    compileCRe: /'/g,

    /**
     * Compiles the template into an internal function, eliminating the RegEx overhead.
     * @return {Ext.Template} this
     */
    compile: function() {
        var me = this,
            fm = Ext.util.Format,
            useFormat = me.disableFormats !== true,
            body, bodyReturn;

        function fn(m, name, format, args) {
            if (format && useFormat) {
                args = args ? ',' + args: "";
                if (format.substr(0, 5) != "this.") {
                    format = "fm." + format + '(';
                }
                else {
                    format = 'this.' + format.substr(5) + '(';
                }
            }
            else {
                args = '';
                format = "(values['" + name + "'] == undefined ? '' : ";
            }
            return "'," + format + "values['" + name + "']" + args + ") ,'";
        }

        bodyReturn = me.html.replace(me.compileARe, '\\\\').replace(me.compileBRe, '\\n').replace(me.compileCRe, "\\'").replace(me.re, fn);
        body = "this.compiled = function(values){ return ['" + bodyReturn + "'].join('');};";
        eval(body);
        return me;
    },

    /**
     * Applies the supplied values to the template and inserts the new node(s) as the first child of el.
     *
     * @param {String/HTMLElement/Ext.Element} el The context element
     * @param {Object/Array} values The template values. See {@link #applyTemplate} for details.
     * @param {Boolean} returnElement (optional) true to return a Ext.Element.
     * @return {HTMLElement/Ext.Element} The new node or Element
     */
    insertFirst: function(el, values, returnElement) {
        return this.doInsert('afterBegin', el, values, returnElement);
    },

    /**
     * Applies the supplied values to the template and inserts the new node(s) before el.
     *
     * @param {String/HTMLElement/Ext.Element} el The context element
     * @param {Object/Array} values The template values. See {@link #applyTemplate} for details.
     * @param {Boolean} returnElement (optional) true to return a Ext.Element.
     * @return {HTMLElement/Ext.Element} The new node or Element
     */
    insertBefore: function(el, values, returnElement) {
        return this.doInsert('beforeBegin', el, values, returnElement);
    },

    /**
     * Applies the supplied values to the template and inserts the new node(s) after el.
     *
     * @param {String/HTMLElement/Ext.Element} el The context element
     * @param {Object/Array} values The template values. See {@link #applyTemplate} for details.
     * @param {Boolean} returnElement (optional) true to return a Ext.Element.
     * @return {HTMLElement/Ext.Element} The new node or Element
     */
    insertAfter: function(el, values, returnElement) {
        return this.doInsert('afterEnd', el, values, returnElement);
    },

    /**
     * Applies the supplied `values` to the template and appends the new node(s) to the specified `el`.
     *
     * For example usage see {@link Ext.Template Ext.Template class docs}.
     *
     * @param {String/HTMLElement/Ext.Element} el The context element
     * @param {Object/Array} values The template values. See {@link #applyTemplate} for details.
     * @param {Boolean} returnElement (optional) true to return an Ext.Element.
     * @return {HTMLElement/Ext.Element} The new node or Element
     */
    append: function(el, values, returnElement) {
        return this.doInsert('beforeEnd', el, values, returnElement);
    },

    doInsert: function(where, el, values, returnEl) {
        el = Ext.getDom(el);
        var newNode = Ext.DomHelper.insertHtml(where, el, this.applyTemplate(values));
        return returnEl ? Ext.get(newNode, true) : newNode;
    },

    /**
     * Applies the supplied values to the template and overwrites the content of el with the new node(s).
     *
     * @param {String/HTMLElement/Ext.Element} el The context element
     * @param {Object/Array} values The template values. See {@link #applyTemplate} for details.
     * @param {Boolean} returnElement (optional) true to return a Ext.Element.
     * @return {HTMLElement/Ext.Element} The new node or Element
     */
    overwrite: function(el, values, returnElement) {
        el = Ext.getDom(el);
        el.innerHTML = this.applyTemplate(values);
        return returnElement ? Ext.get(el.firstChild, true) : el.firstChild;
    }
}, function() {

    /**
     * @method apply
     * @member Ext.Template
     * Alias for {@link #applyTemplate}.
     * @alias Ext.Template#applyTemplate
     */
    this.createAlias('apply', 'applyTemplate');
});

