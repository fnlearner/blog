---
title: rc-select
date: 2022-04-01 20:05:52
tags:
    - rc-select
    - antd
    - select
    - filterOption
---

## 在使用antd的select中的search从远端获取数据时option渲染不符合预期行为，
需求背景：下拉框列表数据默认展示二十条数据，支持后端条件过滤，在滚动时加载数据

场景复现：
<video id="video" src="/images/rc-select/demo.mov" controls="" preload="none" poster="封面">
     
</video>
从视频中可以看到到在搜索数据时列表中有匹配的数据但是在ui上并没有过滤出来
<!--more -->
但是可以看到实际的数据如图
![数据](/images/rc-select/filter.png)
能够正确输出，但是在ui上不显示

一开始有考虑到使用了相同的数据引用地址导致ui渲染不更新，但是在经过深拷贝数据后发现情况仍然复现，因此排除引用地址导致的ui不更新问题。

查看antd源码发现select组件是基于一个叫rc-select的组件做的开发，因此我在本地做了一个最小环境的复现

在排查过程中，发现在rc-select中有一个叫useFilterOption的自定义hook，每次option更新的时候都会执行这个钩子，经过进一步debug 发现：
```js
 if (!searchValue || filterOption === false) {
      return options;
  }
```
`search`代表的就是在启动搜索功能时输入的关键词，在已知`searchValue`不为空的情况下，设置`filterOption`为`false`，那么就可以获取完整的option，fine，排查到这里，基本已经可以确定解决方案是什么了。

修改之后效果如图：
![结果](/images/rc-select/result.png)

现在已经能搜索结果已经能正确在ui上展示了

只要给select组件的filterOption设置为false就行了
