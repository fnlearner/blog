---
title: 响应式模块
date: 2020-07-09 11:23:04
tags:
  - TypeScript
  - Vue3
categories:
  - TypeScript
  - Vue3
---

### 前言

vue3 出了 beta，了解一下响应式数据的实现

### 正文

#### reactive

下面这些是在 reactive 中导入的外部文件

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

<!-- more -->

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

因为`typeof Map = 'function'`以及 Set 里面的四个类型都是，所以这里的 collectionTypes 要变成 new Set<Function>

```bash
const collectionTypes = new Set<Function>([Set, Map, WeakMap, WeakSet])
```

然后是判断 key 是否存在的函数

```bash
 #
 # Make a map and return a function for checking if a key
 # is in that map.
 # IMPORTANT: all calls of this function must be prefixed with
 # \/\*#\_\_PURE\_\_\*\/
 # So that rollup can tree-shake them if necessary.
 #
 # 这个方法是干嘛用的注释写的很清楚了，很显然这是一个闭包，返回的函数是用来判断# key是否存在map中,在调用方法时要在前片加例子中的pure 让rollup能够tree-shake
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

然后这里要说明为什么对 target 执行代理的时候 handler 要根据 target 的 contstructor 来调用不同的 handler，拿 Map 举例子

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

那首先，Map 这个呢把数据储存在自己的私有内部插槽中，类型[MapData]这样，然后这个插槽是跟 Map 对象自身绑定的。而 Proxy 不能完全模仿这样的行为，巧的是，这样的插槽 Proxy 学不来，所以在给它们做代理的时候把调用的实例重新指向 Map 这类结构的实例再进行调用实例方法就行

```bash
const PRIVATE = new WeakMap();
const obj = {};

PRIVATE.set(obj, "private stuff");

const proxy = new Proxy(obj, {});

