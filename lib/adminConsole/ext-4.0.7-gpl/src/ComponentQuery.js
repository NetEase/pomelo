/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * Provides searching of Components within Ext.ComponentManager (globally) or a specific
 * Ext.container.Container on the document with a similar syntax to a CSS selector.
 *
 * Components can be retrieved by using their {@link Ext.Component xtype} with an optional . prefix
 *
 * - `component` or `.component`
 * - `gridpanel` or `.gridpanel`
 *
 * An itemId or id must be prefixed with a #
 *
 * - `#myContainer`
 *
 * Attributes must be wrapped in brackets
 *
 * - `component[autoScroll]`
 * - `panel[title="Test"]`
 *
 * Member expressions from candidate Components may be tested. If the expression returns a *truthy* value,
 * the candidate Component will be included in the query:
 *
 *     var disabledFields = myFormPanel.query("{isDisabled()}");
 *
 * Pseudo classes may be used to filter results in the same way as in {@link Ext.DomQuery DomQuery}:
 *
 *     // Function receives array and returns a filtered array.
 *     Ext.ComponentQuery.pseudos.invalid = function(items) {
 *         var i = 0, l = items.length, c, result = [];
 *         for (; i < l; i++) {
 *             if (!(c = items[i]).isValid()) {
 *                 result.push(c);
 *             }
 *         }
 *         return result;
 *     };
 *      
 *     var invalidFields = myFormPanel.query('field:invalid');
 *     if (invalidFields.length) {
 *         invalidFields[0].getEl().scrollIntoView(myFormPanel.body);
 *         for (var i = 0, l = invalidFields.length; i < l; i++) {
 *             invalidFields[i].getEl().frame("red");
 *         }
 *     }
 *
 * Default pseudos include:
 *
 * - not
 * - last
 *
 * Queries return an array of components.
 * Here are some example queries.
 *
 *     // retrieve all Ext.Panels in the document by xtype
 *     var panelsArray = Ext.ComponentQuery.query('panel');
 *
 *     // retrieve all Ext.Panels within the container with an id myCt
 *     var panelsWithinmyCt = Ext.ComponentQuery.query('#myCt panel');
 *
 *     // retrieve all direct children which are Ext.Panels within myCt
 *     var directChildPanel = Ext.ComponentQuery.query('#myCt > panel');
 *
 *     // retrieve all grids and trees
 *     var gridsAndTrees = Ext.ComponentQuery.query('gridpanel, treepanel');
 *
 * For easy access to queries based from a particular Container see the {@link Ext.container.Container#query},
 * {@link Ext.container.Container#down} and {@link Ext.container.Container#child} methods. Also see
 * {@link Ext.Component#up}.
 */
Ext.define('Ext.ComponentQuery', {
    singleton: true,
    uses: ['Ext.ComponentManager']
}, function() {

    var cq = this,

        // A function source code pattern with a placeholder which accepts an expression which yields a truth value when applied
        // as a member on each item in the passed array.
        filterFnPattern = [
            'var r = [],',
                'i = 0,',
                'it = items,',
                'l = it.length,',
                'c;',
            'for (; i < l; i++) {',
                'c = it[i];',
                'if (c.{0}) {',
                   'r.push(c);',
                '}',
            '}',
            'return r;'
        ].join(''),

        filterItems = function(items, operation) {
            // Argument list for the operation is [ itemsArray, operationArg1, operationArg2...]
            // The operation's method loops over each item in the candidate array and
            // returns an array of items which match its criteria
            return operation.method.apply(this, [ items ].concat(operation.args));
        },

        getItems = function(items, mode) {
            var result = [],
                i = 0,
                length = items.length,
                candidate,
                deep = mode !== '>';
                
            for (; i < length; i++) {
                candidate = items[i];
                if (candidate.getRefItems) {
                    result = result.concat(candidate.getRefItems(deep));
                }
            }
            return result;
        },

        getAncestors = function(items) {
            var result = [],
                i = 0,
                length = items.length,
                candidate;
            for (; i < length; i++) {
                candidate = items[i];
                while (!!(candidate = (candidate.ownerCt || candidate.floatParent))) {
                    result.push(candidate);
                }
            }
            return result;
        },

        // Filters the passed candidate array and returns only items which match the passed xtype
        filterByXType = function(items, xtype, shallow) {
            if (xtype === '*') {
                return items.slice();
            }
            else {
                var result = [],
                    i = 0,
                    length = items.length,
                    candidate;
                for (; i < length; i++) {
                    candidate = items[i];
                    if (candidate.isXType(xtype, shallow)) {
                        result.push(candidate);
                    }
                }
                return result;
            }
        },

        // Filters the passed candidate array and returns only items which have the passed className
        filterByClassName = function(items, className) {
            var EA = Ext.Array,
                result = [],
                i = 0,
                length = items.length,
                candidate;
            for (; i < length; i++) {
                candidate = items[i];
                if (candidate.el ? candidate.el.hasCls(className) : EA.contains(candidate.initCls(), className)) {
                    result.push(candidate);
                }
            }
            return result;
        },

        // Filters the passed candidate array and returns only items which have the specified property match
        filterByAttribute = function(items, property, operator, value) {
            var result = [],
                i = 0,
                length = items.length,
                candidate;
            for (; i < length; i++) {
                candidate = items[i];
                if (!value ? !!candidate[property] : (String(candidate[property]) === value)) {
                    result.push(candidate);
                }
            }
            return result;
        },

        // Filters the passed candidate array and returns only items which have the specified itemId or id
        filterById = function(items, id) {
            var result = [],
                i = 0,
                length = items.length,
                candidate;
            for (; i < length; i++) {
                candidate = items[i];
                if (candidate.getItemId() === id) {
                    result.push(candidate);
                }
            }
            return result;
        },

        // Filters the passed candidate array and returns only items which the named pseudo class matcher filters in
        filterByPseudo = function(items, name, value) {
            return cq.pseudos[name](items, value);
        },

        // Determines leading mode
        // > for direct child, and ^ to switch to ownerCt axis
        modeRe = /^(\s?([>\^])\s?|\s|$)/,

        // Matches a token with possibly (true|false) appended for the "shallow" parameter
        tokenRe = /^(#)?([\w\-]+|\*)(?:\((true|false)\))?/,

        matchers = [{
            // Checks for .xtype with possibly (true|false) appended for the "shallow" parameter
            re: /^\.([\w\-]+)(?:\((true|false)\))?/,
            method: filterByXType
        },{
            // checks for [attribute=value]
            re: /^(?:[\[](?:@)?([\w\-]+)\s?(?:(=|.=)\s?['"]?(.*?)["']?)?[\]])/,
            method: filterByAttribute
        }, {
            // checks for #cmpItemId
            re: /^#([\w\-]+)/,
            method: filterById
        }, {
            // checks for :<pseudo_class>(<selector>)
            re: /^\:([\w\-]+)(?:\(((?:\{[^\}]+\})|(?:(?!\{)[^\s>\/]*?(?!\})))\))?/,
            method: filterByPseudo
        }, {
            // checks for {<member_expression>}
            re: /^(?:\{([^\}]+)\})/,
            method: filterFnPattern
        }];

    // @class Ext.ComponentQuery.Query
    // This internal class is completely hidden in documentation.
    cq.Query = Ext.extend(Object, {
        constructor: function(cfg) {
            cfg = cfg || {};
            Ext.apply(this, cfg);
        },

        // Executes this Query upon the selected root.
        // The root provides the initial source of candidate Component matches which are progressively
        // filtered by iterating through this Query's operations cache.
        // If no root is provided, all registered Components are searched via the ComponentManager.
        // root may be a Container who's descendant Components are filtered
        // root may be a Component with an implementation of getRefItems which provides some nested Components such as the
        // docked items within a Panel.
        // root may be an array of candidate Components to filter using this Query.
        execute : function(root) {
            var operations = this.operations,
                i = 0,
                length = operations.length,
                operation,
                workingItems;

            // no root, use all Components in the document
            if (!root) {
                workingItems = Ext.ComponentManager.all.getArray();
            }
            // Root is a candidate Array
            else if (Ext.isArray(root)) {
                workingItems = root;
            }

            // We are going to loop over our operations and take care of them
            // one by one.
            for (; i < length; i++) {
                operation = operations[i];

                // The mode operation requires some custom handling.
                // All other operations essentially filter down our current
                // working items, while mode replaces our current working
                // items by getting children from each one of our current
                // working items. The type of mode determines the type of
                // children we get. (e.g. > only gets direct children)
                if (operation.mode === '^') {
                    workingItems = getAncestors(workingItems || [root]);
                }
                else if (operation.mode) {
                    workingItems = getItems(workingItems || [root], operation.mode);
                }
                else {
                    workingItems = filterItems(workingItems || getItems([root]), operation);
                }

                // If this is the last operation, it means our current working
                // items are the final matched items. Thus return them!
                if (i === length -1) {
                    return workingItems;
                }
            }
            return [];
        },

        is: function(component) {
            var operations = this.operations,
                components = Ext.isArray(component) ? component : [component],
                originalLength = components.length,
                lastOperation = operations[operations.length-1],
                ln, i;

            components = filterItems(components, lastOperation);
            if (components.length === originalLength) {
                if (operations.length > 1) {
                    for (i = 0, ln = components.length; i < ln; i++) {
                        if (Ext.Array.indexOf(this.execute(), components[i]) === -1) {
                            return false;
                        }
                    }
                }
                return true;
            }
            return false;
        }
    });

    Ext.apply(this, {

        // private cache of selectors and matching ComponentQuery.Query objects
        cache: {},

        // private cache of pseudo class filter functions
        pseudos: {
            not: function(components, selector){
                var CQ = Ext.ComponentQuery,
                    i = 0,
                    length = components.length,
                    results = [],
                    index = -1,
                    component;
                
                for(; i < length; ++i) {
                    component = components[i];
                    if (!CQ.is(component, selector)) {
                        results[++index] = component;
                    }
                }
                return results;
            },
            last: function(components) {
                return components[components.length - 1];
            }
        },

        /**
         * Returns an array of matched Components from within the passed root object.
         *
         * This method filters returned Components in a similar way to how CSS selector based DOM
         * queries work using a textual selector string.
         *
         * See class summary for details.
         *
         * @param {String} selector The selector string to filter returned Components
         * @param {Ext.container.Container} root The Container within which to perform the query.
         * If omitted, all Components within the document are included in the search.
         * 
         * This parameter may also be an array of Components to filter according to the selector.</p>
         * @returns {Ext.Component[]} The matched Components.
         * 
         * @member Ext.ComponentQuery
         */
        query: function(selector, root) {
            var selectors = selector.split(','),
                length = selectors.length,
                i = 0,
                results = [],
                noDupResults = [], 
                dupMatcher = {}, 
                query, resultsLn, cmp;

            for (; i < length; i++) {
                selector = Ext.String.trim(selectors[i]);
                query = this.cache[selector];
                if (!query) {
                    this.cache[selector] = query = this.parse(selector);
                }
                results = results.concat(query.execute(root));
            }

            // multiple selectors, potential to find duplicates
            // lets filter them out.
            if (length > 1) {
                resultsLn = results.length;
                for (i = 0; i < resultsLn; i++) {
                    cmp = results[i];
                    if (!dupMatcher[cmp.id]) {
                        noDupResults.push(cmp);
                        dupMatcher[cmp.id] = true;
                    }
                }
                results = noDupResults;
            }
            return results;
        },

        /**
         * Tests whether the passed Component matches the selector string.
         * @param {Ext.Component} component The Component to test
         * @param {String} selector The selector string to test against.
         * @return {Boolean} True if the Component matches the selector.
         * @member Ext.ComponentQuery
         */
        is: function(component, selector) {
            if (!selector) {
                return true;
            }
            var query = this.cache[selector];
            if (!query) {
                this.cache[selector] = query = this.parse(selector);
            }
            return query.is(component);
        },

        parse: function(selector) {
            var operations = [],
                length = matchers.length,
                lastSelector,
                tokenMatch,
                matchedChar,
                modeMatch,
                selectorMatch,
                i, matcher, method;

            // We are going to parse the beginning of the selector over and
            // over again, slicing off the selector any portions we converted into an
            // operation, until it is an empty string.
            while (selector && lastSelector !== selector) {
                lastSelector = selector;

                // First we check if we are dealing with a token like #, * or an xtype
                tokenMatch = selector.match(tokenRe);

                if (tokenMatch) {
                    matchedChar = tokenMatch[1];

                    // If the token is prefixed with a # we push a filterById operation to our stack
                    if (matchedChar === '#') {
                        operations.push({
                            method: filterById,
                            args: [Ext.String.trim(tokenMatch[2])]
                        });
                    }
                    // If the token is prefixed with a . we push a filterByClassName operation to our stack
                    // FIXME: Not enabled yet. just needs \. adding to the tokenRe prefix
                    else if (matchedChar === '.') {
                        operations.push({
                            method: filterByClassName,
                            args: [Ext.String.trim(tokenMatch[2])]
                        });
                    }
                    // If the token is a * or an xtype string, we push a filterByXType
                    // operation to the stack.
                    else {
                        operations.push({
                            method: filterByXType,
                            args: [Ext.String.trim(tokenMatch[2]), Boolean(tokenMatch[3])]
                        });
                    }

                    // Now we slice of the part we just converted into an operation
                    selector = selector.replace(tokenMatch[0], '');
                }

                // If the next part of the query is not a space or > or ^, it means we
                // are going to check for more things that our current selection
                // has to comply to.
                while (!(modeMatch = selector.match(modeRe))) {
                    // Lets loop over each type of matcher and execute it
                    // on our current selector.
                    for (i = 0; selector && i < length; i++) {
                        matcher = matchers[i];
                        selectorMatch = selector.match(matcher.re);
                        method = matcher.method;

                        // If we have a match, add an operation with the method
                        // associated with this matcher, and pass the regular
                        // expression matches are arguments to the operation.
                        if (selectorMatch) {
                            operations.push({
                                method: Ext.isString(matcher.method)
                                    // Turn a string method into a function by formatting the string with our selector matche expression
                                    // A new method is created for different match expressions, eg {id=='textfield-1024'}
                                    // Every expression may be different in different selectors.
                                    ? Ext.functionFactory('items', Ext.String.format.apply(Ext.String, [method].concat(selectorMatch.slice(1))))
                                    : matcher.method,
                                args: selectorMatch.slice(1)
                            });
                            selector = selector.replace(selectorMatch[0], '');
                            break; // Break on match
                        }
                        //<debug>
                        // Exhausted all matches: It's an error
                        if (i === (length - 1)) {
                            Ext.Error.raise('Invalid ComponentQuery selector: "' + arguments[0] + '"');
                        }
                        //</debug>
                    }
                }

                // Now we are going to check for a mode change. This means a space
                // or a > to determine if we are going to select all the children
                // of the currently matched items, or a ^ if we are going to use the
                // ownerCt axis as the candidate source.
                if (modeMatch[1]) { // Assignment, and test for truthiness!
                    operations.push({
                        mode: modeMatch[2]||modeMatch[1]
                    });
                    selector = selector.replace(modeMatch[0], '');
                }
            }

            //  Now that we have all our operations in an array, we are going
            // to create a new Query using these operations.
            return new cq.Query({
                operations: operations
            });
        }
    });
});
