---
title: 工具函数
date: 2019-09-16 17:19:58
tags: JavaScript
categories: tool
---

### 防抖
```
function debounce(func, wait) {
    let timeout;
    return function () {
        let context = this;
        let args = arguments;

        if (timeout) clearTimeout(timeout);
        
        timeout = setTimeout(() => {
            func.apply(context, args)
        }, wait);
    }
}
```
<!-- more -->
### 节流
```
function throttle(func, wait) {
    let previous = 0;
    return function() {
        let now = Date.now();
        let context = this;
        let args = arguments;
        if (now - previous > wait) {
            func.apply(context, args);
            previous = now;
        }
    }
}
```
### 判断是否是数组
```
let arr=[];
Array.isArray(arr);
//or
Object.prototype.toString.call(arr) === '[Object Array]';
```

### 时间戳转字符串

```
function getTime(time,joiner){
  if(!time){
    return '';
  }
  let time = new Date(time);
  const year = time.getFullYear();//获取年份
  const month = time.getMonth()+1;//get the month of the time
  const date = time.getDate()<10 ? '0'+time.getDate():time.getDate();//get the day of the time;
  const hour = time.getHours();
  const minute = time.getMinutes();
  const seconds = time.getSeconds();
  const result = `${year}${joiner}${month}${joiner}${date}  ${hour}${joiner}${minute}${joiner}${seconds}`;
  return result;
}
```
### 深合并
```
 * @see merge
 * @param {Object} obj1 Object to merge
 * @returns {Object} Result of all merge properties
 */
function deepMerge(/* obj1, obj2, obj3, ... */) {
  var result = {};
  function assignValue(val, key) {
    if (typeof result[key] === 'object' && typeof val === 'object') {
      result[key] = deepMerge(result[key], val);
    } else if (typeof val === 'object') {
      result[key] = deepMerge({}, val);
    } else {
      result[key] = val;
    }
  }

  for (var i = 0, l = arguments.length; i < l; i++) {
    forEach(arguments[i], assignValue);
  }
  return result;
}
```