PRIVATE.get(proxy) === undefined // true
PRIVATE.get(obj) === "private stuff" // true
```

所以在上面创建响应式对象的时候要根据 target 的类型是判断用哪个的 handler

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
# 获取原始数据
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

然后跑了单测，发现所有有关 toRaw 的测试用例都报错，我靠.然后写了个小 demo 跑了一下，上面这个代码在进入倒数第二个调用栈的时候，observed 是 truthy，然后进入最后一个调用栈的时候是返回 undefined 的，然后返回倒数第二个调用栈的时候还是 undefined，这样一直到第一个栈返回的结果一直都是 undefined.

```bash
export function toRaw<T>(observed: T): T {
  return (
    (observed && toRaw((observed as Target)[ReactiveFlags.RAW])) || observed
  )
}
```

执行这段代码的时候，同样的进入最后一个调用栈的时候返回的是 undefined，但是返回倒数第二个调用栈的时候 `observed && undefined`是 fasly 值，所以倒数第二个调用栈返回的是一个具体的值`observed`,有、东西，智商捉急了。

然后还剩几个方法,这个不用说，很明显是设置只读对象，handler 也是有所区别的

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

#### baseHandler

</br>
</br>
导入方法
```bash
import { reactive, readonly, toRaw, ReactiveFlags } from './reactive'
import { TrackOpTypes, TriggerOpTypes } from './operations'
import { track, trigger, ITERATE_KEY } from './effect'
import {
  isObject,
  hasOwn,
  isSymbol,
  hasChanged,
  isArray,
  extend
} from '@vue/shared'
import { isRef } from './ref'
```
获取Symbol的属性名
```bash
const builtInSymbols = new Set(
  Object.getOwnPropertyNames(Symbol)
    .map(key => (Symbol as any)[key])
    .filter(isSymbol)
)
```
看名字就知道干嘛的
```bash
const get = /*#__PURE__*/ createGetter()
const shallowGet = /*#__PURE__*/ createGetter(false, true)
const readonlyGet = /*#__PURE__*/ createGetter(true)
const shallowReadonlyGet = /*#__PURE__*/ createGetter(true, true)
```

对数组的这三个方法插桩，看的时候有个问题，为什么有个条件分支是`res === -1 || res === false`的时候继续执行，什么情况下会进入这个分支？

```bash
const arrayInstrumentations: Record<string, Function> = {}
;['includes', 'indexOf', 'lastIndexOf'].forEach(key => {
  arrayInstrumentations[key] = function(...args: any[]): any {
    const arr = toRaw(this) as any
    for (let i = 0, l = (this as any).length; i < l; i++) {
      track(arr, TrackOpTypes.GET, i + '')
    }
    ## we run the method using the original args first (which may be reactive)
    ## console.log(key,...args)
    const res = arr[key](...args)
    if (res === -1 || res === false) {
      ## if that didn't work, run it again using raw values.
      return arr[key](...args.map(toRaw))
    } else {
      return res
    }
    ## return res
  }
})
```

把 if 的条件分支注释，只留下`return res`这个分支，然后跑单测，发现 reactiveArray.spec.ts 这个测试文件的测试用例`× Array identity methods should work with raw values (16 ms)`测试不通过。发现是在这里的时候不能测试通过

```bash
const raw = {}
const arr = reactive([{}, {}])
arr.push(raw)
## 省略其他代码
# should work also for the observed version
const observed = arr[2]
expect(arr.indexOf(observed)).toBe(2)
```

然后将测试不通过代码拷贝到 vite 的 app 中进行调试，发现是 observed 这个值不再是跟 raw 一样的{},猜测是劫持了数组的 get 方法并且对返回值进行了修改。然后进入到`createGetter`这个方法，其中有个逻辑,如果参数是对象，那么就要转成响应式对象。

```bash
if (isObject(res)) {
    # Convert returned value into a proxy as well. we do the isObject check
    # here to avoid invalid value warning. Also need to lazy access readonly
    # and reactive here to avoid circular dependency.
    return isReadonly ? readonly(res) : reactive(res);
}
```

很显然，`typeof {} === 'object'`，所以这个时候的 observed 不再是单纯的`{}`，它是一个响应式的`{}`，所以就能解释为什么在`res === -1 || res === false`的时候还要进行次函数执行的过程，这是为了防止获取到的值是经过转换的值，所以在分支里面的参数要对参数进行一次还原，SKR。

下面这个就是劫持了 get 的方法，一条条逻辑看

```bash
function createGetter(isReadonly = false, shallow = false) {
  return function get(target: object, key: string | symbol, receiver: object) {
    if (key === ReactiveFlags.IS_REACTIVE) {
      return !isReadonly
    } else if (key === ReactiveFlags.IS_READONLY) {
      return isReadonly
    } else if (
      key === ReactiveFlags.RAW &&
      receiver ===
        (isReadonly
          ? (target as any)[ReactiveFlags.READONLY]
          : (target as any)[ReactiveFlags.REACTIVE])
    ) {
      return target
    }

    const targetIsArray = isArray(target)
    if (targetIsArray && hasOwn(arrayInstrumentations, key)) {
      return Reflect.get(arrayInstrumentations, key, receiver)
    }

    const res = Reflect.get(target, key, receiver)

    if (
      isSymbol(key)
        ? builtInSymbols.has(key)
        : key === `__proto__` || key === `__v_isRef`
    ) {
      return res
    }

    if (!isReadonly) {
      track(target, TrackOpTypes.GET, key)
    }

    if (shallow) {
      return res
    }

    if (isRef(res)) {
      # ref unwrapping, only for Objects, not for Arrays
      # 对于ref的解套，仅仅针对object，不针对数组.
      return targetIsArray ? res : res.value
    }

    if (isObject(res)) {
      # Convert returned value into a proxy as well. we do the isObject check
      # here to avoid invalid value warning. Also need to lazy access readonly
      # and reactive here to avoid circular dependency.
      return isReadonly ? readonly(res) : reactive(res)
    }

    return res
  }
}
```

先看这个,老样子，先注释，跑单测，看结果

```bash
if (key === ReactiveFlags.IS_REACTIVE) {
      return !isReadonly
}
```

结果:
![code3](/images/reactive/code3.png)
可以看到是`reactivity/reactive/Array › should make Array reactive`这个测试用例中的某个用例出现了问题，来看具体问题代码

```bash
    const observed = reactive(original)
    expect(observed).not.toBe(original)
    # 下面这段是问题代码
    expect(isReactive(observed)).toBe(true)
```

看`isReactive`方法

```bash
export function isReactive(value: unknown): boolean {
  if (isReadonly(value)) {
    return isReactive((value as Target)[ReactiveFlags.RAW])
  }
  return !!(value && (value as Target)[ReactiveFlags.IS_REACTIVE])
}
```

那现在可以看出，是在数组访问`ReactiveFlags.IS_REACTIVE`这个 key 的时候被劫持了，然后进

```
if (key === ReactiveFlags.IS_REACTIVE) {
      return !isReadonly
}
```

这个逻辑，至于为什么返回结果要对`isReadonly`取反，很显然，在`createReactiveObject`的时候 reactive 和 readonly 是互斥的关系，那么一个对象不是只读很显然就是响应式,那如果是原始对象呢？很显然，原始对象没有`__v_isReactive`这个属性，那么会返回 undefined，用!!转义就是 false；然后`key === ReactiveFlags.IS_READONLY`这个分支的逻辑就跟`REACTIVE`的逻辑一样的。

然后我把第三个分支给注释，WDM，直接爆栈了。。。
</br>
`RangeError: Maximum call stack size exceeded at Object.get (<anonymous>)`
四个测试用例没通过，我选了其中一个测试用例来复现`Array identity methods should work with raw values`

```bash
    const raw = {}
    const arr = reactive([{}, {}])
    arr.push(raw)
   console.log(arr.indexOf(raw))
