## Pomelo -- 为node.js而生的高性能, 高可伸缩 的游戏服务器框架

Pomelo 是一个基于nodejs的高性能, 高可伸缩的游戏服务器框架.
它提供了基础的开发框架和很多相关的工具和库.
Pomelo 也适用于 实时的Web应用;
它分布式的架构使得本身比其他实时web框架要方便扩展的多.


[![Build Status](https://travis-ci.org/NetEase/pomelo.svg?branch=master)](https://travis-ci.org/NetEase/pomelo)

 * Homepage: <http://pomelo.netease.com/>
 * Mailing list: <https://groups.google.com/group/pomelo>
 * Documentation: <http://github.com/NetEase/pomelo>
 * Wiki: <https://github.com/NetEase/pomelo/wiki/>
 * Issues: <https://github.com/NetEase/pomelo/issues/>
 * Tags: game, nodejs


## 特点

### 完全支持游戏和实时应用的服务器架构

* 多人游戏：手游，社交，网游，MMORPG[大型多人在线角色扮演游戏]
* 实时应用：聊天，消息推送，等等.

### 高性能 高可伸缩

* 分布式 (多进程) 架构, 方便扩展
* 灵活的服务器扩展
* 全性能优化和测试

### 简单

* 简单的API: request, response, broadcast, etc.
* 轻量级: 基于node.js 开发效率高
* 约定优于配置: 几乎零配置

### 强大

* 支持多种客户端,包括  javascript, flash, android, iOS, cocos2d-x, C
* 有多个库和工具帮助开发，包括 命令行工具，admin工具，性能测试工具，AI， 寻路等

* 参考资料丰富: 全文档, 多个案例 和 [一个开源的 MMORPG demo](https://github.com/NetEase/pomelo/wiki/Introduction-to--Lord-of-Pomelo)

### 可扩展

* 支持插件框架, 新特性可通过插件很方便的添加. 我们也提供了多个插件像在线状态，master高可用;
* 自定义特性,用户可非常简单的自定义网络协议，自定义组件

## 为什么要用Pomelo?
高性能, 可扩展, 实时的游戏开发不是一项简单的工作，一个好的容器或者框架可以减少开发的复杂度.
不幸的是，要想找到一个游戏服务器框架解决方案是非常困难的，特别是一个开源的解决方案。Pomelo填补了这个空缺， 为构建游戏服务器框架提供了一个完整的解决方案
Pomelo拥有一下优点：
* 可伸缩。它使用多进程,单线程运行时框架，已经在该行业被证明，尤其适合于node.js 线程模型。
* 易于使用,发展模式非常类似于网络,使用约定优于配置,配置几乎为零。API也很容易使用
* 框架是可扩展的。基于nodejs微模块原理，pomelo的核心是很小的。所有的组件，库和工具都是独立的npm模块，任何人都可以创建自己的模块来扩展这个框架
* 参考资料和文档很丰富. 除了文档之外, 我们也提供了 [an open-source MMO RPG demo](https://github.com/NetEase/pomelo/wiki/Introduction-to--Lord-of-Pomelo) (HTML5 client), 比任何教科书都要好的参考资料.

## 我该如何使用pomelo开发?
使用下面的引用，你可以快速的熟悉pomelo的开发流程：
With the following references, you can quickly familiarize yourself with the pomelo development process:
* [Pomelo documents](https://github.com/NetEase/pomelo/wiki)
* [Getting started](https://github.com/NetEase/pomelo/wiki/Welcome-to-Pomelo)
* [Tutorial](https://github.com/NetEase/pomelo/wiki/Preface)


## Contributors
* NetEase, Inc. (@NetEase)
* Peter Johnson(@missinglink)
* Aaron Yoshitake 
* @D-Deo 
* Eduard Gotwig
* Eric Muyser(@stokegames)
* @GeforceLee
* Harold Jiang(@jzsues)
* @ETiV
* [kaisatec](https://github.com/kaisatec)
* [roytan883](https://github.com/roytan883)
* [wuxian](https://github.com/wuxian)
* [zxc122333](https://github.com/zxc122333)
* [newebug](https://github.com/newebug)
* [jiangzhuo](https://github.com/jiangzhuo)
* [youxiachai](https://github.com/youxiachai)
* [qiankanglai](https://github.com/qiankanglai)
* [xieren58](https://github.com/xieren58)
* [prim](https://github.com/prim)
* [Akaleth](https://github.com/Akaleth)
* [pipi32167](https://github.com/pipi32167)
* [ljhsai](https://github.com/ljhsai)
* [zhanghaojie](https://github.com/zhanghaojie)
* [airandfingers](https://github.com/airandfingers)

## License

(The MIT License)

Copyright (c) 2012-2014 NetEase, Inc. and other contributors

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

