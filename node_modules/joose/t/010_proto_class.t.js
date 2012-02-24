StartTest(function (t) {
    
    //==================================================================================================================================================================================
    t.diag("Joose.Proto.Class")
    
    t.ok(Joose.Proto.Class, "Joose.Proto.Class is here")
    

    //==================================================================================================================================================================================
    t.diag("Circularity")
    
    t.ok(Joose.Proto.Class.meta == Joose.Proto.Class.meta.meta, "Joose.Proto.Class's meta is perfectly circular")
    
    
    //==================================================================================================================================================================================
    t.diag("Stringification")
    
    t.is(Joose.Proto.Class, 'Joose.Proto.Class', "Joose.Proto.Class stringified correctly")
    t.is("" + Joose.Proto.Class.meta, 'a Joose.Proto.Class', "Joose.Proto.Class's meta stringified correctly")
    
    
    //==================================================================================================================================================================================
    t.diag("Inheritance from Joose.Proto.Object")
    
    var TestClass = new Joose.Proto.Class('TestClass', {
        inc : function (a) { return a + 1 }
    }).c
    var testClass = new TestClass()
    
    t.ok(true, "Initialized was inherited from Joose.Proto.Object")
    
    
    //==================================================================================================================================================================================
    t.diag("Constructor property")
    
    t.ok(Joose.Proto.Class.meta.constructor == Joose.Proto.Class, "'constructor' property works as expected #0")
    t.ok(TestClass.meta.constructor == Joose.Proto.Class, "'constructor' property works as expected #1")
    t.ok(testClass.constructor == TestClass, "'constructor' property works as expected #2")

    
    //==================================================================================================================================================================================
    t.diag("Meta property")
    
    t.ok(testClass.meta == TestClass.meta, "'meta' property is the same for class and its instances")
    t.ok(testClass.meta instanceof Joose.Proto.Class, "Test's class 'meta' is a Joose.Proto.Class")
    
    
    //==================================================================================================================================================================================
    t.diag("Methods")

    t.ok(Joose.Proto.Class.meta.hasMethod('hasMethod'), "Joose.Proto.Class has method 'hasMethod'")
    t.ok(Joose.Proto.Class.meta.hasMethod('toString'), "Joose.Proto.Class has method 'toString'")
    
    t.ok(TestClass.meta.hasMethod('inc'), "TestClass has method 'inc'")
    t.is(testClass.inc(1), 2, "... and it works")
    
    t.ok(TestClass.meta.hasMethod('toString'), "TestClass has method 'toString'")
    t.ok(TestClass.meta.hasMethod('SUPER'), "TestClass has method 'SUPER'")
    
    t.ok(TestClass.meta.meta.hasAttribute('superClass'), "meta of TestClass's meta has attribute superClass")

    
    //==================================================================================================================================================================================
    t.diag("Inheritance and mutability (mutableness?)")
    
    var TestClass1 = new Joose.Proto.Class('TestClass1', {
        isa : TestClass,
        
        inc : function (a) { return this.SUPER(a) + 1 }
    }).c
    var testClass1 = new TestClass1()
    
    t.is(testClass1.inc(1), 3, "'inc' was overriden and works correctly")
    
    testClass1.meta.removeMethod('inc')
    
    t.is(testClass1.inc(1), 2, "'inc' is now not overriden")
    
    testClass1.meta.addMethod('inc', function () {
        return this.SUPERARG(arguments) + 1
    })
    
    t.is(testClass1.inc(1), 3, "'inc' was overriden again and works correctly with SUPERARG call")
    
    
    //==================================================================================================================================================================================
    t.diag("isa (instanceof) operations")
    
    t.ok(testClass1 instanceof TestClass1, "testClass1 isa TestClass1")
    t.ok(testClass1 instanceof TestClass, "testClass1 isa TestClass")
    t.ok(testClass1 instanceof Joose.Proto.Object, "testClass1 isa Joose.Proto.Object")
    
    t.ok(TestClass1.meta.isa(TestClass1), "TestClass1 isa TestClass1")
    t.ok(TestClass1.meta.isa(TestClass), "TestClass1 isa TestClass")
    t.ok(TestClass1.meta.isa(Joose.Proto.Object), "TestClass1 isa Joose.Proto.Object")
    
    t.ok(Joose.Proto.Class.meta instanceof Joose.Proto.Object, "Joose.Proto.Class.meta isa Joose.Proto.Object")
    
    //==================================================================================================================================================================================
    t.diag("Stringification #2")
    
    t.is("" + testClass1, 'a TestClass1', "testClass1 stringified correctly")
    t.is("" + testClass1.meta,'a Joose.Proto.Class', "testClass1's meta stringified correctly")
    
    t.done()
})