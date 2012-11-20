## pomelo - a short description
Pomelo is a fast, scalable game server framework for [node.js](http://nodejs.org).
It provides the basic development framework and a lot of related components, including libraries and tools. 
Pomelo is also suitable for realtime web application, its distributed architecture makes pomelo scales better than other realtime web framework.

## Features

* High scalable multi-process architecture, supporting MMO based area partition and other partition strategies
* Easy extention mechnisam, you can scale up your server types and server instances conveniently.
* Easy request, response, broadcast and rpc mechnisam, almost zero configuration.
* Focus on performance, a lot of stress testing and tune in performance and scalability
* Providing a lot tools and libraries, which are quite useful for game development.
* Providing full MMO demo code(html5 client), for good development reference.
* Based on socket.io, which means it can support all the clients that compatible with socket.io.

## Why should you use pomelo?
Fast, scalable, realtime game server development is not an easy job. A good container or framework can reduce the complexity.
Unfortunately, not like web, the game server framework solution is quite rare, especially open source. Pomelo will fill this blank, providing a full solution for building game server framework.
The following are the advantages:
* The architecture is scalable. It uses multi-process, single thread runtime architecture, which has been proved in industry and  especially suitable for node.js thread model.
* Easy to use, the development model is quite similiar to web, using convention over configuration, almost zero config. The api is also easy to use.
* The framework is extensible. Based on node.js micro module principle, the core of pomelo is small. All the components, libraries and tools are individual npm modules, anyone can create their own module to extend the framework.
* The reference is quite complete, we have complete documents.Besides documents, we also provide a full open source MMO demo(html5 client), which is a far more better reference than any books.

## How to develop with pomelo?
With the following references, we can quickly familiar the pomelo development process:
* [the architecture overview of pomelo](https://github.com/NetEase/pomelo/wiki/Architecture-overview-of-pomelo)
* [quick start guide](https://github.com/NetEase/pomelo/wiki/Quick-start-guide)
* [tutoiral](https://github.com/NetEase/pomelo/wiki/Tutorial)
* [FAQ](https://github.com/NetEase/pomelo/wiki/FAQ)

You can also learn from our MMO demo:
* [an introduction to demo --- lord of pomelo](https://github.com/NetEase/pomelo/wiki/Introduction-to--Lord-of-Pomelo)


## License

(The MIT License)

Copyright (c) 2012 Netease, Inc. and other contributors

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
