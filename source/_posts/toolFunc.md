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
function getTime(_time,joiner,joiner2){
  if(!time){
    return '';
  }
  let time = new Date(_time);
  const year = time.getFullYear();//获取年份
  const month = time.getMonth()+1;//get the month of the time
  const date = time.getDate()<10 ? '0'+time.getDate():time.getDate();//get the day of the time;
  const hour = time.getHours();
  const minute = time.getMinutes();
  const seconds = time.getSeconds();
  const result = `${year}${joiner}${month}${joiner}${date}  ${hour}${joiner2}${minute}${joiner2}${seconds}`;
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

### 正则表达式
```
const matchTime = /(?<=\s+\-\s+)(.)+|(.)+(?=\s+\-\s+)/g;//将xx年xx月xx日-xx年xx月xx日的时间格式切割
const regx_positiveInt = /^[0-9]*[1-9][0-9]*$/; //正整数
const regx_positiveAndZeroInt = /^\d+$/; //非负整数（正整数和0）
const regx_number = /^[0-9]*$/;//数字
const regx_ip=/^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$/;//IP地址
```

### 大数相加
由于JavaScript中不管整数还是小数都是Number类型，它的实现是遵循 IEEE 754标准，储存方式是以双精度浮点数储存的，可以表示十进制的15或者16位有效数字，所以当进行运算的数字超过这个范围的时候，就会用有精度缺失的问题，导致计算不准确，所以在大数加减的时候需要转成字符串来做，或者es6+有个BigInt类型也支持做大数加减，或者可以选择npm上的大数加减插件，比如number-precision
```
  var addStrings = function(num1, num2) {
    const maxLen = Math.max.apply(null, [num1.length, num2.length]);
    let result = "";
    let ans = 0;
    if(num1.length<maxLen){
        num1 = num1.padStart(maxLen, "0");
    }
    if(num2.length<maxLen){
        num2 = num2.padStart(maxLen, "0");
    }
    for (let i = maxLen - 1; i >= 0; --i) {
      const temp =ans+Number(num1[i]) + Number(num2[i]);
      result=(temp % 10)+result;
      ans = Math.floor(temp / 10);
    }
    console.log(result);
    return ans===1?ans+ result:result;
  };
```

### 深克隆
```
const isObject = (item)=>{
  return Object.prototype.toString.call(item) === '[object Object]';
}
const isArray = (item)=>{
  return Object.prototype.toString.call(item) === '[object Array]';
}
const isDate = item =>{
  return Object.prototype.toString.call(item) === '[object Date]';
}
const isFunction = item =>{
  return Object.prototype.toString.call(item) === '[object Function]';
}
const deepClone=function(obj){
    const cloneObj=isArray(obj)?[]:isObject(obj)?{}:'';
    for(let key in obj){
      if(obj.hasOwnProperty(key)){
        if(isObject(obj[key])||isArray(obj[key])){
          Object.assign(cloneObj,{
           [key]: deepClone(Reflect.get(obj,key))
          });
        }
        else{
          cloneObj[key] = obj[key];
        }  
      }
    }
    return cloneObj;
}
function deepCopy(original) {
  if (Array.isArray(original)) {
    return original.map(elem => deepCopy(elem));
  } else if (typeof original === 'object' && original !== null) {
    return Object.fromEntries(
      Object.entries(original)
        .map(([k, v]) => [k, deepCopy(v)]));
  } else {
    // Primitive value: atomic, no need to copy
    return original;
  }
}

```
### 深层更新
```
function deepUpdate(original, keys, value) {
  if (keys.length === 0) {
    return value;
  }
  const currentKey = keys[0];
  if (Array.isArray(original)) {
    return original.map(
      (v, index) => index === currentKey
        ? deepUpdate(v, keys.slice(1), value) // (A)
        : v); // (B)
  } else if (typeof original === 'object' && original !== null) {
    return Object.fromEntries(
      Object.entries(original).map(
        (keyValuePair) => {
          const [k,v] = keyValuePair;
          if (k === currentKey) {
            return [k, deepUpdate(v, keys.slice(1), value)]; // (C)
          } else {
            return keyValuePair; // (D)
          }
        }));
  } else {
    // Primitive value
    return original;
  }
}

```
### 深层冻结
```
function deepFreeze(value) {
  if (Array.isArray(value)) {
    for (const element of value) {
      deepFreeze(element);
    }
    Object.freeze(value);
  } else if (typeof value === 'object' && value !== null) {
    for (const v of Object.values(value)) {
      deepFreeze(v);
    }
    Object.freeze(value);
  } else {
    // Nothing to do: primitive values are already immutable
  } 
  return value;
}
```
### 基于现有对象的自定义方法

PS:(不建议直接污染原型链，类型Date.prototype.xxx=function(){}这样的写法)

个人比较喜欢寄生组合继承或者es6的calss继承，比如要写一个基于Date的format方法

```
class DateSelf extends Date{
  constructor(){
    super();
  }
  getAll(begin,end){
    let arr=[];
    var ab = begin.split("-");
    var ae = end.split("-");
    var db = new Date();
    db.setUTCFullYear(ab[0], ab[1] - 1, ab[2]);
    var de = new Date();
    de.setUTCFullYear(ae[0], ae[1] - 1, ae[2]);
    var unixDb = db.getTime();
    var unixDe = de.getTime();
    for (var k = unixDb; k <= unixDe;) {
        // arr.push((new Date(parseInt(k))).format());
        arr.push((DateSelf.formatter(parseInt(k))))
        k = k + 24 * 60 * 60 * 1000;
    }
    return arr;
  }
}
DateSelf.formatter=function(time){
  var s = '';
  const k =  new Date(time)
  var mouth = (k.getMonth() + 1)>=10?(k.getMonth() + 1):('0'+(k.getMonth() + 1));
  var day = k.getDate()>=10?k.getDate():('0'+k.getDate());
  s += k.getFullYear() + '-'; // 获取年份。
  s += mouth + "-"; // 获取月份。
  s += day; // 获取日。
  return (s); // 返回日期。
}
```


