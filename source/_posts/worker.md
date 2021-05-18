---
title: worker
date: 2021-05-18 19:14:20
tags: worker
      javaScript
---


Web Worker 文献综述

Web Worker 作为浏览器多线程技术, 在页面内容不断丰富, 功能日趋复杂的当下, 成为缓解页面卡顿, 提升应用性能的可选方案.
但她的容颜, 隐藏在边缘试探的科普文章和不知深浅的兼容性背后; 对 JS 单线程面试题倒背如流的前端工程师, 对多线程开发有着天然的陌生感.

业务背景

因为我负责的组件中有个是树组件，那么对于这个树组件有个功能是叫做搜索的功能，一开始的时候在搜索匹配节点的时候是在主线程中去执行代码，但是在遇到计算量大的时候，就会一直占用主线程的资源，导致页面不能及时的跟用户进行响应，那么我就想到了将这个计算的代码放到后台（也就是worker）去执行逻辑，这样的话就不会阻塞页面的渲染工作，因为worker的代码跟主线程的代码是属于并行的关系。

#### worker介绍

官方对这个[web worker](https://link.zhihu.com/?target=https%3A//developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API)的表述是
```
Web Workers makes it possible to run a script operation 
in a background thread separate from the main execution thread 
of a web application.

```
![process](/images/worker/worker-process.jpeg)

通过这个其实可以想到的是 并行可以提升执行效率，任务的拆分能减少页面的卡顿

#### 技术规范

[worker的技术规范](https://www.w3.org/TR/workers/)并不是近几年才开始提出的，它在09年就已经有了草案
![worker draft](/images/worker/worker-draft.png)

#### Worker的分类

在mdn上worker介绍了三种worker类型，分别是Dedicated workers （专用worker），Shared Worker（共享worker）以及 Service Worker。
Dedicated worker 只能与创建它的页面渲染进程通行，不能够进行多tab共享，这是最常见的也是用的最多的一种worker
而 SharedWorker 可以在多个浏览器 Tab 中访问到同一个 Worker 实例, 实现多 Tab 共享数据, 共享 webSocket 连接等. 看起来很美好, 但 safari 放弃了 SharedWorker 支持, 因为 webkit 引擎的技术原因. 如下图所示, 只在 safari 5~6 中短暂支持过.

![shared worker](/images/worker/shared-worker.jpeg)

相比之下, DedicatedWorker 有着更广的兼容性和更多业务落地实践, 本文后面讨论中的 Worker 都是特指 DedicatedWorker.

在创建worker的时候，那么其实是会创建操作系统级别的线程
```bash
The Worker interface spawns real OS-level threads. -- MDN
```

JS 多线程, 是有独立于主线程的 JS 运行环境. 如下图所示: Worker 线程有独立的内存空间, Message Queue, Event Loop, Call Stack 等, 线程间通过 postMessage 通信，并且多个线程是可以并发执行的。

#### 异步任务与worker的区别

JS 单线程中的"并发", 准确来说是 Concurrent. 如下图所示, 运行时只有一个函数调用栈, 通过 Event Loop 实现不同 Task 的上下文切换(Context Switch). 这些 Task 通过 BOM API 调起其他线程为主线程工作, 但回调函数代码逻辑依然由 JS 串行运行.
![event-loop](/images/worker/event-loop-and-worker.png)

#### 应用场景
+ 可以减少主线程卡顿.
+ 可能会带来性能提升.


Worker 的多线程能力, 使得同步 JS 任务的拆分一步到位: 从宏观上将整个同步 JS 任务异步化. 不需要再去苦苦寻找原子逻辑, 逻辑异步化的设计上也更加简单和可维护.

这给我们带来更多的想象空间. 如下图所示, 在浏览器主线程渲染周期内, 将可能阻塞页面渲染的 JS 运行任务(Jank Job)迁移到 Worker 线程中, 进而减少主线程的负担, 缩短渲染间隔, 减少页面卡顿.

#### 性能提升

Worker 多线程并不会直接带来计算性能的提升, 能否提升与设备 CPU 核数和线程策略有关.

#### worker的线程策略

一台设备上相同任务在各线程中运行耗时是一样的. 如下图所示: 我们将主线程 JS 任务交给新建的 Worker 线程, 任务在 Worker 线程上运行并不会比原本主线程更快, 而线程新建消耗和通信开销使得渲染间隔可能变得更久.

在单核机器上, 计算资源是内卷的, 新建的 Worker 线程并不能为页面争取到更多的计算资源. 在多核机器上, 新建的 Worker 线程和主线程都能做运算, 页面总计算资源增多, 但对单次任务来说, 在哪个线程上运行耗时是一样的.

真正带来性能提升的是`多核多线程并发`.

如多个没有依赖关系的同步任务, 在单线程上只能串行执行, 在多核多线程中可以并行执行.

#### 把主线程还给 UI
Worker 的应用场景, 本质上是从主线程中剥离逻辑, 让主线程专注于 UI 渲染. 

#### woker 通信方式
[worker相关api](https://developer.mozilla.org/en-US/docs/Web/API/DedicatedWorkerGlobalScope)
![thread](/images/worker/thread.jpeg)

#### worker 跟主线程的 异同

##### 共同点

+ 包含完整的 JS 运行时, 支持 ECMAScript 规范定义的语言语法和内置对象.
+ 支持 XmlHttpRequest, 能独立发送网络请求与后台交互.
+ 包含只读的 Location, 指向 Worker 线程执行的 script url, 可通过 url 传递参数给 Worker 环境.
+ 包含只读的 Navigator, 用于获取浏览器信息, 如通过 Navigator.userAgent 识别浏览器.
+ 支持 setTimeout / setInterval 计时器, 可用于实现异步逻辑.
+ 支持 WebSocket 进行网络 I/O; 支持 IndexedDB 进行文件 I/O.

##### 不同点

+ Worker 线程没有 DOM API, 无法新建和操作 DOM; 也无法访问到主线程的 DOM Element.
+ Worker 线程和主线程间内存独立, Worker 线程无法访问页面上的全局变量(window, document 等)和 JS 函数.
+ Worker 线程不能调用 alert() 或 confirm() 等 UI 相关的 BOM API.
+ Worker 线程被主线程控制, 主线程可以新建和销毁 Worker.
+ Worker 线程可以通过 self.close 自行销毁.


从差异点上看, Worker 线程无法染指 UI, 并受主线程控制, 适合默默干活.

#### 通信速度
Worker 多线程虽然实现了 JS 任务的并行运行, 也带来额外的通信开销. 如下图所示, 从线程A 调用 postMessage 发送数据到线程B onmessage 接收到数据有时间差, 这段时间差称为通信消耗.

![oost](/images/worker/cost.jpeg)

提升的性能 = 并行提升的性能 – 通信消耗的性能. 在线程计算能力固定的情况下, 要通过多线程提升更多性能, 需要尽量减少通信消耗.
#### 数据传输方式
通信方式有 3 种: Structured Clone, Transfer Memory 和 Shared Array Buffer.

##### Structured Clone

Structured Clone 是 postMessage 默认的通信方式. 如下图所示, 复制一份线程A 的 JS Object 内存给到线程B, 线程B 能获取和操作新复制的内存.

Structured Clone 通过复制内存的方式简单有效地隔离不同线程内存, 避免冲突; 且传输的 Object 数据结构很灵活. 但复制过程中, 线程A 要同步执行 Object Serialization, 线程B 要同步执行 Object Deserialization; 如果 Object 规模过大, 会占用大量的线程时间.


##### Transfer Memory

Transfer Memory 意为转移内存, 它不需要 Serialization/Deserialization, 能大大减少传输过程占用的线程时间. 如下图所示 , 线程A 将指定内存的所有权和操作权转给线程B, 但转让后线程A 无法再访问这块内存.

Transfer Memory 以失去控制权来换取高效传输, 通过内存独占给多线程并发加锁. 但只能转让 ArrayBuffer 等大小规整的二进制(Raw Binary)数据; 对矩阵数据(如 RGB 图片,对rgb图片像素操作，比如取反色)比较适用. 实践上也要考虑从 JS Object 生成二进制数据的运算成本。

##### Shared Array Buffers

Shared Array Buffer 是共享内存, 线程A 和线程B 可以同时访问和操作同一块内存空间. 数据都共享了, 也就没有传输什么事了.
但多个并行的线程共享内存, 会产生竞争问题(Race Conditions). 不像前 2 种传输方式默认加锁, Shared Array Buffers 把难题抛给开发者, 开发者可以用 Atomics 来维护这块共享的内存. 作为较新的传输方式, 浏览器兼容性可想而知, 目前只有 Chrome 68+ 支持.

#### 兼容性

兼容性是前端技术方案评估中需要关注的问题. 对 Web Worker 更是如此, 因为 Worker 的多线程能力, 要么业务场景完全用不上; 要么一用就是重度依赖的基础能力.

worker的兼容性还不错 ，能够兼容大部分的主流浏览器 skr









