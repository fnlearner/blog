---
title: queryString
date: 2022-04-01 21:12:54
tags: 
    - querystring
    - 加号
    - +
---

背景：给服务端发送请求的参数中有一个带有+号，并且在url中传递参数
问题：加号以空格的形式发送导致服务端不能正确处理数据
方案：使用`window.encodeURIComponent`对数据进行处理
以上
