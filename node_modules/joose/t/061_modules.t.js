StartTest(function (t) {
    
    //==================================================================================================================================================================================
    t.diag("`Class` in module's body")
    
    Module("Base", function (module) {
        
        // Create the Base.App class
        Class("App", {
            has: {
                engine  : null
            },
    
            after: {
                initialize: function () {
                    this.engine = new Base.App.Engine({ app : this })
                }
            }
        })
    })
    
    t.ok(Base, 'Namespace `Base` has been created')
    t.ok(Base.meta.constructor == Joose.Namespace.Keeper, '.. and its a "module"')
    
    t.ok(Base.App, 'Namespace `Base.App` has been created')
    t.ok(Base.App.meta.constructor == Joose.Meta.Class, '.. and its a "class"')
    

    //==================================================================================================================================================================================
    t.diag("`Module` over the `Class` ")
    
    
    Module("Base.App", function (module) {
        
        t.ok(this == module && module == Base.App, 'Correct argument and scope for module body')
        
        // Create the "Base.App.Engine" class
        Class("Engine", {
           has: {
               app  : null
           }
        })
    })    

    
    t.ok(Base.App.Engine, 'Namespace `Base.App.Engine` has been created')
    t.ok(Base.App.Engine.meta.constructor == Joose.Meta.Class, '.. and its a "class"')
    
    
    var app = new Base.App()
    
    t.ok(app, '`Base.App` has been successfully instantiated')
    
  
    //==================================================================================================================================================================================
    t.diag("`Class` re-declaration ")
    
    
    Class('Test')
    
    t.throws_ok(function () {
        
        Class('Test')
        
    }, Joose.is_IE ? "" : "Double declaration of [Test]", "Double class declaration is detected")
    
    t.expectGlobals('Test', 'Base')
    
    t.done()
})