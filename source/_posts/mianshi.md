---
title: 面试总结
date: 2020-08-07 21:01:36
tags:
---

今天面了一家公司，电面。差不多是这些题目
1. 动画
2. 浏览器储存
3. 缓存机制 -- 强缓存和协商缓存
4. vue响应式原理 -- 2和3
5. react事件
6. 浏览器安全和工程化
7. http协议
8. Promise
9. typescript
10. 浏览器性能优化
11. vue3相比vue2的优点
12. webpack优化
13. 首屏优化
14. 元素隐藏

<!-- more -->

### 怎么让`元素隐藏`

两个属性:

1. display
2. visible

两个属性有什么区别：
1. `display:none` 销毁dom元素
2. `visble：hidden` 不销毁dom元素

哪个会产生回流，哪个会产生重绘
1. `display` 会产生回流，因为影响了周围的元素位置
2. `visible` 只会产生重绘

### 动画相关

一、 哪些属性可以产生动画

1. `animation`
2. `key-frames`
3. `requestAnimationFrame`

三者有什么不同

1. `animation`和`requestAnimationFrame`没有时间轴的概念。产生的动画是连续的。

如果在JS主线程中有一个阻塞任务，那么三种不同方式产生的动画会卡顿吗？为什么？

**wdm，触及到我的知识盲区**

### 浏览器储存相关

一、浏览器有哪些储存方式
1. cookie
2. sessionStorage
3. localStorge

二、有哪些区别
1. cookie储存发数据比较小，大概4k
2. sessionStorage储存数据有时间限制，并且储存在sessionStorage的数据会在当前页面会话结束时清除
3. localStorage储存数据没有时间限制，localStorage中的数据除非手动清除，否则数据不会消失

三、如果要让localStorage实现数据有过期的效果该怎么实现

在把数据存进localStorage的时候同时存放时间参数。每次取值的时候根据时间参数来比对数据是否过期

### 资源缓存相关

#### 强缓存

在http1.0时期，使用的是expire来判断资源是否过期。这个字段存放的是具体的过期时间，比如2020年八月九日，但是这样会有一个问题，当服务器时间和本地浏览器时间不一致的时候，给出具体过期时间会对资源是否过期判断错误，因此在http1.1对时候新加了cache-control字段，这个字段用来存放资源的过期时长，用max-age记录。当强缓存没有命中的时候那么进行协商缓存。

#### 协商缓存

协商缓存主要有两个字段一个是`If-modified-Since`，这个值跟`Last-modifed`配对，一个是`Etag`，这个跟`If-Match`配对,两个主要记录的东西不同。前者是记录文件的修改时间，后者是根据文件内容生成一个Etage值，对于如何生成Etag值，并没有明确规定。而通常生成Etage的值是使用内容的散列，最后修改时间戳的哈希值，或简单地使用版本号。
对于`if-modifued-since`来说，假如文件只是修改了格式，但是内容并没有改变，但是对这个值来说，仍然会告诉浏览器资源无效并且返回新的资源，这明显是不太合适的
对于`Etag`来说，当且仅当文件内容有所变更时，此时Etag值就会相应的更新，因此就可以告诉浏览器缓存的资源已经过期。ETag头的另一个典型用例是缓存未更改的资源。 如果用户再次访问给定的URL（设有ETag字段），显示资源过期了且不可用，客户端就发送值为ETag的If-None-Match header字段。服务器将客户端的ETag（作为If-None-Match字段的值一起发送）与其当前版本的资源的ETag进行比较，如果两个值匹配（即资源未更改），服务器将返回不带任何内容的304未修改状态，告诉客户端缓存版本可用（新鲜）


### vue响应式原理相关

#### 两者实现方式的区别
vue2是使用了Object.defineProperty来实现的数据监听
vue3是使用了Proxy来实现的数据监听

#### 例子

假如有一个响应式数据
```bash
const obj = reactive({a:1})
const computed_obj = computed(()=>{
    return obj.a+1
})
```
为什么对a修改之后，computed_obj也会相应的进行修改?

```bash
在执行obj.a的时候，就会执行track方法
export function track(target: object, type: TrackOpTypes, key: unknown) {
  if (!shouldTrack || activeEffect === undefined) {
    return
  }
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()))
  }
  let dep = depsMap.get(key)
  if (!dep) {
    depsMap.set(key, (dep = new Set()))
  }
  if (!dep.has(activeEffect)) {
    dep.add(activeEffect)
    # 这个activeEffect就是在这之前执行的依赖函数
    # dep 就是 target[key]的依赖
    activeEffect.deps.push(dep)
    if (__DEV__ && activeEffect.options.onTrack) {
      activeEffect.options.onTrack({
        effect: activeEffect,
        target,
        type,
        key
      })
    }
  }
}
```

因此当响应式对象更改时，其对应的依赖项会执行一遍，因此此时computed函数就会执行一次。

### react事件相关

#### setState

 setState什么时候是同步的？什么时候是异步的？

 当事件是合成事件时，即由react控制的事件时，就是异步的；
 如果是由addEventlistener监听时或者在定时器中执行时，那就是同步的。

 ### 浏览器安全以及工程化相关

 #### 数据传输安全

 使用https传输数据，服务端从第三方平台获取非堆成加密的公钥和私钥，客户端从服务端获取公钥，然后在客户端随机生成哈希串，然后用公钥对这个哈希串加密，然后把加密后的哈希串发送给服务端，服务端用私钥对这个哈希串进行解密，这个时候客户端和服务端就有了共同的哈希串，然后客户端和服务端用这个哈希串对明文进行加密传输。
 #### 工程化
