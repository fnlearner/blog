---
title: 今日随笔(2-10)
date: 2021-02-10 15:13:29
tags: JavsScript 
---

#### NaN 和 Number.isNaN
---
全局属性 NaN 的值表示不是一个数字（Not-A-Number）。

NaN 属性的初始值就是 NaN，和 Number.NaN 的值一样。在现代浏览器中（ES5中）， NaN 属性是一个不可配置（non-configurable），不可写（non-writable）的属性。但在ES3中，这个属性的值是可以被更改的，但是也应该避免覆盖。  --- mdn


NaN是唯一一个自身不相等的数字，判断一个值是否是NaN，主要是用两种方法来判断，一个是NaN，一个是Number.isNaN。

```bash
NaN === NaN;        // false
Number.NaN === NaN; // false
isNaN(NaN);         // true
isNaN(Number.NaN);  // true

function valueIsNaN(v) { return v !== v; }
valueIsNaN(1);          // false
valueIsNaN(NaN);        // true
valueIsNaN(Number.NaN); // true
```
对于两个方法还是有所不同的：如果当前值是NaN，或者将其强制转换为数字后将是NaN，则前者将返回true。而后者仅当值当前为NaN时才为true：
```bash
isNaN('hello world');        // true 'hello world'转数字失败变成NaN。
Number.isNaN('hello world'); // false
```

对于NaN方法：

- Let num be ? ToNumber(number).
- If num is NaN, return true.
- Otherwise, return false.

而对于Number.isNaN来说：

- If Type(number) is not Number, return false.
- If number is NaN, return true.
- Otherwise, return false.


可以看到规范中定义的两个方法在第一步中对传递进来对参数的处理方式并不一样。因此这两个方法是有所区别的。