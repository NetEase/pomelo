Name
====

Joose - A postmodern class system for JavaScript


SYNOPSIS
========

In browsers (see [Manual.Installation](Joose/Manual/Installation.html)):
        
        <script type="text/javascript" src="/jsan/Task/Joose/Core.js"></script>

Then:

        Class("Point", {
        
            has: {
                x: {is: "ro"},
                y: {is: "rw"},
            },
            
            methods: {
                clear: function () {
                    var x = this.getX()
                    this.setY(0)
                }
            }
        })
        
        Class("Point.ThreeD", {
        
            isa: Point,
            
            has: {
                z: {}
            },
            
            after: {
                clear: function () {
                    this.z = 0
                }
            }
        })
        
        var point = new Point.ThreeD({
            x : 1,
            y : 2,
            z : 3
        })

In NodeJS:

        var Class = require('joose').Class
        
        var Point = exports.Point = Class({
            has: {
                x: {is: "ro"},
                y: {is: "rw"},
            },
            
            methods: {
                clear: function () {
                    var x = this.getX()
                    this.setY(0)
                }
            }
        })


        exports.Point3D = Class({
        
            isa: Point,
            
            has: {
                z: {}
            },
            
            after: {
                clear: function () {
                    this.z = 0
                }
            }
        })



DESCRIPTION
===========

Joose is a self-hosting meta object system for JavaScript with support for classes, inheritance, roles (aka traits), method modifiers and much more.

The main goal of Joose is to make JavaScript Object Oriented Programming easier, more consistent and less tedious. With Joose you can to think more about what you want to do and less about the mechanics of OOP.

The Joose framework has been successfully used in multiple production systems for twelve months now and has been proven to be very stable. 
Joose is being tested using an automated unit-test suite that is being run in all major browsers (Firefox, IE, Safari, Opera and Chrome) and on NodeJS server-side platform.

Joose core package is only 8kb (YUI+gz).


New to Joose?
-------------

If you're new to Joose, the best place to start is the [Joose.Manual][1] docs, followed by the [Joose.Cookbook][2]. The intro will show you what Joose is, and how it makes JavaScript OO better.

The cookbook recipes on Joose basics will get you up to speed with many of Joose's features quickly. Once you have an idea of what Joose can do, you can use the API documentation to get more detail on features which interest you.


 
BUILDING CLASSES WITH JOOSE
===========================

Joose makes every attempt to provide as much convenience as possible during class construction/definition, but still stay out of your way if you want it to. Here are a few items to note when building classes with Joose.

- Unless specified with 'isa', any class which uses Joose will inherit from Joose.Meta.Object.


PROVIDED INSTANCE METHODS
=========================

Joose provides a number of methods to all your classes, mostly through the inheritance from Joose.Meta.Object.

  - `this.SUPER(arg1, arg2, ...)`

Only valid in the scope of usual methods and OVERRIDE method modifiers. Calls a superclass's method with the arguments provided.

  - `this.SUPERARG(Array arg)`

Only valid in the scope of usual methods and OVERRIDE method modifiers. Calls a superclass's method with the "packed" arguments, provided as array. Usually used as: `this.SUPERARG(arguments)`
This method is just a shortcut for `this.SUPER.apply(this, arguments)`

  - `this.BUILD([Object arg])`

Default `BUILD` method checks whether the 1st argument passed to it is an Object. If so, it passes it to `initialize` method. This method also optionally *detaches* current instance. 
See [Joose.Manual.Traits][traits] for details.

  - `this.initialize(Object properties)`

Default `initialize` method uses `properties` to initialize the attributes of current instance.

  - `this.toString()`

Defalt string coercion is string "a ClassName", where ClassName is a name of instance's class.
 

PROVIDED INSTANCE PROPERTIES
============================

Joose provides a number of properties to all instances of your classes.

  - `this.constructor`

A class with which `this` instance was constructed.

  - `this.meta`

An instance of metaclass for `this` instance's class. 


PROVIDED CLASS PROPERTIES
============================

Joose also provides a number of properties to classes.

  - `class.meta`

An instance of metaclass for this class. The same as `this.meta` for instances of `class`

  - `class.my`

