StartTest(function (t) {
    t.plan(49)
    
    //==================================================================================================================================================================================
    t.diag("Joose.Managed.Role")
    
    t.ok(Joose.Managed.Role, "Joose.Managed.Role is here")
    
    //==================================================================================================================================================================================
    t.diag("Sanity")
    
    t.ok(Joose.Managed.Role.meta.stem.attributesMC == Joose.Managed.StemElement.Attributes, 'Joose.Managed.Role itslef has a class stem')
    
    var A = new Joose.Managed.Role('A', { 
        have : {
            A1 : 'A1'
        },
        
        methods : {
            A2 : function () { return 'A2' }
        }
    }).c
    

    t.throws_ok(function () {
        new A()
    }, "Roles cant be instantiated", "Roles cant be instantiated")
    
    t.ok(A.meta.hasAttribute('A1') && A.meta.getAttribute('A1').value == 'A1', 'A has correct attribute A1')
    t.ok(A.meta.hasMethod('A2') && A.meta.getMethod('A2').value() == 'A2', 'A has correct method A2')


    //==================================================================================================================================================================================
    t.diag("Basic composition")
    
    var B = new Joose.Managed.Role('B', { 
        have : {
            B1 : 'B1',
            A1 : 'B-A1'
        },
        
        methods : {
            B2 : function () { return 'B2' }
        },
        
        does : [ A ]
    }).c
    
    t.ok(B.meta.hasMethod('A2') && B.meta.getMethod('A2') == A.meta.getMethod('A2'), 'method A2 was composed from A #1')
    t.is(B.meta.getAttribute('A1').value, 'B-A1', "A1 property of B don't changed")
    
    
    var C = new Joose.Managed.Role('C', {
        have : {
            C1 : 'C1'
        },
        
        does : [ B ]
    }).c
    
    //==================================================================================================================================================================================
    t.diag("Composition with conflicting flattening")
    
    var E = new Joose.Managed.Role('E', {
        have : {
            E1 : 'E1'
        },
        
        methods : {
            E2 : function () { return 'E2' }
        },
        
        does : [ A, B ]
    }).c
    
    t.ok(E.meta.hasAttribute('B1') && E.meta.getAttribute('B1') == B.meta.getAttribute('B1'), 'E received B1')
    
    t.ok(E.meta.hasAttribute('A1'), 'E received A1')
    t.ok(E.meta.getAttribute('A1') instanceof Joose.Managed.Property.ConflictMarker, 'A1 is a conflict marker actually')
    
    t.ok(E.meta.hasMethod('A2') && E.meta.getMethod('A2') == A.meta.getMethod('A2'), 'E received A2')
    t.ok(E.meta.hasMethod('B2') && E.meta.getMethod('B2') == B.meta.getMethod('B2'), 'E received B2')
    


    //==================================================================================================================================================================================
    t.diag("Composition with conflicting flattening #2")
    
    var D = new Joose.Managed.Role('D', {
        have : {
            D1 : 'D1'
        },
        
        does : [ B, E ]
    }).c
    
    
    t.ok(D.meta.hasAttribute('A1') && D.meta.getAttribute('A1') instanceof Joose.Managed.Property.ConflictMarker, 'A1 is still a conflict marker')
    
    t.ok(D.meta.hasMethod('A2') && D.meta.getMethod('A2') == A.meta.getMethod('A2'), 'D received A2')
    t.ok(D.meta.hasMethod('B2') && D.meta.getMethod('B2') == B.meta.getMethod('B2'), 'D received B2')
    t.ok(D.meta.hasMethod('E2') && D.meta.getMethod('E2') == E.meta.getMethod('E2'), 'D received E2')
    
    
    //==================================================================================================================================================================================
    t.diag("Composition with conflict resolution")
    
    var F = new Joose.Managed.Role('F', {
        have : {
            F1 : 'F1',
            A1 : 'F-A1'
        },
        
        methods : {
            F2 : function () { return 'F2' }
        },
        
        does : [ C, D, E ]
    }).c
    
    
    t.ok(F.meta.hasMethod('A2') && F.meta.getMethod('A2') == A.meta.getMethod('A2'), 'F received A2')
    t.ok(F.meta.hasAttribute('D1') && F.meta.getAttribute('D1') == D.meta.getAttribute('D1'), 'F received D1')
    t.ok(F.meta.hasMethod('E2') && F.meta.getMethod('E2') == E.meta.getMethod('E2'), 'F received E2')
    
    t.ok(F.meta.hasAttribute('A1'), 'F got A1')
    t.ok(!(F.meta.getAttribute('A1') instanceof Joose.Managed.Property.ConflictMarker), 'A1 is not a conflict marker')
    t.is(F.meta.getAttribute('A1').value, 'F-A1', 'Conflict was resolved')

    
    //==================================================================================================================================================================================
    t.diag("Aliasing & exclusion")
    
    var E1 = new Joose.Managed.Role('E1', {
        have : {
            E11 : 'E11'
        },
        
        does : [{
            role : A,
            alias : {
                A1 : 'A1_from_A'
            },
            exclude : [ 'A2' ]
        },{
            role : B,
            alias : {
                A1 : 'A1_from_B'
            },
            exclude : [ 'A1', 'B1' ]
        }]
    }).c
    
    t.ok(!E1.meta.hasAttribute('B1'), "E1 don't received B1")
    
    t.ok(E1.meta.hasMethod('A2') && E1.meta.getMethod('A2') == B.meta.getMethod('A2'), "E1 still received A2 from B")
    t.ok(E1.meta.hasMethod('B2') && E1.meta.getMethod('B2') == E.meta.getMethod('B2'), 'E1 received B2')
    
    t.ok(E1.meta.hasAttribute('A1'), "E1 now received A1 from A without conflict")
    t.ok(!(E1.meta.getAttribute('A1') instanceof Joose.Managed.Property.ConflictMarker), 'A1 is not a conflict marker')
    t.ok(E1.meta.getAttribute('A1') == A.meta.getAttribute('A1'), "E1 now received A1 from A")
    
    t.ok(E1.meta.hasAttribute('A1_from_A'), 'E1 received A1_from_A #1')
    t.ok(E1.meta.getAttribute('A1_from_A').value == 'A1', 'E1 received A1_from_A #2')
    
    t.ok(E1.meta.hasAttribute('A1_from_B'), 'E1 received A1_from_B #1')
    t.ok(E1.meta.getAttribute('A1_from_B').value == 'B-A1', 'E1 received A1_from_B #2')
    
    
    //==================================================================================================================================================================================
    t.diag("Mutability")
    
    A.meta.extend({
        methods : {
            A3 : function () { return 'A3' }
        }        
    })
    
    t.ok(B.meta.hasMethod('A3') && B.meta.getMethod('A3') == A.meta.getMethod('A3'), 'B received A3 property via mutation');    
    t.ok(C.meta.hasMethod('A3') && C.meta.getMethod('A3') == A.meta.getMethod('A3'), 'C received A3 property via mutation')
    t.ok(D.meta.hasMethod('A3') && D.meta.getMethod('A3') == A.meta.getMethod('A3'), 'D received A3 property via mutation')
    t.ok(E.meta.hasMethod('A3') && E.meta.getMethod('A3') == A.meta.getMethod('A3'), 'E received A3 property via mutation')
    t.ok(F.meta.hasMethod('A3') && F.meta.getMethod('A3') == A.meta.getMethod('A3'), 'F received A3 property via mutation')
    t.ok(E1.meta.hasMethod('A3') && E1.meta.getMethod('A3') == A.meta.getMethod('A3'), 'E1 received A3 property via mutation')
    
    
    A.meta.extend({
        removeMethods : [ 'A3' ]
    });    
    
    t.ok(!B.meta.hasMethod('A3'), 'B lost A3 property via mutation');    
    t.ok(!C.meta.hasMethod('A3'), 'C lost A3 property via mutation')
    t.ok(!D.meta.hasMethod('A3'), 'D lost A3 property via mutation')
    t.ok(!E.meta.hasMethod('A3'), 'E lost A3 property via mutation')
    t.ok(!F.meta.hasMethod('A3'), 'F lost A3 property via mutation')
    t.ok(!E1.meta.hasMethod('A3'), 'E1 lost A3 property via mutation')
    
    
    F.meta.extend({
        have : {
            C1 : 'F-C1',
            D1 : 'F-D1'
        },
        
        havenot : [ 'A1' ]
    })

    t.ok(F.meta.hasAttribute('C1') && F.meta.getAttribute('C1').value == 'F-C1', 'F have override C1 property during mutation')
    t.ok(F.meta.hasAttribute('D1') && F.meta.getAttribute('D1').value == 'F-D1', 'F have override D1 property during mutation')
    t.ok(F.meta.getAttribute('A1') instanceof Joose.Managed.Property.ConflictMarker, 'A1 of F is now a conflict marker')
    
    B.meta.extend({
        havenot : [ 'A1' ]
    })
    
    t.ok(!(F.meta.getAttribute('A1') instanceof Joose.Managed.Property.ConflictMarker), 'A1 of F is now not a conflict marker')
    t.ok(F.meta.getAttribute('A1') == A.meta.getAttribute('A1'), 'A1 of F is now obtained from A')
    
})