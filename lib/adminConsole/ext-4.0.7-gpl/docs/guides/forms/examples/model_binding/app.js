/**
 * @example Binding a Model to a Form
 *
 */
Ext.require('Ext.form.Panel');
Ext.require('Ext.form.field.Date');

Ext.define('User', {
    extend: 'Ext.data.Model',
    fields: ['firstName', 'lastName', 'birthDate'],
    proxy: {
        type: 'ajax',
        api: {
            read: 'data/get_user',
            update: 'data/update_user'
        },
        reader: {
            type: 'json',
            root: 'users'
        }
    }
});

Ext.onReady(function() {

    var userForm = Ext.create('Ext.form.Panel', {
        renderTo: Ext.getBody(),
        title: 'User Form',
        height: 150,
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
                xtype: 'datefield',
                fieldLabel: 'Date of Birth',
                name: 'birthDate'
            }
        ],
        buttons: [
            {
                text: 'Submit',
                handler: function() {
                    var form = this.up('form').getForm(), // get the basic form
                        record = form.getRecord(); // get the underlying model instance
                    if (form.isValid()) { // make sure the form contains valid data before submitting
                        form.updateRecord(record); // update the record with the form data
                        record.save({ // save the record to the server
                            success: function(user) {
                                Ext.Msg.alert('Success', 'User saved successfully.')
                            },
                            failure: function(user) {
                                Ext.Msg.alert('Failure', 'Failed to save user.')
                            }
                        });
                    } else { // display error alert if the data is invalid
                        Ext.Msg.alert('Invalid Data', 'Please correct form errors.')
                    }
                }
            }
        ]
    });

    Ext.ModelMgr.getModel('User').load(1, { // load user with ID of "1"
        success: function(user) {
            userForm.loadRecord(user); // when user is loaded successfully, load the data into the form
        }
    });


});
