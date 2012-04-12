/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * @author Ed Spencer
 *
 * Fields are used to define what a Model is. They aren't instantiated directly - instead, when we create a class that
 * extends {@link Ext.data.Model}, it will automatically create a Field instance for each field configured in a {@link
 * Ext.data.Model Model}. For example, we might set up a model like this:
 *
 *     Ext.define('User', {
 *         extend: 'Ext.data.Model',
 *         fields: [
 *             'name', 'email',
 *             {name: 'age', type: 'int'},
 *             {name: 'gender', type: 'string', defaultValue: 'Unknown'}
 *         ]
 *     });
 *
 * Four fields will have been created for the User Model - name, email, age and gender. Note that we specified a couple
 * of different formats here; if we only pass in the string name of the field (as with name and email), the field is set
 * up with the 'auto' type. It's as if we'd done this instead:
 *
 *     Ext.define('User', {
 *         extend: 'Ext.data.Model',
 *         fields: [
 *             {name: 'name', type: 'auto'},
 *             {name: 'email', type: 'auto'},
 *             {name: 'age', type: 'int'},
 *             {name: 'gender', type: 'string', defaultValue: 'Unknown'}
 *         ]
 *     });
 *
 * # Types and conversion
 *
 * The {@link #type} is important - it's used to automatically convert data passed to the field into the correct format.
 * In our example above, the name and email fields used the 'auto' type and will just accept anything that is passed
 * into them. The 'age' field had an 'int' type however, so if we passed 25.4 this would be rounded to 25.
 *
 * Sometimes a simple type isn't enough, or we want to perform some processing when we load a Field's data. We can do
 * this using a {@link #convert} function. Here, we're going to create a new field based on another:
 *
 *     Ext.define('User', {
 *         extend: 'Ext.data.Model',
 *         fields: [
 *             'name', 'email',
 *             {name: 'age', type: 'int'},
 *             {name: 'gender', type: 'string', defaultValue: 'Unknown'},
 *
 *             {
 *                 name: 'firstName',
 *                 convert: function(value, record) {
 *                     var fullName  = record.get('name'),
 *                         splits    = fullName.split(" "),
 *                         firstName = splits[0];
 *
 *                     return firstName;
 *                 }
 *             }
 *         ]
 *     });
 *
 * Now when we create a new User, the firstName is populated automatically based on the name:
 *
 *     var ed = Ext.create('User', {name: 'Ed Spencer'});
 *
 *     console.log(ed.get('firstName')); //logs 'Ed', based on our convert function
 *
 * In fact, if we log out all of the data inside ed, we'll see this:
 *
 *     console.log(ed.data);
 *
 *     //outputs this:
 *     {
 *         age: 0,
 *         email: "",
 *         firstName: "Ed",
 *         gender: "Unknown",
 *         name: "Ed Spencer"
 *     }
 *
 * The age field has been given a default of zero because we made it an int type. As an auto field, email has defaulted
 * to an empty string. When we registered the User model we set gender's {@link #defaultValue} to 'Unknown' so we see
 * that now. Let's correct that and satisfy ourselves that the types work as we expect:
 *
 *     ed.set('gender', 'Male');
 *     ed.get('gender'); //returns 'Male'
 *
 *     ed.set('age', 25.4);
 *     ed.get('age'); //returns 25 - we wanted an int, not a float, so no decimal places allowed
 */
Ext.define('Ext.data.Field', {
    requires: ['Ext.data.Types', 'Ext.data.SortTypes'],
    alias: 'data.field',
    
    constructor : function(config) {
        if (Ext.isString(config)) {
            config = {name: config};
        }
        Ext.apply(this, config);
        
        var types = Ext.data.Types,
            st = this.sortType,
            t;

        if (this.type) {
            if (Ext.isString(this.type)) {
                this.type = types[this.type.toUpperCase()] || types.AUTO;
            }
        } else {
            this.type = types.AUTO;
        }

        // named sortTypes are supported, here we look them up
        if (Ext.isString(st)) {
            this.sortType = Ext.data.SortTypes[st];
        } else if(Ext.isEmpty(st)) {
            this.sortType = this.type.sortType;
        }

        if (!this.convert) {
            this.convert = this.type.convert;
        }
    },
    
    /**
     * @cfg {String} name
     *
     * The name by which the field is referenced within the Model. This is referenced by, for example, the `dataIndex`
     * property in column definition objects passed to {@link Ext.grid.property.HeaderContainer}.
     *
     * Note: In the simplest case, if no properties other than `name` are required, a field definition may consist of
     * just a String for the field name.
     */
    
    /**
     * @cfg {String/Object} type
     *
     * The data type for automatic conversion from received data to the *stored* value if
     * `{@link Ext.data.Field#convert convert}` has not been specified. This may be specified as a string value.
     * Possible values are
     *
     * - auto (Default, implies no conversion)
     * - string
     * - int
     * - float
     * - boolean
     * - date
     *
     * This may also be specified by referencing a member of the {@link Ext.data.Types} class.
     *
     * Developers may create their own application-specific data types by defining new members of the {@link
     * Ext.data.Types} class.
     */
    
    /**
     * @cfg {Function} convert
     *
     * A function which converts the value provided by the Reader into an object that will be stored in the Model.
     * It is passed the following parameters:
     *
     * - **v** : Mixed
     *
     *   The data value as read by the Reader, if undefined will use the configured `{@link Ext.data.Field#defaultValue
     *   defaultValue}`.
     *
     * - **rec** : Ext.data.Model
     *
     *   The data object containing the Model as read so far by the Reader. Note that the Model may not be fully populated
     *   at this point as the fields are read in the order that they are defined in your
     *   {@link Ext.data.Model#fields fields} array.
     *
     * Example of convert functions:
     *
     *     function fullName(v, record){
     *         return record.name.last + ', ' + record.name.first;
     *     }
     *
     *     function location(v, record){
     *         return !record.city ? '' : (record.city + ', ' + record.state);
     *     }
     *
     *     Ext.define('Dude', {
     *         extend: 'Ext.data.Model',
     *         fields: [
     *             {name: 'fullname',  convert: fullName},
     *             {name: 'firstname', mapping: 'name.first'},
     *             {name: 'lastname',  mapping: 'name.last'},
     *             {name: 'city', defaultValue: 'homeless'},
     *             'state',
     *             {name: 'location',  convert: location}
     *         ]
     *     });
     *
     *     // create the data store
     *     var store = Ext.create('Ext.data.Store', {
     *         reader: {
     *             type: 'json',
     *             model: 'Dude',
     *             idProperty: 'key',
     *             root: 'daRoot',
     *             totalProperty: 'total'
     *         }
     *     });
     *
     *     var myData = [
     *         { key: 1,
     *           name: { first: 'Fat',    last:  'Albert' }
     *           // notice no city, state provided in data object
     *         },
     *         { key: 2,
     *           name: { first: 'Barney', last:  'Rubble' },
     *           city: 'Bedrock', state: 'Stoneridge'
     *         },
     *         { key: 3,
     *           name: { first: 'Cliff',  last:  'Claven' },
     *           city: 'Boston',  state: 'MA'
     *         }
     *     ];
     */

    /**
     * @cfg {String} dateFormat
     *
     * Used when converting received data into a Date when the {@link #type} is specified as `"date"`.
     *
     * A format string for the {@link Ext.Date#parse Ext.Date.parse} function, or "timestamp" if the value provided by
     * the Reader is a UNIX timestamp, or "time" if the value provided by the Reader is a javascript millisecond
     * timestamp. See {@link Ext.Date}.
     */
    dateFormat: null,
    
    /**
     * @cfg {Boolean} useNull
     *
     * Use when converting received data into a Number type (either int or float). If the value cannot be
     * parsed, null will be used if useNull is true, otherwise the value will be 0. Defaults to false.
     */
    useNull: false,
    
    /**
     * @cfg {Object} defaultValue
     *
     * The default value used **when a Model is being created by a {@link Ext.data.reader.Reader Reader}**
     * when the item referenced by the `{@link Ext.data.Field#mapping mapping}` does not exist in the data object
     * (i.e. undefined). Defaults to "".
     */
    defaultValue: "",

    /**
     * @cfg {String/Number} mapping
     *
     * (Optional) A path expression for use by the {@link Ext.data.reader.Reader} implementation that is creating the
     * {@link Ext.data.Model Model} to extract the Field value from the data object. If the path expression is the same
     * as the field name, the mapping may be omitted.
     *
     * The form of the mapping expression depends on the Reader being used.
     *
     * - {@link Ext.data.reader.Json}
     *
     *   The mapping is a string containing the javascript expression to reference the data from an element of the data
     *   item's {@link Ext.data.reader.Json#root root} Array. Defaults to the field name.
     *
     * - {@link Ext.data.reader.Xml}
     *
     *   The mapping is an {@link Ext.DomQuery} path to the data item relative to the DOM element that represents the
     *   {@link Ext.data.reader.Xml#record record}. Defaults to the field name.
     *
     * - {@link Ext.data.reader.Array}
     *
     *   The mapping is a number indicating the Array index of the field's value. Defaults to the field specification's
     *   Array position.
     *
     * If a more complex value extraction strategy is required, then configure the Field with a {@link #convert}
     * function. This is passed the whole row object, and may interrogate it in whatever way is necessary in order to
     * return the desired data.
     */
    mapping: null,

    /**
     * @cfg {Function} sortType
     *
     * A function which converts a Field's value to a comparable value in order to ensure correct sort ordering.
     * Predefined functions are provided in {@link Ext.data.SortTypes}. A custom sort example:
     *
     *     // current sort     after sort we want
     *     // +-+------+          +-+------+
     *     // |1|First |          |1|First |
     *     // |2|Last  |          |3|Second|
     *     // |3|Second|          |2|Last  |
     *     // +-+------+          +-+------+
     *
     *     sortType: function(value) {
     *        switch (value.toLowerCase()) // native toLowerCase():
     *        {
     *           case 'first': return 1;
     *           case 'second': return 2;
     *           default: return 3;
     *        }
     *     }
     */
    sortType : null,

    /**
     * @cfg {String} sortDir
     *
     * Initial direction to sort (`"ASC"` or `"DESC"`). Defaults to `"ASC"`.
     */
    sortDir : "ASC",

    /**
     * @cfg {Boolean} allowBlank
     * @private
     *
     * Used for validating a {@link Ext.data.Model model}. Defaults to true. An empty value here will cause
     * {@link Ext.data.Model}.{@link Ext.data.Model#isValid isValid} to evaluate to false.
     */
    allowBlank : true,

    /**
     * @cfg {Boolean} persist
     *
     * False to exclude this field from the {@link Ext.data.Model#modified} fields in a model. This will also exclude
     * the field from being written using a {@link Ext.data.writer.Writer}. This option is useful when model fields are
     * used to keep state on the client but do not need to be persisted to the server. Defaults to true.
     */
    persist: true
});

