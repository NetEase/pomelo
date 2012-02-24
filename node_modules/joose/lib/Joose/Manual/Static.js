/**

NAME
====

Joose.Manual.Static - Static methods and attributes, "out of the box"


WHAT IS A STATIC PROPERTY?
==========================

Static method (or attribute) is a method, defined on the class itself, not on its instances. Its somewhat similar to singleton concept. 
Static methods often manage some system-wide state or set of helper functions.


SYNTAX
======

To declare a static part of your class use `my` builder:

        Class('TypeRegistry', {
        
            my : {
                has : {
                    types : Joose.I.Object
                },
                
                does : [ JooseX.Storable ],
                
                methods : {
                    registerType : function (type, value) {
                        ....
                    }
                }
            }
        })

You may use any usual builders inside of `my`, including method modifires, `isa`, `does`, etc. Static properties are also [mutable][] 


USAGE
=====

To access static properties "outside" of class context, use `my` property of its constructor, like
        
        TypeRegistry.my.types['someTypeName']
        
        TypeRegistry.my.registerType('textfield', Ext.form.TextField)
        
         
Static methods are also aliased to the constructor, so you can call them directly, w/o `my`:

        TypeRegistry.registerType('textfield', Ext.form.TextField)
        

Inside of *static* methods, *static* attributes are available via `this`. Inside of the *usual* methods, *static* properties are available via `my`: 

        Class('TypeRegistry', {
        
            my : {
                has : {
                    types : Joose.I.Object
                }
            
                methods : {
                    registerType : function (type, value) {
                        this.types[ type ] = value
                    }
                }
            },
            
            methods : {
            
                someMethod : function () {
                    this.my.registerType('someTypeName', someValue)
                    
                    this.my.types[ 'someType' ]
                }
            }
        })
        
        //or
        
        var registry = new TypeRegistry()
        
        registry.my.registerType('someTypeName', someValue)


ACESSING HOSTING CLASS
======================

If you need to access the constructor of the hosting class from static methods, add a special static attribute `HOST`.
During instantiation, it will be provided with the correct value: 


        Class('FileType', {
        
            has : {
                ...
            },
            
            
            methods : {
                ...
            },
        
        
            my : {
                has : {
                    types   : { init : {} },
                
                    HOST    : null,
                },
                
            
                methods : {
                    register : function (name, param1, param2) {
                    
                        // this.HOST == FileType
                        
                        this.types[ name ] = new this.HOST({
                            param1 : param1,
                            param2 : param2
                        })
                    }
                }
            }
        })

Static method `register` shown in the example will also correctly work in the subclasses of `FileType`.


INHERITANCE OF STATIC PROPERTIES
================================

Static properties are inheritable like any other. There are though some additional details you should take into account.
Under the hood, static properties implemented as a singleton class, and you can specify from what class it should inherit directly:

Direct inheritance
------------------

You may use `isa` builder to directly specify from what class your static part should inherit:

        Class('TypeRegistry', {
        
            my : {
                isa : Registry,
                
                ....
            }
        })

Direct inheritance has a highest priority.


Indirect inheritance
--------------------

Otherwise if the class have static properties they'll be inheried by this class subclasses:

        Class('Registry', {
        
            my : {
                ....
            }
        })

        Class('TypeRegistry', {
            isa : Registry
        })

`TypeRegistry` will inherit all the attributes of `Registry`, including static, which will be accessible as `TypeRegistry.my`. `TypeRegistry.my` will be a subclass of the `Registry.my` class. 


You may specify any additional builders, which will customize the static methods of subclass: 

        Class('TypeRegistry', {
            isa : Registry,
            
            my : {
                override : {
                    registerType : function (type, value) {
                        ....
                    }
                }
            }
        })

        
        
ROLES WITH STATIC PROPERTIES
============================
        
In addition to all this static wizardry you can create a role with static methods just fine:

        Role('TypeRegistry.Storable', {
        
            my : {
                has : {
                    storageId : { is : 'rw' }
                },
                
                override : {
                    registerType : function (type, value) {
                        ....
                    }
                }
            }
        })
        
Such roles should be applied in "indirect form", to the usual class, which should contain the static part, being modified.

        Class('TypeRegistry', {
            
            does : TypeRegistry.Storable
        })
        


AUTHOR
======

Nickolay Platonov [nickolay8@gmail.com](mailto:nickolay8@gmail.com)


COPYRIGHT AND LICENSE
=====================

Copyright (c) 2008-2011, Malte Ubl, Nickolay Platonov

All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
* Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
* Neither the name of Malte Ubl nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission. 

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. 

[mutable]: Mutability.html

*/