工程化即系统化、模块化、规范化的一个过程。

工程化需要做什么：

1. 统一团队成员的编码规范，便于团队协作和代码维护，包括：

    + 目录结构，文件命名规范
    + 编码规范：eslint stylelint等

2. 开发流程的规范

    + 应对各项风险，需求变更等
    + code review机制
3. 前后端接口规范，其他文档规范

4. 使用版本管理工具来安全高效等管理代码

    + 对git对使用
    + 规范commit描述
    + 创建merge request ，code review通过后才可以进行merge

5. 使用合适对技术栈编码，来提高开发效率以及维护难度

    + 用模块化对方式来组织代码，包括js模块化，css模块化
    + 采用组件化对编程思想，处理UI层
    + 将数据层和UI层分离

6. 提高代码可靠性，引入单元测试

### http协议相关
http请求中分为哪些部分？
1. 请求头
2. 请求体

http2.0 相比较之前的协议有哪些改进？
1. 多路复用，复用tcp连接，并且可以不按顺序，和二进制分帧一起解决队头堵塞问题
2. 二进制分帧
3. 头部压缩，传递方法的时候只传递索引，服务端根据索引去索引表查询方法
4. 允许服务端推送，这样客户端不用发起请求获得后续资源
http传输是根据什么协议传输？为什么？
+ tcp/ip协议，安全可靠

http传输在哪个层进行传输？
+ 应用层

### promise

Promise 对象是一个代理对象（代理一个值），被代理的值在Promise对象创建时可能是未知的。它允许你为异步操作的成功和失败分别绑定相应的处理方法（handlers）。 这让异步方法可以像同步方法那样返回值，但并不是立即返回最终执行结果，而是一个能代表未来出现的结果的promise对象

```bash
const data = Promise.resolve(2)
```
这个就算是使用了resolve，那么data也不会被赋值成2，而是一个promise对象
，只有在调用了then方法后才会得到真正对值

```bash
Promise.resolve(2).then(res=>console.log(res))
# 这时候就会输出22
```
同时 then方法接受两个函数类型对参数，一个是onfulfilled，一个是onrejected，前者在调用resolve的时候进入，后者则是在调用reject或者抛出错误的时候调用，因此catch也可以被叫做是then的语法糖，因为catch方法可以等于then(null,onRejected)
### typescript

在ts中 interface 和 type 的区别？

**相同点：**
1. 都可以描述一个对象或者函数✅
 
```bash
interface User {
  name: string
  age: number
}

interface SetUser {
  (name: string, age: number): void;
}
```
```bash
type User = {
  name: string
  age: number
};

type SetUser = (name: string, age: number)=> void;
```

2. 都允许拓展✅

```bash
# interface extends interface

interface Name { 
  name: string; 
}
interface User extends Name { 
  age: number; 
}
```

```bash
# type extends type
type Name = { 
  name: string; 
}
type User = Name & { age: number  };
```
    
```bash
# interface extends type
type Name = { 
  name: string; 
}
interface User extends Name { 
  age: number; 
}
```

```bash
# type extends interface
interface Name { 
  name: string; 
}
type User = Name & { 
  age: number; 
}
```

**不同点：**
1. type 可以声明基本类型别名，联合类型，元组等类型
```bash
# 基本类型别名
type Name = string

# 联合类型
interface Dog {
    wong();
}
interface Cat {
    miao();
}

type Pet = Dog | Cat

# 具体定义数组每个位置的类型
type PetList = [Dog, Pet]

```
2. type 语句中还可以使用 typeof 获取实例的 类型进行赋值

```bash
# 当你想获取一个变量的类型时，使用 typeof
let div = document.createElement('div');
type B = typeof div
```

3. interface 可以进行声明合并

```bash
interface User {
  name: string
  age: number
}

interface User {
  sex: string
}
# 上面两个接口哦可以合并成下面这个接口声明
interface User{
    name:string,
    age:number,
    sex:string
}
```
### 浏览器性能优化

采用chrome标签的performace 来 查看 页面渲染过程中可能发生卡顿的 片段，查看在执行过程中 耗时过长的函数，配合火焰图查看函数调用栈深度

1. 使用RequestAnimationFrame函数实现动画，或者新建图层来实现动画
2. 使用Web Workers来执行耗费大量时间的任务
3. 降低样式计算复杂度，
4. 避免动态修改样式
### v3相比v2优点
v3 有更棒的tree-shaking
v3 的dom diff性能优化，只监听变量，而对于静态节点不进行比较
v3 有更好的ts支持
v3 能够根据数据索引值来对数据进行监听了
v3 体积更小
### webpack优化
见面试2
### 首屏渲染优化
+ 减少请求资源数
    + 图片合成雪碧图
    + webpack的html-webpack-plugin
+ 减少资源体积
    + webpack对图片体积的压缩，转base64
    + 不在视口区域的元素不渲染
    + 非重点文件延迟加载defer
    + 重点登陆页可以考虑ssr
+ loading过程可以采用骨架屏
+ 组件动态加载
+ 路由动态加载
+ 图片懒加载
+ 图片格式尽量采用webp或者avif
