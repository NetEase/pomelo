StartTest(function (t) {
    
    //==================================================================================================================================================================================
    t.diag("Advanced attributes and class's body")
    
    
    var bodyCalled = false
    
    Class('Test', {
        
        has : {
            attr         : { is : 'rw', init : 'value' }
        },
        
        body : function () {
            bodyCalled = true
        }
    
    })
    
    t.ok(Test, "'Test' class was created")
    
    t.ok(Test.meta.getAttribute('attr').value == 'value', "'Test' class has correct 'attr' attribute")
    
    t.ok(!Test.meta.stem.opened, "'Test' class has closed stem")
    
    t.ok(bodyCalled, 'Body of class was called')

    
    //==================================================================================================================================================================================
    t.diag("Consumption of advanced attribute from Role #1")    
    
    Role('TestRole', {
        has : {
            res : {
                is : 'rw',
                init : 'advanced'
            }
        }
    })    
    
    t.ok(TestRole.meta.hasAttribute('res'), "'res' attribute was added")    

    t.ok(TestRole.meta.hasMethod('getRes'), "Getter method was created")
    t.ok(TestRole.meta.hasMethod('setRes'), "Setter method was created")
    
    
    
    var advAttr = TestRole.meta.getAttribute('res')    
    
    t.ok(advAttr instanceof Joose.Managed.Attribute, "'res' attribute is a Joose.Managed.Attribute instance")    
    
    t.ok(advAttr.value == 'advanced', "Attribute has a correct initial value")    
    

    Class('TestClass', {
        
        does : TestRole
    })
    
    t.ok(TestClass.meta.hasAttribute('res'), "Attribute 'res' was consumed from Role")

    t.ok(TestClass.meta.hasMethod('getRes'), ".. along with getter")
    t.ok(TestClass.meta.hasMethod('setRes'), ".. and setter")
    
    
    var advAttr1 = TestClass.meta.getAttribute('res')    
    
    t.ok(advAttr1 instanceof Joose.Managed.Attribute, "'res' attribute is advanced")    
    
    t.ok(advAttr1.value == 'advanced', "Attribute has a correct initial value")
    
    
    //==================================================================================================================================================================================
    t.diag("Consumption of advanced attribute from Role #2")    
    
    
    Class('TestClass2', {
        
        does : TestRole,
        
        has : {
            res : {
                is      : 'rw',
                init    : 'fromClass'
            }
        }
    })
    
    
    t.ok(TestClass2.meta.hasMethod('getRes'), "Getter method was created")
    t.ok(TestClass2.meta.hasMethod('setRes'), "Setter method was created")
    
    t.ok(TestClass2.meta.getAttribute('res').value == 'fromClass', "Created attribute has a correct value - received from class")


    //==================================================================================================================================================================================
    t.diag("Webkit & RegExp attributes")
    
    
    Class('Bar', {
        has : { 
            regex1  : { is: 'rw', init: /abc/ }, 
            regex2  : /abc/ 
        }
    })
    
    var bar = new Bar()

    t.ok(bar.regex1.test(/123abc123/), 'Attribute was correctly initialized with RegExp #1')
    t.ok(bar.regex2.test(/123abc123/), 'Attribute was correctly initialized with RegExp #2')
    

        //==================================================================================================================================================================================
    t.diag("Webkit & RegExp attributes")
    
    
    Class('Baz', {
        has : { 
            barClass  : Bar 
        }
    })
    
    var baz = new Baz()

    t.ok(baz.barClass == Bar, 'Correct attribute initialization with Class')

    
    
    t.expectGlobals('Test', 'TestRole', 'TestClass', 'TestClass2', 'Bar', 'Baz')
    t.done()
})    

