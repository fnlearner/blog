---
title: provide of vue3
date: 2020-06-28 14:33:54
tags: Vue JavaScript
---

### 前言

好奇provide怎么实现的，然后呢就去扒了下源码hhh，看了下provide的function，有点懵,provide的代码在runtime-core/src/apiInject.ts里面
```bash
export interface InjectionKey<T> extends Symbol {}

export function provide<T>(key: InjectionKey<T> | string, value: T) {
  if (!currentInstance) {
    if (__DEV__) {
      warn(`provide() can only be used inside setup().`)
    }
  } else {
    let provides = currentInstance.provides
    // by default an instance inherits its parent's provides object
    // but when it needs to provide values of its own, it creates its
    // own provides object using parent provides object as prototype.
    // this way in `inject` we can simply look up injections from direct
    // parent and let the prototype chain do the work.
    const parentProvides =
      currentInstance.parent && currentInstance.parent.provides
    if (parentProvides === provides) {
      provides = currentInstance.provides = Object.create(parentProvides)
    }
    // TS doesn't allow symbol as index type
    provides[key as string] = value
  }
}
```
有点纳闷为啥parentProvides === provides 的时候就可以判断当前的实例调用了provide，然后我用尤大的那个vite写了个demo，父元素调用provide，子元素也调用provide
<br>App.vue
```bash
<template>
  <img alt="Vue logo" src="./assets/logo.png" />
  <HelloWorld msg="Hello Vue 3.0 + Vite" />
  {{foo}}
</template>

<script>
import HelloWorld from './components/HelloWorld.vue'
import {provide,inject} from 'vue'
export default {
  name: 'App',
  components: {
    HelloWorld
  },
  setup(props,ctx){
	  provide('foo',1)
	  // console.log(ctx,props)
	  return {
		  foo:inject('foo')
	  }
  }
}
</script>
<br>
```
HelloWorld.vue
```bash
<template>
	<h1>{{ msg }}</h1>
	<button @click="count++">count is: {{ count }}</button>
	<p>
		Edit
		<code>components/HelloWorld.vue</code>
		to test hot module replacement.
	</p>
	{{foo}}
</template>

<script>
import { ref ,provide,inject,defineComponent} from 'vue';
export default defineComponent({
	name: 'HelloWorld',
	props: {
		msg: String
	},
	setup(props,ctx ) {
		// debugger
		const count = ref(0);
		provide('bar',2)
		// debugger
		// console.log(ctx.provide)
		const foo = inject('foo')
		return {
			count,
			foo
		};
	}
});
</script>
<br>
```

在debug的时候在调用栈里面发现在调用mount的时候以此调用了render,patch,processComponent,mountComponent..这些方法，render和patch应该是和dom相关，然后看processComponent
```bash
  const processComponent = (n1, n2, container, anchor, parentComponent, parentSuspense, isSVG, optimized) => {
        if (n1 == null) {
            if (n2.shapeFlag & 512 /* COMPONENT_KEPT_ALIVE */) {
                parentComponent.ctx.activate(n2, container, anchor, isSVG, optimized);
            }
            else {
                mountComponent(n2, container, anchor, parentComponent, parentSuspense, isSVG, optimized);
            }
        }
        else {
            updateComponent(n1, n2, optimized);
        }
    };
```
emmm看起来还是跟dom相关,直接看渲染组件的时候干了啥吧。
```bash
 const mountComponent = (initialVNode, container, anchor, parentComponent, parentSuspense, isSVG, optimized) => {
        const instance = (initialVNode.component = createComponentInstance(initialVNode, parentComponent, parentSuspense)); //看这个实例
        //省略代码
        // setup() is async. This component relies on async logic to be resolved
        // before proceeding
        //省略代码
    };
```
<br>
createComponentInstance

```bash
function createComponentInstance(vnode, parent, suspense) {
    // inherit parent app context - or - if root, adopt from root vnode
    // 继承父级app上下文，如果是root，调整为根节点
    const appContext = (parent ? parent.appContext : vnode.appContext) || emptyAppContext;
    const instance = {
        //省略
        provides: parent ? parent.provides : Object.create(appContext.provides),
        //省略
    };

    if ((process.env.NODE_ENV !== 'production')) {
        instance.ctx = createRenderContext(instance);
    }
    else {
        instance.ctx = { _: instance };
    }
    instance.root = parent ? parent.root : instance;
    instance.emit = emit.bind(null, instance);
    return instance;
}
```
可以看到如果instance如果有父元素的话，instance里面的provides是会继承父节点中的provides
所以这就是为啥provide方法中判断当前的provide和父元素的是否相等，因为如果当前节点调用provide方法的话，那么当前元素的provide一定是和父元素的provide的引用地址相同的，所以当前的provide就可以把父元素的provide当做原型链来生成一个新的object
<br>
然后我回头看了下provide方法的注解，默认情况下实例是继承父元素的provides的，操啊，我花这么多时间是干啥啊！