A static instance. See [Joose.Manual.Static][6] for more details.

  - `class.superClass`

A superclass (constructor function) of given `class`
    
    
PROVIDED HELPERS
================

Declaration helpers
-------------------

Declaration helpers allows you to declare a class, role or module.

  - `Class(String name, Object builders)`
  
Declares a class, using provided builders. `name` will be transformed into class's constructor. See the details [here][construction]

  - `Class(Object buildersObj)`
  
Declares an anonymous class.
  
  - `Role(String name, Object builders)`

  - `Role(Object buildersObj)`
  
The same helpers for Roles. See [Roles][roles].

  - `Module(String name, Object builders)`

  - `Module(String name, Function body)`

The same helpers for Modules. See the details [here][construction]


Joose also provides a number of small helpers functions, which you might found useful. 

Helpers for Arrays
------------------

  - `Joose.A.each(array, func, scope)`

Calls a `func` in the optional `scope` for each element of `array` as: `func(element, index)`, where `index` is the index of element in the `array`. Returning a `false` from `func` stops the iteration.
If the iteration were stopped with returned `false` value, this helper also return `false`. Otherwise it returns undefined value.

  - `Joose.A.map(array, func, scope)`

Calls a `func` in the optional `scope` for each element of `array` as: `func(element, index)`, where `index` is the index of element in the `array`. 
Returning values from all calls to `func` are collected in the resulting array, which is returned. 

  - `Joose.A.exists(array, value)`

Returns boolean value, indicating whether this `value` is exists in the `array`.
    
  - `Joose.A.grep(array, func)`

Calls the `func` for each element of `array` and returns an array, consisted from only those elements, for which it returns 'true' value

  - `Joose.A.remove(array, removeEle)`

Returns a "shallow copy" of `array`, without the all the occurrences of `removeEle` (if any). Comparison is performing with '===' operator. Do not modifies original `array`.
    

Helpers for Strings
------------------

  - `Joose.S.saneSplit(str, delimeter)`

Implements a perl-like 'split', which returns empty array for splitted empty string (not an array with an empty string). Behave as standard `String.prototype.split` in other aspects.

  - `Joose.S.uppercaseFirst(string)`

Returns a copy of `string`, with uppercased first letter.
    

Helpers for Objects
------------------

  - `Joose.O.each(object, func, scope)`

Calls a `func` in the optional `scope` for *all* properties of the `object` (*including* inherited via prototype chain). 
`func` is called as: `func(value, name), where `value` is the value of the `name` property of `object`. Returning a `false` from `func` stops the iteration.
If the iteration were stopped with returned `false` value, this helper also return `false`. Otherwise it returns undefined value.

  - `Joose.O.eachOwn(object, func, scope)`

Calls a `func` in the optional `scope` for only "own" properties of the `object`. `func` is called as: `func(value, name), where `value` is the value of the `name` property of `object`.
Returning a `false` from `func` stops the iteration. If the iteration were stopped with returned `false` value, this helper also return `false`. Otherwise it returns undefined value.
    
  - `Joose.O.copy(source, target?)`

Copies *all* the properties of `source` object to the `target` (which is created as empty object if not supplied). (*including* inherited via prototype chain). Returns `target`. 

  - `Joose.O.copyOwn(source, target?)`

Copies only the "own" properties of `source` object to the `target` (which is created as empty object if not supplied).. Returns `target`. 
    
  - `Joose.O.getMutableCopy(object)`

Returns a "mutable copy" of `object`. "Mutable copy" is an empty object, which however inherit all the properties of original via prototype chain.

  - `Joose.O.extend(target, source)`

Copies all the properties of `source` object to the `target` (*including* inherited via prototype chain). 
    
  - `Joose.O.isEmpty(object)`

Returns boolean value, indicating whether the `object` have no *own* properties.
    
  - `Joose.O.isInstance(obj)`

Returns boolean value, indicating whether the passed `obj` is an instance of some Joose class.
    
  - `Joose.O.wantArray(obj)`

Returns `obj` itself if `obj` is an array, or `[ obj ]` otherwise.


Helpers for Attributes declaration
----------------------------------

