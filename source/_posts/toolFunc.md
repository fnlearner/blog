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

###  判断对象类型

```
Object.toType = (function toType(global) {
  return function(obj) {
    if (obj === global) {
      return "global";
    }
    return ({}).toString.call(obj).match(/\s([a-z|A-Z]+)/)[1].toLowerCase();
  }
})(this)
```

### 用promsie异步加载图像

```
functin load(image,attributes){
  	if (!image) {
		return Promise.reject();
	} else if (typeof image === 'string') {
		/* Create a <img> from a string */
		const src = image;
		image = new Image();
		Object.keys(attributes || {}).forEach(
			name => image.setAttribute(name, attributes[name])
		);
		image.src = src;
	} else if (image.length !== undefined) {
		/* Treat as multiple images */

		// Momentarily ignore errors
		const reflected = [].map.call(image, img => load(img, attributes).catch(err => err));

		return Promise.all(reflected).then(results => {
			const loaded = results.filter(x => x.naturalWidth);
			if (loaded.length === results.length) {
				return loaded;
			}
			return Promise.reject({
				loaded,
				errored: results.filter(x => !x.naturalWidth)
			});
		});
	} else if (image.tagName.toUpperCase() !== 'IMG') {
		return Promise.reject();
	}

	const promise = new Promise((resolve, reject) => {
		if (image.naturalWidth) {
			// If the browser can determine the naturalWidth the
			// image is already loaded successfully
			resolve(image);
		} else if (image.complete) {
			// If the image is complete but the naturalWidth is 0px
			// it is probably broken
			reject(image);
		} else {
			image.addEventListener('load', fulfill);
			image.addEventListener('error', fulfill);
		}
		function fulfill() {
			if (image.naturalWidth) {
				resolve(image);
			} else {
				reject(image);
			}
			image.removeEventListener('load', fulfill);
			image.removeEventListener('error', fulfill);
		}
	});
	promise.image = image;
	return promise;
}
```

### 获取类型
({}).toString.call(obj) 的用法与 Object.prototype.toString.call(obj)一样。这两个返回的格式是[object [class]].
```
const toType = (obj) =>{
   return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase()
}
toType({a: 4}); //"object"
toType([1, 2, 3]); //"array"
(function() {console.log(toType(arguments))})(); //arguments
toType(new ReferenceError); //"error"
toType(new Date); //"date"
toType(/a-z/); //"regexp"
toType(Math); //"math"
toType(JSON); //"json"
toType(new Number(4)); //"number"
toType(new String("abc")); //"string"
toType(new Boolean(true)); //"boolean"

//typeof 也可以判断类型,但是只能获取基本类型，引用类型统一返回object，所以尽量用toType的方法;instanceof也可以,然鹅instanceof是基于原型链判断的，如果继承的话
  class MyArray extends Array{
    constructor(){
      super()
    }
  }

  const myArray = new MyArray();
  console.log(`Array: ${myArray instanceof Array}`);
  console.log(`MyArray :${myArray instanceof MyArray}`);
  //这样两个返回的都是true

```

几个内置对象没有构造函数，因此不能用instanceof来判断类型
```
Math instanceof Math //TypeError
```
一个window可以包含多个iframe框架，意味着包含多个全局上下文，因此意味着每个类型有多个构造器，在这样的环境下，给定的对象类型不能保证是给定的构造函数的实例
```
const ifFrame = document.createElement('iframe');
document.body.appendChild(ifFrame);
const IFrameArray = window.frames[1].Array; 
const array = new IFrameArray();

array instanceof IFrameArray //true
array instanceof Array // false
```
由于array的constructor是iframe中的Array,因此即使array 与 此时的window上下文中的Array都是数组范畴，但是instanceof是基于原型链来判断的，array的原型链是并没有指向当前window下的Array,因此array instanceof Array 为 false

