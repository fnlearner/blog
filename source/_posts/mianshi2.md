---
title: 面试总结(2)
date: 2020-08-30 21:31:44
tags: 
    - article 
    - conclusion
---
## https握手过程
1. 服务端生成公私钥
2. 服务端把公钥，加密的hash算法以及个人信息发送给CA
3. CA把服务端发送来的明文信息用服务端发来的hash算法加密生成密文，然后用CA的私钥对密文进行加密生成签名
4. CA把证书发还给服务端，证书内容包括签名，以及证书的颁发对象以及 颁发者等信息。
5. 服务端把证书和明文信息一起发送给客户端
6. 客户端接收服务端发送的证书，用内置在操作系统的公钥对签名进行解密，然后用服务端发来对hash算法对明文进行加密，如果两次生成的字符串相等，那么数据是可信的
7. 客户端在本地随机生成random1，发送给服务端
8. 服务端在本地随机生成random2，发送给客户端
9. 客户端在本地随机生成random3，然后用服务端发来的公钥对random3加密发送给服务端
10. 客户端服务端根据三个随机random各自生成对称密钥
11. 用生成的对称密钥加密一段握手信息，发送给服务端。双端验证。
12. 后续加密用生成的对称密钥加密
<!--more -->
## 输入URL到页面渲染过程
1. 浏览器进程拼接URL，加协议
2. 网络进程根据URl做DNS解析
3. 请求的资源返回给渲染进程
4. 渲染进程根据返回的状态码以及content-type来进行后续的流程
5. 是html类型则进行渲染流程
6. 生成CSSOM以及DOM
7. 生成Render树。
8. 根据render树生成图层树
9. 渲染进程对图层进行绘制，把图层绘制拆分成一个个的绘制指令，绘制指令组成绘制列表
10. 渲染进程的合成线程来进行实际的绘制操作
11. 合成线程在光栅化线程中执行光栅化（把图层转化成位图）
12. 光栅化采用GPU加速，因此实际绘制过程在GPU进程
13. 光栅化结束渲染进程通知浏览器进程
14. 浏览器进程接收drawquard命令，将其页面内容绘制到内存中，最后再将内存显示在屏幕上。
15. done！

## 字符串翻转
略
## 字符串转数组
parseInt Number 两者区别
略
## DNS解析过程
找本地缓存，没找到请求域名服务器
## DNS劫持
略
## 强缓存 协商缓存
+ 强缓存：

    + Cache-Control
    + Expire
+ 协商缓存：

    + If-Modified-Since
    + Etag
其他略

## vue双向绑定原理

数据劫持 ➕ 发布订阅
## vue响应式原理

依赖收集 + 依赖更细

## react fiber

1. 根据component生成fiber树
2. 每个节点都对应一个fiber节点
3. 当前渲染在屏幕上的是current树
4. current树有一个是alternate的指针指向wip树
5. wip也有相同的指针指向current树
6. wip树是fork了一份current树，这个叫做double buffering
7. 有两个阶段，一个是render，一个是commit
8. render阶段可以被打断，commit阶段不可以被打断
9. render阶段的任务主要根据插入的顺序来执行，通过使用requestIdlecallback这个api来实现任务的调度
10. 高优先级的任务可以打断低优先级的任务执行，比如用户输入等需要及时反馈的任务属于高优先级，而对于数据获取这类的任务属于低优先级
11. react内部通过使用messageChannel来实现reqeustIdleCallback的polyfill

## xss防御

1. 转码
2. 白名单
3. 过滤

## CSRF

1. SameSite
    + Lax
    + Strict
    + None
2. x-frame-option
3. csp
    + default-src
    + image-src
    + media-src
    + script-src
4. token
5. refer/origin

## 性能优化
1. webpack

    + 缩小构建体积（分包，tree-shaking，剔除第三方库不需要的模块）
    + 缓存（cache-loader，hard-source-webpack-plugin，dll）
    + 预加载（preload）
    + 减少请求资源数（mini-css-extract-plugin，html-webpack-plugin）

2. 差异化服务
3. 图片懒加载（非可视区域图片用placeholder替代或者低质量图片）
4. 减少时间复杂度
5. 非必要文件异步加载或动态加载模块
6. 对核心内容启用SSR

## 跨域

CORS

img

script