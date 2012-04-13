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
 * @class Ext.Class
 *
 * Handles class creation throughout the framework. This is a low level factory that is used by Ext.ClassManager and generally
 * should not be used directly. If you choose to use Ext.Class you will lose out on the namespace, aliasing and depency loading
 * features made available by Ext.ClassManager. The only time you would use Ext.Class directly is to create an anonymous class.
 *
 * If you wish to create a class you should use {@link Ext#define Ext.define} which aliases
 * {@link Ext.ClassManager#create Ext.ClassManager.create} to enable namespacing and dynamic dependency resolution.
 *
 * Ext.Class is the factory and **not** the superclass of everything. For the base class that **all** Ext classes inherit
 * from, see {@link Ext.Base}.
 */
(function() {

    var Class,
        Base = Ext.Base,
        baseStaticProperties = [],
        baseStaticProperty;

    for (baseStaticProperty in Base) {
        if (Base.hasOwnProperty(baseStaticProperty)) {
            baseStaticProperties.push(baseStaticProperty);
        }
    }

    /**
     * @method constructor
     * Creates new class.
     * @param {Object} classData An object represent the properties of this class
     * @param {Function} createdFn (Optional) The callback function to be executed when this class is fully created.
     * Note that the creation process can be asynchronous depending on the pre-processors used.
     * @return {Ext.Base} The newly created class
     */
    Ext.Class = Class = function(newClass, classData, onClassCreated) {
        if (typeof newClass != 'function') {
            onClassCreated = classData;
            classData = newClass;
            newClass = function() {
                return this.constructor.apply(this, arguments);
            };
        }

        if (!classData) {
            classData = {};
        }

        var preprocessorStack = classData.preprocessors || Class.getDefaultPreprocessors(),
            registeredPreprocessors = Class.getPreprocessors(),
            index = 0,
            preprocessors = [],
            preprocessor, staticPropertyName, process, i, j, ln;

        for (i = 0, ln = baseStaticProperties.length; i < ln; i++) {
            staticPropertyName = baseStaticProperties[i];
            newClass[staticPropertyName] = Base[staticPropertyName];
        }

        delete classData.preprocessors;

        for (j = 0, ln = preprocessorStack.length; j < ln; j++) {
            preprocessor = preprocessorStack[j];

            if (typeof preprocessor == 'string') {
                preprocessor = registeredPreprocessors[preprocessor];

                if (!preprocessor.always) {
                    if (classData.hasOwnProperty(preprocessor.name)) {
                        preprocessors.push(preprocessor.fn);
                    }
                }
                else {
                    preprocessors.push(preprocessor.fn);
                }
            }
            else {
                preprocessors.push(preprocessor);
            }
        }

        classData.onClassCreated = onClassCreated || Ext.emptyFn;

        classData.onBeforeClassCreated = function(cls, data) {
            onClassCreated = data.onClassCreated;

            delete data.onBeforeClassCreated;
            delete data.onClassCreated;

            cls.implement(data);

            onClassCreated.call(cls, cls);
        };

        process = function(cls, data) {
            preprocessor = preprocessors[index++];

            if (!preprocessor) {
                data.onBeforeClassCreated.apply(this, arguments);
                return;
            }

            if (preprocessor.call(this, cls, data, process) !== false) {
                process.apply(this, arguments);
            }
        };

        process.call(Class, newClass, classData);

        return newClass;
    };

    Ext.apply(Class, {

        /** @private */
        preprocessors: {},

        /**
         * Register a new pre-processor to be used during the class creation process
         *
         * @member Ext.Class
         * @param {String} name The pre-processor's name
         * @param {Function} fn The callback function to be executed. Typical format:
         *
         *     function(cls, data, fn) {
         *         // Your code here
         *
         *         // Execute this when the processing is finished.
         *         // Asynchronous processing is perfectly ok
         *         if (fn) {
         *             fn.call(this, cls, data);
         *         }
         *     });
         *
         * @param {Function} fn.cls The created class
         * @param {Object} fn.data The set of properties passed in {@link Ext.Class} constructor
         * @param {Function} fn.fn The callback function that **must** to be executed when this pre-processor finishes,
         * regardless of whether the processing is synchronous or aynchronous
         *
         * @return {Ext.Class} this
         * @static
         */
        registerPreprocessor: function(name, fn, always) {
            this.preprocessors[name] = {
                name: name,
                always: always ||  false,
                fn: fn
            };

            return this;
        },

        /**
         * Retrieve a pre-processor callback function by its name, which has been registered before
         *
         * @param {String} name
         * @return {Function} preprocessor
         * @static
         */
        getPreprocessor: function(name) {
            return this.preprocessors[name];
        },

        getPreprocessors: function() {
            return this.preprocessors;
        },

        /**
         * Retrieve the array stack of default pre-processors
         *
         * @return {Function[]} defaultPreprocessors
         * @static
         */
        getDefaultPreprocessors: function() {
            return this.defaultPreprocessors || [];
        },

        /**
         * Set the default array stack of default pre-processors
         *
         * @param {Function/Function[]} preprocessors
         * @return {Ext.Class} this
         * @static
         */
        setDefaultPreprocessors: function(preprocessors) {
            this.defaultPreprocessors = Ext.Array.from(preprocessors);

            return this;
        },

        /**
         * Inserts this pre-processor at a specific position in the stack, optionally relative to
         * any existing pre-processor. For example:
         *
         *     Ext.Class.registerPreprocessor('debug', function(cls, data, fn) {
         *         // Your code here
         *
         *         if (fn) {
         *             fn.call(this, cls, data);
         *         }
         *     }).setDefaultPreprocessorPosition('debug', 'last');
         *
         * @param {String} name The pre-processor name. Note that it needs to be registered with
         * {@link #registerPreprocessor registerPreprocessor} before this
         * @param {String} offset The insertion position. Four possible values are:
         * 'first', 'last', or: 'before', 'after' (relative to the name provided in the third argument)
         * @param {String} relativeName
         * @return {Ext.Class} this
         * @static
         */
        setDefaultPreprocessorPosition: function(name, offset, relativeName) {
            var defaultPreprocessors = this.defaultPreprocessors,
                index;

            if (typeof offset == 'string') {
                if (offset === 'first') {
                    defaultPreprocessors.unshift(name);

                    return this;
                }
                else if (offset === 'last') {
                    defaultPreprocessors.push(name);

                    return this;
                }

                offset = (offset === 'after') ? 1 : -1;
            }

            index = Ext.Array.indexOf(defaultPreprocessors, relativeName);

            if (index !== -1) {
                Ext.Array.splice(defaultPreprocessors, Math.max(0, index + offset), 0, name);
            }

            return this;
        }
    });

    /**
     * @cfg {String} extend
     * The parent class that this class extends. For example:
     *
     *     Ext.define('Person', {
     *         say: function(text) { alert(text); }
     *     });
     *
     *     Ext.define('Developer', {
     *         extend: 'Person',
     *         say: function(text) { this.callParent(["print "+text]); }
     *     });
     */
    Class.registerPreprocessor('extend', function(cls, data) {
        var extend = data.extend,
            base = Ext.Base,
            basePrototype = base.prototype,
            prototype = function() {},
            parent, i, k, ln, staticName, parentStatics,
            parentPrototype, clsPrototype;

        if (extend && extend !== Object) {
            parent = extend;
        }
        else {
            parent = base;
        }

        parentPrototype = parent.prototype;

        prototype.prototype = parentPrototype;
        clsPrototype = cls.prototype = new prototype();

        if (!('$class' in parent)) {
            for (i in basePrototype) {
                if (!parentPrototype[i]) {
                    parentPrototype[i] = basePrototype[i];
                }
            }
        }

        clsPrototype.self = cls;

        cls.superclass = clsPrototype.superclass = parentPrototype;

        delete data.extend;

        //<feature classSystem.inheritableStatics>
        // Statics inheritance
        parentStatics = parentPrototype.$inheritableStatics;

        if (parentStatics) {
            for (k = 0, ln = parentStatics.length; k < ln; k++) {
                staticName = parentStatics[k];

                if (!cls.hasOwnProperty(staticName)) {
                    cls[staticName] = parent[staticName];
                }
            }
        }
        //</feature>

        //<feature classSystem.config>
        // Merge the parent class' config object without referencing it
        if (parentPrototype.config) {
            clsPrototype.config = Ext.Object.merge({}, parentPrototype.config);
        }
        else {
            clsPrototype.config = {};
        }
        //</feature>

        //<feature classSystem.onClassExtended>
        if (clsPrototype.$onExtended) {
            clsPrototype.$onExtended.call(cls, cls, data);
        }

        if (data.onClassExtended) {
            clsPrototype.$onExtended = data.onClassExtended;
            delete data.onClassExtended;
        }
        //</feature>

    }, true);

    //<feature classSystem.statics>
    /**
     * @cfg {Object} statics
     * List of static methods for this class. For example:
     *
     *     Ext.define('Computer', {
     *          statics: {
     *              factory: function(brand) {
     *                  // 'this' in static methods refer to the class itself
     *                  return new this(brand);
     *              }
     *          },
     *
     *          constructor: function() { ... }
     *     });
     *
     *     var dellComputer = Computer.factory('Dell');
     */
    Class.registerPreprocessor('statics', function(cls, data) {
        cls.addStatics(data.statics);

        delete data.statics;
    });
    //</feature>

    //<feature classSystem.inheritableStatics>
    /**
     * @cfg {Object} inheritableStatics
     * List of inheritable static methods for this class.
     * Otherwise just like {@link #statics} but subclasses inherit these methods.
     */
    Class.registerPreprocessor('inheritableStatics', function(cls, data) {
        cls.addInheritableStatics(data.inheritableStatics);

        delete data.inheritableStatics;
    });
    //</feature>

    //<feature classSystem.config>
    /**
     * @cfg {Object} config
     * List of configuration options with their default values, for which automatically
     * accessor methods are generated.  For example:
     *
     *     Ext.define('SmartPhone', {
     *          config: {
     *              hasTouchScreen: false,
     *              operatingSystem: 'Other',
     *              price: 500
     *          },
     *          constructor: function(cfg) {
     *              this.initConfig(cfg);
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
     */
    Class.registerPreprocessor('config', function(cls, data) {
        var prototype = cls.prototype;

        Ext.Object.each(data.config, function(name) {
            var cName = name.charAt(0).toUpperCase() + name.substr(1),
                pName = name,
                apply = 'apply' + cName,
                setter = 'set' + cName,
                getter = 'get' + cName;

            if (!(apply in prototype) && !data.hasOwnProperty(apply)) {
                data[apply] = function(val) {
                    return val;
                };
            }

            if (!(setter in prototype) && !data.hasOwnProperty(setter)) {
                data[setter] = function(val) {
                    var ret = this[apply].call(this, val, this[pName]);

                    if (typeof ret != 'undefined') {
                        this[pName] = ret;
                    }

                    return this;
                };
            }

            if (!(getter in prototype) && !data.hasOwnProperty(getter)) {
                data[getter] = function() {
                    return this[pName];
                };
            }
        });

        Ext.Object.merge(prototype.config, data.config);
        delete data.config;
    });
    //</feature>

    //<feature classSystem.mixins>
    /**
     * @cfg {Object} mixins
     * List of classes to mix into this class. For example:
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
     *              canSing: 'CanSing'
     *          }
     *     })
     */
    Class.registerPreprocessor('mixins', function(cls, data) {
        var mixins = data.mixins,
            name, mixin, i, ln;

        delete data.mixins;

        Ext.Function.interceptBefore(data, 'onClassCreated', function(cls) {
            if (mixins instanceof Array) {
                for (i = 0,ln = mixins.length; i < ln; i++) {
                    mixin = mixins[i];
                    name = mixin.prototype.mixinId || mixin.$className;

                    cls.mixin(name, mixin);
                }
            }
            else {
                for (name in mixins) {
                    if (mixins.hasOwnProperty(name)) {
                        cls.mixin(name, mixins[name]);
                    }
                }
            }
        });
    });

    //</feature>

    Class.setDefaultPreprocessors([
        'extend'
        //<feature classSystem.statics>
        ,'statics'
        //</feature>
        //<feature classSystem.inheritableStatics>
        ,'inheritableStatics'
        //</feature>
        //<feature classSystem.config>
        ,'config'
        //</feature>
        //<feature classSystem.mixins>
        ,'mixins'
        //</feature>
    ]);

    //<feature classSystem.backwardsCompatible>
    // Backwards compatible
    Ext.extend = function(subclass, superclass, members) {
        if (arguments.length === 2 && Ext.isObject(superclass)) {
            members = superclass;
            superclass = subclass;
            subclass = null;
        }

        var cls;

        if (!superclass) {
            Ext.Error.raise("Attempting to extend from a class which has not been loaded on the page.");
        }

        members.extend = superclass;
        members.preprocessors = [
            'extend'
            //<feature classSystem.statics>
            ,'statics'
            //</feature>
            //<feature classSystem.inheritableStatics>
            ,'inheritableStatics'
            //</feature>
            //<feature classSystem.mixins>
            ,'mixins'
            //</feature>
            //<feature classSystem.config>
            ,'config'
            //</feature>
        ];

        if (subclass) {
            cls = new Class(subclass, members);
        }
        else {
            cls = new Class(members);
        }

        cls.prototype.override = function(o) {
            for (var m in o) {
                if (o.hasOwnProperty(m)) {
                    this[m] = o[m];
                }
            }
        };

        return cls;
    };
    //</feature>

})();

