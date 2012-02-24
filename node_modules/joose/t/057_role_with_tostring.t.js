StartTest(function (t) {
    
    //==================================================================================================================================================================================
    t.diag("Role creation")
    
    Role('RoleWithToString', {
        
        has : {
            title : 'title'
        },
        
        methods : {
            toString : function () { return this.title }
        }
    })
    

    Class('Test', {
        does    : RoleWithToString
    })
    
    var test = new Test({ title : 'yo' })
    
    t.ok(test + '' == 'yo', 'Correct stringification')
    
    t.expectGlobals('Test', 'RoleWithToString')
    
    t.done()
})