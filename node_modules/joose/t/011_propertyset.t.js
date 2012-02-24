StartTest(function (t) {
    
    //==================================================================================================================================================================================
    t.diag("Joose.Managed.PropertySet")
    
    t.ok(Joose.Managed.Property, "Joose.Managed.Property is here")
    t.ok(Joose.Managed.Property.ConflictMarker, "Joose.Managed.Property.ConflictMarker is here")
    t.ok(Joose.Managed.PropertySet, "Joose.Managed.PropertySet is here")
    

    //==================================================================================================================================================================================
    t.diag("Sanity")
    
    var A = new Joose.Managed.PropertySet()
    A.addProperty('A1', { init : 'A1'} )
    A.addProperty('A2', { init : 'A2'} )
    
    t.ok(A.haveProperty('A1') && A.getProperty('A1').value == 'A1', 'A has correct property A1')
    t.ok(A.haveProperty('A2') && A.getProperty('A2').value == 'A2', 'A has correct property A2')


    //==================================================================================================================================================================================
    t.diag("Basic composition")
    
    var B = new Joose.Managed.PropertySet()
    B.addProperty('B1', { init : 'B1'} )
    B.addProperty('B2', { init : 'B2'} )
    B.addProperty('A1', { init : 'B-A1'} )
    
    B.composeFrom(A)
    
    t.ok(B.haveProperty('A2'), 'A2 property was composed from A #1')
    t.ok(B.getProperty('A2') == A.getProperty('A2'), 'A2 property was composed from A #2')
    
    t.is(B.getProperty('A1').value, 'B-A1', "A1 property of B don't changed")
    
    var C = new Joose.Managed.PropertySet()
    C.addProperty('C1', { init : 'C1'} )
    
    C.composeFrom(B)
    
    //==================================================================================================================================================================================
    t.diag("Composition with conflicting flattening")
    
    var E = new Joose.Managed.PropertySet()
    E.addProperty('E1', { init : 'E1'} )
    E.addProperty('E2', { init : 'E2'} )
    
    E.composeFrom(A, B)
    
    t.ok(E.haveProperty('A1'), 'E received A1')
    t.ok(E.haveProperty('A2'), 'E received A2')
    t.ok(E.haveProperty('B1'), 'E received B1')
    t.ok(E.haveProperty('B2'), 'E received B2')
    
    t.ok(E.getProperty('A2') == A.getProperty('A2'), 'A2 property was composed from A #2')
    
    t.ok(E.getProperty('A1') instanceof Joose.Managed.Property.ConflictMarker, 'A1 is a conflict marker actually')


    //==================================================================================================================================================================================
    t.diag("Composition with conflicting flattening #2")
    
    var D = new Joose.Managed.PropertySet()
    D.addProperty('D1', { init : 'D1'} )
    
    D.composeFrom(B, E)
    
    t.ok(D.haveProperty('A2'), 'D received A2 #1')
    t.ok(D.getProperty('A2') == A.getProperty('A2'), 'D received A2 #2')
    
    t.ok(D.haveProperty('A1'), 'D received A1')
    t.ok(D.getProperty('A1') instanceof Joose.Managed.Property.ConflictMarker, 'A1 is still a conflict marker')
    

    //==================================================================================================================================================================================
    t.diag("Composition with conflict resolution")
    
    var F = new Joose.Managed.PropertySet()
    F.addProperty('F1', { init : 'F1'} )
    F.addProperty('A1', { init : 'F-A1'} )
    
    F.composeFrom(C, D, E)
    
    t.ok(F.haveProperty('A2'), 'F received A2 #1')
    t.ok(F.getProperty('A2') == A.getProperty('A2'), 'F received A2 #2')
    
    t.ok(F.haveProperty('B1'), 'F received B1 #1')
    t.ok(F.getProperty('B1') == B.getProperty('B1'), 'F received B1 #2')
    
    t.ok(F.haveProperty('B2'), 'F received B2 #1')
    t.ok(F.getProperty('B2') == B.getProperty('B2'), 'F received B2 #2')
    
    t.ok(F.haveProperty('A1'), 'F got A1')
    t.ok(!(F.getProperty('A1') instanceof Joose.Managed.Property.ConflictMarker), 'A1 is not a conflict marker')
    t.is(F.getProperty('A1').value, 'F-A1', 'Conflict was resolved')

    
    //==================================================================================================================================================================================
    t.diag("Aliasing & exclusion")
    
    var E1 = new Joose.Managed.PropertySet()
    E1.addProperty('E11', { init : 'E11'} )
    
    E1.composeFrom({
        propertySet : A,
        alias : {
            A1 : 'A1_from_A'
        },
        exclude : [ 'A2' ]
    },{
        propertySet : B,
        alias : {
            A1 : 'A1_from_B'
        },
        exclude : [ 'A1', 'B1' ]
    })
    
    t.ok(!E1.haveProperty('B1'), "E1 don't received B1")
    
    t.ok(E1.haveProperty('B2'), 'E1 received B2 #1')
    t.ok(E1.getProperty('B2') == B.getProperty('B2'), 'E1 received B2 #2')
    
    t.ok(E1.haveProperty('A1'), "E1 now received A1 from A without conflict")
    t.ok(E1.getProperty('A1') == A.getProperty('A1'), "E1 now received A1 from A")
    
    t.ok(E1.haveProperty('A1_from_A'), 'E1 received A1_from_A #1')
    t.ok(E1.getProperty('A1_from_A').value == 'A1', 'E1 received A1_from_A #2')
    
    t.ok(E1.haveProperty('A1_from_B'), 'E1 received A1_from_B #1')
    t.ok(E1.getProperty('A1_from_B').value == 'B-A1', 'E1 received A1_from_B #2')
    
    t.ok(E1.haveProperty('A2'), "E1 still received A2 from B")
    t.ok(E1.getProperty('A2') == B.getProperty('A2'), "E1 still received A2 from B")
    
    t.done()
})