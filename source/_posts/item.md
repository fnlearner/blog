---
title: item
date: 2020-10-07 20:46:37
tags: JavaScript
---

### Proposal for a .item() method on all the built-in indexables

这个方法是给有索引对象内置的一个方法，那么这个方法接收一个 number 类型的 index，对象能够根据 index 来确定值。那其实看到这会有个问题，具备索引的对象自己就能根据索引来确定值了，那么这个方法出现的意义是为什么？它其实是用负值的 index 来获取值，比如

```bash
const arr =[1,2,3]
arr.item(-1) // 3
```

是这样的用法。
那么这个方法是挂载在 String，Array，TypeArray 这三个数据结构的原型链上。
然后对于 dom 结构中类型 document.getElementById()这样的返回 NodeList 结构在经过 Array.from 转化之后同样会挂载 item 方法

但是这个方法目前还处于 stage3 阶段，因此是不能直接使用的 hhhh。但是官方给出了 polyfill

Like this:

```bash
function item(n) {
	# ToInteger() abstract op
	n = Math.trunc(n) || 0;
	# Allow negative indexing from the end
	if(n < 0) n += this.length;
	# OOB access is guaranteed to return undefined
	if(n < 0 || n >= this.length) return undefined;
	# Otherwise, this is just normal property access
	return this[n];
}

# Other TypedArray constructors omitted for brevity.
for (let C of [Array, String, Uint8Array]) {
    Object.defineProperty(C.prototype, "item",
                          { value: item,
                            writable: true,
                            enumerable: false,
                            configurable: true });
}
```

#### 2021-3-21 更新

![proposal](/images/item/proposal.png)

item方法更名为at方法

`Spec-compliant polyfills using the old name of .item(): Array.prototype.item, String.prototype.item`


The original iteration of this proposal proposed the name of the method to be .item(). Unfortunately, this was found out to be not web compatible. Libraries, notably YUI2 and YUI3, were duck-typing objects to be DOM collections based on the presence of a .item property. Please see [#28](https://github.com/tc39/proposal-relative-indexing-method/issues/28), [#31](https://github.com/tc39/proposal-relative-indexing-method/issues/31), and [#32](https://github.com/tc39/proposal-relative-indexing-method/issues/32) for more details.

Captured below is the original motivation for choosing the .item() name and the original concerns.
