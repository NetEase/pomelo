/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
Ext.require([
    'Ext.ProgressBar'
]);

Ext.onReady(function(){
    //Please do not use the following runner code as a best practice! :)
    var Runner = function(){
        var f = function(v, pbar, btn, count, cb){
            return function(){
                if(v > count){
                    btn.dom.disabled = false;
                    cb();
                }else{
                    if(pbar.id=='pbar4'){
                        //give this one a different count style for fun
                        var i = v/count;
                        pbar.updateProgress(i, Math.round(100*i)+'% completed...');
                    }else{
                        pbar.updateProgress(v/count, 'Loading item ' + v + ' of '+count+'...');
                    }
                }
           };
        };
        return {
            run : function(pbar, btn, count, cb) {
                btn.dom.disabled = true;
                var ms = 5000/count;
                for(var i = 1; i < (count+2); i++){
                   setTimeout(f(i, pbar, btn, count, cb), i*ms);
                }
            }
        };
    }();

    //==== Progress bar 1 ====
    var pbar1 = Ext.create('Ext.ProgressBar', {
       text:'Initializing...'
    });

    var btn1 = Ext.get('btn1');
    btn1.on('click', function() {
        Ext.fly('p1text').update('Working');
        if (!pbar1.rendered) {
            pbar1.render('p1');
        } else {
            pbar1.text = 'Initializing...';
            pbar1.show();
        }
        Runner.run(pbar1, Ext.get('btn1'), 10, function() {
            pbar1.reset(true);
            Ext.fly('p1text').update('Done.').show();
        });
    });

    //==== Progress bar 2 ====
    var pbar2 = Ext.create('Ext.ProgressBar', {
        text:'Ready',
        id:'pbar2',
        cls:'left-align',
        renderTo:'p2'
    });

    var btn2 = Ext.get('btn2');

    btn2.on('click', function() {
        Runner.run(pbar2, btn2, 12, function() {
            pbar2.reset();
            pbar2.updateText('Done.');
        });
    });

    //==== Progress bar 3 ====
    var pbar3 = Ext.create('Ext.ProgressBar', {
        id:'pbar3',
        width:300,
        renderTo:'p3'
    });

    pbar3.on('update', function(val) {
        //You can handle this event at each progress interval if
        //needed to perform some other action
        Ext.fly('p3text').dom.innerHTML += '.';
    });

    var btn3 = Ext.get('btn3');

    btn3.on('click', function(){
        Ext.fly('p3text').update('Working');
        btn3.dom.disabled = true;
        pbar3.wait({
            interval: 200,
            duration: 5000,
            increment: 15,
            fn:function() {
                btn3.dom.disabled = false;
                Ext.fly('p3text').update('Done');
            }
        });
    });

    //==== Progress bar 4 ====
    var pbar4 = Ext.create('Ext.ProgressBar', {
        text:'Waiting on you...',
        id:'pbar4',
        textEl:'p4text',
        cls:'custom',
        renderTo:'p4'
    });

    var btn4 = Ext.get('btn4');

    btn4.on('click', function() {
        Runner.run(pbar4, btn4, 19, function() {
            pbar4.updateText('All finished!');
        });
    });
});

