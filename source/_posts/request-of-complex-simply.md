---
title: 简单请求和复杂请求
date: 2020-09-16 19:55:45
tags:
---

### 简单请求

请求方法只能是以下三种：
1. GET
2. POST
3. HEAD

请求头只能用以下几种：
1. Accept
2. Accept-Language
3. Content-Language
4. Content-Type （需要注意额外的限制）
5. DPR
6. Downlink
7. Save-Data
8. Viewport-Width
9. Width

Content——Type只能有以下几种

1. text/plain
2. multipart/form-data
3. application/x-www-form-urlencoded

请求中的任意XMLHttpRequestUpload 对象均没有注册任何事件监听器；XMLHttpRequestUpload 对象可以使用 XMLHttpRequest.upload 属性访问。

请求中没有使用 ReadableStream 对象。

### 复杂请求

非简单请求就是复杂亲求