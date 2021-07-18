---
title: polyfill
date: 2021-07-13 18:59:58
tags: JavaScript
---

## Promise.all

```js
Promise.all = function (promises) {
  let results = [];
  return new Promise((resolve, reject) => {
    promises.forEach((p, index) => {
      p.then((result) => {
        results.push(result);
        if (index === promises.length - 1) {
          resolve(results);
        }
      }).catch((err) => reject(err));
    });
  });
};
```

## Promise.any

```js
Promise.any = function (promises) {
  const result = [];
  return new Promise((resolve, reject) => {
    promises.forEach((item, index) => {
      item
        .then((res) => resolve(res))
        .catch((error) => {
          result.push(error);
          if (index === pro mises.length - 1) {
              // 如果全部都失败，返回结果合集
            reject(result);
          }
        });
    });
  });
};
```
