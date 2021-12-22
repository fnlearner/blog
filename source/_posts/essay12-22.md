---
title: 今日随笔
date: 2021-12-22 19:11:39
tags:
    - Class
    - TypeScript
    - This
---
![现象](/images/essay12-22/xianxiang.png)

全局调用g函数发现this为undefined，按照我的理解在全局调用的函数this应该是指向windows，然而这里却输出的是undefined
因此我去查了资料，发现在规范上是这么写的

![class](/images/essay12-22/class.jpg)
如果所示class中默认为严格模式，而在严格模式中，未指明this指向的话this是等于undefined的，this是在运行时确定的，而不是在声明的时候确定的，因此这里的`g()`在全局环境中调用未指明this指向，因此此时输出undefined。
![function](/images/essay12-22/function.jpg)
而在function中是可以指定是否是严格模式的