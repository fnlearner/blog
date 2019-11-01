---
title: Chrome调试工具的那点事
date: 2019-09-27 19:57:29
tags: Chrome
---

### $_

调试的过程中，你经常会通过打印查看一些变量的值，但如果你想看一下上次执行的结果呢？再输一遍表达式吗
<!-- more -->
这时候 $_ 就派上了用场，$_ 是对上次执行的结果的 引用 ：
![demo](/images/chrome_panel/demo1.png)

### $$

用Jquery库的同学都知道$是Jquery的缩写，在Chrome的调试面板中，如果你没有定义$这个变量，它在 console 中就是对这一大串函数 document.querySelector 的别名。$$则是==Array.from(document.querySelector),返回的是一个数组，而不是一个nodeList，可以帮我们省却很多时间

### $0

$0保存的是当前选中节点的引用,$1是上个节点，$2是上上个,到4截止。

### 截屏
截屏的时候你们肯定用的是qq或者tim的ctrl+alt+a或者微信的alt+a，其实浏览器本身也支持截屏
![图片](/images/chrome_panel/demo2.gif)

### 切换主题

![图片](/images/chrome_panel/demo3.gif)

PS:Ummm,还有其他命令我就不玩啦。忘了说，ctrl+shift+p打开那个command面板
### 打断点

大部分人打断点都是这样打滴
![图片](/images/chrome_panel/demo4.png)
然鹅如果你只想看第50次循环中的数据是什么样的，难道需要前面的49次都断电吗？烦不烦？所以你可以酱紫：
![图片](/images/chrome_panel/demo5.gif)

设置条件断点后，可以指定在某个条件的时候断点，并且在右侧可以移除所有断点而不用手动一个个点取消。

