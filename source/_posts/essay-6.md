---
title: 今日随笔(2020-12-27)
date: 2020-12-27 12:00:04
tags:
---

1. 在vue ts class给数组添加值时报错
```bash
export default class App{
    list =[]
    _push(){
        this.list.push(1)
        # error 
    }
}
```
由于定义的list是never类型的数组，所以不能够直接添加元素，所以在定义数组的时候需要显示定义类型
```bash
list = [] as number[]
```
2. line-height 属性同样会影响伪元素的高度
3. ts class 自定义vue双向绑定
v-model默认监听input事件，如果是checkbox或者radio
```bash
@Modle('change') value:any
# 这样vue会监听change，$emit('change')改变外部绑定的值
```
