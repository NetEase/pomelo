/**

NAME
====

Joose.Manual.Installation - The installation procedure for Joose.


DESCRIPTION
===========

You can install Joose from the following sources:

 
1. INSTALLING FROM TARBALL
==========================

The latest released tarball is available for downloading from <http://search.npmjs.org/#/joose>. Alternative locations: <http://nodul.es/modules/joose> and <http://npm.mape.me/> (search for package 'joose').


Source files to include
-----------------------

To use Joose include the following source file in your page/project (from the root of the tarball)

    task-joose-core.js
    
or from another location:

    lib/Task/Joose/Core.js

It contains all the individual source files concatenated into one.


2. INSTALLING FROM `npm`
=======================

First, install `npm` (please refer to : <http://github.com/isaacs/npm/>). Then, from command line:

        > npm install joose

You may need to `sudo` the command above.

After this you can use Joose as follows:

        require('joose')
        
        Class('My.Class', {
        
            methods : {
                ...
            }
        })
        
        // or 
        
        var Class = require('joose').Class
        
        
        var MyClass = Class({
        
            methods : {
                ...
            }
        })

Please note, that Joose aims to be client/server neutral, and behaves a bit differently than usual CommonJS module.  

`require('joose')` will *modify the global scope* - will add the `Joose`, `Class`, `Role` and `Module` symbols to it.
`Class`, `Role` and `Module` are also being exported from `require`. 


3. Configuring your system for cross-platform code.
===================================================

If you are planning to use Joose and Joose extensions in the browsers, you way want to also complete the following steps:

3.1 Add the `$NPM_ROOT/.jsan` to your NODE_PATH enviroment variable
------------------------

Here the `$NPM_ROOT` is the "root" setting of your `npm` installation. You can retrieve it with the following command:

    npm config get root 2>/dev/null

Typically its `/usr/local/lib/node`. So, to do that, add this line to your `~/.bashrc`:

    export NODE_PATH=/usr/local/lib/node/.jsan


3.2 Create an alias for your local webserver
------------------------

Configure you local web server that way, that the url `http://localhost/jsan` will point to the `/usr/local/lib/node/.jsan` (the directory from previous step).

After theis setup, you can either require the browser-related code from NodeJS (it uses CamelCase for modules names as a convention):

    require('Useful/Module')
    
    // or, with JooseX.Namespace.Depended

    use('Useful.Module', function () { ... })

Or you can load it in the browsers in the exactly the same way:

    // JooseX.Namespace.Depended only

    use('Useful.Module', function () { ... })


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

*/
