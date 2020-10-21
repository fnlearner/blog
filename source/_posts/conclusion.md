---
title: 随笔
date: 2020-10-21 21:03:54
tags:
---


### 笔记一

在vue项目中使用ts-class的形式来编写组件的时候，要记得在export上面➕`@Component`装饰器，不然组件不能正常注册
```bash
import {
    Component,
    Vue,
    InjectReactive
} from 'vue-property-decorator';

@Component
class Child extends Vue {
    @InjectReactive() node: number;
    mounted() {
        console.log(this.node)
    }
}
```
如果在页面中需要用到子组件的情况，需要像这样注册,并且`@Component`装饰器只需要写一次
```bash
import {
    Vue,
    Component,
    ProvideReactive
} from 'vue-property-decorator';
import Child from './child.vue'
@Component({
    components: {
        Child
    }
})
class Parent extends Vue {
    @ProvideReactive() node = {}
    mounted() {
        this.node = 1
    }
}
```

### 笔记二 --- ProvideReactive来做数据透传的注意点

如果在组件中使用Provide来进行数据透传的话，数据是不带响应式的。如果需要数据具有响应式，那么需要用ProvideReactive来做属性的透传，代码例子可以看上一个代码，另外由于在路由跳转的时候，有时候会有Provide的值重新定义的问题，这时候控制台会抛出异常，具体可以看这个
[issue](https://github.com/kaorun343/vue-property-decorator/issues/277),有临时的解决方案

### 笔记三 --- 在弹窗中保证数据的实时性

需要把数据以Provide的形式传递给弹窗，但是数据仅仅只在第一次显示的时候是正常的数据，在关闭弹窗后再一次开启弹窗，显示的数据是上一次的数据。原因暂时不知道。所以我在关闭弹窗的时候同时用v-if来销毁元素，这样每次打开的元素都是一个最新的元素，同时这个时候获取到的数据也是最新的数据。

### 笔记四 --- 数据获取完后保证子组件获取最新的数据

在父组件用axios获取数据的时候，然后传递给子组件，但是子组件渲染的时候是定义时就给的默认值。
原因：父组件在请求数据的时候，子组件的生命周期已经走完并且已经渲染完成，所以这时候是拿不到请求后返回的真实数据
方案：我这里用v-if来判断获取的数据的长度是否为空来判断是否要渲染子组件，缺点：数据量很大的时候会有很长时间的空白。


### 笔记五 --- 自定义组件绑定v-models

想让自定义组件能够使用v-model语法糖，这样子组件的数据就可以实时的反馈到父组件中去

在vue中，对input来说，v-model是value和input事件的语法糖，对于checkbox来说，监听的事件是change，给对应的元素添加对应的事件，然后在自组件emit出去，把相应的value值绑定到对应的dom元素中去。


