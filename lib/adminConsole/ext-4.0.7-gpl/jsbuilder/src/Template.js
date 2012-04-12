/**
 * @class Ext.Template
 * <p>Represents an HTML fragment template. Templates may be {@link #compile precompiled}
 * for greater performance.</p>
 * <p>For example usage {@link #Template see the constructor}.</p>
 *
 * @constructor
 * An instance of this class may be created by passing to the constructor either
 * a single argument, or multiple arguments:
 * <div class="mdetail-params"><ul>
 * <li><b>single argument</b> : String/Array
 * <div class="sub-desc">
 * The single argument may be either a String or an Array:<ul>
 * <li><tt>String</tt> : </li><pre><code>
var t = new Ext.Template("&lt;div>Hello {0}.&lt;/div>");
t.{@link #append}('some-element', ['foo']);
   </code></pre>
 * <li><tt>Array</tt> : </li>
 * An Array will be combined with <code>join('')</code>.
<pre><code>
var t = new Ext.Template([
    '&lt;div name="{id}"&gt;',
        '&lt;span class="{cls}"&gt;{name:trim} {value:ellipsis(10)}&lt;/span&gt;',
    '&lt;/div&gt;',
]);
t.{@link #compile}();
t.{@link #append}('some-element', {id: 'myid', cls: 'myclass', name: 'foo', value: 'bar'});
   </code></pre>
 * </ul></div></li>
 * <li><b>multiple arguments</b> : String, Object, Array, ...
 * <div class="sub-desc">
 * Multiple arguments will be combined with <code>join('')</code>.
 * <pre><code>
var t = new Ext.Template(
    '&lt;div name="{id}"&gt;',
        '&lt;span class="{cls}"&gt;{name} {value}&lt;/span&gt;',
    '&lt;/div&gt;',
    // a configuration object:
    {
        compiled: true,      // {@link #compile} immediately
    }
);
   </code></pre>
 * <p><b>Notes</b>:</p>
 * <div class="mdetail-params"><ul>
 * <li>Formatting and <code>disableFormats</code> are not applicable for Sencha Touch.</li>
 * </ul></div>
 * </div></li>
 * </ul></div>
 * @param {Mixed} config
 */
Ext.Template = function(html) {
    var me = this,
        a = arguments,
        buf = [];

    if (Ext.isArray(html)) {
        html = html.join("");
    }
    else if (a.length > 1) {
        Ext.each(a, function(v) {
            if (Ext.isObject(v)) {
                Ext.apply(me, v);
            } else {
                buf.push(v);
            }
        });
        html = buf.join('');
    }

    // @private
    me.html = html;
    
    if (me.compiled) {
        me.compile();
    }
};

