StartTest(function (t) {
    
    //==================================================================================================================================================================================
    t.diag("Custom attribute class")
    
    
    Class('My.Attribute.Set', {
        
        isa     : Joose.Managed.Attribute,
        
        have     : {
            canInlineSetRaw : false
        },
        
        before  : {
            
            setRawValueTo : function () {
            }
        }
    })
    

    Class('My.Attribute.Get', {
        
        isa     : Joose.Managed.Attribute,
        
        have     : {
            canInlineGetRaw : false
        },
        
        before  : {
            
            getRawValueFrom : function () {
            }
        }
    })
    
    
    Class('My.Attribute.Both', {
        
        isa     : Joose.Managed.Attribute,
        
        have     : {
            canInlineSetRaw : false,
            canInlineGetRaw : false
        },
        
        
        before  : {
            
            setRawValueTo : function () {
            },
            
            getRawValueFrom : function () {
            }
        }
    })
    
    
    Class('Test', {
        
        has : {
            attr         : { is : 'rw', init : 'value' },
            
            myAttr       : {
                meta    : My.Attribute.Set,
                is      : 'rw', 
                init    : 'value'
            },
            
            myAttr1       : {
                meta    : My.Attribute.Get,
                is      : 'rw', 
                init    : 'value'
            },
            
            myAttr2       : {
                meta    : My.Attribute.Both,
                is      : 'rw', 
                init    : 'value'
            }
        }
    })
    
    var test = new Test()
    
    t.unlike(test.setAttr.__CONTAIN__.toString(), /setRawValueTo/, 'Call to `setRawValueTo` has been inlined')
    t.unlike(test.getAttr.__CONTAIN__.toString(), /getRawValueFrom/, 'Call to `setRawValueTo` has been inlined')
    
    t.like(test.setMyAttr.__CONTAIN__.toString(), /setRawValueTo/, 'Call to `setRawValueTo` has not been inlined')
    t.unlike(test.getMyAttr.__CONTAIN__.toString(), /getRawValueFrom/, 'Call to `setRawValueTo` has been inlined')

    t.unlike(test.setMyAttr1.__CONTAIN__.toString(), /setRawValueTo/, 'Call to `setRawValueTo` has been inlined')
    t.like(test.getMyAttr1.__CONTAIN__.toString(), /getRawValueFrom/, 'Call to `setRawValueTo` has not been inlined')
    
    t.like(test.setMyAttr2.__CONTAIN__.toString(), /setRawValueTo/, 'Call to `setRawValueTo` has not been inlined')
    t.like(test.getMyAttr2.__CONTAIN__.toString(), /getRawValueFrom/, 'Call to `setRawValueTo` has not been inlined')
    
    t.expectGlobals('My', 'Test')
    
    t.done()    
})    

