/**
 * @example Form Submission
 *
 */
Ext.require('Ext.form.Panel');
Ext.require('Ext.form.field.Date');

Ext.onReady(function() {
    Ext.create('Ext.form.Panel', {
        renderTo: Ext.getBody(),
        title: 'User Form',
        height: 150,
        width: 280,
        bodyPadding: 10,
        defaultType: 'textfield',
        // The form will submit an AJAX request to this URL when submitted
        url: 'data/add_user',
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
                    var form = this.up('form').getForm(); // get the basic form
                    if (form.isValid()) { // make sure the form contains valid data before submitting
                        form.submit({
                            success: function(form, action) {
                               Ext.Msg.alert('Success', action.result.msg);
                            },
                            failure: function(form, action) {
                                Ext.Msg.alert('Failed', action.result.msg);
                            }
                        });
                    } else { // display error alert if the data is invalid
                        Ext.Msg.alert('Invalid Data', 'Please correct form errors.')
                    }
                }
            }
        ]
    });

});