```

然后跟着代码走，先进入 indexOf 的这个方法，这个方法是被劫持的,走到这里

```bash
['includes', 'indexOf', 'lastIndexOf'].forEach(key => {
    arrayInstrumentations[key] = function (...args) {
        # 1 这里需要获取当前数组的原始数据,然后会在this中访问__v_raw属性，接着就进入劫持的get方法
        const arr = toRaw(this);
        for (let i = 0, l = this.length; i < l; i++) {
            track(arr, "get" /* GET */, i + '');
        }
        # we run the method using the original args first (which may be reactive)
        # 2
        const res = arr[key](...args);
        if (res === -1 || res === false) {
            # if that didn't work, run it again using raw values.
            return arr[key](...args.map(toRaw));
        }
        else {
            return res;
        }
    };
});

# 当1执行的时候，跳到get的时候此时的key是__v_raw
# 这里截取get方法的一部分，第三个分支被我删去，此时不会直接return，而是继续往下执行，此时
# 的return res是undefined,然后在返回toRaw方法的时候直接看第一层调用栈observed&&undefinde||observed,很明显这时候的arr返回的是observed，因此此时的arr并不是原始数据，当执行到2处时，又一次进入get方# 法，此时的key是indexOf，然后此时会返回 return Reflect.get(arrayInstrumentations, # key, receiver);而arrayInstrumentations['indexOf']这个方法又进入了1这个过程，从而造# 成调用栈爆栈的问题
if (key === "__v_isReactive" /* IS_REACTIVE */) {
        return !isReadonly;
    }
    else if (key === "__v_isReadonly" /* IS_READONLY */) {
        return isReadonly;
    }
    const targetIsArray = isArray(target);
    if (targetIsArray && hasOwn(arrayInstrumentations, key)) {
        return Reflect.get(arrayInstrumentations, key, receiver);
}
```

有一个 Symbol 的判断逻辑一直没有理解，我 TM

```bash
  if (
      isSymbol(key)
        ? builtInSymbols.has(key)
        : key === `__proto__` || key === `__v_isRef`
    ) {
      return res
    }
```

我在单测里面执行测试用例的自定义 Symbol 访问

```bash
    const customSymbol = Symbol()
    const obj = {
      [Symbol.asyncIterator]: { a: 1 },
      [Symbol.unscopables]: { b: '1' },
      [customSymbol]: { c: [1, 2, 3] }
    }

    const objRef = ref(obj)
    expect(objRef.value[Symbol.asyncIterator]).toBe(obj[Symbol.asyncIterator])
    expect(objRef.value[Symbol.unscopables]).toBe(obj[Symbol.unscopables])
    # 这两句log语句都是输出 { c: [ 1, 2, 3 ] }原始数据
    console.log(objRef.value[customSymbol])
    console.log(obj[customSymbol])
```

然后我在 demo 里面也复制了这段代码

```bash
    const customSymbol = Symbol()
    const obj = {
      [Symbol.asyncIterator]: { a: 1 },
      [Symbol.unscopables]: { b: '1' },
      [customSymbol]: { c: [1, 2, 3] }
    }

    debugger
    const objRef = ref(obj)
    # 结果下面两个log 一个输出 代理过的Object，一个输出Objectt原始数据
    console.log(objRef.value[customSymbol])
    console.log(obj[customSymbol])
```

我就先不管它了。

然后是`createSetter`,是 set 方法的插桩

```bash
function createSetter(shallow = false) {
  return function set(
    target: object,
    key: string | symbol,
    value: unknown,
    receiver: object
  ): boolean {
    const oldValue = (target as any)[key]
    if (!shallow) {
      value = toRaw(value)
      # 这里就是判断赋值的时候新值如果不是ref，并且旧值是ref的情况下的赋值
      # 这里有个条件是判断当前target是非数组，但是当我把这个条件删除的时候，210个测试用例仍然测试通过，所以这个条件不知道是干啥的。
      if (!isArray(target) && isRef(oldValue) && !isRef(value)) {
        oldValue.value = value
        return true
      }
    } else {
      # in shallow mode, objects are set as-is regardless of reactive or not
    }

    const hadKey = hasOwn(target, key)
    const result = Reflect.set(target, key, value, receiver)
    # don't trigger if target is something up in the prototype chain of original
    # 这个等于是在什么情况下发生的，把里面的逻辑拿出来，找到没有通过的测试用例，发现就一个，是在effect模块，emm先记录，等读到的时候再看---effect-settter
    if (target === toRaw(receiver)) {
      # 这里就是判断要set的key是否存在target上，如果不存在，就触发添加数据的依赖，如果存在，就触发更新数据的依赖
      if (!hadKey) {
        trigger(target, TriggerOpTypes.ADD, key, value)
      } else if (hasChanged(value, oldValue)) {
        trigger(target, TriggerOpTypes.SET, key, value, oldValue)
      }
    }
    # Reflect要返回boolean来判断是否设置成功
    return result
  }
}
# hasChange方法用来判断值是否有所改变，&&后面的判断语句是用来过滤NaN的，因为NaN是唯一一个自身不相等的数
export const hasChanged = (value: any, oldValue: any): boolean =>
  value !== oldValue && (value === value || oldValue === oldValue)
