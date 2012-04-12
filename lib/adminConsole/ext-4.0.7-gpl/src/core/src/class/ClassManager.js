/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * @author Jacky Nguyen <jacky@sencha.com>
 * @docauthor Jacky Nguyen <jacky@sencha.com>
 * @class Ext.ClassManager
 *
 * Ext.ClassManager manages all classes and handles mapping from string class name to
 * actual class objects throughout the whole framework. It is not generally accessed directly, rather through
 * these convenient shorthands:
 *
 * - {@link Ext#define Ext.define}
 * - {@link Ext#create Ext.create}
 * - {@link Ext#widget Ext.widget}
 * - {@link Ext#getClass Ext.getClass}
 * - {@link Ext#getClassName Ext.getClassName}
 *
 * # Basic syntax:
 *
 *     Ext.define(className, properties);
 *
 * in which `properties` is an object represent a collection of properties that apply to the class. See
 * {@link Ext.ClassManager#create} for more detailed instructions.
 *
 *     Ext.define('Person', {
 *          name: 'Unknown',
 *
 *          constructor: function(name) {
 *              if (name) {
 *                  this.name = name;
 *              }
 *
 *              return this;
 *          },
 *
 *          eat: function(foodType) {
 *              alert("I'm eating: " + foodType);
 *
 *              return this;
 *          }
 *     });
 *
 *     var aaron = new Person("Aaron");
 *     aaron.eat("Sandwich"); // alert("I'm eating: Sandwich");
 *
 * Ext.Class has a powerful set of extensible {@link Ext.Class#registerPreprocessor pre-processors} which takes care of
 * everything related to class creation, including but not limited to inheritance, mixins, configuration, statics, etc.
 *
 * # Inheritance:
 *
 *     Ext.define('Developer', {
 *          extend: 'Person',
 *
 *          constructor: function(name, isGeek) {
 *              this.isGeek = isGeek;
 *
 *              // Apply a method from the parent class' prototype
 *              this.callParent([name]);
 *
 *              return this;
 *
 *          },
 *
 *          code: function(language) {
 *              alert("I'm coding in: " + language);
 *
 *              this.eat("Bugs");
 *
 *              return this;
 *          }
 *     });
 *
 *     var jacky = new Developer("Jacky", true);
 *     jacky.code("JavaScript"); // alert("I'm coding in: JavaScript");
 *                               // alert("I'm eating: Bugs");
 *
 * See {@link Ext.Base#callParent} for more details on calling superclass' methods
 *
 * # Mixins:
 *
 *     Ext.define('CanPlayGuitar', {
 *          playGuitar: function() {
 *             alert("F#...G...D...A");
 *          }
 *     });
 *
 *     Ext.define('CanComposeSongs', {
 *          composeSongs: function() { ... }
 *     });
 *
 *     Ext.define('CanSing', {
 *          sing: function() {
 *              alert("I'm on the highway to hell...")
 *          }
 *     });
 *
 *     Ext.define('Musician', {
 *          extend: 'Person',
 *
 *          mixins: {
 *              canPlayGuitar: 'CanPlayGuitar',
 *              canComposeSongs: 'CanComposeSongs',
 *              canSing: 'CanSing'
 *          }
 *     })
 *
 *     Ext.define('CoolPerson', {
 *          extend: 'Person',
 *
 *          mixins: {
 *              canPlayGuitar: 'CanPlayGuitar',
 *              canSing: 'CanSing'
 *          },
 *
 *          sing: function() {
 *              alert("Ahem....");
 *
 *              this.mixins.canSing.sing.call(this);
 *
 *              alert("[Playing guitar at the same time...]");
 *
 *              this.playGuitar();
 *          }
 *     });
 *
 *     var me = new CoolPerson("Jacky");
 *
 *     me.sing(); // alert("Ahem...");
 *                // alert("I'm on the highway to hell...");
 *                // alert("[Playing guitar at the same time...]");
 *                // alert("F#...G...D...A");
 *
 * # Config:
 *
 *     Ext.define('SmartPhone', {
 *          config: {
 *              hasTouchScreen: false,
 *              operatingSystem: 'Other',
 *              price: 500
 *          },
 *
 *          isExpensive: false,
 *
 *          constructor: function(config) {
 *              this.initConfig(config);
 *
 *              return this;
 *          },
 *
 *          applyPrice: function(price) {
 *              this.isExpensive = (price > 500);
 *
 *              return price;
 *          },
 *
 *          applyOperatingSystem: function(operatingSystem) {
 *              if (!(/^(iOS|Android|BlackBerry)$/i).test(operatingSystem)) {
 *                  return 'Other';
 *              }
 *
 *              return operatingSystem;
 *          }
 *     });
 *
 *     var iPhone = new SmartPhone({
 *          hasTouchScreen: true,
 *          operatingSystem: 'iOS'
 *     });
 *
 *     iPhone.getPrice(); // 500;
 *     iPhone.getOperatingSystem(); // 'iOS'
 *     iPhone.getHasTouchScreen(); // true;
 *     iPhone.hasTouchScreen(); // true
 *
 *     iPhone.isExpensive; // false;
 *     iPhone.setPrice(600);
 *     iPhone.getPrice(); // 600
 *     iPhone.isExpensive; // true;
 *
 *     iPhone.setOperatingSystem('AlienOS');
 *     iPhone.getOperatingSystem(); // 'Other'
 *
 * # Statics:
 *
 *     Ext.define('Computer', {
 *          statics: {
 *              factory: function(brand) {
 *                 // 'this' in static methods refer to the class itself
 *                  return new this(brand);
 *              }
 *          },
 *
 *          constructor: function() { ... }
 *     });
 *
 *     var dellComputer = Computer.factory('Dell');
 *
 * Also see {@link Ext.Base#statics} and {@link Ext.Base#self} for more details on accessing
 * static properties within class methods
 *
 * @singleton
 */
(function(Class, alias) {

    var slice = Array.prototype.slice;

    var Manager = Ext.ClassManager = {

        /**
         * @property {Object} classes
         * All classes which were defined through the ClassManager. Keys are the
         * name of the classes and the values are references to the classes.
         * @private
         */
        classes: {},

        /**
         * @private
         */
        existCache: {},

        /**
         * @private
         */
        namespaceRewrites: [{
            from: 'Ext.',
            to: Ext
        }],

        /**
         * @private
         */
        maps: {
            alternateToName: {},
            aliasToName: {},
            nameToAliases: {}
        },

        /** @private */
        enableNamespaceParseCache: true,

        /** @private */
        namespaceParseCache: {},

        /** @private */
        instantiators: [],

        //<debug>
        /** @private */
        instantiationCounts: {},
        //</debug>

        /**
         * Checks if a class has already been created.
         *
         * @param {String} className
         * @return {Boolean} exist
         */
        isCreated: function(className) {
            var i, ln, part, root, parts;

            //<debug error>
            if (typeof className !== 'string' || className.length < 1) {
                Ext.Error.raise({
                    sourceClass: "Ext.ClassManager",
                    sourceMethod: "exist",
                    msg: "Invalid classname, must be a string and must not be empty"
                });
            }
            //</debug>

            if (this.classes.hasOwnProperty(className) || this.existCache.hasOwnProperty(className)) {
                return true;
            }

            root = Ext.global;
            parts = this.parseNamespace(className);

            for (i = 0, ln = parts.length; i < ln; i++) {
                part = parts[i];

                if (typeof part !== 'string') {
                    root = part;
                } else {
                    if (!root || !root[part]) {
                        return false;
                    }

                    root = root[part];
                }
            }

            Ext.Loader.historyPush(className);

            this.existCache[className] = true;

            return true;
        },

        /**
         * Supports namespace rewriting
         * @private
         */
        parseNamespace: function(namespace) {
            //<debug error>
            if (typeof namespace !== 'string') {
                Ext.Error.raise({
                    sourceClass: "Ext.ClassManager",
                    sourceMethod: "parseNamespace",
                    msg: "Invalid namespace, must be a string"
                });
            }
            //</debug>

            var cache = this.namespaceParseCache;

            if (this.enableNamespaceParseCache) {
                if (cache.hasOwnProperty(namespace)) {
                    return cache[namespace];
                }
            }

            var parts = [],
                rewrites = this.namespaceRewrites,
                rewrite, from, to, i, ln, root = Ext.global;

            for (i = 0, ln = rewrites.length; i < ln; i++) {
                rewrite = rewrites[i];
                from = rewrite.from;
                to = rewrite.to;

                if (namespace === from || namespace.substring(0, from.length) === from) {
                    namespace = namespace.substring(from.length);

                    if (typeof to !== 'string') {
                        root = to;
                    } else {
                        parts = parts.concat(to.split('.'));
                    }

                    break;
                }
            }

            parts.push(root);

            parts = parts.concat(namespace.split('.'));

            if (this.enableNamespaceParseCache) {
                cache[namespace] = parts;
            }

            return parts;
        },

        /**
         * Creates a namespace and assign the `value` to the created object
         *
         *     Ext.ClassManager.setNamespace('MyCompany.pkg.Example', someObject);
         *
         *     alert(MyCompany.pkg.Example === someObject); // alerts true
         *
         * @param {String} name
         * @param {Object} value
         */
        setNamespace: function(name, value) {
            var root = Ext.global,
                parts = this.parseNamespace(name),
                ln = parts.length - 1,
                leaf = parts[ln],
                i, part;

            for (i = 0; i < ln; i++) {
                part = parts[i];

                if (typeof part !== 'string') {
                    root = part;
                } else {
                    if (!root[part]) {
                        root[part] = {};
                    }

                    root = root[part];
                }
            }

            root[leaf] = value;

            return root[leaf];
        },

        /**
         * The new Ext.ns, supports namespace rewriting
         * @private
         */
        createNamespaces: function() {
            var root = Ext.global,
                parts, part, i, j, ln, subLn;

            for (i = 0, ln = arguments.length; i < ln; i++) {
                parts = this.parseNamespace(arguments[i]);

                for (j = 0, subLn = parts.length; j < subLn; j++) {
                    part = parts[j];

                    if (typeof part !== 'string') {
                        root = part;
                    } else {
                        if (!root[part]) {
                            root[part] = {};
                        }

                        root = root[part];
                    }
                }
            }

            return root;
        },

        /**
         * Sets a name reference to a class.
         *
         * @param {String} name
         * @param {Object} value
         * @return {Ext.ClassManager} this
         */
        set: function(name, value) {
            var targetName = this.getName(value);

            this.classes[name] = this.setNamespace(name, value);

            if (targetName && targetName !== name) {
                this.maps.alternateToName[name] = targetName;
            }

            return this;
        },

        /**
         * Retrieve a class by its name.
         *
         * @param {String} name
         * @return {Ext.Class} class
         */
        get: function(name) {
            if (this.classes.hasOwnProperty(name)) {
                return this.classes[name];
            }

            var root = Ext.global,
                parts = this.parseNamespace(name),
                part, i, ln;

            for (i = 0, ln = parts.length; i < ln; i++) {
                part = parts[i];

                if (typeof part !== 'string') {
                    root = part;
                } else {
                    if (!root || !root[part]) {
                        return null;
                    }

                    root = root[part];
                }
            }

            return root;
        },

        /**
         * Register the alias for a class.
         *
         * @param {Ext.Class/String} cls a reference to a class or a className
         * @param {String} alias Alias to use when referring to this class
         */
        setAlias: function(cls, alias) {
            var aliasToNameMap = this.maps.aliasToName,
                nameToAliasesMap = this.maps.nameToAliases,
                className;

            if (typeof cls === 'string') {
                className = cls;
            } else {
                className = this.getName(cls);
            }

            if (alias && aliasToNameMap[alias] !== className) {
                //<debug info>
                if (aliasToNameMap.hasOwnProperty(alias) && Ext.isDefined(Ext.global.console)) {
                    Ext.global.console.log("[Ext.ClassManager] Overriding existing alias: '" + alias + "' " +
                        "of: '" + aliasToNameMap[alias] + "' with: '" + className + "'. Be sure it's intentional.");
                }
                //</debug>

                aliasToNameMap[alias] = className;
            }

            if (!nameToAliasesMap[className]) {
                nameToAliasesMap[className] = [];
            }

            if (alias) {
                Ext.Array.include(nameToAliasesMap[className], alias);
            }

            return this;
        },

        /**
         * Get a reference to the class by its alias.
         *
         * @param {String} alias
         * @return {Ext.Class} class
         */
        getByAlias: function(alias) {
            return this.get(this.getNameByAlias(alias));
        },

        /**
         * Get the name of a class by its alias.
         *
         * @param {String} alias
         * @return {String} className
         */
        getNameByAlias: function(alias) {
            return this.maps.aliasToName[alias] || '';
        },

        /**
         * Get the name of a class by its alternate name.
         *
         * @param {String} alternate
         * @return {String} className
         */
        getNameByAlternate: function(alternate) {
            return this.maps.alternateToName[alternate] || '';
        },

        /**
         * Get the aliases of a class by the class name
         *
         * @param {String} name
         * @return {String[]} aliases
         */
        getAliasesByName: function(name) {
            return this.maps.nameToAliases[name] || [];
        },

        /**
         * Get the name of the class by its reference or its instance.
         *
         *     Ext.ClassManager.getName(Ext.Action); // returns "Ext.Action"
         *
         * {@link Ext#getClassName Ext.getClassName} is alias for {@link Ext.ClassManager#getName Ext.ClassManager.getName}.
         *
         * @param {Ext.Class/Object} object
         * @return {String} className
         */
        getName: function(object) {
            return object && object.$className || '';
        },

        /**
         * Get the class of the provided object; returns null if it's not an instance
         * of any class created with Ext.define.
         *
         *     var component = new Ext.Component();
         *
         *     Ext.ClassManager.getClass(component); // returns Ext.Component
         *
         * {@link Ext#getClass Ext.getClass} is alias for {@link Ext.ClassManager#getClass Ext.ClassManager.getClass}.
         *
         * @param {Object} object
         * @return {Ext.Class} class
         */
        getClass: function(object) {
            return object && object.self || null;
        },

        /**
         * Defines a class.
         *
         * {@link Ext#define Ext.define} and {@link Ext.ClassManager#create Ext.ClassManager.create} are almost aliases
         * of each other, with the only exception that Ext.define allows definition of {@link Ext.Class#override overrides}.
         * To avoid trouble, always use Ext.define.
         *
         *     Ext.define('My.awesome.Class', {
         *         someProperty: 'something',
         *         someMethod: function() { ... }
         *         ...
         *
         *     }, function() {
         *         alert('Created!');
         *         alert(this === My.awesome.Class); // alerts true
         *
         *         var myInstance = new this();
         *     });
         *
         * @param {String} className The class name to create in string dot-namespaced format, for example:
         * `My.very.awesome.Class`, `FeedViewer.plugin.CoolPager`. It is highly recommended to follow this simple convention:
         *
         * - The root and the class name are 'CamelCased'
         * - Everything else is lower-cased
         *
         * @param {Object} data The key-value pairs of properties to apply to this class. Property names can be of any valid
         * strings, except those in the reserved list below:
         *
         * - {@link Ext.Base#self self}
         * - {@link Ext.Class#alias alias}
         * - {@link Ext.Class#alternateClassName alternateClassName}
         * - {@link Ext.Class#config config}
         * - {@link Ext.Class#extend extend}
         * - {@link Ext.Class#inheritableStatics inheritableStatics}
         * - {@link Ext.Class#mixins mixins}
         * - {@link Ext.Class#override override} (only when using {@link Ext#define Ext.define})
         * - {@link Ext.Class#requires requires}
         * - {@link Ext.Class#singleton singleton}
         * - {@link Ext.Class#statics statics}
         * - {@link Ext.Class#uses uses}
         *
         * @param {Function} [createdFn] callback to execute after the class is created, the execution scope of which
         * (`this`) will be the newly created class itself.
         *
         * @return {Ext.Base}
         */
        create: function(className, data, createdFn) {
            var manager = this;

            //<debug error>
            if (typeof className !== 'string') {
                Ext.Error.raise({
                    sourceClass: "Ext",
                    sourceMethod: "define",
                    msg: "Invalid class name '" + className + "' specified, must be a non-empty string"
                });
            }
            //</debug>

            data.$className = className;

            return new Class(data, function() {
                var postprocessorStack = data.postprocessors || manager.defaultPostprocessors,
                    registeredPostprocessors = manager.postprocessors,
                    index = 0,
                    postprocessors = [],
                    postprocessor, process, i, ln;

                delete data.postprocessors;

                for (i = 0, ln = postprocessorStack.length; i < ln; i++) {
                    postprocessor = postprocessorStack[i];

                    if (typeof postprocessor === 'string') {
                        postprocessor = registeredPostprocessors[postprocessor];

                        if (!postprocessor.always) {
                            if (data[postprocessor.name] !== undefined) {
                                postprocessors.push(postprocessor.fn);
                            }
                        }
                        else {
                            postprocessors.push(postprocessor.fn);
                        }
                    }
                    else {
                        postprocessors.push(postprocessor);
                    }
                }

                process = function(clsName, cls, clsData) {
                    postprocessor = postprocessors[index++];

                    if (!postprocessor) {
                        manager.set(className, cls);

                        Ext.Loader.historyPush(className);

                        if (createdFn) {
                            createdFn.call(cls, cls);
                        }

                        return;
                    }

                    if (postprocessor.call(this, clsName, cls, clsData, process) !== false) {
                        process.apply(this, arguments);
                    }
                };

                process.call(manager, className, this, data);
            });
        },

        /**
         * Instantiate a class by its alias.
         *
         * If {@link Ext.Loader} is {@link Ext.Loader#setConfig enabled} and the class has not been defined yet, it will
         * attempt to load the class via synchronous loading.
         *
         *     var window = Ext.ClassManager.instantiateByAlias('widget.window', { width: 600, height: 800, ... });
         *
         * {@link Ext#createByAlias Ext.createByAlias} is alias for {@link Ext.ClassManager#instantiateByAlias Ext.ClassManager.instantiateByAlias}.
         *
         * @param {String} alias
         * @param {Object...} args Additional arguments after the alias will be passed to the
         * class constructor.
         * @return {Object} instance
         */
        instantiateByAlias: function() {
            var alias = arguments[0],
                args = slice.call(arguments),
                className = this.getNameByAlias(alias);

            if (!className) {
                className = this.maps.aliasToName[alias];

                //<debug error>
                if (!className) {
                    Ext.Error.raise({
                        sourceClass: "Ext",
                        sourceMethod: "createByAlias",
                        msg: "Cannot create an instance of unrecognized alias: " + alias
                    });
                }
                //</debug>

                //<debug warn>
                if (Ext.global.console) {
                    Ext.global.console.warn("[Ext.Loader] Synchronously loading '" + className + "'; consider adding " +
                         "Ext.require('" + alias + "') above Ext.onReady");
                }
                //</debug>

                Ext.syncRequire(className);
            }

            args[0] = className;

            return this.instantiate.apply(this, args);
        },

        /**
         * Instantiate a class by either full name, alias or alternate name.
         *
         * If {@link Ext.Loader} is {@link Ext.Loader#setConfig enabled} and the class has not been defined yet, it will
         * attempt to load the class via synchronous loading.
         *
         * For example, all these three lines return the same result:
         *
         *     // alias
         *     var window = Ext.ClassManager.instantiate('widget.window', { width: 600, height: 800, ... });
         *
         *     // alternate name
         *     var window = Ext.ClassManager.instantiate('Ext.Window', { width: 600, height: 800, ... });
         *
         *     // full class name
         *     var window = Ext.ClassManager.instantiate('Ext.window.Window', { width: 600, height: 800, ... });
         *
         * {@link Ext#create Ext.create} is alias for {@link Ext.ClassManager#instantiate Ext.ClassManager.instantiate}.
         *
         * @param {String} name
         * @param {Object...} args Additional arguments after the name will be passed to the class' constructor.
         * @return {Object} instance
         */
        instantiate: function() {
            var name = arguments[0],
                args = slice.call(arguments, 1),
                alias = name,
                possibleName, cls;

            if (typeof name !== 'function') {
                //<debug error>
                if ((typeof name !== 'string' || name.length < 1)) {
                    Ext.Error.raise({
                        sourceClass: "Ext",
                        sourceMethod: "create",
                        msg: "Invalid class name or alias '" + name + "' specified, must be a non-empty string"
                    });
                }
                //</debug>

                cls = this.get(name);
            }
            else {
                cls = name;
            }

            // No record of this class name, it's possibly an alias, so look it up
            if (!cls) {
                possibleName = this.getNameByAlias(name);

                if (possibleName) {
                    name = possibleName;

                    cls = this.get(name);
                }
            }

            // Still no record of this class name, it's possibly an alternate name, so look it up
            if (!cls) {
                possibleName = this.getNameByAlternate(name);

                if (possibleName) {
                    name = possibleName;

                    cls = this.get(name);
                }
            }

            // Still not existing at this point, try to load it via synchronous mode as the last resort
            if (!cls) {
                //<debug warn>
                if (Ext.global.console) {
                    Ext.global.console.warn("[Ext.Loader] Synchronously loading '" + name + "'; consider adding " +
                         "Ext.require('" + ((possibleName) ? alias : name) + "') above Ext.onReady");
                }
                //</debug>

                Ext.syncRequire(name);

                cls = this.get(name);
            }

            //<debug error>
            if (!cls) {
                Ext.Error.raise({
                    sourceClass: "Ext",
                    sourceMethod: "create",
                    msg: "Cannot create an instance of unrecognized class name / alias: " + alias
                });
            }

            if (typeof cls !== 'function') {
                Ext.Error.raise({
                    sourceClass: "Ext",
                    sourceMethod: "create",
                    msg: "'" + name + "' is a singleton and cannot be instantiated"
                });
            }
            //</debug>

            //<debug>
            if (!this.instantiationCounts[name]) {
                this.instantiationCounts[name] = 0;
            }

            this.instantiationCounts[name]++;
            //</debug>

            return this.getInstantiator(args.length)(cls, args);
        },

        /**
         * @private
         * @param name
         * @param args
         */
        dynInstantiate: function(name, args) {
            args = Ext.Array.from(args, true);
            args.unshift(name);

            return this.instantiate.apply(this, args);
        },

        /**
         * @private
         * @param length
         */
        getInstantiator: function(length) {
            if (!this.instantiators[length]) {
                var i = length,
                    args = [];

                for (i = 0; i < length; i++) {
                    args.push('a['+i+']');
                }

                this.instantiators[length] = new Function('c', 'a', 'return new c('+args.join(',')+')');
            }

            return this.instantiators[length];
        },

        /**
         * @private
         */
        postprocessors: {},

        /**
         * @private
         */
        defaultPostprocessors: [],

        /**
         * Register a post-processor function.
         *
         * @param {String} name
         * @param {Function} postprocessor
         */
        registerPostprocessor: function(name, fn, always) {
            this.postprocessors[name] = {
                name: name,
                always: always ||  false,
                fn: fn
            };

            return this;
        },

        /**
         * Set the default post processors array stack which are applied to every class.
         *
         * @param {String/String[]} The name of a registered post processor or an array of registered names.
         * @return {Ext.ClassManager} this
         */
        setDefaultPostprocessors: function(postprocessors) {
            this.defaultPostprocessors = Ext.Array.from(postprocessors);

            return this;
        },

        /**
         * Insert this post-processor at a specific position in the stack, optionally relative to
         * any existing post-processor
         *
         * @param {String} name The post-processor name. Note that it needs to be registered with
         * {@link Ext.ClassManager#registerPostprocessor} before this
         * @param {String} offset The insertion position. Four possible values are:
         * 'first', 'last', or: 'before', 'after' (relative to the name provided in the third argument)
         * @param {String} relativeName
         * @return {Ext.ClassManager} this
         */
        setDefaultPostprocessorPosition: function(name, offset, relativeName) {
            var defaultPostprocessors = this.defaultPostprocessors,
                index;

            if (typeof offset === 'string') {
                if (offset === 'first') {
                    defaultPostprocessors.unshift(name);

                    return this;
                }
                else if (offset === 'last') {
                    defaultPostprocessors.push(name);

                    return this;
                }

                offset = (offset === 'after') ? 1 : -1;
            }

            index = Ext.Array.indexOf(defaultPostprocessors, relativeName);

            if (index !== -1) {
                Ext.Array.splice(defaultPostprocessors, Math.max(0, index + offset), 0, name);
            }

            return this;
        },

        /**
         * Converts a string expression to an array of matching class names. An expression can either refers to class aliases
         * or class names. Expressions support wildcards:
         *
         *     // returns ['Ext.window.Window']
         *     var window = Ext.ClassManager.getNamesByExpression('widget.window');
         *
         *     // returns ['widget.panel', 'widget.window', ...]
         *     var allWidgets = Ext.ClassManager.getNamesByExpression('widget.*');
         *
         *     // returns ['Ext.data.Store', 'Ext.data.ArrayProxy', ...]
         *     var allData = Ext.ClassManager.getNamesByExpression('Ext.data.*');
         *
         * @param {String} expression
         * @return {String[]} classNames
         */
        getNamesByExpression: function(expression) {
            var nameToAliasesMap = this.maps.nameToAliases,
                names = [],
                name, alias, aliases, possibleName, regex, i, ln;

            //<debug error>
            if (typeof expression !== 'string' || expression.length < 1) {
                Ext.Error.raise({
                    sourceClass: "Ext.ClassManager",
                    sourceMethod: "getNamesByExpression",
                    msg: "Expression " + expression + " is invalid, must be a non-empty string"
                });
            }
            //</debug>

            if (expression.indexOf('*') !== -1) {
                expression = expression.replace(/\*/g, '(.*?)');
                regex = new RegExp('^' + expression + '$');

                for (name in nameToAliasesMap) {
                    if (nameToAliasesMap.hasOwnProperty(name)) {
                        aliases = nameToAliasesMap[name];

                        if (name.search(regex) !== -1) {
                            names.push(name);
                        }
                        else {
                            for (i = 0, ln = aliases.length; i < ln; i++) {
                                alias = aliases[i];

                                if (alias.search(regex) !== -1) {
                                    names.push(name);
                                    break;
                                }
                            }
                        }
                    }
                }

            } else {
                possibleName = this.getNameByAlias(expression);

                if (possibleName) {
                    names.push(possibleName);
                } else {
                    possibleName = this.getNameByAlternate(expression);

                    if (possibleName) {
                        names.push(possibleName);
                    } else {
                        names.push(expression);
                    }
                }
            }

            return names;
        }
    };

    var defaultPostprocessors = Manager.defaultPostprocessors;
    //<feature classSystem.alias>

    /**
     * @cfg {String[]} alias
     * @member Ext.Class
     * List of short aliases for class names.  Most useful for defining xtypes for widgets:
     *
     *     Ext.define('MyApp.CoolPanel', {
     *         extend: 'Ext.panel.Panel',
     *         alias: ['widget.coolpanel'],
     *         title: 'Yeah!'
     *     });
     *
     *     // Using Ext.create
     *     Ext.widget('widget.coolpanel');
     *     // Using the shorthand for widgets and in xtypes
     *     Ext.widget('panel', {
     *         items: [
     *             {xtype: 'coolpanel', html: 'Foo'},
     *             {xtype: 'coolpanel', html: 'Bar'}
     *         ]
     *     });
     */
    Manager.registerPostprocessor('alias', function(name, cls, data) {
        var aliases = data.alias,
            i, ln;

        delete data.alias;

        for (i = 0, ln = aliases.length; i < ln; i++) {
            alias = aliases[i];

            this.setAlias(cls, alias);
        }
    });

    /**
     * @cfg {Boolean} singleton
     * @member Ext.Class
     * When set to true, the class will be instantiated as singleton.  For example:
     *
     *     Ext.define('Logger', {
     *         singleton: true,
     *         log: function(msg) {
     *             console.log(msg);
     *         }
     *     });
     *
     *     Logger.log('Hello');
     */
    Manager.registerPostprocessor('singleton', function(name, cls, data, fn) {
        fn.call(this, name, new cls(), data);
        return false;
    });

    /**
     * @cfg {String/String[]} alternateClassName
     * @member Ext.Class
     * Defines alternate names for this class.  For example:
     *
     *     Ext.define('Developer', {
     *         alternateClassName: ['Coder', 'Hacker'],
     *         code: function(msg) {
     *             alert('Typing... ' + msg);
     *         }
     *     });
     *
     *     var joe = Ext.create('Developer');
     *     joe.code('stackoverflow');
     *
     *     var rms = Ext.create('Hacker');
     *     rms.code('hack hack');
     */
    Manager.registerPostprocessor('alternateClassName', function(name, cls, data) {
        var alternates = data.alternateClassName,
            i, ln, alternate;

        if (!(alternates instanceof Array)) {
            alternates = [alternates];
        }

        for (i = 0, ln = alternates.length; i < ln; i++) {
            alternate = alternates[i];

            //<debug error>
            if (typeof alternate !== 'string') {
                Ext.Error.raise({
                    sourceClass: "Ext",
                    sourceMethod: "define",
                    msg: "Invalid alternate of: '" + alternate + "' for class: '" + name + "'; must be a valid string"
                });
            }
            //</debug>

            this.set(alternate, cls);
        }
    });

    Manager.setDefaultPostprocessors(['alias', 'singleton', 'alternateClassName']);

    Ext.apply(Ext, {
        /**
         * @method
         * @member Ext
         * @alias Ext.ClassManager#instantiate
         */
        create: alias(Manager, 'instantiate'),

        /**
         * @private
         * API to be stablized
         *
         * @param {Object} item
         * @param {String} namespace
         */
        factory: function(item, namespace) {
            if (item instanceof Array) {
                var i, ln;

                for (i = 0, ln = item.length; i < ln; i++) {
                    item[i] = Ext.factory(item[i], namespace);
                }

                return item;
            }

            var isString = (typeof item === 'string');

            if (isString || (item instanceof Object && item.constructor === Object)) {
                var name, config = {};

                if (isString) {
                    name = item;
                }
                else {
                    name = item.className;
                    config = item;
                    delete config.className;
                }

                if (namespace !== undefined && name.indexOf(namespace) === -1) {
                    name = namespace + '.' + Ext.String.capitalize(name);
                }

                return Ext.create(name, config);
            }

            if (typeof item === 'function') {
                return Ext.create(item);
            }

            return item;
        },

        /**
         * Convenient shorthand to create a widget by its xtype, also see {@link Ext.ClassManager#instantiateByAlias}
         *
         *     var button = Ext.widget('button'); // Equivalent to Ext.create('widget.button')
         *     var panel = Ext.widget('panel'); // Equivalent to Ext.create('widget.panel')
         *
         * @method
         * @member Ext
         * @param {String} name  xtype of the widget to create.
         * @param {Object...} args  arguments for the widget constructor.
         * @return {Object} widget instance
         */
        widget: function(name) {
            var args = slice.call(arguments);
            args[0] = 'widget.' + name;

            return Manager.instantiateByAlias.apply(Manager, args);
        },

        /**
         * @method
         * @member Ext
         * @alias Ext.ClassManager#instantiateByAlias
         */
        createByAlias: alias(Manager, 'instantiateByAlias'),

        /**
         * @cfg {String} override
         * @member Ext.Class
         * 
         * Defines an override applied to a class. Note that **overrides can only be created using
         * {@link Ext#define}.** {@link Ext.ClassManager#create} only creates classes.
         * 
         * To define an override, include the override property. The content of an override is
         * aggregated with the specified class in order to extend or modify that class. This can be
         * as simple as setting default property values or it can extend and/or replace methods.
         * This can also extend the statics of the class.
         *
         * One use for an override is to break a large class into manageable pieces.
         *
         *      // File: /src/app/Panel.js
         *
         *      Ext.define('My.app.Panel', {
         *          extend: 'Ext.panel.Panel',
         *          requires: [
         *              'My.app.PanelPart2',
         *              'My.app.PanelPart3'
         *          ]
         *
         *          constructor: function (config) {
         *              this.callSuper(arguments); // calls Ext.panel.Panel's constructor
         *              //...
         *          },
         *
         *          statics: {
         *              method: function () {
         *                  return 'abc';
         *              }
         *          }
         *      });
         *
         *      // File: /src/app/PanelPart2.js
         *      Ext.define('My.app.PanelPart2', {
         *          override: 'My.app.Panel',
         *
         *          constructor: function (config) {
         *              this.callSuper(arguments); // calls My.app.Panel's constructor
         *              //...
         *          }
         *      });
         *
         * Another use of overrides is to provide optional parts of classes that can be
         * independently required. In this case, the class may even be unaware of the
         * override altogether.
         *
         *      Ext.define('My.ux.CoolTip', {
         *          override: 'Ext.tip.ToolTip',
         *
         *          constructor: function (config) {
         *              this.callSuper(arguments); // calls Ext.tip.ToolTip's constructor
         *              //...
         *          }
         *      });
         *
         * The above override can now be required as normal.
         *
         *      Ext.define('My.app.App', {
         *          requires: [
         *              'My.ux.CoolTip'
         *          ]
         *      });
         *
         * Overrides can also contain statics:
         *
         *      Ext.define('My.app.BarMod', {
         *          override: 'Ext.foo.Bar',
         *
         *          statics: {
         *              method: function (x) {
         *                  return this.callSuper([x * 2]); // call Ext.foo.Bar.method
         *              }
         *          }
         *      });
         *
         * IMPORTANT: An override is only included in a build if the class it overrides is
         * required. Otherwise, the override, like the target class, is not included.
         */
        
        /**
         * @method
         *
         * @member Ext
         * @alias Ext.ClassManager#create
         */
        define: function (className, data, createdFn) {
            if (!data.override) {
                return Manager.create.apply(Manager, arguments);
            }

            var requires = data.requires,
                uses = data.uses,
                overrideName = className;

            className = data.override;

            // hoist any 'requires' or 'uses' from the body onto the faux class:
            data = Ext.apply({}, data);
            delete data.requires;
            delete data.uses;
            delete data.override;

            // make sure className is in the requires list:
            if (typeof requires == 'string') {
                requires = [ className, requires ];
            } else if (requires) {
                requires = requires.slice(0);
                requires.unshift(className);
            } else {
                requires = [ className ];
            }

// TODO - we need to rework this to allow the override to not require the target class
//  and rather 'wait' for it in such a way that if the target class is not in the build,
//  neither are any of its overrides.
//
//  Also, this should process the overrides for a class ASAP (ideally before any derived
//  classes) if the target class 'requires' the overrides. Without some special handling, the
//  overrides so required will be processed before the class and have to be bufferred even
//  in a build.
//
// TODO - we should probably support the "config" processor on an override (to config new
//  functionaliy like Aria) and maybe inheritableStatics (although static is now supported
//  by callSuper). If inheritableStatics causes those statics to be included on derived class
//  constructors, that probably means "no" to this since an override can come after other
//  classes extend the target.
            return Manager.create(overrideName, {
                    requires: requires,
                    uses: uses,
                    isPartial: true,
                    constructor: function () {
                        //<debug error>
                        throw new Error("Cannot create override '" + overrideName + "'");
                        //</debug>
                    }
                }, function () {
                    var cls = Manager.get(className);
                    if (cls.override) { // if (normal class)
                        cls.override(data);
                    } else { // else (singleton)
                        cls.self.override(data);
                    }

                    if (createdFn) {
                        // called once the override is applied and with the context of the
                        // overridden class (the override itself is a meaningless, name-only
                        // thing).
                        createdFn.call(cls);
                    }
                });
        },

        /**
         * @method
         * @member Ext
         * @alias Ext.ClassManager#getName
         */
        getClassName: alias(Manager, 'getName'),

        /**
         * Returns the displayName property or className or object.
         * When all else fails, returns "Anonymous".
         * @param {Object} object
         * @return {String}
         */
        getDisplayName: function(object) {
            if (object.displayName) {
                return object.displayName;
            }

            if (object.$name && object.$class) {
                return Ext.getClassName(object.$class) + '#' + object.$name;
            }

            if (object.$className) {
                return object.$className;
            }

            return 'Anonymous';
        },

        /**
         * @method
         * @member Ext
         * @alias Ext.ClassManager#getClass
         */
        getClass: alias(Manager, 'getClass'),

        /**
         * Creates namespaces to be used for scoping variables and classes so that they are not global.
         * Specifying the last node of a namespace implicitly creates all other nodes. Usage:
         *
         *     Ext.namespace('Company', 'Company.data');
         *
         *     // equivalent and preferable to the above syntax
         *     Ext.namespace('Company.data');
         *
         *     Company.Widget = function() { ... };
         *
         *     Company.data.CustomStore = function(config) { ... };
         *
         * @method
         * @member Ext
         * @param {String} namespace1
         * @param {String} namespace2
         * @param {String} etc
         * @return {Object} The namespace object. (If multiple arguments are passed, this will be the last namespace created)
         */
        namespace: alias(Manager, 'createNamespaces')
    });

    /**
     * Old name for {@link Ext#widget}.
     * @deprecated 4.0.0 Use {@link Ext#widget} instead.
     * @method
     * @member Ext
     * @alias Ext#widget
     */
    Ext.createWidget = Ext.widget;

    /**
     * Convenient alias for {@link Ext#namespace Ext.namespace}
     * @method
     * @member Ext
     * @alias Ext#namespace
     */
    Ext.ns = Ext.namespace;

    Class.registerPreprocessor('className', function(cls, data) {
        if (data.$className) {
            cls.$className = data.$className;
            //<debug>
            cls.displayName = cls.$className;
            //</debug>
        }
    }, true);

    Class.setDefaultPreprocessorPosition('className', 'first');

    Class.registerPreprocessor('xtype', function(cls, data) {
        var xtypes = Ext.Array.from(data.xtype),
            widgetPrefix = 'widget.',
            aliases = Ext.Array.from(data.alias),
            i, ln, xtype;

        data.xtype = xtypes[0];
        data.xtypes = xtypes;

        aliases = data.alias = Ext.Array.from(data.alias);

        for (i = 0,ln = xtypes.length; i < ln; i++) {
            xtype = xtypes[i];

            //<debug error>
            if (typeof xtype != 'string' || xtype.length < 1) {
                throw new Error("[Ext.define] Invalid xtype of: '" + xtype + "' for class: '" + name + "'; must be a valid non-empty string");
            }
            //</debug>

            aliases.push(widgetPrefix + xtype);
        }

        data.alias = aliases;
    });

    Class.setDefaultPreprocessorPosition('xtype', 'last');

    Class.registerPreprocessor('alias', function(cls, data) {
        var aliases = Ext.Array.from(data.alias),
            xtypes = Ext.Array.from(data.xtypes),
            widgetPrefix = 'widget.',
            widgetPrefixLength = widgetPrefix.length,
            i, ln, alias, xtype;

        for (i = 0, ln = aliases.length; i < ln; i++) {
            alias = aliases[i];

            //<debug error>
            if (typeof alias != 'string') {
                throw new Error("[Ext.define] Invalid alias of: '" + alias + "' for class: '" + name + "'; must be a valid string");
            }
            //</debug>

            if (alias.substring(0, widgetPrefixLength) === widgetPrefix) {
                xtype = alias.substring(widgetPrefixLength);
                Ext.Array.include(xtypes, xtype);

                if (!cls.xtype) {
                    cls.xtype = data.xtype = xtype;
                }
            }
        }

        data.alias = aliases;
        data.xtypes = xtypes;
    });

    Class.setDefaultPreprocessorPosition('alias', 'last');

})(Ext.Class, Ext.Function.alias);

