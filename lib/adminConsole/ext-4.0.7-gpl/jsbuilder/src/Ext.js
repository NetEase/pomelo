Ext = {
    /**
     * Copies all the properties of config to obj.
     * @param {Object} object The receiver of the properties
     * @param {Object} config The source of the properties
     * @param {Object} defaults A different object that will also be applied for default values
     * @return {Object} returns obj
     * @member Ext apply
     */
    apply : function(object, config, defaults) {
        // no "this" reference for friendly out of scope calls
        if (defaults) {
            Ext.apply(object, defaults);
        }
        if (object && config && typeof config == 'object') {
            for (var key in config) {
                object[key] = config[key];
            }
        }
        return object;
    },

    /**
     * Copies all the properties of config to obj if they don't already exist.
     * @param {Object} obj The receiver of the properties
     * @param {Object} config The source of the properties
     * @return {Object} returns obj
     */
    applyIf : function(object, config) {
        var property, undefined;
        if (object) {
            for (property in config) {
                if (object[property] === undefined) {
                    object[property] = config[property];
                }
            }
        }
        return object;
    },
        
    /**
     * <p>Extends one class to create a subclass and optionally overrides members with the passed literal. This method
     * also adds the function "override()" to the subclass that can be used to override members of the class.</p>
     * @param {Function} superclass The constructor of class being extended.
     * @param {Object} overrides <p>A literal with members which are copied into the subclass's
     * prototype, and are therefore shared between all instances of the new class.</p>
     * <p>This may contain a special member named <tt><b>constructor</b></tt>. This is used
     * to define the constructor of the new class, and is returned. If this property is
     * <i>not</i> specified, a constructor is generated and returned which just calls the
     * superclass's constructor passing on its parameters.</p>
     * <p><b>It is essential that you call the superclass constructor in any provided constructor. See example code.</b></p>
     * @return {Function} The subclass constructor from the <code>overrides</code> parameter, or a generated one if not provided.
     */
    extend : function() {
        // inline overrides
        var inlineOverrides = function(o){
            for(var m in o){
                this[m] = o[m];
            }
        };

        var objectConstructor = Object.prototype.constructor;

        return function(subclass, superclass, overrides){
            // First we check if the user passed in just the superClass with overrides
            if(Ext.isObject(superclass)){
                overrides = superclass;
                superclass = subclass;
                subclass = overrides.constructor != objectConstructor
                ? overrides.constructor
                : function(){
                    superclass.apply(this, arguments);
                };
            }

            // We create a new temporary class
            var F = function(){},
            subclassProto,
            superclassProto = superclass.prototype;

            F.prototype = superclassProto;
            subclassProto = subclass.prototype = new F();
            subclassProto.constructor = subclass;
            subclass.superclass = superclassProto;

            if(superclassProto.constructor == objectConstructor){
                superclassProto.constructor = superclass;
            }

            subclass.override = function(overrides){
                Ext.override(subclass, overrides);
            };

            subclassProto.superclass = subclassProto.supr = (function(){
                return superclassProto;
            });

            subclassProto.override = inlineOverrides;
            subclassProto.proto = subclassProto;
            subclassProto.superproto = superclassProto;
            
            subclass.override(overrides);
            subclass.extend = function(o){
                return Ext.extend(subclass, o);
            };

            return subclass;
        };
    }(),
    
    /**
     * Adds a list of functions to the prototype of an existing class, overwriting any existing methods with the same name.
     * @param {Object} origclass The class to override
     * @param {Object} overrides The list of functions to add to origClass.  This should be specified as an object literal
     * containing one or more methods.
     * @method override
     */
    override : function(origclass, overrides) {
        if (overrides) {
            Ext.apply(origclass.prototype, overrides);
        }
    },
    
    /**
     * <p>Returns true if the passed value is empty.</p>
     * <p>The value is deemed to be empty if it is<div class="mdetail-params"><ul>
     * <li>null</li>
     * <li>undefined</li>
     * <li>an empty array</li>
     * <li>a zero length string (Unless the <tt>allowBlank</tt> parameter is <tt>true</tt>)</li>
     * </ul></div>
     * @param {Mixed} value The value to test
     * @param {Boolean} allowBlank (optional) true to allow empty strings (defaults to false)
     * @return {Boolean}
     */
    isEmpty : function(v, allowBlank) {
        return v == null || ((Ext.isArray(v) && !v.length)) || (!allowBlank ? v === '' : false);
    },

    /**
     * Returns true if the passed value is a JavaScript array, otherwise false.
     * @param {Mixed} value The value to test
     * @return {Boolean}
     */
    isArray : function(v) {
        return Object.prototype.toString.apply(v) === '[object Array]';
    },

    /**
     * Returns true if the passed object is a JavaScript date object, otherwise false.
     * @param {Object} object The object to test
     * @return {Boolean}
     */
    isDate : function(v) {
        return Object.prototype.toString.apply(v) === '[object Date]';
    },

    /**
     * Returns true if the passed value is a JavaScript Object, otherwise false.
     * @param {Mixed} value The value to test
     * @return {Boolean}
     */
    isObject : function(v) {
        return !!v && Object.prototype.toString.call(v) === '[object Object]';
    },

    /**
     * Returns true if the passed value is a JavaScript 'primitive', a string, number or boolean.
     * @param {Mixed} value The value to test
     * @return {Boolean}
     */
    isPrimitive : function(v) {
        return Ext.isString(v) || Ext.isNumber(v) || Ext.isBoolean(v);
    },

    /**
     * Returns true if the passed value is a JavaScript Function, otherwise false.
     * @param {Mixed} value The value to test
     * @return {Boolean}
     */
    isFunction : function(v) {
        return Object.prototype.toString.apply(v) === '[object Function]';
    },

    /**
     * Returns true if the passed value is a number. Returns false for non-finite numbers.
     * @param {Mixed} value The value to test
     * @return {Boolean}
     */
    isNumber : function(v) {
        return Object.prototype.toString.apply(v) === '[object Number]' && isFinite(v);
    },

    /**
     * Returns true if the passed value is a string.
     * @param {Mixed} value The value to test
     * @return {Boolean}
     */
    isString : function(v) {
        return Object.prototype.toString.apply(v) === '[object String]';
    },

    /**util
     * Returns true if the passed value is a boolean.
     * @param {Mixed} value The value to test
     * @return {Boolean}
     */
    isBoolean : function(v) {
        return Object.prototype.toString.apply(v) === '[object Boolean]';
    },

    /**
     * Returns true if the passed value is not undefined.
     * @param {Mixed} value The value to test
     * @return {Boolean}
     */
    isDefined : function(v){
        return typeof v !== 'undefined';
    },

    each : function(array, fn, scope) {
        if (Ext.isEmpty(array, true)) {
            return 0;
        }
        if (!Ext.isIterable(array) || Ext.isPrimitive(array)) {
            array = [array];
        }
        for (var i = 0, len = array.length; i < len; i++) {
            if (fn.call(scope || array[i], array[i], i, array) === false) {
                return i;
            }
        }
        return true;
    },
    
    iterate : function(obj, fn, scope) {
        if (Ext.isEmpty(obj)) {
            return;
        }
        if (Ext.isIterable(obj)) {
            Ext.each(obj, fn, scope);
            return;
        }
        else if (Ext.isObject(obj)) {
            for (var prop in obj) {
                if (obj.hasOwnProperty(prop)) {
                    if (fn.call(scope || obj, prop, obj[prop], obj) === false) {
                        return;
                    }
                }
            }
        }
    },
    
    isIterable : function(v) {
        //check for array or arguments
        if (Ext.isArray(v) || v.callee) {
            return true;
        }
    },

    $included: {},

    require: function(className) {

    }
}