---
title: jsonp实现
date: 2019-11-28 14:04:32
tags: Thinking JavaScript
---
由于浏览器的同源策略，所以当不同源发送请求时，会发生跨域，请求返回的结果被浏览器所拦截，其中一个解决办法就是用jsonp,jquery中的ajax中就支持了jsonp的数据类型
```
$.ajax({
 url: 'http://twitter.com/status/user_timeline/padraicb.json?count=10',
 dataType: 'jsonp',
 success: function onSuccess() { }
});
```
<!--more -->
### 什么是jsonp？

jsonp就是我们开发人员利用了script标签的特性来绕过了浏览器的同源策略，因为script加载资源的时候不受浏览器同源策略的影响，但是这个策略（同源策略）不允许读取与当前网站不同源的回复，只允许发送请求，不允许读取请求

一个网站的origin由三分部分组成，首先就是URI的格式（http://）,接着是主机名（比如：baidu.com），最后是端口号（比如：443）。像 http://logrocket.com 和 https:////logrocket.com 是两个不同的origin因为URI的格式不同。
### 它怎么工作的？

假如本地端口启动在localhost：8080，我们发送一个请求到提供json api的服务上去
```
https://www.server.com/api/person/1
```
然后响应的话可能长这样
```
{
  "firstName": "Maciej",
  "lastName": "Cieslar"
}
```
但是由于同源策略的限制，我们可以发送请求到服务端，但是服务端返回的请求被浏览器给拦截了，因为网站跟服务器不同源。

script元素可以代替我们自己发送请求，同源策略不限制它，它能够加载并且执行外链资源的js，这样的话比如在 https://logrocket.com的网站可以从不同来源的提供商加载google Map库，比如CDN

通过给script中的src赋值成想要访问的请求，script标签将会获取到响应，并且在浏览器中执行
```
<script src="https://www.server.com/api/person/1" async="true"></script>
```

但是问题在于，script会自动解析并且执行返回的js代码。在这种情况下，上面返回的代码会是JSON格式的。JSON会被解析成js代码，因此浏览器会抛出一个错误因为JSON不是有效的JS代码
![图片](https://i0.wp.com/blog.logrocket.com/wp-content/uploads/2019/11/invalid-syntax-error.png?w=730&ssl=1)

因此我们必须返回一个正常运行的JS代码这样script解析并且运行的时候浏览器才不会抛出错误。我们只要把返回的JSON赋值给JS变量或者作为函数的参数就行，毕竟本质上来说，JSON也属于JS对象格式。

因此与其返回纯JSON格式，服务器倒不如返回JS代码。在返回的代码中，将JSON对象放在返回的函数中作为参数传递，函数的名字需要由客户端来传递，提供的函数名字在查询参数中叫做callback

在查询中提供回调函数的名字后，我们在全局上下文中创建了一个函数（function），这个函数在响应被解析并且执行的时候回调用一次

```
https://www.server.com/api/person/1?callback=callbackName
```

```
callbackName({
  "firstName": "Maciej",
  "lastName": "Cieslar"
})
```
因为callbackName在接收到回调的时候callbackName挂载到window上，因此上面的代码其实就是相当于

```
window.callbackName({
  "firstName": "Maciej",
  "lastName": "Cieslar"
})
```

这段代码会在window上下文执行，这个函数将由script下载的代码来执行

为了让jsonp能够正常工作，前后端都需要支持。当对于函数的命名没有标准的规范的时候，前端通常会给发送的函数命名为callback


### 创建一个jsonp的实现
```
let jsonpID = 0;

function jsonp(url, timeout = 7500) {
  const head = document.querySelector('head');
  jsonpID += 1;

  return new Promise((resolve, reject) => {
    let script = document.createElement('script');
    const callbackName = `jsonpCallback${jsonpID}`;

    script.src = encodeURI(`${url}?callback=${callbackName}`);
    script.async = true;

    const timeoutId = window.setTimeout(() => {
      cleanUp();

      return reject(new Error('Timeout'));
    }, timeout);

    window[callbackName] = data => {
      cleanUp();

      return resolve(data);
    };

    script.addEventListener('error', error => {
      cleanUp();

      return reject(error);
    });

    function cleanUp() {
      window[callbackName] = undefined;
      head.removeChild(script);
      window.clearTimeout(timeoutId);
      script = null;
    }

    head.appendChild(script);
  });
}



```

如上所示，jsonpID是一个共享的变量，它会确保每个请求都有独一无二的函数名字。
首先我们把head对象的引用保存在一个叫head的变量中，然后我们会增加jsonpID来确保函数名唯一。在函数内部返回一个promise，我们创建一个script标签以及由jsonpCallback和独一无二的ID组成的callbackName,然后我们把提供的url放到script标签的src属性上，设置callbackName = callbackName，这个实现不支持添加参数，只能get请求，可以添加async确保不会阻塞浏览器

返回的结果有三种可能
+ 要么正确  
+ 要么错误  
+ 要么超时
在上面的代码中都做了处理

在cleanUp函数中抽象清理过程，三个函数-超时，成功，失败-看起来都长一样 
```
const timeoutId = window.setTimeout(() => {
  cleanUp();

  return reject(new Error('Timeout'));
}, timeout);

window[callbackName] = data => {
  cleanUp();

  return resolve(data);
};

script.addEventListener('error', error => {
  cleanUp();

  return reject(error);
});
```

然后在请求完成后调用cleanUp函数,注销挂载在window上的callbackName，移除script节点，清除定时器，将script置空，让script能被浏览器正常GC
```
function cleanUp() {
  window[callbackName] = undefined;
  head.removeChild(script);
  window.clearTimeout(timeoutId);
  script = null;
}
```
然后我们再把script插入到head头中，script将会在插入的时候自动发送请求,
来个例子
```
jsonp(
  'https://gist.github.com/maciejcieslar/1c1f79d5778af4c2ee17927de769cea3.json'
)
  .then(console.log)
  .catch(console.error);
```

PS：当初被问的时候就不会，好气啊

