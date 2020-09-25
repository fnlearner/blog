---
title: axios
date: 2020-09-25 14:01:50
tags:
---

### 为什么 axios 既可以用 axios({})这样请求 ，也可以 axios.get()这样请求？

在使`axios.create`的时候,调用了这个方法

```bash
/**
 * Create an instance of Axios
 *
 * @param {Object} defaultConfig The default config for the instance
 * @return {Axios} A new instance of Axios
 */
function createInstance(defaultConfig) {
  var context = new Axios(defaultConfig);//生成配置 和拦截器
  # 在这里，instance 是一个 wrapped 函数，将context作为参数传递给request，所以调用axios({})就是在调用request({})
  var instance = bind(Axios.prototype.request, context);

  #Copy axios.prototype to instance
  # 这个是把Axios原型链的东西挂载到instance上去
  # 因为instance 是个一个functoin，所以在直接赋值的时候不能直接看到
  # 能在instance 的prototype上可以看到
  # 所以在调用类似axios.get(）这类的方法是能正常运行
  utils.extend(instance, Axios.prototype, context);

  # Copy context to instance
  utils.extend(instance, context);
  # console.log(instance)
  return instance;
}
```

从图中可以看到,方法之类的确实挂载到了原型链上
![prototype](/images/axios/prototype.png)

### cancalToken 怎么取消请求的

那么其实什么时候需要取消请求，举一个很常见的例子，取消重复请求，就是当前已经发出请求的情况下，后续同样的请求如果发送就会被取消（如果是表单的提交也可以使用 dom 的 disabld 禁止点击 2333）
举个栗子：
在 axios 上是挂载了 Cancel 相应的东西

- axios.Cancel = require('./cancel/Cancel');
- axios.CancelToken = require('./cancel/CancelToken');
- axios.isCancel = require('./cancel/isCancel');

```bash
 var data = document.getElementById("data").value;
          const CancelToken = axios.CancelToken;
          axios
            .post(
              "/post/server",
              {
                data,
              },
              {
                cancelToken: new CancelToken((c) => {
                  cancel = c;
                  console.log(c)
                }),
              }
            )
            .then(function (res) {
              output.className = "container";
              output.innerHTML = res.data;
            })
            .catch(function (err) {
              output.className = "container text-danger";
              output.innerHTML = err.message;
            });
          cancel('sdfsd');
```

然后这里 axios.post 实际上就是调用了`request`方法，方法的返回值是一个 promise，最后一个执行的 promise 是一个叫`dispatchRequest`的函数，函数位置在 core/dispatchRequest.js 文件下，因为返回的是一个 promise ，状态是 pendding，加入到微任务队列，然后执行主线程的`cancel`方法。cancel 方法是在初始化 cancelToken 的时候给 cancel 赋值了。

`cancelToken：`

```bash

function CancelToken(executor) {
  if (typeof executor !== 'function') {
    throw new TypeError('executor must be a function.');
  }

  var resolvePromise;
  # 这里把resolve钩子赋值给resolvePromise 为了让cancel函数能够改变promise的状态
  this.promise = new Promise(function promiseExecutor(resolve) {
    resolvePromise = resolve;
  });

  var token = this;
  executor(function cancel(message) {
    if (token.reason) {
      # Cancellation has already been requested
      return;
    }

    token.reason = new Cancel(message);
    # 这里改变promise状态位fulfilled
    resolvePromise(token.reason);
  });
}
```

主线程任务执行完成的时候开始进入下一轮任务执行，没有宏任务需要执行，直接执行微任务，先执行刚刚 request 返回的 promise，其实是开始执行了`dispatchRequest`

```bash

module.exports = function dispatchRequest(config) {
  throwIfCancellationRequested(config);
  # 省略其他代码
}
/**
 * Throws a `Cancel` if cancellation has been requested.
 */
function throwIfCancellationRequested(config) {
  if (config.cancelToken) {
      # 这个方法挂载在canceltoken原型链傻姑娘
    config.cancelToken.throwIfRequested();
  }
}
CancelToken.prototype.throwIfRequested = function throwIfRequested() {
  if (this.reason) {
      # 这里抛出错误，然后在主程序代码中的catch捕获，然后程序返回，不进行后续创建xhr对象的过程
    throw this.reason;
  }
};
```

在xhr文件中看到有一段代码，长这样:
```bash
if (config.cancelToken) {
      // Handle cancellation
      config.cancelToken.promise.then(function onCanceled(cancel) {
        if (!request) {
          return;
        }

        request.abort();
        reject(cancel);
        // Clean up request
        request = null;
      });
    }
```
那么上文中的resolvePromise改变后的promise就是在这里调用，那什么情况会到这里来执行请求，假如有A，B两个请求，A请求响应时间过长，然后等到B执行回调都回来的时候，直接把A请求给取（gan）消(diao)了