```

附一张疑问图
![confused](/images/reactive/code5.png)
![confused](/images/reactive/code6.png)
剩下几个的逻辑就很单一了。

```bash
# 删除逻辑 删除成功并且在target有这个key存在然后触发更新
function deleteProperty(target: object, key: string | symbol): boolean {
  const hadKey = hasOwn(target, key)
  const oldValue = (target as any)[key]
  const result = Reflect.deleteProperty(target, key)
  if (result && hadKey) {
    trigger(target, TriggerOpTypes.DELETE, key, undefined, oldValue)
  }
  return result
}
# 静态方法 Reflect.has() 作用与 in 操作符 相同。
function has(target: object, key: string | symbol): boolean {
  const result = Reflect.has(target, key)
  track(target, TrackOpTypes.HAS, key)
  return result
}
# Reflect.ownKeys() 返回一个由目标对象自身的属性键组成的数组。不包括原型链喔
function ownKeys(target: object): (string | number | symbol)[] {
  track(target, TrackOpTypes.ITERATE, ITERATE_KEY)
  return Reflect.ownKeys(target)
}
```

然后在 baseHandlers 剩下的代码就是一些 handler 了，没有逻辑

#### collectionHandler

导入文件，类型声明，以及一些方法

```bash
import { toRaw, reactive, readonly, ReactiveFlags } from './reactive'
import { track, trigger, ITERATE_KEY, MAP_KEY_ITERATE_KEY } from './effect'
import { TrackOpTypes, TriggerOpTypes } from './operations'
import {
  isObject,
  capitalize,
  hasOwn,
  hasChanged,
  toRawType
} from '@vue/shared'

export type CollectionTypes = IterableCollections | WeakCollections

type IterableCollections = Map<any, any> | Set<any>
type WeakCollections = WeakMap<any, any> | WeakSet<any>
type MapTypes = Map<any, any> | WeakMap<any, any>
type SetTypes = Set<any> | WeakSet<any>

const toReactive = <T extends unknown>(value: T): T =>
  isObject(value) ? reactive(value) : value

const toReadonly = <T extends unknown>(value: T): T =>
  isObject(value) ? readonly(value) : value

const toShallow = <T extends unknown>(value: T): T => value

const getProto = <T extends CollectionTypes>(v: T): any =>
  Reflect.getPrototypeOf(v)

