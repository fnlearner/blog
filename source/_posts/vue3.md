---
title: vue3
date: 2021-09-20 21:24:21
tags: Vue
      JavaScript
---

### intro

本文介绍vue3 的setup语法糖写法，语法的导入组件以及暴露模版变量均不用显示导出，引入 === 导出

### 接收属性

`defineProps`来接收从父级组件传递来的属性以及方法,能接收`string`类型的数组或者类型对象
<!-- more -->
example:
```js
const props = defineProps({
    msg?:String
})
const props = defineProps(['msg'])
```
除了上面这种接收类型声明，还可以采用的就是ts的类型注入写法
example:
```js
const props = defineProps<{msg:string}>()
```
But以上写法不支持的是给默认值，具体可以查看vue的rfc
So vue提供了额外的一个方法-> `withDefaults`
example:
```js
const props = withDefaults(defineProps<{msg:string}>(),{msg:'12313123'})
```

### 触发方法到父组件

`defineEmits`用来定义子组件内部可以触发的事件

example:
```js
const emits = defineEmits(['input'])
```
或者
example:
```js
const emit = defineEmits<{ (event:'change',value:string):void } >()
```
子组件中未在`emit`中声明到事件将默认会认为是根元素的原生dom事件
使用方法 example:

```js
emit('change','1')
```

### 父组件使用子组件的变量`defineExpose`
 
example:
```js
const a = 1
defineExpose({a})
```
父组件直接ref调一下就行了

### v-model 语法糖

modelValue + update:modelValue

v-model:show => update:show


### css的`v-bind`语法糖
js
```js
const red = ref('red')
```
css
```css
.red{
    color:v-bind(red)
}
```
html
```html
<div :class="red"></div>
```
编译结果

`<div class="red" style="--e43c18bc-red:red;">12313123</div>`

为什么会编译成行内样式？因为性能好 ，可以查看benchmark对比

