---
title: 今日随笔
date: 2021-12-29 18:18:59
tags: 同源策略
---

### 同源策略

同源的定义：如果两个 URL 的 protocol、port (en-US) (如果有指定的话)和 host 都相同的话，则这两个 URL 是同源。这个方案也被称为“协议/主机/端口元组”，或者直接是 “元组”。（“元组” 是指一组项目构成的整体，双重/三重/四重/五重/等的通用形式）。


### 哪些请求不受同源策略控制

image（对一半）,script嵌入的跨域脚本 , link,video和audio加载的媒体资源，applet等嵌入的插件，@font-face引入的字体 and iframe载入的任何资源

#### 为什么不受控制

so 要提到浏览器的跨域网络访问

同源策略控制不同源之间的交互，例如在使用XMLHttpRequest 或 <img> 标签时则会受到同源策略的约束。这些交互通常分为三类：

- 跨域写操作（Cross-origin writes）一般是被允许的。例如链接（links），重定向以及表单提交。特定少数的HTTP请求需要添加 preflight。
- 跨域资源嵌入（Cross-origin embedding）一般是被允许（后面会举例说明）。
- 跨域读操作（Cross-origin reads）一般是不被允许的，但常可以通过内嵌资源来巧妙的进行读取访问。例如，你可以读取嵌入图片的高度和宽度，调用内嵌脚本的方法，或availability of an embedded resource.

#### 允许跨域访问
- 用cors
- nginx
- webpack的devserver

#### 题外话

如果在canvas调用drawImage跨域的image，canvas是不能把图片导出成base64d，需要给图片添加`crossOrigin=anonymous`，这样canvas写入的图片才能正确被导出。
```
The image is then configured to allow cross-origin downloading by setting its crossOrigin attribute to "Anonymous"
```
引入mdn的解释，图片在设置了这个属性之后就被配置成允许跨域下载了。