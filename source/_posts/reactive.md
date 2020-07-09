---
title: reactive
date: 2020-07-09 11:23:04
tags: TypeScript Vue3
categories: TypeScript Vue3
---

### 前言

vue3出了beta，了解一下响应式数据的实现

### 正题
下面这些是在reactive中导入的外部文件
```bash
import { isObject, toRawType, def, hasOwn, makeMap } from '@vue/shared'##这些都是通用方法
## 两个handler，待会儿说为啥
import {
  mutableHandlers,
  readonlyHandlers,
  shallowReactiveHandlers,
  shallowReadonlyHandlers
} from './baseHandlers' 
import {
  mutableCollectionHandlers,
  readonlyCollectionHandlers,
  shallowCollectionHandlers
} from './collectionHandlers'
## 然后是ref，是为了给primitive类型的value做reactive
import { UnwrapRef, Ref } from './ref'
```
然后是常量定义
```bash
## 枚举类型
export const enum ReactiveFlags {
  SKIP = '__v_skip',
  IS_REACTIVE = '__v_isReactive',
  IS_READONLY = '__v_isReadonly',
  RAW = '__v_raw',
  REACTIVE = '__v_reactive',
  READONLY = '__v_readonly'
}
## 所监听数据中的属性接口
interface Target {
  [ReactiveFlags.SKIP]?: boolean
  [ReactiveFlags.IS_REACTIVE]?: boolean
  [ReactiveFlags.IS_READONLY]?: boolean
  [ReactiveFlags.RAW]?: any
  [ReactiveFlags.REACTIVE]?: any
  [ReactiveFlags.READONLY]?: any
}
```
因为`typeof Map = 'function'`以及Set里面的四个类型都是，所以这里的collectionTypes要变成new Set<Function>
```bash
const collectionTypes = new Set<Function>([Set, Map, WeakMap, WeakSet])
```

然后是判断key是否存在的函数
```bash
 #
 # Make a map and return a function for checking if a key
 # is in that map.
 # IMPORTANT: all calls of this function must be prefixed with
 # \/\*#\_\_PURE\_\_\*\/
 # So that rollup can tree-shake them if necessary.
 #
 # 这个方法是干嘛用的注释写的很清楚了，很显然这是一个闭包，返回的函数是用来判断# key是否存在map中
export function makeMap(
  str: string,
  expectsLowerCase?: boolean
): (key: string) => boolean {
  const map: Record<string, boolean> = Object.create(null)
  const list: Array<string> = str.split(',')
  for (let i = 0; i < list.length; i++) {
    map[list[i]] = true
  }
  return expectsLowerCase ? val => !!map[val.toLowerCase()] : val => !!map[val]
}

const isObservableType = /*#__PURE__*/ makeMap(
  'Object,Array,Map,Set,WeakMap,WeakSet'
)
```


```bash
## 判断value是否能被代理
const canObserve = (value: Target): boolean => {
  return (
    !value[ReactiveFlags.SKIP] &&
    isObservableType(toRawType(value)) &&
    !Object.isFrozen(value)
  )
}
```


```bash
## only unwrap nested ref,用来给嵌套的ref解套
type UnwrapNestedRefs<T> = T extends Ref ? T : UnwrapRef<T>
```

```bash
## 函数定义
export function reactive<T extends object>(target: T): UnwrapNestedRefs<T>
export function reactive(target: object) {
  ## if trying to observe a readonly proxy, return the readonly version.
  ## 如果传进来的数据是只读的，直接返回
  if (target && (target as Target)[ReactiveFlags.IS_READONLY]) {
    return target
  }
  ## 否则就创建响应式对象
  return createReactiveObject(
    target,
    false,
    mutableHandlers,
    mutableCollectionHandlers
  )
}
```
作者的注释都写的很明白了。
```bash
# 只有在属性中不带skip并且类型属于'Object,Array,Map,Set,WeakMap,WeakSet'并且属性没有被冻结的对象才能够被代理
const canObserve = (value: Target): boolean => {
  return (
    !value[ReactiveFlags.SKIP] &&
    isObservableType(toRawType(value)) &&
    !Object.isFrozen(value)
  )
}
const hasOwnProperty = Object.prototype.hasOwnProperty
export const hasOwn = (
  val: object,
  key: string | symbol
): key is keyof typeof val => hasOwnProperty.call(val, key)

function createReactiveObject(
  target: Target,
  isReadonly: boolean,
  baseHandlers: ProxyHandler<any>,
  collectionHandlers: ProxyHandler<any>
) {
  if (!isObject(target)) {
    if (__DEV__) {
      console.warn(`value cannot be made reactive: ${String(target)}`)
    }
    return target
  }
  # target is already a Proxy, return it.
  # exception: calling readonly() on a reactive object
  if (
    target[ReactiveFlags.RAW] &&
    !(isReadonly && target[ReactiveFlags.IS_REACTIVE])
  ) {
    return target
  }
  # target already has corresponding Proxy
  if (
    hasOwn(target, isReadonly ? ReactiveFlags.READONLY : ReactiveFlags.REACTIVE)
  ) {
    return isReadonly
      ? target[ReactiveFlags.READONLY]
      : target[ReactiveFlags.REACTIVE]
  }
  # only a whitelist of value types can be observed.
  if (!canObserve(target)) {
    return target
  }
  const observed = new Proxy(
    target,
    collectionTypes.has(target.constructor) ? collectionHandlers : baseHandlers
  )
  def(
    target,
    isReadonly ? ReactiveFlags.READONLY : ReactiveFlags.REACTIVE,
    observed
  )
  return observed
}
# def函数，显然是在obj定义一个可编写不可枚举的key,将target的响应式对象储存在自身的属性上，这样可以解决自己嵌套自己的无限循环（禁止套娃）
export const def = (obj: object, key: string | symbol, value: any) => {
  Object.defineProperty(obj, key, {
    configurable: true,
    enumerable: false,
    value
  })
}
```
然后这里要说明为什么对target执行代理的时候handler要根据target的contstructor来调用不同的handler，拿Map举例子
```bash
const map = new Map()
const proxy = new Proxy(map,{})
proxy.set(1,1)
```
一执行肯定就报错`Uncaught TypeError: Method Map.prototype.set called on incompatible receiver [object Object]`,提示信息告诉我们代码可以变成这样
```bash
var map = new Map();
var proxy = new Proxy(map, {});
Map.prototype.set.call(proxy, 1, 1);
```
所以这段代码`Map.prototype.set.call(proxy, 1, 1);`为什么这个报错，就是这个问题的核心

