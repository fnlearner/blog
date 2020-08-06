---
title: 今日随笔(8-6)
date: 2020-08-06 22:20:44
tags:
---

先看代码
```bash
const a = 1
[...[1,2,3]].forEach(item=>console.log(item))
```
乍一看，是不是感觉挺正常的，在浏览器的log窗口应该能输出1，2，3，才对
然后在浏览器跑一下，发现

![error](/images/essay-4/unexpected_error.png.png)

然后emm排查了一下，语法是没问题的，浏览器版本是最新的开发版本，es6的语法肯定是支持的，那问题其实就是a=1 后面漏了分号，所以代码就成了这样
```bash
const a = 1[...[1,2,3]].forEach(item=>console.log(item))
```
那代码成了这样那肯定不能正确解析了～

果然，漏写分号不是好习惯～