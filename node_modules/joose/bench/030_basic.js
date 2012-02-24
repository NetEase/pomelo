var original = function (a) {
    return a + 'a'
}

var inside = function() {
    return arguments.callee.caller
}
  
  
var wrapper = function() {
    return inside.call(this)
}
  

var modifier = function() {}
  
var override = function() {
  
    var beforeSUPER = this.SUPER
  
    this.SUPER = original
  
    var res = modifier.apply(this, arguments)
  
    this.SUPER = beforeSUPER
  
    return res
}


StartBenchmark(
    {
        id          : 'Wrap1',
        
        run         : function (bench, prepared) {
            override.call({})
        }
    },
    
    
    {
        id          : 'Wrap2',
        
        run         : function (bench, prepared) {
            prepared.call({})
        }
    } 
)    

