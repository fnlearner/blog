---
title: 节流
date: 2021-02-19 21:10:15
tags: JavaScript
---
##### 创建一个节流函数在给定的毫秒中最多调用一次

Creates a throttled function that only invokes the provided function at most once per every wait milliseconds

---
使用setTimeout 和 clearTimeout 对给定对方法节流。fn使用`Function.prototype.apply()`this上下文应用到函数中并且提供必要到参数arguments。使用`Date.now()`收集上一次函数的调用时间。没有给定第二个参数 `wait`的情况，默认设置时间间隔为0
<!-- more -->
```js
const throttle = (fn, wait) => {
  let inThrottle, lastFn, lastTime;
  return function() {
    const context = this,
      args = arguments;
    if (!inThrottle) {
      fn.apply(context, args);
      lastTime = Date.now();
      inThrottle = true;
    } else {
      clearTimeout(lastFn);
      lastFn = setTimeout(function() {
        if (Date.now() - lastTime >= wait) {
          fn.apply(context, args);
          lastTime = Date.now();
        }
      }, Math.max(wait - (Date.now() - lastTime), 0));
    }
  };
};

```

---
##### for instance
```js
window.addEventListener(
  'resize',
  throttle(function(evt) {
    console.log(window.innerWidth);
    console.log(window.innerHeight);
  }, 250)
); 
```