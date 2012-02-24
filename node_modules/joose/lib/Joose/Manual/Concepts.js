/**

NAME
====

Joose.Manual.Concepts - Joose OO concepts. 

Joose CONCEPTS (VS "RAW" JavaScript)
-----------------------

In the past, you may not have thought too much about the difference between packages and classes, attributes and methods, constructors and methods, etc. 
With Joose, these are all conceptually separate things, even though under the hood they're implemented with plain old JavaScript.

Our meta-object protocol (aka MOP) provides well-defined introspection features for each of those concepts, and Joose in turn provides distinct sugar for each of them. 
Joose also introduces additional concepts such as roles, method modifiers, and declarative delegation.

Knowing what these concepts mean in Joose-speak, and how they used to be done in "raw" JavaScript OO is a good way to start learning to use Joose.

Class
-----

At its simplest, a class will consist simply of attributes and/or methods. It can also include roles, method modifiers, and more.

A class has zero or more attributes.

A class has zero or more methods.

A class has zero or **one** superclasses (aka parent class). A class inherits from its superclass.

A class has zero or more method modifiers. These modifiers can apply to its own methods or methods that are inherited from its ancestors.

A class does (*consumes*) zero or more roles.

A class has a constructor. Its provided for you "for free" by Joose.

The constructor accepts named parameters corresponding to the class's attributes and uses them to initialize an object instance.

A class has a metaclass, which in turn has meta-attributes, meta-methods, and meta-roles. This metaclass describes the class.

A class is usually analogous to a category of nouns, like "People" or "Users".

        Class('Person', {})
        # now it's a Joose class!


Attribute
---------

An attribute is a property of the class that defines it. It always has a name, and it may have a number of other properties.

These properties can include a read/write flag, accessor method names, a default value, and more.

Attributes are not methods, but defining them causes various accessor methods to be created. Usually, an attribute will always have at least a reader accessor method. Many attributes also have other methods, such as a writer method.

An attribute is something that the class's members have. For example, People have first and last names. Users have passwords and last login datetimes.

        has : {
            firstName : { is : 'rw' }
        }


Method
======

A method is very straightforward. Any function you define in your class is a method.

Methods correspond to verbs, and are what your objects can do. For example, a User can login.

        methods : {
        
            login : function () {
                ...
            }
        }

Roles
=====

A role is something that a class does. We also say that classes *consume* roles (or that a role is *composed* to the class). 
For example, a 'Eagle' class might do the 'Winged' role, and so could a 'Gryphon' class. A role is used to define some concept that cuts across multiple unrelated classes, like "winged", or "has a color".

A role has zero or more attributes.

A role has zero or more methods.

A role has zero or more method modifiers.

A role has zero or more required methods.

A required method is not implemented by the role. Required methods say "to use this Role you must implement this method".

Roles are *composed* into classes (or other roles). When a role is composed into a class (or other roles), its attributes and methods are *flattened* into that class.
Roles do not show up in the inheritance hierarchy.
When a role is composed, its attributes and methods appear as *if they were defined in the consuming class*.

Role are somewhat like mixins or interfaces in other OO languages.

        Role('Horny', {
            has : {
                hornLength : { is : 'rw' }
            },
            
            methods : {
                butt : function () {
                    ...
                }
            }
        })

Method modifiers
----------------

A method modifier is a hook that is called when a named method is called. For example, you could say "before calling login(), call this modifier first". Modifiers come in different flavors like "before", "after", "around", and "augment", and you can apply more than one modifier to a single method.

Method modifiers are often used as an alternative to overriding a method in a parent class. They are also used in roles as a way of modifying methods in the consuming class.

Under the hood, a method modifier is just a plain JavaScript function that gets called before or after (or around, etc.) some named method.

        before : {
            login : function (pwd) {
                alert("Called login() with password : " + pwd)
            }
        }


Constructor
-----------

A constructor creates an object instance for the class. In raw JavaScript, this is a function, which usually accepts several arguments and initialize the class instance with its values.

With Joose, this constructor method is created for you, and it simply does the right thing. It accepts an object as 1st argument, which properties will be used as values of class's attributes. More over, you generally should never define your own constructor! 

When you want to do something whenever an object is created, you should provide a 'initialize' method in your class. Joose will call this method for you after creating a new object, with the same arguments as were passed to constructor.


Object instance
---------------

An object instance is a specific noun in the class's "category". For example, one specific Person or User. An instance is created by the class's constructor.

An instance has values for its attributes. For example, a specific person has a first and last name.

Joose vs raw JavaScript summary
---------------------------

* Class

 A function with no introspection other than mucking about in the prototype.

 With Joose, you get well-defined declaration and introspection.

* Attributes

  Hand-written accessor methods or just plain values in prototype.

  With Joose, these are declaratively defined, and distinct from methods.

* Method

  These are pretty much the same in Joose as in raw JavaScript.

* Roles

  May be provided by some frameworks.

  With Joose, they're part of the core feature set, and are introspectable like everything else.

* Method Modifiers

  Could only be done through serious prototype wizardry, and you probably never saw this before (at least in really "raw" JavaScript).

* Constructor

  A function, which process all the passed attributes to initialize the class.

  Comes for free when you define a class with Joose.


META WHAT? 
==========

A metaclass is a class that describes classes. With Joose, every class you define gets a 'meta' property. It returns an instance of Joose.Meta.Class object (usually), which has an introspection API that can tell you about the class it represents.

Almost every concept we defined earlier has a meta class, so we have Joose.Meta.Class, Joose.Meta.Role and so on.


BUT I NEED TO DO IT MY WAY!
===========================

One of the great things about Joose is that if you dig down and find that it does something the "wrong way", you can change it by extending a metaclass. 
For example, you can make your constructors strict (no unknown parameters allowed!), you can re-define a naming scheme for attribute accessors, you can make a class a Singleton, and much, much more.

Many of these extensions require surprisingly small amounts of code, and once you've done it once, you'll never have to hand-code "your way of doing things" again. Instead you'll just load your favorite extension.


WHAT NEXT?
==========

So you're sold on Joose. Time to learn how to really use it - jump straight to [Joose.Manual.Classes][classes] and the rest of the [Joose.Manual][manual].

After that we recommend that you start with the [Joose.Cookbook][cookbook]. If you work your way through all the recipes under the basics section, you should have a pretty good sense of how Joose works, and all of its basic OO features.

After that, check out the Role recipes. If you're really curious, go on and read the Meta and Extending recipes, but those are mostly there for people who want to be Joose wizards and change how Joose works.


AUTHOR
======

Nickolay Platonov [nickolay8@gmail.com](mailto:nickolay8@gmail.com)

Heavily based on the original content of Moose::Manual, by Dave Rolsky [autarch@urth.org](mailto:autarch@urth.org)


COPYRIGHT AND LICENSE
=====================

Copyright (c) 2008-2011, Malte Ubl, Nickolay Platonov

All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
* Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
* Neither the name of Malte Ubl nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission. 

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. 

[classes]: Classes.html
[manual]: ../Manual.html
[cookbook]: ../Cookbook.html

*/
