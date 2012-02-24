/**

NAME
====

Joose.Cookbook.Basics.Recipe1 - The (always classic) **Point** example.


SYNOPSIS
========

        Class('Point', {
            has : {
                x : { is : 'rw', required : true },
                y : { is : 'rw', required : true }
            },
            
            
            methods : {
                clear : function () {
                    this.setX(0)
                    this.setY(0)
                }
            }
          
        })
        
        Class('Point3D', {
            isa : Point,
        
            has : {
                z : { is : 'rw', required : true }
            },
            
            
            after : {
                clear : function () {
                    this.setZ(0)
                }
            }
          
        })
        
        var point1 = new Point({ x : 5, y : 7})
        var point3d = new Point3D({ x : 5, y : 7, z : -5})


DESCRIPTION
===========

When Joose is loaded, it exports a set of sugar functions into global namespace. 
This means that we import some functions which serve as Joose "keywords". 
These aren't real language keywords, they're just JavaScript functions exported into our package.

Joose automatically makes our class a subclass of "Joose.Meta.Object".
This class provides us with a constructor that respects our attributes, as well other features. 

Now, onto the keywords. The first one we see here is `Class`, which starts the declaration of the class.

`Class` accepts 1 or 2 arguments - optional class name and a object, describing a class. Each property of that
object is called *builder*. 

`Class` converts given class name into constructor. If no class name were provided the anonymous class will be created. 

`Class` returns a constructor of declared class.

Builders
--------

The first builder we see is `has`, which defines the attributes in our class:

            has : {
                x : { is : 'rw', required : true },
                y : { is : 'rw', required : true }
            }

This will create attributes named `x` and `y`. The accessors, generated for this attributes will be read-write.

The `required : true` parameter means that this attribute must be provided when a new object is created. 
A point object without coordinates doesn't make much sense, so we don't allow it.

We have defined our attributes; next we define our methods. In Joose, as with regular JavaScript, a method is just a function.
It should be defined in the `methods` builder:

            methods : {
                clear : function () {
                    this.setX(0)
                    this.setY(0)
                }
            }

That concludes the `Point` class.

Next we have a subclass of `Point`, `Point3D`. To declare our superclass, we use the `isa` builder:

            isa : Point

Note, that Joose allows you to have only one superclass. As a cleaner alternative for multiple inheritance Joose provides [Roles][roles] mechanism.


Next we create a new attribute for `Point3D` called `z`.

            has : {
                z : { is : 'rw', required : true }
            },

This attribute is just like `Point`'s `x` and `y` attributes.

The `after` builder demonstrates a Joose feature called "method modifiers" (or "advice" for the AOP inclined):

            after : {
                clear : function () {
                    this.setZ(0)
                }
            }

When `clear` is called on a `Point3D` object, our modifier method gets called as well. Unsurprisingly, the modifier is called *after* the real method.

In this case, the real `clear` method is inherited from `Point`. Our modifier method receives the same arguments as those passed to the modified method.

Of course, using the `after` modifier is not the only way to accomplish this. You can get the same results with this code:

            methods : {
                clear : function () {
                    this.SUPER()
                    this.setZ(0)
                }
            }

You could also use another Joose method modifier, `override`:

            override : {
                clear : function () {
                    this.SUPER()
                    this.setZ(0)
                }
            }

The `override` modifier allows you to use the `this.SUPER` call to dispatch to the superclass's method in a very Ruby-ish style.

The choice of whether to use a method modifier, and which one to use, is often a question of style as much as functionality.

Since `Point` inherits from [Joose.Meta.Object][protoobject], it will also inherit the default `Joose.Meta.Object` constructor:

        var point1 = new Point({ x : 5, y : 7})
        var point3d = new Point3D({ x : 5, y : 7, z : -5})

This constructor accepts a named argument pair for each attribute defined by the class. 
In this particular example, the attributes are required, and calling constructor without them will throw an error.

        var point1 = new Point({ x : 5 }) //no y, kaboom!

From here on, we can use `point` and `point3d` just as you would any other JavaScript object. 


CONCLUSION
==========

This recipe demonstrates some basic Joose concepts, attributes, subclassing, and a simple method modifier.

SEE ALSO
========

- Method Modifiers

The concept of method modifiers is directly ripped off from CLOS. 
A great explanation of them can be found by following this [link](http://www.gigamonkeys.com/book/object-reorientation-generic-functions.html)


AUTHOR
======

Nickolay Platonov [nickolay8@gmail.com](mailto:nickolay8@gmail.com)

Based on original Moose::Cookbook content, written by:

Stevan Little [stevan@iinteractive.com](mailto:stevan@iinteractive.com)

Dave Rolsky[autarch@urth.org](mailto:autarch@urth.org)

COPYRIGHT AND LICENSE
=====================

Copyright (c) 2008-2011, Malte Ubl, Nickolay Platonov

All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
* Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
* Neither the name of Malte Ubl nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission. 

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. 

[roles]: ../../Manual/Roles.html
*/
