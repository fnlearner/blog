---
title: GET 和 POST 的区别
date: 2020-09-12 11:54:31
tags:
---

## GET请求

1. GET请求返回的资源会被浏览器缓存
2. GET请求会保存在浏览器的历史记录中
3. GET请求能当书签
4. GET不能用来处理敏感数据
5. 有长度限制（2048个字符）
6. 仅仅用来获取数据，不能修改
7. 参数的数据类型，只接收ascll编码
8. 仅支持url编码
9. 产生一个数据包
10. 页面重载或者回退没有影响

## POST请求

1. 请求不会被缓存
2. 不会保存在历史记录中
3. 不能作为书签
4. 数据长度没有限制
5. 参数的数据类型没有限制
6. 支持多种编码
7. 两个数据包，需要服务器响应100后继续发出请求之后服务器（可能）响应200
8. 刷新或者回退 数据会重新提交

## 其他http方法

### put

put方法跟post一样，也是用来创建或者更新资源的，但是跟post不一样的地方在于put请求是幂等的，也就是说put请求发起多次所产生的结果是跟第一个一样的；那么对于post请求，重复请求就会产生多次创建相同资源的副作用

### head

head请求跟get请求是差不多相同的，不同的地方在于head请求没有返回体
那么head 请求通常是在发起get请求之前检查get请求返回的是什么，比如在下载文件的时候或者下载请求体的时候

### delete

删除方法用来删除资源

### options

是复杂请求的预检请求
