StartBenchmark(
    {
        title       : 'Small class creation time',
        id          : 'class-creation-simple1',
        
        run         : function () {
            return Class({
                
                has : {
                    foo     : Joose.I.Array,
                    bar     : Joose.I.Object
                    
                },
                
                methods : {
                    doThis : function () {},
                    doThat : function () {}
                }
            })
        }
    }, 
    {
        title       : 'Average class creation time',
        id          : 'class-creation-simple2',
        
        run         : function () {
            return Class({
                
                has : {
                    foo     : Joose.I.Array,
                    bar     : Joose.I.Object,
                    foo1    : Joose.I.Array,
                    bar1    : Joose.I.Object,
                    foo2    : Joose.I.Array,
                    bar2    : Joose.I.Object,
                    foo3    : Joose.I.Array,
                    bar3    : Joose.I.Object,
                    foo4    : Joose.I.Array,
                    bar4    : Joose.I.Object
                    
                },
                
                methods : {
                    doThis : function () {},
                    doThat : function () {},
                    doThis1 : function () {},
                    doThat1 : function () {},
                    doThis2 : function () {},
                    doThat2 : function () {},
                    doThis3 : function () {},
                    doThat3 : function () {},
                    doThis4 : function () {},
                    doThat4 : function () {}
                }
            })
        }
    }, 
    {
        title       : 'Big class creation time',
        id          : 'class-creation-simple3',
        
        run         : function () {
            return Class({
                
                has : {
                    foo     : Joose.I.Array,
                    bar     : Joose.I.Object,
                    foo1    : Joose.I.Array,
                    bar1    : Joose.I.Object,
                    foo2    : Joose.I.Array,
                    bar2    : Joose.I.Object,
                    foo3    : Joose.I.Array,
                    bar3    : Joose.I.Object,
                    foo4    : Joose.I.Array,
                    bar4    : Joose.I.Object,
                    foo5    : Joose.I.Array,
                    bar6    : Joose.I.Object,
                    foo10   : Joose.I.Array,
                    bar10   : Joose.I.Object,
                    foo20   : Joose.I.Array,
                    bar20   : Joose.I.Object,
                    foo30   : Joose.I.Array,
                    bar30   : Joose.I.Object,
                    foo40   : Joose.I.Array,
                    bar40   : Joose.I.Object
                },
                
                methods : {
                    doThis : function () {},
                    doThat : function () {},
                    doThis1 : function () {},
                    doThat1 : function () {},
                    doThis2 : function () {},
                    doThat2 : function () {},
                    doThis3 : function () {},
                    doThat3 : function () {},
                    doThis4 : function () {},
                    doThat4 : function () {},
                    doThis5 : function () {},
                    doThat5 : function () {},
                    doThis10 : function () {},
                    doThat10 : function () {},
                    doThis20 : function () {},
                    doThat20 : function () {},
                    doThis30 : function () {},
                    doThat30 : function () {},
                    doThis40 : function () {},
                    doThat40 : function () {}
                }
            })
        }
    }

)    
