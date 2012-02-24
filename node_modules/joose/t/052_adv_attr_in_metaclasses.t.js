StartTest(function (t) {
    
    //==================================================================================================================================================================================
    t.diag("Initialization of advanced attributes in subclasses of Joose.Meta.Class")
    
    
    //==================================================================================================================================================================================
    t.diag("Creation")
    
    
    Class('TestMeta', {
        
        meta : Joose.Meta.Class,
        
        isa : Joose.Meta.Class,
        
        has : {
            attr         : { 
                is : 'rw', 
                init : function () {
                    return '123'
                } 
            }
        }
    })
    
    t.ok(TestMeta, "'TestMeta' class was created")
    
    t.ok(TestMeta.meta.hasAttribute('attr'), "'TestMeta' class has 'attr' attribute")
    
    
    //==================================================================================================================================================================================
    t.diag("Instantiation")
    
    var testMeta = new TestMeta('NewClass', {})
    
    t.ok(testMeta.attr == '123', "Attribute 'attr' was correctly initialized")
    
    
    //==================================================================================================================================================================================
    t.diag("Creation for Roles")
    
    
    Class('TestMeta2', {
        
        meta : Joose.Meta.Class,
        
        isa : Joose.Meta.Role,
        
        has : {
            attr         : { 
                is : 'rw', 
                init : function () {
                    return '123'
                } 
            }
        }
    })
    
    t.ok(TestMeta2, "'TestMeta2' class was created")
    
    t.ok(TestMeta2.meta.hasAttribute('attr'), "'TestMeta2' class has 'attr' attribute")
    
    
    //==================================================================================================================================================================================
    t.diag("Instantiation for Roles")
    
    var testMeta2 = new TestMeta2('NewRole', {})
    
    t.ok(testMeta2.attr == '123', "Attribute 'attr' was correctly initialized for roles")
    
    t.expectGlobals('TestMeta', 'TestMeta2')
    
    t.done()
})    

