---
title: 今日随笔(1-31)
date: 2021-01-31 15:30:19
tags: JavaScript
---

### null vs undefined

The ECMAScript language specification describes them as follows:

- undefined 是被使用但是没有被赋值
- null 是对变量一个显示对声明一个值

在JS中，每个变量能够同时被赋值引用类型和原始类型。因此，如果null意味着 不是一个对象，JS也需要一个初值意味着 既不是 引用类型 也不是 原始类型。那个值就是undefined。

<!-- more -->
If a variable myVar has not been initialized yet, its value is undefined:

```bash
let myVar;
assert.equal(myVar, undefined);
```

If a property .unknownProp is missing, accessing the property produces the values undefined:
```bash
const obj = {};
assert.equal(obj.unknownProp, undefined);
```

If a function does not explicitly return anything, the function implicitly returns undefined:
```bash
function myFunc() {}
assert.equal(myFunc(), undefined);
```

If a function has a return statement without an argument, the function implicitly returns undefined:

```bash
function myFunc() {
  return;
}
assert.equal(myFunc(), undefined);
```

If a parameter x is omitted, the language initializes that parameter with undefined:

```bash
function myFunc(x) {
  assert.equal(x, undefined);
}
myFunc();
```

Optional chaining via obj?.someProp returns undefined if obj is undefined or null:

```bash
 > undefined?.someProp
undefined
> null?.someProp
undefined
```

The prototype of an object is either an object or, at the end of a chain of prototypes, null. Object.prototype does not have a prototype:

```bash
> Object.getPrototypeOf(Object.prototype)
null
```

If we match a regular expression (such as /a/) against a string (such as 'x'), we either get an object with matching data (if matching was successful) or null (if matching failed)(有结果就返回匹配对象，没结果返回null):
```bash
> /a/.exec('x')
null
```

The JSON data format does not support undefined, only null:

```bash
> JSON.stringify({a: undefined, b: null})
'{"b":null}'
```

### Operators that treat undefined and/or null specially 

#### undefined and parameter default values 

参数默认值的使用情况：
- 参数没传
- 参数的值是undefined

For example
```bash
function myFunc(arg='abc') {
  return arg;
}
assert.equal(myFunc('hello'), 'hello');
assert.equal(myFunc(), 'abc');
assert.equal(myFunc(undefined), 'abc');
```
#### undefined and destructuring default values  

解构给默认值跟参数给默认值一样，匹配到undefined给默认值
Default values in destructuring work similarly to parameter default values – they are used if a variable either has no match in the data or if it matches undefined:

```bash
const [a='a'] = [];
assert.equal(a, 'a');

const [b='b'] = [undefined];
assert.equal(b, 'b');

const {prop: c='c'} = {};
assert.equal(c, 'c');

const {prop: d='d'} = {prop: undefined};
assert.equal(d, 'd');
```

#### undefined and null and optional chaining  
When there is optional chaining via value?.prop:

- If value is undefined or null, return undefined. That is, this happens whenever value.prop would throw an exception.
- Otherwise, return value.prop.

```bash
function getProp(value) {
  # optional static property access
  return value?.prop;
}
assert.equal(
  getProp({prop: 123}), 123);
assert.equal(
  getProp(undefined), undefined);
assert.equal(
  getProp(null), undefined);
```

The following two operations work similarly:

```bash
obj?.[«expr»] // optional dynamic property access
func?.(«arg0», «arg1») // optional function or method call
```

#### undefined and null and nullish coalescing  

nullish coalescing 的使用比较 简单，如果值是undefined 或者null的时候取后者
```bash
> undefined ?? 'default value'
'default value'
> null ?? 'default value'
'default value'

> 0 ?? 'default value'
0
> 123 ?? 'default value'
123
> '' ?? 'default value'
''
> 'abc' ?? 'default value'
'abc'
```

The nullish coalescing assignment operator ??= combines nullish coalescing with assignment:

??=  就是把 取值和赋值合起来
```bash
function setName(obj) {
  obj.name ??= '(Unnamed)';
  return obj;
}
assert.deepEqual(
  setName({}),
  {name: '(Unnamed)'}
);
assert.deepEqual(
  setName({name: undefined}),
  {name: '(Unnamed)'}
);
assert.deepEqual(
  setName({name: null}),
  {name: '(Unnamed)'}
);
assert.deepEqual(
  setName({name: 'Jane'}),
  {name: 'Jane'}
);
```