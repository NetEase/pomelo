/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
Ext.require([
    'Ext.form.*'
]);

Ext.onReady(function() {

    // Add the additional 'advanced' VTypes
    Ext.apply(Ext.form.field.VTypes, {
        daterange: function(val, field) {
            var date = field.parseDate(val);

            if (!date) {
                return false;
            }
            if (field.startDateField && (!this.dateRangeMax || (date.getTime() != this.dateRangeMax.getTime()))) {
                var start = field.up('form').down('#' + field.startDateField);
                start.setMaxValue(date);
                start.validate();
                this.dateRangeMax = date;
            }
            else if (field.endDateField && (!this.dateRangeMin || (date.getTime() != this.dateRangeMin.getTime()))) {
                var end = field.up('form').down('#' + field.endDateField);
                end.setMinValue(date);
                end.validate();
                this.dateRangeMin = date;
            }
            /*
             * Always return true since we're only using this vtype to set the
             * min/max allowed values (these are tested for after the vtype test)
             */
            return true;
        },

        daterangeText: 'Start date must be less than end date',

        password: function(val, field) {
            if (field.initialPassField) {
                var pwd = field.up('form').down('#' + field.initialPassField);
                return (val == pwd.getValue());
            }
            return true;
        },

        passwordText: 'Passwords do not match'
    });

    /*
     * ================  Date Range  =======================
     */

    var dr = Ext.create('Ext.FormPanel', {
        renderTo: 'dr',
        frame: true,
        title: 'Date Range',
        bodyPadding: '5px 5px 0',
        width: 350,
        fieldDefaults: {
            labelWidth: 125,
            msgTarget: 'side',
            autoFitErrors: false
        },
        defaults: {
            width: 300
        },
        defaultType: 'datefield',
        items: [
            {
                fieldLabel: 'Start Date',
                name: 'startdt',
                id: 'startdt',
                vtype: 'daterange',
                endDateField: 'enddt' // id of the end date field
            },
            {
                fieldLabel: 'End Date',
                name: 'enddt',
                id: 'enddt',
                vtype: 'daterange',
                startDateField: 'startdt' // id of the start date field
            }
        ]
    });


    /*
     * ================  Password Verification =======================
     */

    var pwd = Ext.create('Ext.FormPanel', {
        renderTo: 'pw',
        frame: true,
        title: 'Password Verification',
        bodyPadding: '5px 5px 0',
        width: 350,
        fieldDefaults: {
            labelWidth: 125,
            msgTarget: 'side',
            autoFitErrors: false
        },
        defaults: {
            width: 300,
            inputType: 'password'
        },
        defaultType: 'textfield',
        items: [
            {
                fieldLabel: 'Password',
                name: 'pass',
                id: 'pass'
            },
            {
                fieldLabel: 'Confirm Password',
                name: 'pass-cfrm',
                vtype: 'password',
                initialPassField: 'pass' // id of the initial password field
            }
        ]
    });

});