之前的toType有个问题,当toType的传参是window,window内置方法以及DOM时，有很长一串的结果返回时
```
toType(window);
//"global" (Chrome) "domwindow" (Safari) "window" (FF/IE9) "object" (IE7/IE8)
 
toType(document);
//"htmldocument" (Chrome/FF/Safari) "document" (IE9) "object" (IE7/IE8)
 
toType(document.createElement('a'));
//"htmlanchorelement" (Chrome/FF/Safari/IE) "object" (IE7/IE8)
 
toType(alert);
//"function" (Chrome/FF/Safari/IE9) "object" (IE7/IE8)
```
改进一下toType方法,将这个方法挂载到Object上,但是不要挂载到prototype上，将这个方法写成IIFE+闭包
```
Object.toType = (function toType(global) {
  return function(obj) {
    if (obj === global) {
      return "global";
    }
    return ({}).toString.call(obj).match(/\s([a-z|A-Z]+)/)[1].toLowerCase();
  }
})(this)
Object.toType(window); //"global" (all browsers)
Object.toType([1,2,3]); //"array" (all browsers)
Object.toType(/a-z/); //"regexp" (all browsers)
Object.toType(JSON); //"json" (all browsers)
```
这个方法也不是万能的,如果扔进来一个未知类型,则会抛出异常
```
Object.toType(fff)//ReferenceError
```
玩个好玩的，应该可以用具名组匹配来获取类型
```
Object.toType = (function(global){
    const reg = /(?<type>(?<=\s+?)[A-Za-z]+)/;
    return function(obj){
      if(obj === global){
          return 'global';
      }
      const matchObj = reg.exec(Object.prototype.toString.call(obj));
      const type =  matchObj.groups.type;
      return type;
    }
})(this)
```
### takeRightWhile

```
const takeRightWhile = (arr, func) =>
  arr.reduceRight((acc, el) => (func(el) ? acc : [el, ...acc]), []);
```
用法
```
takeRightWhile([1, 2, 3, 4], n => n < 3); // [3, 4]
```

### zip

```
const zip = (...arrays) => {
  const maxLength = Math.max(...arrays.map(x => x.length));
  return Array.from({ length: maxLength }).map((_, i) => {
    return Array.from({ length: arrays.length }, (_, k) => arrays[k][i]);
  });
};
```
用法
```
zip(['a', 'b'], [1, 2], [true, false]); // [['a', 1, true], ['b', 2, false]]
zip(['a'], [1, 2], [true, false]); // [['a', 1, true], [undefined, 2, false]]
```

### 聚合函数

```
//单个参数
const pipe = (...fns) => x => {
    return fns.reduceRight((v,fn)=>{
       return fn(v);
    },x)
}
```
用法

```
const square = v => v+1;
const double = v => v+2;
const addOne = v => v+3;

const res = pipe(square,double,addOne);
res(3)//9
```

### elementIsVisibleInViewport

```
const elementIsVisibleInViewport = (el, partiallyVisible = false) => {
  const { top, left, bottom, right } = el.getBoundingClientRect();
  const { innerHeight, innerWidth } = window;
  return partiallyVisible
    ? ((top > 0 && top < innerHeight) || (bottom > 0 && bottom < innerHeight)) &&
        ((left > 0 && left < innerWidth) || (right > 0 && right < innerWidth))
    : top >= 0 && left >= 0 && bottom <= innerHeight && right <= innerWidth;
};
```
用法
```
elementIsVisibleInViewport(el); // false - (not fully visible)
elementIsVisibleInViewport(el, true); // true - (partially visible)
```

### 聚合函数(2)

```
//第一个函数允许多个参数，剩余函数仅允许一个参数
const composeRight = (...fns) => fns.reduce((f,g)=>(...args)=>g(f(...args)));
```
用法
```
const add =(x,y) => x+y;
const square = x => x**2;
const addAndSquare = composeRight(add,square);
```

### uniqueSymmetricDifference

```
const uniqueSymmetricDifference = (a, b) => [
  ...new Set([...a.filter(v => !b.includes(v)), ...b.filter(v => !a.includes(v))])
];
```
用法
```
uniqueSymmetricDifference([1, 2, 3], [1, 2, 4]); // [3, 4]
```

### 获取长度
```
const size = val =>
    Array.isArray(val)
        ? val.length
        : val && typeof val === 'object'
        ? val.size || val.length || Object.keys(val).length
        : typeof val === 'string'
            ? new Blob([val]).size
            : 0;
```


### initialArrayWithRangeRight
```
const initialArrayWithRangeRight = (end,start = 0, step = 1) => {
    return Array.from({length:Math.ceil(end-start+1)/step}).map((v,i,arr)=>{
        return (arr.length-i-1)*step+start;
    });
}
```
用法
```
initialArrayWithRangeRight(5)// [5,4,3,2,1,0]
```

### 创建加密hash
```
const hashBrowser = val =>
  crypto.subtle.digest('SHA-256', new TextEncoder('utf-8').encode(val)).then(h => {
    let hexes = [],
      view = new DataView(h);
    for (let i = 0; i < view.byteLength; i += 4)
      hexes.push(('00000000' + view.getUint32(i).toString(16)).slice(-8));
    return hexes.join('');
  });
```
用法
```
hashBrowser(JSON.stringify({ a: 'a', b: [1, 2, 3, 4], foo: { c: 'bar' } })).then(console.log); // '04aa106279f5977f59f9067fa9712afc4aedc6f5862a8defc34552d8c7206393'
```