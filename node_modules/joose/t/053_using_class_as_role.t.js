StartTest(function (t) {
    
    t.plan(13)
    
    //==================================================================================================================================================================================
    t.diag("Using Class as Role")
    
    Role('PseudoRole1', {
        have : {
            res1 : 'pseudoRole1'
        },
        
        methods : {
            process1 : function () {
                return 'processFromPseudoRole1'
            }
        },
        
        
        after : {
            process1 : function () {
                this.res1 = 'resFromAfter1'
            }
        }
    })
    
    t.ok(PseudoRole1, 'PseudoRole1 role was created')
    
    t.ok(PseudoRole1.meta.hasAttribute('res1'), "PseudoRole1 has correct attribute 'res'")
    t.ok(PseudoRole1.meta.hasMethod('process1'), "PseudoRole1 has method 'process'")
    
    Class('PseudoRole2', {
        
        does : PseudoRole1,
        
        have : {
            res2 : 'pseudoRole2'
        },
        
        methods : {
            process2 : function () {
                return 'processFromPseudoRole2'
            }
        },
        
        
        after : {
            process2 : function () {
                this.res2 = 'resFromAfter2'
            }
        }
    })
    t.ok(PseudoRole2, 'PseudoRole2 class was created')
    
    t.ok(PseudoRole2.meta.hasAttribute('res2') && PseudoRole2.meta.getAttribute('res2').value == 'pseudoRole2', "PseudoRole2 has correct attribute 'res'")
    t.ok(PseudoRole2.meta.hasMethod('process2') && new PseudoRole2().process2() == 'processFromPseudoRole2', "PseudoRole2 has method 'process'")

    
    Class('Resource', {
        does : PseudoRole2,
        
        methods : {
            process2 : function () {
                return 'processFromResource'
            }
        }
    })
    t.ok(Resource, 'Resource class was created')
    
    t.ok(Resource.meta.hasAttribute('res1') && Resource.meta.getAttribute('res1').value == 'pseudoRole1', "Resource has correct attribute 'res1'")
    t.ok(Resource.meta.hasAttribute('res2') && Resource.meta.getAttribute('res2').value == 'pseudoRole2', "Resource has correct attribute 'res2'")
    
    var resource = new Resource()
    
    t.ok(Resource.meta.hasMethod('process1') && resource.process1() == 'processFromPseudoRole1', "Resource has correct method 'process1'")
    t.ok(Resource.meta.hasMethod('process2') && resource.process2() == 'processFromResource', "Resource has correct method 'process2'")
    
    t.ok(resource.res1 == 'resFromAfter1', 'method modifier was recevied from PseudoRole1')
    t.ok(resource.res2 == 'resFromAfter2', 'method modifier was recevied from PseudoRole2')
})