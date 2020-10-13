---
title: 今日随笔(2020-10-11)
date: 2020-10-11 23:06:32
tags: TypeScript Upload
---

### 命令行文件的上传与下载

文件的上传和下载命令都是scp

**上传**
从服务器上下载文件 scp username@servername:/path/filename /Users/mac/Desktop（本地目录，例如：
```bash
scp root@47.98.37.170:/root/test.txt /Users/mac/Desktop就是将服务器上的/root/test.txt下载到本地的/Users/mac/Desktop目录下。注意两个地址之间有空格！
```

**下载**
上传本地文件到服务器 scp /path/filename username@servername:/path ;

note： 下载命令就是将两个路径换一个位置就行了。


### TS 4.0的一些更新

#### 类型解构
```bash
type Strings = [string, string];
type Numbers = number[]

type Unbounded = [...Strings, ...Numbers, boolean];
# // [string, string, ...Array<number | boolean>]
# 按照官方的解释就是解构一个已知长度的类型的时候，那么最后的结果类型也是没有任何限制的，在解构类型之后添加的类型声明都要添加到被解构类型的类型中去
```
---待续哈，明天更新