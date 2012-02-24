dnode-protocol
==============

This module implements the dnode protocol in a reusable form that is presently
used for both the server-side and browser-side dnode code.

If you care about how this particular module works and want to use it for
whatever reason, check out
[all the tests in test/](https://github.com/substack/dnode-protocol/tree/master/test).

the protocol
============

dnode uses newline-terminated JSON messages. Each side of the connection may
request that a method be invoked on the other side.

data fields
-----------

All messages have this format:

* method :: String or Integer
* arguments :: Array
* callbacks :: Object
* links :: Array

When the method field is a string, it refers to a named method at the remote.
When the method field is an integer, it refers to an anonymous function
declared in the callbacks field of a previous request.

The arguments field contains the data to supply the remote method or callback.
The callbacks field maps an integral callback ID to an Array of elements
representing the callback's path in the arguments structure. For instance,
an arguments array before transformation of

    [ 50, 3, { "b" : function () {}, "c" : 4 }, function () {} ]

could result in a callback field of

    { 103 : [ 2, "b" ], 104 : [ 3 ] }

if the functions were assigned IDs of 103 and 104 from left to right
respectively. Function 103 is in the object at element index 2 and at the key
"b", so its path is [ 2, "b" ]. Function 104 is just at index 3 in the argument
field so its path is just [ 3 ].

The contents of the arguments array at a callback location is not used, so it
may contain any value or may be left undefined.

The Array and Object fields can be omitted, in which case they default to [] and
{}.

methods
-------

After the connection is established, each side should send a message with the
method field set to "methods". The arguments fields should contain an array with
a single element: the object that should be wrapped. The callbacks field is
populated from the arguments array given the procedure above.

Example of this initial methods message:

    {
        "method" : "methods",
        "arguments" : [ { "timesTen" : "[Function]", "moo" : "[Function]" } ],
        "callbacks" : { "0" : ["0","timesTen"], "1" : ["0","moo"] }
    }

Note that the string "[Function]" is just a placeholder and its value is
unimportant.

After methods are exchanged, each side may request methods from the other based
on named keys or numeric callback IDs.

links
-----

An optional field, "links" supports representing cyclic data structures over
JSON. The "links" field is an array of hashes with "from" and "to" keys set. The
values of the "from" and "two" keys are array encoding paths through the data
structure from the root, as in the "callbacks" field.

Example of a method call with cyclic references:

    {
        "method" : 12,
        "arguments" : [ { "a" : 5, "b" : [ { "c" : 5 } ] } ],
        "callbacks" : {},
        "links" : [ { "from" : [ 0 ], "to" : [ 0, "b", 1 ] } ]
    }
This example creates a link to the first argument within the first argument's
"b" key's second element. The previous data structure could be generated from
the following javascript where `fn` comes from the remote:

    var data = { a : 5, b : [ { c : 5 } ] };
    data.b.push(data);
    fn(data);

Note that links need not necessarily be cyclic, they can just more efficiently
encode duplicate data, for instance.

other languages
===============

These libraries implement the dnode protocol too so you can make RPC calls
between scripts written in different languages.

* [dnode-perl](http://github.com/substack/dnode-perl)
* [dnode-ruby](http://github.com/substack/dnode-ruby)

There's a python one in the works too at
* [dnode-python](https://github.com/jesusabdullah/dnode-python)
but it's not finished yet.