那首先，Map这个呢把数据储存在自己的私有内部插槽中，类型[MapData]这样，然后这个插槽是跟Map对象自身绑定的。而Proxy不能完全模仿这样的行为，巧的是，这样的插槽Proxy学不来
```bash
const PRIVATE = new WeakMap();
const obj = {};

PRIVATE.set(obj, "private stuff");

const proxy = new Proxy(obj, {});

PRIVATE.get(proxy) === undefined // true
PRIVATE.get(obj) === "private stuff" // true
```
所以在上面创建响应式对象的时候要根据target的类型是判断用哪个的handler

之前的枚举类型中有定义了`IS_REACTIVE`和`IS_READONLY`，就是用来判断`isReactive`和`isReadonly`，由于创建只读对象的`readonly`方法和创建响应式对象的`reactive`都是通过`createReactiveObject`方法来进行调用的，所以可以通过判断响应式或者只读属性来判断是否是被代理过的对象
```bash
export function isReactive(value: unknown): boolean {
  if (isReadonly(value)) {
    return isReactive((value as Target)[ReactiveFlags.RAW])
  }
  return !!(value && (value as Target)[ReactiveFlags.IS_REACTIVE])
}
export function isReadonly(value: unknown): boolean {
  return !!(value && (value as Target)[ReactiveFlags.IS_READONLY])
}

export function isProxy(value: unknown): boolean {
  return isReactive(value) || isReadonly(value)
}
export function toRaw<T>(observed: T): T {
  return (
    (observed && toRaw((observed as Target)[ReactiveFlags.RAW])) || observed
  )
}
# 这个方法就是不让value值被代理，之前的canObserve中有对SKIP的判断
export function markRaw<T extends object>(value: T): T {
  def(value, ReactiveFlags.SKIP, true)
  return value
}
```
对于`toRaw`这个方法我曾经把它改成这样
```bash
export function toRaw<T>(observed: T): T {
  return (
       observed ? toRaw((observed as Target)[ReactiveFlags.RAW]) : observed
  )
}
```
然后跑了单测，发现所有有关toRaw的测试用例都报错，我靠.然后写了个小demo跑了一下，上面这个代码在进入倒数第二个调用栈的时候，observed是truey，然后进入最后一个调用栈的时候是返回undefined的，然后返回倒数第二个调用栈的时候还是undefined，这样一直到第一个栈返回的结果一直都是undefined.

```bash
export function toRaw<T>(observed: T): T {
  return (
    (observed && toRaw((observed as Target)[ReactiveFlags.RAW])) || observed
  )
}
```
执行这段代码的时候，同样的进入最后一个调用栈的时候返回的是undefined，但是返回倒数第二个调用栈的时候 `observed && undefined`是fasly值，所以倒数第二个调用栈返回的是一个具体的值`observed`,有、东西，智商捉急了。


然后还剩几个方法,这个不用说，很明显是设置只读对象，handler也是有所区别的
```bash
export function readonly<T extends object>(
  target: T
): Readonly<UnwrapNestedRefs<T>> {
  return createReactiveObject(
    target,
    true,
    readonlyHandlers,
    readonlyCollectionHandlers
  )
}
```

```bash
# 浅拷贝，只有第一层的数据才是响应式
# Return a reactive-copy of the original object, where only the root level
# properties are reactive, and does NOT unwrap refs nor recursively convert
# returned properties.
export function shallowReactive<T extends object>(target: T): T {
  return createReactiveObject(
    target,
    false,
    shallowReactiveHandlers,
    shallowCollectionHandlers
  )
}
```

```bash
# 浅只读，不会对ref解套
# Return a reactive-copy of the original object, where only the root level
# properties are readonly, and does NOT unwrap refs nor recursively convert
# returned properties.
# This is used for creating the props proxy object for stateful components.
export function shallowReadonly<T extends object>(
  target: T
): Readonly<{ [K in keyof T]: UnwrapNestedRefs<T[K]> }> {
  return createReactiveObject(
    target,
    true,
    shallowReadonlyHandlers,
    readonlyCollectionHandlers
  )
}
```
OVER