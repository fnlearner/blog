---
title: 元素定位
date: 2020-12-31 21:39:36
tags:
---

1. focus
   + Options

     An optional object providing options to control aspects of the focusing process. This object may contain the following property:
     + preventScroll Optional

        A Boolean value indicating whether or not the browser should scroll the document to bring the newly-focused element into view. A value of false for preventScroll (the default) means that the browser will scroll the element into view after focusing it. If preventScroll is set to true, no scrolling will occur.
2. 计算元素的scrollTop，让滚动列表的scrollTop的值等于元素的scrollTop
3. scrollIntoView

    [文档](https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView)