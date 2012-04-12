/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
Ext.require([
    'Ext.window.MessageBox',
    'Ext.tip.*'
]);

Ext.onReady(function(){
    Ext.get('mb1').on('click', function(e){
        Ext.MessageBox.confirm('Confirm', 'Are you sure you want to do that?', showResult);
    });

    Ext.get('mb2').on('click', function(e){
        Ext.MessageBox.prompt('Name', 'Please enter your name:', showResultText);
    });

    Ext.get('mb3').on('click', function(e){
        Ext.MessageBox.show({
           title: 'Address',
           msg: 'Please enter your address:',
           width:300,
           buttons: Ext.MessageBox.OKCANCEL,
           multiline: true,
           fn: showResultText,
           animateTarget: 'mb3'
       });
    });

    Ext.get('mb4').on('click', function(e){
        Ext.MessageBox.show({
           title:'Save Changes?',
           msg: 'You are closing a tab that has unsaved changes. <br />Would you like to save your changes?',
           buttons: Ext.MessageBox.YESNOCANCEL,
           fn: showResult,
           animateTarget: 'mb4',
           icon: Ext.MessageBox.QUESTION
       });
    });

    Ext.get('mb6').on('click', function(){
        Ext.MessageBox.show({
           title: 'Please wait',
           msg: 'Loading items...',
           progressText: 'Initializing...',
           width:300,
           progress:true,
           closable:false,
           animateTarget: 'mb6'
       });

       // this hideous block creates the bogus progress
       var f = function(v){
            return function(){
                if(v == 12){
                    Ext.MessageBox.hide();
                    Ext.example.msg('Done', 'Your fake items were loaded!');
                }else{
                    var i = v/11;
                    Ext.MessageBox.updateProgress(i, Math.round(100*i)+'% completed');
                }
           };
       };
       for(var i = 1; i < 13; i++){
           setTimeout(f(i), i*500);
       }
    });

    Ext.get('mb7').on('click', function(){
        Ext.MessageBox.show({
           msg: 'Saving your data, please wait...',
           progressText: 'Saving...',
           width:300,
           wait:true,
           waitConfig: {interval:200},
           icon:'ext-mb-download', //custom class in msg-box.html
           animateTarget: 'mb7'
       });
        setTimeout(function(){
            //This simulates a long-running operation like a database save or XHR call.
            //In real code, this would be in a callback function.
            Ext.MessageBox.hide();
            Ext.example.msg('Done', 'Your fake data was saved!');
        }, 8000);
    });

    Ext.get('mb8').on('click', function(){
        Ext.MessageBox.alert('Status', 'Changes saved successfully.', showResult);
    });

    //Add these values dynamically so they aren't hard-coded in the html
    Ext.fly('info').dom.value = Ext.MessageBox.INFO;
    Ext.fly('question').dom.value = Ext.MessageBox.QUESTION;
    Ext.fly('warning').dom.value = Ext.MessageBox.WARNING;
    Ext.fly('error').dom.value = Ext.MessageBox.ERROR;

    Ext.get('mb9').on('click', function(){
        Ext.MessageBox.show({
           title: 'Icon Support',
           msg: 'Here is a message with an icon!',
           buttons: Ext.MessageBox.OK,
           animateTarget: 'mb9',
           fn: showResult,
           icon: Ext.get('icons').dom.value
       });
    });

    function showResult(btn){
        Ext.example.msg('Button Click', 'You clicked the {0} button', btn);
    };

    function showResultText(btn, text){
        Ext.example.msg('Button Click', 'You clicked the {0} button and entered the text "{1}".', btn, text);
    };
});