```

看 get 方法

```bash
function get(
  target: MapTypes,
  key: unknown,
  wrap: typeof toReactive | typeof toReadonly | typeof toShallow
) {
  target = toRaw(target)
  const rawKey = toRaw(key)
  # 这里的key不等于rawKey的话那么必然是这个key是响应式对象
  # 然后这里track应该是收集依赖，具体逻辑不知道，先这样看
  if (key !== rawKey) {
    track(target, TrackOpTypes.GET, key)
  }
  track(target, TrackOpTypes.GET, rawKey)
  const { has, get } = getProto(target)
  # 判断是key在target上还是rawKey在target上，wrap是属于toReactive|toReadonly|toShallow三个函数中的其中一个，if里面是在组合调用函数
  if (has.call(target, key)) {
    return wrap(get.call(target, key))
  } else if (has.call(target, rawKey)) {
    return wrap(get.call(target, rawKey))
  }
```

啊，然后看 set 方法

```bash
function set(this: MapTypes, key: unknown, value: unknown) {
  value = toRaw(value)
  # 这里肯定要把this转成原生数据类型，而不能用Proxy，原因之前有讲了，这里的has调用绑定到了代理之前的数据实例
  const target = toRaw(this)
  const { has, get, set } = getProto(target)

  let hadKey = has.call(target, key)
  ## 这个是我自己改的，果然 ，测试用例没通过，调了下，果然还是得用实例自带的方法来判断，用Object.prototype.hasOwnProperty还是不能用来对Map这类结构进行判断的
  ## let hadKey = hasOwn(target,key as any)
  if (!hadKey) {
    # 这个逻辑跟之前的对数组的indexOf插桩的方法一个道理，都是考虑了key值为响应式对象的情况
    key = toRaw(key)
    hadKey = has.call(target, key)
  } else if (__DEV__) {
    checkIdentityKeys(target, has, key)
  }

  const oldValue = get.call(target, key)
  const result = set.call(target, key, value)
  # 更新依赖---->要么add要么set
  if (!hadKey) {
    trigger(target, TriggerOpTypes.ADD, key, value)
  } else if (hasChanged(value, oldValue)) {
    trigger(target, TriggerOpTypes.SET, key, value, oldValue)
  }
  return result
}
```

has 和 add 方法

```bash
function has(this: CollectionTypes, key: unknown): boolean {
  const target = toRaw(this)
  const rawKey = toRaw(key)
  # 响应对象
  if (key !== rawKey) {
    track(target, TrackOpTypes.HAS, key)
  }
  track(target, TrackOpTypes.HAS, rawKey)
  const has = getProto(target).has
  # 这里用到了或运算符考虑到了Set里面放置了响应式对象的情况
  # 所以单独只使用一个判断的话测试用例是不能全部通过的
  return has.call(target, key) || has.call(target, rawKey)
}

# 这个方法 就 嗯  一目了然
function add(this: SetTypes, value: unknown) {
  # 可能会有疑问，这里的添加不是把value都做了一个转换吗？为什么Set里面会有响应式对象？
  # 这个方法只是劫持了Set方法的add，所以只有Set转变成响应式对象后调用了add方法，加入进去的value才只是普通的value值
  value = toRaw(value)
  const target = toRaw(this)
  const proto = getProto(target)
  const hadKey = proto.has.call(target, value)
  const result = proto.add.call(target, value)
  if (!hadKey) {
    trigger(target, TriggerOpTypes.ADD, value, value)
  }
  return result
}
```

执行这段代码，在 set 转为响应式对象前后分别把响应式对象 entry 加入

```bash
const raw = new Set();
const entry = reactive({});
raw.add(entry);
const set = reactive(raw);
// console.log(set.has(entry));
set.add(entry)
```

看 log 结果
![code7](/images/reactive/code7.png)

从图里可以很明显的看出 添加了两个相同的对象，但是一个是原始值，一个是代理对象，说明之前那个问题，Set 结构里面是可以有代理对象的，只要在 Set 被 reactive 之前加入就行，在被 reactive 之后添加的数据就只是原始数据，而不是代理对象了，这里的原始数据指的是没有被 Proxy

deleteEntry 跟 set 逻辑有点相似,区别就在于调用的方法不一样

```bash

function deleteEntry(this: CollectionTypes, key: unknown) {
  const target = toRaw(this)
  const { has, get, delete: del } = getProto(target)
  let hadKey = has.call(target, key)
  if (!hadKey) {
    key = toRaw(key)
    hadKey = has.call(target, key)
  } else if (__DEV__) {
    checkIdentityKeys(target, has, key)
  }

  const oldValue = get ? get.call(target, key) : undefined
  # forward the operation before queueing reactions
  const result = del.call(target, key)
  if (hadKey) {
    trigger(target, TriggerOpTypes.DELETE, key, undefined, oldValue)
  }
  return result
}

```

clear 方法

```bash
function clear(this: IterableCollections) {
  const target = toRaw(this)
  const hadItems = target.size !== 0
  const oldTarget = __DEV__
    ? target instanceof Map
      ? new Map(target)
      : new Set(target)
    : undefined
  # forward the operation before queueing reactions
  const result = getProto(target).clear.call(target)
  # 告诉有收集这个target的对象们可以把它的值置空了
  if (hadItems) {
    trigger(target, TriggerOpTypes.CLEAR, undefined, undefined, oldTarget)
  }
  return result
}

```

forEach

```bash
unction createForEach(isReadonly: boolean, shallow: boolean) {
  return function forEach(
    this: IterableCollections,
    callback: Function,
    # 以为这个参数没有用，注释掉跑了下测试，只有一个用例报错，断言写的是callback内部的this等于thisArg
    thisArg?: unknown
  ) {
    const observed = this
    # 本来以为这里的observed算是重复变量，
    # 所以下一行可以改成
    # const target = toRaw(this)
    # 但是注意到wrappedCallback这个函数也用到了，取得是外层作用域的this，因此需要一个储存this的临时变量
    const target = toRaw(observed)
    const wrap = isReadonly ? toReadonly : shallow ? toShallow : toReactive
    !isReadonly && track(target, TrackOpTypes.ITERATE, ITERATE_KEY)
    # important: create sure the callback is
    # 1. invoked with the reactive map as `this` and 3rd arg
    # 2. the value received should be a corresponding reactive/readonly.
    function wrappedCallback(value: unknown, key: unknown) {
      return callback.call(thisArg, wrap(value), wrap(key), observed)
    }
    # 这句我一开始以为是遍历原型链上所有的属性以及方法并且进行this重定向，后来我对这句进行了一次debug，我发现下面这句应该是等同于
    # return getProto(target)['forEach'].call(target,wrappedCallback)
    # 我觉得这样写应该更容易理解吧～
    return getProto(target).forEach.call(target, wrappedCallback)
  }
}
```

对迭代方法进行一个插桩，返回闭包

```bash
function createIterableMethod(
  method: string | symbol,
  isReadonly: boolean,
  shallow: boolean
) {
  return function(
    this: IterableCollections,
    ...args: unknown[]
  ): Iterable & Iterator {
    const target = toRaw(this)#获取原始数据
    const isMap = target instanceof Map
    const isPair = method === 'entries' || (method === Symbol.iterator && isMap)
    const isKeyOnly = method === 'keys' && isMap
    # 考虑这里对apply可以用call来调用吗？
    # 但是是不行，因为这里的arg是一个数组，而call的参数需要是一个参数或者多个参数，就是说call的参数只能是一个个的传！
    # 并且这里的innerIterator返回的并不是一个array，而是一个iterator
    const innerIterator = getProto(target)[method].apply(target, args)
    const wrap = isReadonly ? toReadonly : shallow ? toShallow : toReactive
    !isReadonly &&
      track(
        target,
        TrackOpTypes.ITERATE,
        isKeyOnly ? MAP_KEY_ITERATE_KEY : ITERATE_KEY
      )
    # return a wrapped iterator which returns observed versions of the
    # values emitted from the real iterator
    return {
      # iterator protocol
      next() {
        const { value, done } = innerIterator.next()
        return done
          ? { value, done }
          : {
              # 只有在调用entries方法或者是Map类型对时候才需要返回【key，value】，并且让返回对数据保持响应式结构
              value: isPair ? [wrap(value[0]), wrap(value[1])] : wrap(value),
              done
            }
      },
      # iterable protocol
      # mdn对于重写迭代器有提到需要返回自身，否则会发生意料之外对错误
      [Symbol.iterator]() {
        return this
      }
    }
  }
}
之后的函数都是通过条件来调用之前的函数，就跳哟拉～

待续...(reactive还没看完)
```

#### ref

跟 reactive 类似，同样也是让一个 value 值变成一个响应式对象，但是不同的是 reactive 只能让 object 变成响应式对象，却不包括 primitive 值

```bash
# 收集 触发依赖
import { track, trigger } from './effect'
# 枚举类型
import { TrackOpTypes, TriggerOpTypes } from './operations'
# 通用方法
import { isObject, hasChanged } from '@vue/shared'
import { reactive, isProxy, toRaw } from './reactive'
import { CollectionTypes } from './collectionHandlers'
```

要定义一个独一无二的字段 Symbol 类型，并且不想让 ide 识别出来

```bash
declare const RefSymbol: unique symbol
export interface Ref<T = any> {
  #
   #Type differentiator only.
   #We need this to be in public d.ts but don't want it to show up in IDE
   #autocomplete, so we use a private Symbol instead.
   #
  [RefSymbol]: true
  value: T
}

```

toRefs 的类型声明，每个在 T 里面的值都是 ref 类型

```bash
export type ToRefs<T = any> = { [K in keyof T]: Ref<T[K]> }
```

由于 reactive 仅接受 object 作为入参，所以对于 primitive 的值就返回它的值而不是调用 reactive

```bash
const convert = <T extends unknown>(val: T): T =>
  isObject(val) ? reactive(val) : val
```

ref 直接调用了`createRef`

```bash
export function ref(value?: unknown) {
  return createRef(value)
}
# createRef直接返回一个object，
# const count = ref(1)
# ==>count = {
#         __v_isRef:true,
#         value:1
#     }
function createRef(rawValue: unknown, shallow = false) {
  if (isRef(rawValue)) {
    return rawValue
  }
  let value = shallow ? rawValue : convert(rawValue)
  const r = {
    __v_isRef: true,
    get value() {
      track(r, TrackOpTypes.GET, 'value')
      return value
    },
    set value(newVal) {
      if (hasChanged(toRaw(newVal), rawValue)) {
        rawValue = newVal
        value = shallow ? newVal : convert(newVal)
        trigger(
          r,
          TriggerOpTypes.SET,
          'value',
          __DEV__ ? { newValue: newVal } : void 0
        )
      }
    }
  }
  return r
}
```

由于 reactive 只是针对于 object 的，对于内部的 prop 是没有做代理的，因此一旦解构，解构出来的值就已经失去了响应性

```bash
export function toRefs<T extends object>(object: T): ToRefs<T> {
  if (__DEV__ && !isProxy(object)) {
    console.warn(`toRefs() expects a reactive object but received a plain one.`)
  }
  const ret: any = {}
  for (const key in object) {
    ret[key] = toRef(object, key)
  }
  return ret
}

export function toRef<T extends object, K extends keyof T>(
  object: T,
  key: K
): Ref<T[K]> {
  return {
    __v_isRef: true,
    get value(): any {
      return object[key]
    },
    set value(newVal) {
      object[key] = newVal
    }
  } as any
}

```

LIKE THIS

```bash
function f(){
  const obj = reactive({count:10,age:10]})
  return {
    ...obj
  }
}
const obj = f()
let {count,age} = obj
count # 10
count++
count # 11
obj.count #10
```

```bash
function f(){
  const obj = reactive({count:10,age:10]})
  return {
    ...toRefs(obj)
  }
}
const obj = f()
const {count}  = obj # 这样解构出来的count是一个ref类型，它具备有响应性
count.value # 10
count.value++
count.value #11
obj.count.value # 11
```

看看这个很长很长的类型声明

```bash
export interface RefUnwrapBailTypes {}
# 首先如果T是Ref类型的，那么把ref类型里面推断的数据类型作为类型传递给UnwrapRefSimple
export type UnwrapRef<T> = T extends Ref<infer V>
  ? UnwrapRefSimple<V>
  : UnwrapRefSimple<T>
