---
title: 今日随笔(7-29)
date: 2020-07-29 10:04:30
tags: essay
categories: essay
---

## runAsync

使用 web worker 在一个单独的线程中执行函数，能够允许执行不阻塞 UI 渲染的耗时函数

1. 使用 blob 形式的 url 来创建`worker`,`worker`的内容应该是函数的系列化版本，然后立即返回函数的返回值

2. 返回值是一个`promise`，它监听了`worker`的`onmessage` and `onerror`两个事件，返回从主线程发送过来的数据或者是抛出一个错误
<!-- more -->
```bash
const runAsync = fn => {
  const worker = new Worker(
    URL.createObjectURL(new Blob([`postMessage((${fn})());`]), {
      type: 'application/javascript; charset=utf-8'
    })
  );
  return new Promise((res, rej) => {
    worker.onmessage = ({ data }) => {
      res(data), worker.terminate();
    };
    worker.onerror = err => {
      rej(err), worker.terminate();
    };
  });
};
```

example

```bash
 const longRunningFunction = () => {
      let result = 0;
      for (let i = 0; i < 1000; i++)
        for (let j = 0; j < 700; j++)
          for (let k = 0; k < 300; k++) result = result + i + j + k;

      return result;
};
runAsync(longRunningFunction).then(console.log); // 209685000000
```

然后由于代码是在不同的上下文执行的，因此所有的变量以及函数声明都要在内部定义,
比如下面这个是不行滴。

```bash
let outsideVariable = 50;
runAsync(() => typeof outsideVariable).then(console.log); // 'undefined'
```

## Copy to Clipboard

1. 创建一个`textarea`或者`input`元素添加到`document`中，让它的值等于要我们想要复制到粘贴板上的值
2. 使用`HTMLInputElement.select()` 选择 刚刚创建的元素的内容
3. 调用`Document.execCommand('copy')`复制刚刚选中的内容
4. 将刚刚创建的元素移除

```bash
const copy = val=>{
    const el = document.createElement('input')
    input.value = val
    document.body.appendChild(el)
    el.select()
    document.execCommand('copy')
    documnet.body.removeChild(el)
}
```

但是在执行这个方法的时候，在插入以及移除元素的时候可能会发生闪烁，一个常见的解决方案就是把创建的这个元素放置在不可见区域，看一下改造后的方法

```bash
const copyToClipboard = str => {
  const el = document.createElement('textarea');
  el.value = str;
  el.setAttribute('readonly', '');
  el.style.position = 'absolute';
  el.style.left = '-9999px';
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
};
```

## 修改 url 来重载页面

</br>

**使用 h5 的 history**

```bash
const nextURL = 'https://my-website.com/page_b';
const nextTitle = 'My new page title';
const nextState = { additionalInformation: 'Updated the URL with JS' };
# 在浏览器历史新建一个入口并且无需重新加载
window.history.pushState(nextState, nextTitle, nextURL);
# 取代当前入口
window.history.replaceState(nextState, nextTitle, nextURL);
```

history api 只允许访问同源网站，所以你不能导航到域名完全不一样的网站

**location**

location api 是比较旧的东西了，它需要重载页面才可以改变浏览器记录

## 获取当前 url

```bash
const getBaseUrl = url =>{
    return url.indexOf('?') >0 ?url.slice(0,url.indexOf('?')):url
}
```

EXAMPLES

```bash
getBaseURL('http://url.com/page?name=Adam&surname=Smith');
# 'http://url.com/page'
```
