StartTest(function (t) {
    
    t.plan(41)
    
    
    //==================================================================================================================================================================================
    t.diag("Advanced attributes")    
    
    t.ok(Joose.Managed.Attribute, "Joose.Managed.Attribute is here")    
    
    
    //==================================================================================================================================================================================
    t.diag("Class with advanced attribute")    
    
    Class('TestClass', {
        has : {
            res : {
                is : 'rw',
                init : 'advanced'
            }
        }
    })    
    
    t.ok(TestClass.meta instanceof Joose.Meta.Class, "TestClass successfully created")    
    t.ok(TestClass.meta.hasAttribute('res'), "'res' attribute was added")    
    
    var advAttr = TestClass.meta.getAttribute('res')    
    
    t.ok(advAttr instanceof Joose.Managed.Attribute, "'res' attribute is a Joose.Managed.Attribute instance")    
    
    t.ok(advAttr.value == 'advanced' && TestClass.prototype.res == 'advanced', "Attribute has a correct initial value")    
    
    t.ok(TestClass.meta.hasMethod('getRes'), "Getter method was added")    
    t.ok(TestClass.meta.hasMethod('setRes'), "Setter method was added")    
    
    
    var testClass = new TestClass()    
    
    t.ok(testClass.res == 'advanced' && testClass.getRes() == 'advanced', "Getter works #1")    
    
    testClass.setRes('setter')    
    t.ok(testClass.res == 'setter' && testClass.getRes() == 'setter', "Setter & Getter works")    
    

    //==================================================================================================================================================================================
    t.diag("Simplified advanced attribute")    
    
    TestClass.meta.extend({ 
        has : {
            simplified1 : null,
            simplified2 : false,
            simplified3 : 10,
            simplified4 : function () { return 'func' }
        }
    })    
    
    t.ok(TestClass.meta.hasAttribute('simplified1'), "'simplified1' attribute was added")    
    t.ok(TestClass.meta.hasAttribute('simplified4'), "'simplified4' attribute was added")    
    
    t.ok(TestClass.prototype.simplified1 === null, "'simplified1' attribute has correct initial value")    
    t.ok(TestClass.prototype.simplified2 === false, "'simplified2' attribute has correct initial value")    
    t.ok(TestClass.prototype.simplified3 === 10, "'simplified3' attribute has correct initial value")    
    t.ok(TestClass.prototype.simplified4 == null, "'simplified4' attribute has correct initial value")    
    
    t.ok(new TestClass().simplified4 == 'func', "'simplified4' attribute has correctly initialized")    
    
    
    //==================================================================================================================================================================================
    t.diag("Role with advanced attribute")    
    
    Role('TestRole', {
        has : {
            res : {
                is : 'rw',
                init : 'advanced'
            }
        }
    })    
    
    t.ok(TestRole.meta instanceof Joose.Meta.Role, "TestRole successfully created")    
    t.ok(TestRole.meta.hasAttribute('res'), "'res' attribute was added")    
    
    var advAttr = TestRole.meta.getAttribute('res')    
    
    t.ok(advAttr instanceof Joose.Managed.Attribute, "'res' attribute is a Joose.Managed.Attribute instance")    
    
    t.ok(advAttr.value == 'advanced', "Attribute has a correct initial value")    
    
    
    //==================================================================================================================================================================================
    t.diag("Mutability & Custom accessors")    
    
    TestClass.meta.extend({ 
        methods : {
            
            setRes : function (value) {
                this.res = 'mutable:' + value    
            },
            
            getRes : function (value) {
                return 'getRes'    
            }
        }
    })    
    
    testClass.setRes('mutable')    
    t.ok(testClass.res == 'mutable:mutable' && testClass.getRes() == 'getRes', "Custom Setter & Getter works")    
    
    TestClass.meta.extend({ 
        removeMethods : [ 'setRes', 'getRes' ]
    })    
    
    
    testClass.setRes('mutable')    
    t.ok(testClass.res == 'mutable' && testClass.getRes() == 'mutable', "Setter & Getter from attribute in effect again")    
    

    //==================================================================================================================================================================================
    t.diag("Attributes initialization")    
    
    TestClass.meta.extend({ 
        has : {
            simple : { init : 'simple' },
            
            required : { required : true },
            
            func : {
                init : function () { return {} }
            }
        }
    })    
    
    var testClass1 = new TestClass({
        simple : 'foo',
        required : 'bar'
    })    
    
    t.ok(testClass1.simple == 'foo', "'simple' attribute initialized")    
    t.ok(testClass1.required == 'bar', "'required' attribute initialized")    
    t.ok(typeof testClass1.func == 'object', "'func' attribute initialized")    
    
    
    //==================================================================================================================================================================================
    t.diag("Exception on 'required'")    
    
    
    t.throws_ok(function () {
        var testClass2 = new TestClass()    
    }, "Required attribute [required] is missed during initialization of a TestClass", "required attribute should be specified")    

    var testClass2 = new TestClass({
        simple : 'foo1',
        required : 'bar1'
    })    
    
    t.ok(typeof testClass2.func == 'object', "'func' attribute initialized #2")    
    t.ok(testClass2.func != testClass1.func, "'init' creates different instances for each call")
    
    
    //==================================================================================================================================================================================
    t.diag("'private' attributes imitation")
    
    Class('TestClass2', {
        has : {
            res : {
                is : 'rw',
                init : 'advanced',
                isPrivate : true
            },
            
            __res1 : {
                is : 'rw',
                init : 'private'
            }
        }
    })    
    
    
    var testClass2 = new TestClass2()
    
    t.ok(!testClass2.res, '"Private" attribute is not visible')
    
    t.ok(testClass2.getRes() == 'advanced', '"Private" attribute was correctly initialized')
    
    
    testClass2.setRes('newvalue')
    t.ok(testClass2.getRes() == 'newvalue', '"Private" attribute was correctly changed')
    
    t.ok(TestClass2.meta.getAttribute('res1').isPrivate, 'Attribute with 2 leading underscores becomes private')
    t.ok(testClass2.getRes1() == 'private', '.. and receives getter')
    
    testClass2.setRes1('newvalue1')
    t.ok(testClass2.getRes1() == 'newvalue1', '.. and setter')
    
    
    
    //==================================================================================================================================================================================
    t.diag("Custom setter/getter names")
    
    Class('TestClass3', {
        has : {
            res : {
                is : 'rw',
                init : 'advanced3',
                
                getterName : 'GETRES',
                setterName : 'SETRES'
            }
        }
    })    
    
    t.ok(TestClass3.meta.hasMethod('GETRES') && TestClass3.meta.hasMethod('SETRES'), 'Custom getter/setter were added')
    
    
    var testClass3 = new TestClass3()
    
    t.ok(testClass3.res == 'advanced3', 'Attribute was initialized correctly')
    
    t.ok(testClass3.GETRES() == 'advanced3', 'Customized getter works correctly')
    
    
    testClass3.SETRES('custom')

    t.ok(testClass3.GETRES() == 'custom', 'Customized setter works correctly')
    
    
    //==================================================================================================================================================================================
    t.diag("Initializing in builder method")
    
    Class('TestClass4', {
        has : {
            res : {
                is : 'rw',
                builder : 'this._buildRes'
            }
        },
        
        methods : {
            _buildRes : function (config, name) {
                
                t.ok(name == 'res', 'Name was correctly passed into attribute builder')
                t.ok(config.foo == 'bar', 'Config was correctly passed into attribute builder')
                
                return 123
            }
        }
    })    

    
    var testClass4 = new TestClass4({ foo : 'bar' })
    
    t.ok(testClass4.res == 123, 'Attribute was correctly initialized from builder')
})    