To simplify declaration of attributes Joose provides a number of default attributes initializers (see [Joose.Manual.Attributes][4] for details)

 - `Joose.I.Array`

Returns empty Array when called

 - `Joose.I.Object`

Returns empty Object when called

- `Joose.I.Function`

Returns empty Function when called (which in turn will return Joose.I.Function)

- `Joose.I.Now`

Returns new instance of `Date` (at the time of class instantiation)


CONFIGURATION
=============

You can provide some configuration options to Joose. To specify them before Joose has been loaded, create a global `JOOSE_CFG` object. At the time of Joose loading, it will alias it as `Joose.C` symbol.

`Joose.C` is the place, where various extension will check for configuration options.



METACLASS
=========

When you use Joose, you can specify which metaclass to use:

        Class("Point", {
        
            meta : NewMetaClass,
            ....
        })


You can also specify traits which will be applied to your metaclass:

        Class("Point", {
        
            trait : TraitWithCustomBuilder,
        
            coords : [ 1, 2, 3 ]
            
            ....
        })

When you do this, your class's meta object will have the specified traits applied to it. See [Joose.Manual.Roles][5] and [Joose.Manual.Traits][traits] for further details.
    

The JooseX. namespace
=====================

Generally if you're writing an extension for Joose itself you'll want to put your extension in the JooseX. namespace. This namespace is specifically for extensions that make Joose better or different in some fundamental way. 
It is traditionally not for a package that just happens to use Joose. 

These extensions can be found in the [npm registry][3]. See [Joose.Manual.JooseX][7] for more details.


<div style="display:none">

CAVEATS
=======

Refering to meta instance from the constructor

Method modifiers order in Rhino

</div>


GETTING HELP
============

We offer a mailing list and an active IRC channel.

The mailing list is <a href="mailto:joose-js@googlegroups.com">joose-js@googlegroups.com</a>. To subscribe, visit: <http://groups.google.com/group/joose-js>

You can also visit us at [#joose](http://webchat.freenode.net/?randomnick=1&channels=joose&prompt=1) on freenode. Questions at all levels (on Joose-related topics ;) are welcome.


ACKNOWLEDGEMENTS
================

Many thanks to the whole Moose community for being icebreaker in the meta world. 

Special thanks to Dave Rolsky for the excellent Moose documentation written, on which this document is based.


SEE ALSO
========

<http://joose.it> - This is the official web home of Joose.

<http://github.com/Joose/Joose> - Our version control repository

<http://www.iinteractive.com/moose> - Home page of Moose - post-modern class system for perl

BUGS
====

All complex software has bugs lurking in it, and this module is no exception.

Please report any bugs through the web interface at <https://github.com/Joose/Joose/issues>


FEATURE REQUESTS
================

We are very strict about what features we add to the Joose core, especially the user-visible features. Instead we have made sure that the underlying meta-system of Joose is as extensible as possible so that you can add your own features easily.

That said, occasionally there is a feature needed in the meta-system to support your planned extension, in which case you should 
either email the mailing list ([joose-js@googlegroups.com](mailto:joose-js@googlegroups.com)) or join us on IRC at <irc://irc.freenode.org/#joose> to discuss. 
The [Joose.Manual.Contributing][8] has more detail about how and when you can contribute.


AUTHORS
=======

Malte Ubl 

Jeremy Wall

Nickolay Platonov



COPYRIGHT AND LICENSE
=====================

Copyright (c) 2008-2011, Malte Ubl, Nickolay Platonov

All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
* Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
* Neither the name of Malte Ubl nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission. 

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. 


Documentation is based on original Moose::Manual documentation, copyright 2006-2009 by Infinity Interactive, Inc.


[1]: Joose/Manual.html
[2]: Joose/Cookbook.html
[3]: http://npmjs.org
[4]: Joose/Manual/Attributes.html
[5]: Joose/Manual/Roles.html
[6]: Joose/Manual/Static.html
[7]: Joose/Manual/JooseX.html
[8]: Joose/Manual/Contributing.html

[construction]: Joose/Manual/Construction.html
[traits]: Joose/Manual/Traits.html
[roles]: Joose/Manual/Roles.html