# 然后UnwrapRefSimple根据传进来的类型来决定返回什么类型
type UnwrapRefSimple<T> = T extends
  | Function
  | CollectionTypes
  | BaseTypes
  | Ref
  | RefUnwrapBailTypes[keyof RefUnwrapBailTypes]
  ? T
  : T extends Array<any>
    ? { [K in keyof T]: UnwrapRefSimple<T[K]> }
    : T extends object ? UnwrappedObject<T> : T
```

这里的 T[P]要用 UnwrapRef 嵌套应该是要考虑对象中有 ref 的情况

```bash
type UnwrappedObject<T> = { [P in keyof T]: UnwrapRef<T[P]> } & SymbolExtract<T>
```

#### effect

```bash
# 两个枚举
import { TrackOpTypes, TriggerOpTypes } from './operations'
# 两个工具方法
import { EMPTY_OBJ, isArray } from '@vue/shared'

```

储存依赖

```bash
# The main WeakMap that stores {target -> key -> dep} connections.
# Conceptually, it's easier to think of a dependency as a Dep class
# which maintains a Set of subscribers, but we simply store them as
# raw Sets to reduce memory overhead.
type Dep = Set<ReactiveEffect>
type KeyToDepMap = Map<any, Dep>
const targetMap = new WeakMap<any, KeyToDepMap>()
```

```bash
export interface ReactiveEffect<T = any> {
  (...args: any[]): T
  _isEffect: true
  id: number
  # 是否停止监听
  active: boolean
  # 原始函数
  raw: () => T
  # 依赖数组
  deps: Array<Dep>
  # 选项
  options: ReactiveEffectOptions
}

