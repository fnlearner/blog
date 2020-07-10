---
title: reactive
date: 2020-07-09 11:23:04
tags: TypeScript Vue3
categories: TypeScript Vue3
---

### 前言

vue3出了beta，了解一下响应式数据的实现

### 正题

**reactive**
</br>
</br>
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

那首先，Map这个呢把数据储存在自己的私有内部插槽中，类型[MapData]这样，然后这个插槽是跟Map对象自身绑定的。而Proxy不能完全模仿这样的行为，巧的是，这样的插槽Proxy学不来，所以在给它们做代理的时候把调用的实例重新指向Map这类结构的实例再进行调用实例方法就行
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

**baseHandler**
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
把if的条件分支注释，只留下`return res`这个分支，然后跑单测，发现reactiveArray.spec.ts这个测试文件的测试用例` × Array identity methods should work with raw values (16 ms)`测试不通过。发现是在这里的时候不能测试通过
```bash
const raw = {}
const arr = reactive([{}, {}])
arr.push(raw)
## 省略其他代码
# should work also for the observed version
const observed = arr[2]
expect(arr.indexOf(observed)).toBe(2)
```
然后将测试不通过代码拷贝到vite的app中进行调试，发现是observed这个值不再是跟raw一样的{},猜测是劫持了数组的get方法并且对返回值进行了修改。然后进入到`createGetter`这个方法，其中有个逻辑,如果参数是对象，那么就要转成响应式对象。
```bash
if (isObject(res)) {
    # Convert returned value into a proxy as well. we do the isObject check
    # here to avoid invalid value warning. Also need to lazy access readonly
    # and reactive here to avoid circular dependency.
    return isReadonly ? readonly(res) : reactive(res);
}
```
很显然，`typeof {} === 'object'`，所以这个时候的observed不再是单纯的`{}`，它是一个响应式的`{}`，所以就能解释为什么在`res === -1 || res === false`的时候还要进行次函数执行的过程，这是为了防止获取到的值是经过转换的值，所以在分支里面的参数要对参数进行一次还原，SKR。


下面这个就是劫持了get的方法，一条条逻辑看
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
那现在可以看出，是在数组访问`ReactiveFlags.IS_REACTIVE`这个key的时候被劫持了，然后进
```
if (key === ReactiveFlags.IS_REACTIVE) {
      return !isReadonly
}
```
这个逻辑，至于为什么返回结果要对`isReadonly`取反，很显然，在`createReactiveObject`的时候reactive 和 readonly是互斥的关系，那么一个对象不是只读很显然就是响应式,那如果是原始对象呢？很显然，原始对象没有`__v_isReactive`这个属性，那么会返回undefined，用!!转义就是false；然后`key === ReactiveFlags.IS_READONLY`这个分支的逻辑就跟`REACTIVE`的逻辑一样的。

然后我把第三个分支给注释，WDM，直接爆栈了。。。
</br>
` RangeError: Maximum call stack size exceeded
        at Object.get (<anonymous>)`
四个测试用例没通过，我选了其中一个测试用例来复现`Array identity methods should work with raw values`
```bash
    const raw = {}
    const arr = reactive([{}, {}])
    arr.push(raw)
   console.log(arr.indexOf(raw))
```
然后跟着代码走，先进入indexOf的这个方法，这个方法是被劫持的,走到这里

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
# 的return res是undefined，因此此时的arr并不是原始数据，当执行到2处时，又一次进入get方# 法，此时的key是indexOf，然后此时会返回 return Reflect.get(arrayInstrumentations, # key, receiver);而arrayInstrumentations['indexOf']这个方法又进入了1这个过程，从而造# 成调用栈爆栈的问题
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

有一个Symbol的判断逻辑一直没有理解，我TM
```bash
  if (
      isSymbol(key)
        ? builtInSymbols.has(key)
        : key === `__proto__` || key === `__v_isRef`
    ) {
      return res
    }
```
我在单测里面执行测试用例的自定义Symbol访问
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
然后我在demo里面也复制了这段代码
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

然后是`createSetter`,是set方法的插桩
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
然后在baseHandlers剩下的代码就是一些handler了，没有逻辑


**collectionHandler**
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
看get方法
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

啊，然后看set方法 
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
has 和 add方法
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
执行这段代码，在set转为响应式对象前后分别把响应式对象entry加入
```bash
const raw = new Set();
const entry = reactive({});
raw.add(entry);
const set = reactive(raw);
// console.log(set.has(entry));
set.add(entry)
```
看log结果
![code7](/images/reactive/code7.png)

从图里可以很明显的看出 添加了两个相同的对象，但是一个是原始值，一个是代理对象，说明之前那个问题，Set结构里面是可以有代理对象的，只要在Set被reactive之前加入就行，在被reactive之后添加的数据就只是原始数据，而不是代理对象了，这里的原始数据指的是没有被Proxy


deleteEntry 跟set 逻辑有点相似,区别就在于调用的方法不一样
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
OVER