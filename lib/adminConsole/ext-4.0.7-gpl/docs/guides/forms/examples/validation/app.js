/**
 * @example Form Validation
 *
 */
Ext.require('Ext.form.Panel');
Ext.require('Ext.form.field.Date');
Ext.onReady(function() {

    var timeTest = /^([1-9]|1[0-9]):([0-5][0-9])(\s[a|p]m)$/i;
    Ext.apply(Ext.form.field.VTypes, {
        //  vtype validation function
        time: function(val, field) {
            return timeTest.test(val);
        },
        // vtype Text property: The error text to display when the validation function returns false
        timeText: 'Not a valid time.  Must be in the format "12:34 PM".',
        // vtype Mask property: The keystroke filter mask
        timeMask: /[\d\s:amp]/i
    });

    Ext.create('Ext.form.Panel', {
        renderTo: Ext.getBody(),
        title: 'User Form',
        height: 200,
        width: 280,
        bodyPadding: 10,
        defaultType: 'textfield',
        items: [
            {
                fieldLabel: 'First Name',
                name: 'firstName'
            },
            {
                fieldLabel: 'Last Name',
                name: 'lastName'
            },
            {
                fieldLabel: 'Email Address',
                name: 'email',
                vtype: 'email'
            },
            {
                xtype: 'datefield',
                fieldLabel: 'Date of Birth',
                name: 'birthDate',
                msgTarget: 'under', // location of the error message
                invalidText: '"{0}" bad. "{1}" good.' // custom error message
            },
            {
                fieldLabel: 'Last Login Time',
                name: 'loginTime',
                vtype: 'time' //  using a custom validation type
            }
        ]
    });

});