export interface ReactiveEffectOptions {
  # 判断是否立即执行
  lazy?: boolean
  computed?: boolean
  scheduler?: (job: ReactiveEffect) => void
  onTrack?: (event: DebuggerEvent) => void
  onTrigger?: (event: DebuggerEvent) => void
  onStop?: () => void
}

export type DebuggerEvent = {
  effect: ReactiveEffect
  target: object
  type: TrackOpTypes | TriggerOpTypes
  key: any
} & DebuggerEventExtraInfo

export interface DebuggerEventExtraInfo {
  newValue?: any
  oldValue?: any
  oldTarget?: Map<any, any> | Set<any>
}
```

定义变量

```bash
# 储存effect的数组
const effectStack: ReactiveEffect[] = []
let activeEffect: ReactiveEffect | undefined

export const ITERATE_KEY = Symbol(__DEV__ ? 'iterate' : '')
export const MAP_KEY_ITERATE_KEY = Symbol(__DEV__ ? 'Map key iterate' : '')
```

判断是否是 effect 函数

```bash
export function isEffect(fn: any): fn is ReactiveEffect {
  return fn && fn._isEffect === true
}
```

创建 effect 函数

```bash
export function effect<T = any>(
  fn: () => T,
  options: ReactiveEffectOptions = EMPTY_OBJ
): ReactiveEffect<T> {
  if (isEffect(fn)) {
    fn = fn.raw
  }
  const effect = createReactiveEffect(fn, options)
  # 如果没有lazy参数，那么effect 函数立即执行
  if (!options.lazy) {
    effect()
  }
  return effect
}
let uid = 0
# 删除effect里面的依赖的依赖的effect（很拗口）
function cleanup(effect: ReactiveEffect) {
  const { deps } = effect
  if (deps.length) {
    for (let i = 0; i < deps.length; i++) {
      deps[i].delete(effect)
    }
    deps.length = 0
  }
}

function createReactiveEffect<T = any>(
  fn: (...args: any[]) => T,
  options: ReactiveEffectOptions
): ReactiveEffect<T> {
  const effect = function reactiveEffect(...args: unknown[]): unknown {
    # 把这句注释，一个用例报错 reactivity/effect › stop with scheduler
    # 提示我们 在把effect调用了stop之后，scheduler不在执行
    if (!effect.active) {
      return options.scheduler ? undefined : fn(...args)
    }
    # 问个问题，if代码块里面的语句push了一次，然后pop了一次，那么为什么还需要判断effect是否存在effect栈中
    if (!effectStack.includes(effect)) {
      # 这里要删除effect的依赖项，是为了处理effect里面有条件语句的情况，
      # 分支不处于激活状态时，修改分支上的属性不应该执行effect
      cleanup(effect)
      try {
        enableTracking()
        effectStack.push(effect)
        activeEffect = effect
        return fn(...args)
      } finally {
        effectStack.pop()
        resetTracking()
        activeEffect = effectStack[effectStack.length - 1]
      }
    }
  } as ReactiveEffect
  effect.id = uid++
  effect._isEffect = true
  effect.active = true
  effect.raw = fn
  effect.deps = []
  effect.options = options
  return effect
}
```

提个问题，在 effect 函数里面的 if 语句块里面执行了一次`effectStack.push`,然后又执行了`effectStack.pop`,但是为什么要在 if 语句里面判断 effect 是否存在 effectStack 中，所以我把这个 if 语句删除，这是为了防止套娃。在 effect 里面调用 effect 本身，避免无限递归（小声 bb，我只看懂了这层）

track 函数，这是为了收集依赖

```bash
export function track(target: object, type: TrackOpTypes, key: unknown) {
  if (!shouldTrack || activeEffect === undefined) {
    return
  }
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()))
  }
  let dep = depsMap.get(key)
  if (!dep) {
    depsMap.set(key, (dep = new Set()))
  }
  # 在收集依赖前执行了cleanup方法
  if (!dep.has(activeEffect)) {
    dep.add(activeEffect)
    activeEffect.deps.push(dep)
    if (__DEV__ && activeEffect.options.onTrack) {
      activeEffect.options.onTrack({
        effect: activeEffect,
        target,
        type,
        key
      })
    }
  }
}

