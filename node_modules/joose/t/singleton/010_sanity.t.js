StartTest(function(t) {
    
    //======================================================================================================================================================================================================================================================
    t.diag('Sanity')
    
    t.ok(Joose.Meta.Singleton, "Joose.Meta.Singleton is here")
    
    
    //======================================================================================================================================================================================================================================================
    t.diag('Various ways to receive the singleton instance')
    
    
    var SomeClass = Class({
        trait : Joose.Meta.Singleton,
        
        has : {
            init    : null,
            attr    : 'value'
        },
        
        methods : {
            process : function () {
                return 'result'
            }
        }
    })
    
    
    var instance1 = new SomeClass({
        init    : 'yo'
    })
    
    t.ok(instance1.init == 'yo', 'Instance was created with correct arguments')
    
    
    var instance2 = new SomeClass()
    
    var instance3 = SomeClass()
    
    t.ok(instance1 == instance2 && instance2 == instance3, 'All ways ok')
    
    t.ok(instance1 instanceof SomeClass, 'its an instance of SomeClass, really #1')
    t.ok(instance1.attr == 'value', 'its an instance of SomeClass, really #2')
    t.ok(instance1.process() == 'result', 'its an instance of SomeClass, really #3')
    
    t.ok(instance1.init == 'yo', 'Instance was not reconfigured')
    
    
    //======================================================================================================================================================================================================================================================
    t.diag('Various ways to receive the singleton instance #2 + Singleton helper')

    
    var SomeClass1 = Singleton({
        has : {
            init    : null,
            attr    : 'value1'
        },
        
        methods : {
            process : function () {
                return 'result1'
            },
            
            configure : function (arg) {
                this.init = arg
            }                
        }
    })
    
    //now instance3 goes first
    var instance3 = SomeClass1({
        init : 'yo1'
    })
    
    t.ok(instance3.init == 'yo1', 'Instance was created with correct arguments')
    
    
    var instance1 = new SomeClass1(11)
    
    t.ok(instance3.init == 11, 'Instance was reconfigured #1')
    
    
    var instance2 = new SomeClass1('yo2')
    
    t.ok(instance3.init == 'yo2', 'Instance was reconfigured #2')
    

    //======================================================================================================================================================================================================================================================
    t.diag('Various ways to receive the singleton instance #2 + Singleton helper')
    
    
    t.ok(instance1 == instance2 && instance2 == instance3, 'All ways ok #2')
    
    t.ok(instance1 instanceof SomeClass1, 'its an instance of SomeClass1, really #1')
    t.ok(instance1.attr == 'value1', 'its an instance of SomeClass1, really #2')
    t.ok(instance1.process() == 'result1', 'its an instance of SomeClass1, really #3')
    
    
    //======================================================================================================================================================================================================================================================
    t.diag('Inheritance')
    
    var SomeClass2 = Class({
        isa : SomeClass
    })
    
    var instance1 = SomeClass2()
    var instance2 = new SomeClass2()
    var instance3 = new SomeClass2()
    
    
    t.ok(instance1 == instance2 && instance2 == instance3, "'Singleton-nessment' was inherited along with metaclass")
    
        
    t.done()
})    