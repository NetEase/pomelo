StartTest(function(t) {
    
    //==================================================================================================================================================================================
    t.diag("Sanity")    
    
    t.ok(Joose.Attribute.Trigger, "Joose.Attribute.Trigger is here")
    
    
    //==================================================================================================================================================================================
    t.diag("Trigger testing")
    
    var TestClass = Class({
        has : {
            res : {
                is : 'rw',
                init : 'advanced'
            },
            
            trigger : {
                is      : 'rw',
                init    : 'foo',
                
                trigger : function (value, oldValue) {
                    t.ok(oldValue == 'bar', 'Correct old value')
                    t.ok(value == 'baz', 'Trigger received new attribute value')
                    
                    this.setRes('triggered')
                } 
            }
        }
    })    
    
    var testClass = new TestClass({
        trigger : 'bar'
    })    
    
    t.ok(testClass.trigger == 'bar', "Value of 'trigger' attribute is correct")   
    t.ok(testClass.res != 'triggered', ".. and the trigger function was not executed during initialization")
    
    testClass.setTrigger('baz')
    
    t.ok(testClass.res == 'triggered', ".. and the trigger function was executed")
    
    t.throwsOk(function () {
        
        var TestClas2 = Class({
            
            has : {
                trigger : {
                    is : 'ro',
                    
                    trigger : function (value, oldValue) {
                    } 
                }
            }
        })    
        
    }, "Can't use `trigger` for read-only attributes", 'Correct exception on "ro/trigger" combination')
    
    t.done()
})    