Ext.Template.prototype = {
    isTemplate: true,
    
    re: /\{([\w-]+)(?:\:([\w\.]*)(?:\((.*?)?\))?)?\}/g,
    argsRe: /^\s*['"](.*)["']\s*$/,
    compileARe: /\\/g,
    compileBRe: /(\r\n|\n)/g,
    compileCRe: /'/g,
    
    /**
     * @cfg {Boolean} disableFormats true to disable format functions in the template. If the template doesn't contain format functions, setting 
     * disableFormats to true will reduce apply time (defaults to false)
     */
    disableFormats: false,
    
    /**
     * Returns an HTML fragment of this template with the specified values applied.
     * @param {Object/Array} values The template values. Can be an array if your params are numeric (i.e. {0}) or an object (i.e. {foo: 'bar'})
     * @return {String} The HTML fragment
     * @hide repeat doc
     */
    applyTemplate: function(values) {
        var me = this,
            useF = me.disableFormats !== true,
            fm = Ext.util.Format,
            tpl = me,
            re,
            i,
            len;

        if (me.compiled) {
            return me.compiled(values);
        }
        function fn(m, name, format, args) {
            if (format && useF) {
                if (format.substr(0, 5) == "this.") {
                    return tpl.call(format.substr(5), values[name], values);
                }
                else {
                    if (args) {
                        // quoted values are required for strings in compiled templates,
                        // but for non compiled we need to strip them
                        // quoted reversed for jsmin
                        re = me.argsRe;
                        args = args.split(',');
                        for (i = 0, len = args.length; i < len; i++) {
                            args[i] = args[i].replace(re, "$1");
                        }
                        args = [values[name]].concat(args);
                    }
                    else {
                        args = [values[name]];
                    }
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
     * @param {Boolean} compile (optional) True to compile the template (defaults to undefined)
     * @return {Ext.Template} this
     */
    set: function(html, compile) {
        var me = this;
        me.html = html;
        me.compiled = null;
        return compile ? me.compile() : me;
    },

    /**
     * Compiles the template into an internal function, eliminating the RegEx overhead.
     * @return {Ext.Template} this
     * @hide repeat doc
     */
    compile: function() {
        var me = this,
            fm = Ext.util.Format,
            useF = me.disableFormats !== true,
            body;

        function fn(m, name, format, args) {
            if (format && useF) {
                args = args ? ',' + args: "";
                if (format.substr(0, 5) != "this.") {
                    format = "fm." + format + '(';
                }
                else {
                    format = 'this.call("' + format.substr(5) + '", ';
                    args = ", values";
                }
            }
            else {
                args = '';
                format = "(values['" + name + "'] == undefined ? '' : ";
            }
            return "'," + format + "values['" + name + "']" + args + ") ,'";
        }


        body = ["this.compiled = function(values){ return ['"];
        body.push(me.html.replace(me.compileARe, '\\\\').replace(me.compileBRe, '\\n').replace(me.compileCRe, "\\'").replace(me.re, fn));
        body.push("'].join('');};");
        body = body.join('');
        eval(body);
        return me;
    },

    /**
     * Applies the supplied values to the template and inserts the new node(s) as the first child of el.
     * @param {Mixed} el The context element
     * @param {Object/Array} values The template values. Can be an array if your params are numeric (i.e. {0}) or an object (i.e. {foo: 'bar'})
     * @param {Boolean} returnElement (optional) true to return a Ext.Element (defaults to undefined)
     * @return {HTMLElement/Ext.Element} The new node or Element
     */
    insertFirst: function(el, values, returnElement) {
        return this.doInsert('afterBegin', el, values, returnElement);
    },

    /**
     * Applies the supplied values to the template and inserts the new node(s) before el.
     * @param {Mixed} el The context element
     * @param {Object/Array} values The template values. Can be an array if your params are numeric (i.e. {0}) or an object (i.e. {foo: 'bar'})
     * @param {Boolean} returnElement (optional) true to return a Ext.Element (defaults to undefined)
     * @return {HTMLElement/Ext.Element} The new node or Element
     */
    insertBefore: function(el, values, returnElement) {
        return this.doInsert('beforeBegin', el, values, returnElement);
    },

    /**
     * Applies the supplied values to the template and inserts the new node(s) after el.
     * @param {Mixed} el The context element
     * @param {Object/Array} values The template values. Can be an array if your params are numeric (i.e. {0}) or an object (i.e. {foo: 'bar'})
     * @param {Boolean} returnElement (optional) true to return a Ext.Element (defaults to undefined)
     * @return {HTMLElement/Ext.Element} The new node or Element
     */
    insertAfter: function(el, values, returnElement) {
        return this.doInsert('afterEnd', el, values, returnElement);
    },

    /**
     * Applies the supplied <code>values</code> to the template and appends
     * the new node(s) to the specified <code>el</code>.
     * <p>For example usage {@link #Template see the constructor}.</p>
     * @param {Mixed} el The context element
     * @param {Object/Array} values
     * The template values. Can be an array if the params are numeric (i.e. <code>{0}</code>)
     * or an object (i.e. <code>{foo: 'bar'}</code>).
     * @param {Boolean} returnElement (optional) true to return an Ext.Element (defaults to undefined)
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
     * @param {Mixed} el The context element
     * @param {Object/Array} values The template values. Can be an array if your params are numeric (i.e. {0}) or an object (i.e. {foo: 'bar'})
     * @param {Boolean} returnElement (optional) true to return a Ext.Element (defaults to undefined)
     * @return {HTMLElement/Ext.Element} The new node or Element
     */
    overwrite: function(el, values, returnElement) {
        el = Ext.getDom(el);
        el.innerHTML = this.applyTemplate(values);
        return returnElement ? Ext.get(el.firstChild, true) : el.firstChild;
    },

    // private function used to call members
    call: function(fnName, value, allValues) {
        return this[fnName](value, allValues);
    }
};
/**
 * Alias for {@link #applyTemplate}
 * Returns an HTML fragment of this template with the specified <code>values</code> applied.
 * @param {Object/Array} values
 * The template values. Can be an array if the params are numeric (i.e. <code>{0}</code>)
 * or an object (i.e. <code>{foo: 'bar'}</code>).
 * @return {String} The HTML fragment
 * @member Ext.Template
 * @method apply
 */
Ext.Template.prototype.apply = Ext.Template.prototype.applyTemplate;