```

更新依赖

```bash

export function trigger(
  target: object,
  type: TriggerOpTypes,
  key?: unknown,
  newValue?: unknown,
  oldValue?: unknown,
  oldTarget?: Map<unknown, unknown> | Set<unknown>
) {
  const depsMap = targetMap.get(target)
  if (!depsMap) {
    // never been tracked
    return
  }

  const effects = new Set<ReactiveEffect>()
  const add = (effectsToAdd: Set<ReactiveEffect> | undefined) => {
    if (effectsToAdd) {
      effectsToAdd.forEach(effect => {
      # 判断是否需要收集依赖或者effect是否重复
        if (effect !== activeEffect || !shouldTrack) {
          effects.add(effect)
        } else {
          # the effect mutated its own dependency during its execution.
          # this can be caused by operations like foo.value++
          # do not trigger or we end in an infinite loop
        }
      })
    }
  }

  if (type === TriggerOpTypes.CLEAR) {
    # collection being cleared
    # trigger all effects for target
    depsMap.forEach(add)
  } else if (key === 'length' && isArray(target)) {
    depsMap.forEach((dep, key) => {
      if (key === 'length' || key >= (newValue as number)) {
        add(dep)
      }
    })
  } else {
    # schedule runs for SET | ADD | DELETE
    if (key !== void 0) {
      add(depsMap.get(key))
    }
    #如果是增加或者删除数据的行为，还要再往相应队列中增加监听函数
    # also run for iteration key on ADD | DELETE | Map.SET
    const isAddOrDelete =
      type === TriggerOpTypes.ADD ||
      (type === TriggerOpTypes.DELETE && !isArray(target))
    # 这个逻辑需要什么时候走到，比如对数据进行push操作时，劫持的key其实是length，此时的key确实不是0，但是depsMap.get(0)其实是为空的
    # 而depsMap.get('length')才是真的有相应effect，所以需要补充第二个逻辑
    # 假如第一个逻辑和第二个逻辑都执行了，那还是只会执行一次effect的
    # 理由是add中的effects这是一个set结构，自动去重
    if (
      isAddOrDelete ||
      (type === TriggerOpTypes.SET && target instanceof Map)
    ) {
      #如果原始数据是数组，则key为length，否则为迭代行为标识符
      add(depsMap.get(isArray(target) ? 'length' : ITERATE_KEY))
    }
    if (isAddOrDelete && target instanceof Map) {
      add(depsMap.get(MAP_KEY_ITERATE_KEY))
    }
  }

  const run = (effect: ReactiveEffect) => {
    if (__DEV__ && effect.options.onTrigger) {
      effect.options.onTrigger({
        effect,
        target,
        key,
        type,
        newValue,
        oldValue,
        oldTarget
      })
    }
    # 这里对computed进行区分，因为computed 对象中自带scheduler函数
    if (effect.options.scheduler) {
      effect.options.scheduler(effect)
    } else {
      effect()
    }
  }
# 运行所有计算数据的监听方法
  effects.forEach(run)
}

```
computed
```bash
export function computed<T>(getter: ComputedGetter<T>): ComputedRef<T>
export function computed<T>(
  options: WritableComputedOptions<T>
): WritableComputedRef<T>
export function computed<T>(
  getterOrOptions: ComputedGetter<T> | WritableComputedOptions<T>
) {
  let getter: ComputedGetter<T>
  let setter: ComputedSetter<T>

  if (isFunction(getterOrOptions)) {
    getter = getterOrOptions
    setter = __DEV__
      ? () => {
          console.warn('Write operation failed: computed value is readonly')
        }
      : NOOP
  } else {
    getter = getterOrOptions.get
    setter = getterOrOptions.set
  }

  let dirty = true
  let value: T
  let computed: ComputedRef<T>

  const runner = effect(getter, {
    lazy: true,
    scheduler: () => {
      if (!dirty) {
        dirty = true
        trigger(computed, TriggerOpTypes.SET, 'value')
      }
    }
  })
  computed = {
    __v_isRef: true,
    [ReactiveFlags.IS_READONLY]:
      isFunction(getterOrOptions) || !getterOrOptions.set,

    // expose effect so computed can be stopped
    effect: runner,
    get value() {
       # 跑单测可以发现这个是为了防止重复计算的。
      if (dirty) {
        value = runner()
        dirty = false
      }
      # 收集依赖
      track(computed, TrackOpTypes.GET, 'value')
      return value
    },
    set value(newValue: T) {
      setter(newValue)
    }
  } as any
  return computed
}
```

OVER
