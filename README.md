##Pomelo -- a fast, scalable game server framework for node.js

Pomelo is a fast, scalable game server framework for [node.js](http://nodejs.org).
It provides the basic development framework and many related components, including libraries and tools. 
Pomelo is also suitable for realtime web applications; its distributed architecture makes pomelo scale better than other realtime web frameworks.

 * Homepage: <http://pomelo.netease.com/>
 * Mailing list: <https://groups.google.com/group/pomelo>
 * Documentation: <http://github.com/NetEase/pomelo>
 * Wiki: <https://github.com/NetEase/pomelo/wiki/>
 * Issues: <https://github.com/NetEase/pomelo/issues/>
 * Tags: game, nodejs 


## Features

### Fast, scalable

* Distributed (multi-process) architecture
* Flexible server extension
* Full performance optimization and test

### Easy

* Simple API: request, response, broadcast, etc.
* Lightweight: high development efficiency based on node.js
* Convention over configruation: almost zero config

### Powerful

* Many libraries and tools
* Good reference materials: full docs, and [an open-source MMO RPG demo](https://github.com/NetEase/pomelo/wiki/Introduction-to--Lord-of-Pomelo)


## Why should I use pomelo?
Fast, scalable, realtime game server development is not an easy job, and a good container or framework can reduce its complexity.
Unfortunately, not like web, the game server framework solution is quite rare, especially open source. Pomelo fills this gap, providing a full solution for building game server frameworks.
Pomelo has the following advantages:
* The architecture is scalable. It uses multi-process, single thread runtime architecture, which has been proven in industry and is  especially suited to the node.js thread model.
* Easy to use, the development model is quite similiar to web, using convention over configuration, almost zero config. The [API](http://pomelo.netease.com/api.html) is also easy to use.
* The framework is extensible. Based on node.js micro module principle, the core of pomelo is small. All the components, libraries and tools are individual npm modules, anyone can create their own module to extend the framework.
* The reference materials and documentation are quite complete. Besides documents, we also provide [an open-source MMO RPG demo](https://github.com/NetEase/pomelo/wiki/Introduction-to--Lord-of-Pomelo) (HTML5 client), which is a far better reference material than any book.

## How can I develop with pomelo?
With the following references, you can quickly familiarize yourself with the pomelo development process:
* [Architecture Overview of pomelo](https://github.com/NetEase/pomelo/wiki/Architecture-overview-of-pomelo)
* [Quick Start Guide](https://github.com/NetEase/pomelo/wiki/Quick-start-guide)
* [Tutorial](https://github.com/NetEase/pomelo/wiki/Tutorial)
* [FAQ](https://github.com/NetEase/pomelo/wiki/FAQ)

You can also learn from our MMO demo:
* [Introduction to Lord of Pomelo](https://github.com/NetEase/pomelo/wiki/Introduction-to--Lord-of-Pomelo)

## Contributors
* NetEase, Inc.
* Aaron Yoshitake
* Eduard Gotwig
* Eric Muyser


## License

(The MIT License)

Copyright (c) 2012-2013 NetEase, Inc. and other contributors

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
