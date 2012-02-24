StartTest(function(t) {
    
    //======================================================================================================================================================================================================================================================
    t.diag('Sanity')
    
    t.ok(Joose.Meta.Singleton, "Joose.Meta.Singleton is here")
    
    
    //======================================================================================================================================================================================================================================================
    t.diag('Creating singletons with applied traits')
    
    var SomeRole = Role({
        has : {
            anotherAttr : 'anotherValue'
        },
    
        methods : {
            anotherProcess : function () {
                return 'anotherResult'
            }
        }
    })
    
    
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
    
    
    var instance = new SomeClass({
        trait           : SomeRole,
        
        init            : 'yo',
        anotherAttr     : 'yo1'
    })
    
    t.ok(instance.init == 'yo', 'Instance was created with correct arguments')
    
    t.ok(instance.anotherAttr == 'yo1', 'Attribute from trait was initialized correctly')
    t.ok(instance.attr == 'value', 'Own attribute was initialized correctly')
    
    t.ok(instance.process() == 'result', 'Own method works correctly')
    t.ok(instance.anotherProcess() == 'anotherResult', 'Method from trait works correctly')
        

    t.done()
})    