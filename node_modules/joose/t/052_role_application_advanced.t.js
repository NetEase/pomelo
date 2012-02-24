StartTest(function (t) {
    t.plan(8)
    
    //==================================================================================================================================================================================
    t.diag("Advanced Role application")
    
    //==================================================================================================================================================================================
    t.diag("Overriding methods/attributes from superclass")
    
    Class('SuperClass', {
        have : {
            res : 'sup:res'
        },
        
        methods : {
            process : function () { return 'sup:process' }
        }
    })
    t.ok(SuperClass, 'SuperClass class was created')

    
    Class('SubClass', {
        isa : SuperClass
    })
    t.ok(SubClass, 'SubClass class was created')
    
    t.ok(SubClass.meta.hasAttribute('res') && SubClass.meta.getAttribute('res').value == 'sup:res', "SubClass has correct attribute 'res'")
    t.ok(SubClass.meta.hasMethod('process') && new SubClass().process() == 'sup:process', "SubClass has method 'process'")
    
    
    Role('Resource', {
        have : {
            res : 'role:res'
        },
        
        methods : {
            process : function () { return 'role:process' }
        }
    })
    t.ok(Resource, 'Resource role was created')
    
    SubClass.meta.extend({
        does : [ Resource ]
    })
    
    t.ok(SubClass.meta.hasAttribute('res') && SubClass.meta.getAttribute('res').value == 'role:res', "SubClass has correct attribute 'res'")
    t.ok(SubClass.meta.hasMethod('process') && new SubClass().process() == 'role:process', "SubClass has method 'process'")

    
    //==================================================================================================================================================================================
    t.diag("Composition of the same Role on different hierarchy levels")
    
    Role('PostProcess', {
        after : {
            process : function () {
                this.res += '|afterFromRole'
            }
        }
    })
    
    
    Class('SuperClass1', {
        does : [ PostProcess ],
        
        have : {
            res : 'sup1:res'
        },
        
        methods : {
            process : function () { 
                this.res += '|afterSup1' 
            }
        }
    })
    
    
    Class('SubClass1', {
        isa : SuperClass1,
        
        does : [ PostProcess ],
        
        methods : {
            process : function () { 
                this.SUPER()
                this.res += '|afterSub1' 
            }
        }
    })
    
    Class('SubClass2', {
        isa : SubClass1,
        
        does : [ PostProcess ],
        
        methods : {
            process : function () { 
                this.SUPER()
                this.res += '|afterSub2' 
            }
        }
    })
    
    var sub2 = new SubClass2()
    sub2.process()
    
    t.ok(sub2.res == 'sup1:res|afterSup1|afterFromRole|afterSub1|afterFromRole|afterSub2|afterFromRole', "'PostProcess' role was applied on all inheritance levels")
    
})