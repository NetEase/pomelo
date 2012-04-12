/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
Ext.require([
    'Ext.form.field.ComboBox',
    'Ext.form.FieldSet',
    'Ext.tip.QuickTipManager',
    'Ext.data.*'
]);

Ext.onReady(function() {
    Ext.tip.QuickTipManager.init();

    // Define the model for a State
    Ext.define('State', {
        extend: 'Ext.data.Model',
        fields: [
            {type: 'string', name: 'abbr'},
            {type: 'string', name: 'name'},
            {type: 'string', name: 'slogan'}
        ]
    });

    // The data for all states
    var states = [
        {"abbr":"AL","name":"Alabama","slogan":"The Heart of Dixie"},
        {"abbr":"AK","name":"Alaska","slogan":"The Land of the Midnight Sun"},
        {"abbr":"AZ","name":"Arizona","slogan":"The Grand Canyon State"},
        {"abbr":"AR","name":"Arkansas","slogan":"The Natural State"},
        {"abbr":"CA","name":"California","slogan":"The Golden State"},
        {"abbr":"CO","name":"Colorado","slogan":"The Mountain State"},
        {"abbr":"CT","name":"Connecticut","slogan":"The Constitution State"},
        {"abbr":"DE","name":"Delaware","slogan":"The First State"},
        {"abbr":"DC","name":"District of Columbia","slogan":"The Nation's Capital"},
        {"abbr":"FL","name":"Florida","slogan":"The Sunshine State"},
        {"abbr":"GA","name":"Georgia","slogan":"The Peach State"},
        {"abbr":"HI","name":"Hawaii","slogan":"The Aloha State"},
        {"abbr":"ID","name":"Idaho","slogan":"Famous Potatoes"},
        {"abbr":"IL","name":"Illinois","slogan":"The Prairie State"},
        {"abbr":"IN","name":"Indiana","slogan":"The Hospitality State"},
        {"abbr":"IA","name":"Iowa","slogan":"The Corn State"},
        {"abbr":"KS","name":"Kansas","slogan":"The Sunflower State"},
        {"abbr":"KY","name":"Kentucky","slogan":"The Bluegrass State"},
        {"abbr":"LA","name":"Louisiana","slogan":"The Bayou State"},
        {"abbr":"ME","name":"Maine","slogan":"The Pine Tree State"},
        {"abbr":"MD","name":"Maryland","slogan":"Chesapeake State"},
        {"abbr":"MA","name":"Massachusetts","slogan":"The Spirit of America"},
        {"abbr":"MI","name":"Michigan","slogan":"Great Lakes State"},
        {"abbr":"MN","name":"Minnesota","slogan":"North Star State"},
        {"abbr":"MS","name":"Mississippi","slogan":"Magnolia State"},
        {"abbr":"MO","name":"Missouri","slogan":"Show Me State"},
        {"abbr":"MT","name":"Montana","slogan":"Big Sky Country"},
        {"abbr":"NE","name":"Nebraska","slogan":"Beef State"},
        {"abbr":"NV","name":"Nevada","slogan":"Silver State"},
        {"abbr":"NH","name":"New Hampshire","slogan":"Granite State"},
        {"abbr":"NJ","name":"New Jersey","slogan":"Garden State"},
        {"abbr":"NM","name":"New Mexico","slogan":"Land of Enchantment"},
        {"abbr":"NY","name":"New York","slogan":"Empire State"},
        {"abbr":"NC","name":"North Carolina","slogan":"First in Freedom"},
        {"abbr":"ND","name":"North Dakota","slogan":"Peace Garden State"},
        {"abbr":"OH","name":"Ohio","slogan":"The Heart of it All"},
        {"abbr":"OK","name":"Oklahoma","slogan":"Oklahoma is OK"},
        {"abbr":"OR","name":"Oregon","slogan":"Pacific Wonderland"},
        {"abbr":"PA","name":"Pennsylvania","slogan":"Keystone State"},
        {"abbr":"RI","name":"Rhode Island","slogan":"Ocean State"},
        {"abbr":"SC","name":"South Carolina","slogan":"Nothing Could be Finer"},
        {"abbr":"SD","name":"South Dakota","slogan":"Great Faces, Great Places"},
        {"abbr":"TN","name":"Tennessee","slogan":"Volunteer State"},
        {"abbr":"TX","name":"Texas","slogan":"Lone Star State"},
        {"abbr":"UT","name":"Utah","slogan":"Salt Lake State"},
        {"abbr":"VT","name":"Vermont","slogan":"Green Mountain State"},
        {"abbr":"VA","name":"Virginia","slogan":"Mother of States"},
        {"abbr":"WA","name":"Washington","slogan":"Green Tree State"},
        {"abbr":"WV","name":"West Virginia","slogan":"Mountain State"},
        {"abbr":"WI","name":"Wisconsin","slogan":"America's Dairyland"},
        {"abbr":"WY","name":"Wyoming","slogan":"Like No Place on Earth"}
    ];

    // The data store holding the states; shared by each of the ComboBox examples below
    var store = Ext.create('Ext.data.Store', {
        model: 'State',
        data: states
    });

    // Simple ComboBox using the data store
    var simpleCombo = Ext.create('Ext.form.field.ComboBox', {
        fieldLabel: 'Select a single state',
        renderTo: 'simpleCombo',
        displayField: 'name',
        width: 320,
        labelWidth: 130,
        store: store,
        queryMode: 'local',
        typeAhead: true
    });

    // ComboBox with a custom item template
    var customTplCombo = Ext.create('Ext.form.field.ComboBox', {
        fieldLabel: 'Select a single state',
        renderTo: 'customTplCombo',
        displayField: 'name',
        width: 320,
        labelWidth: 130,
        store: store,
        queryMode: 'local',

        listConfig: {
            getInnerTpl: function() {
                return '<div data-qtip="{name}. {slogan}">{name} ({abbr})</div>';
            }
        }
    });

    // ComboBox with multiple selection enabled
    var multiCombo = Ext.create('Ext.form.field.ComboBox', {
        fieldLabel: 'Select multiple states',
        renderTo: 'multiSelectCombo',
        multiSelect: true,
        displayField: 'name',
        width: 320,
        labelWidth: 130,
        store: store,
        queryMode: 'local'
    });

    // ComboBox transformed from HTML select
    var transformed = Ext.create('Ext.form.field.ComboBox', {
        typeAhead: true,
        transform: 'stateSelect',
        width: 135,
        forceSelection: true
    });


    ////// Collapsible code panels; ignore: /////

    Ext.select('pre.code').each(function(pre) {
        Ext.create('Ext.form.FieldSet', {
            contentEl: pre,
            renderTo: pre.parent(),
            title: 'View code for this example',
            collapsible: true,
            collapsed: true
        })
    });


});

