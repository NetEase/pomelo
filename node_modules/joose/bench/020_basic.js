StartBenchmark(
    {
        title       : 'ExtJS class creation time',
        id          : 'ext-class-creation-simple',
        
        run         : function () {
            return Ext.define('Class' + Math.round(Math.random() * 1e10), {
                
                foo     : null,
                bar     : null,
                foo1    : null,
                bar1    : null,
                foo2    : null,
                bar2    : null,
                foo3    : null,
                bar3    : null,
                foo4    : null,
                bar4    : null,
                
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
            })
        }
    
    } 
)    
